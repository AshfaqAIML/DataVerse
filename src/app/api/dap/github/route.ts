import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/dap/github — fetch analysis-relevant files from a PUBLIC
 * GitHub repository so the evaluation can run its static analysis on
 * real submitted code.
 *
 * Body: { url: string }  — a github.com repo URL (owner/repo[, /tree/branch]).
 * Returns: { repo, branch, files: [{ name, ext, content }], skipped }
 *
 * Runs server-side only. Public repos need no auth; rate limits are
 * GitHub's unauthenticated 60/h per IP. All failures return a JSON
 * error the UI degrades gracefully from.
 */

const MAX_FILES = 10;
const MAX_BYTES = 400_000;
const ANALYSIS_EXTS = new Set(["py", "ipynb", "r", "sql", "md", "txt", "js", "dax"]);

export async function POST(req: NextRequest) {
  let url: string;
  try {
    const body = await req.json();
    url = String(body?.url ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseRepoUrl(url);
  if (!parsed) {
    return NextResponse.json(
      { error: "Not a valid GitHub repository URL. Use https://github.com/owner/repo." },
      { status: 400 }
    );
  }
  const { owner, repo, branchHint } = parsed;

  try {
    // 1. Resolve the default branch.
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "dap-academy" },
    });
    if (metaRes.status === 404) {
      return NextResponse.json(
        { error: "Repository not found (or private). Public repositories only." },
        { status: 404 }
      );
    }
    if (!metaRes.ok) {
      return NextResponse.json(
        { error: `GitHub API error (${metaRes.status}). Try again shortly.` },
        { status: 502 }
      );
    }
    const meta = (await metaRes.json()) as { default_branch?: string };
    const branch = branchHint || meta.default_branch || "main";

    // 2. List the tree.
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      { headers: { Accept: "application/vnd.github+json", "User-Agent": "dap-academy" } }
    );
    if (!treeRes.ok) {
      return NextResponse.json(
        { error: `Could not read the repository tree (${treeRes.status}).` },
        { status: 502 }
      );
    }
    const tree = (await treeRes.json()) as {
      tree?: { path: string; type: string; size?: number }[];
    };

    // 3. Pick analysis-relevant files (prefer notebooks, then scripts, then docs).
    const blobs = (tree.tree ?? []).filter(
      (t) =>
        t.type === "blob" &&
        !t.path.includes("node_modules/") &&
        !t.path.startsWith(".") &&
        ANALYSIS_EXTS.has(t.path.split(".").pop()?.toLowerCase() ?? "")
    );
    const priority = (p: string) =>
      p.endsWith(".ipynb") ? 0 : p.endsWith(".py") || p.endsWith(".sql") ? 1 : p.endsWith(".md") ? 2 : 3;
    blobs.sort((a, b) => priority(a.path) - priority(b.path) || a.path.localeCompare(b.path));
    const chosen = blobs.slice(0, MAX_FILES);
    let skipped = blobs.length - chosen.length;

    // 4. Fetch raw contents.
    const files: { name: string; ext: string; content: string }[] = [];
    for (const blob of chosen) {
      if ((blob.size ?? 0) > MAX_BYTES) {
        skipped++;
        continue;
      }
      const rawRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${blob.path}`,
        { headers: { "User-Agent": "dap-academy" } }
      );
      if (!rawRes.ok) continue;
      const content = await rawRes.text();
      files.push({
        name: blob.path.split("/").pop() ?? blob.path,
        ext: blob.path.split(".").pop()?.toLowerCase() ?? "txt",
        content: content.slice(0, MAX_BYTES),
      });
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No analysable files (.py/.ipynb/.sql/.md/.r) found in the repository." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      repo: `${owner}/${repo}`,
      branch,
      files,
      skipped,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach GitHub from this environment. Upload your files directly instead." },
      { status: 502 }
    );
  }
}

function parseRepoUrl(url: string): { owner: string; repo: string; branchHint?: string } | null {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (u.hostname !== "github.com" && u.hostname !== "www.github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const [owner, repoRaw, treeKind, branchRaw] = parts;
    const repo = repoRaw.replace(/\.git$/, "");
    if (!owner || !repo) return null;
    const branchHint = treeKind === "tree" && branchRaw ? decodeURIComponent(branchRaw) : undefined;
    return { owner, repo, branchHint };
  } catch {
    return null;
  }
}
