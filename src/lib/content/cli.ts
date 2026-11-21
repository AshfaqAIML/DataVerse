/**
 * Content CLI — the editorial pipeline's front door.
 *
 *   bun run content:validate                     # the quality gate (CI uses this)
 *   bun run content:stats                        # honest coverage + publish decisions
 *   bun run content:scaffold -- <subject> <m> <c> <l> [archetype]
 *   bun run content:scaffold --next -- <subject> [archetype]
 *
 * Exit codes: 0 = clean, 1 = errors found, 2 = usage error.
 */
import { compileContent, defaultContentRoot } from "./compile";
import { validateLessonsIn, reportOf } from "./rules";
import { scaffoldLesson } from "./templates";
import { subjectPublishDecision } from "./lifecycle";
import { availableSubjects, registryLessonsFor, subjectBySlug } from "../curriculum/data";
import type { Archetype } from "./sections";

function printReport(report: ReturnType<typeof reportOf>) {
  const byPath = new Map<string, typeof report.findings>();
  for (const f of report.findings) {
    const arr = byPath.get(f.path) ?? [];
    arr.push(f);
    byPath.set(f.path, arr);
  }
  for (const [path, findings] of [...byPath.entries()].sort()) {
    console.log(`\n  ${path}`);
    for (const f of findings) {
      const line = f.line ? `:${f.line}` : "";
      const tag = f.severity === "error" ? "ERROR" : f.severity === "warning" ? "WARN " : "info ";
      console.log(`    [${tag}] ${f.rule}${line}  ${f.message}`);
    }
  }
  console.log("");
  console.log(`  lessons compiled: ${report.lessons}`);
  console.log(`  findings: ${report.errorCount} error(s), ${report.warningCount} warning(s)`);
  console.log(report.ok ? "  STATUS: PASS" : "  STATUS: FAIL");
}

function cmdValidate(args: Set<string>) {
  const root = args.has("--root") ? nextValue("--root")! : defaultContentRoot();
  const bundle = compileContent(root);
  const findings = validateLessonsIn(bundle, { verify: args.has("--no-verify") ? null : {} });
  const report = reportOf(findings, bundle);
  printReport(report);
  process.exit(report.ok ? 0 : 1);
}

let argvRest: string[] = [];
function nextValue(flag: string): string | null {
  const i = process.argv.indexOf(flag);
  if (i === -1 || i + 1 >= process.argv.length) return null;
  return process.argv[i + 1];
}

function cmdStats() {
  const bundle = compileContent(defaultContentRoot());
  console.log("DataVerse Academy — content coverage (honest counts)");
  console.log("=".repeat(64));
  let totalLessons = 0;
  let authored = 0;
  for (const cov of bundle.coverage) {
    totalLessons += cov.total;
    authored += cov.authored;
    const pct = cov.total === 0 ? 0 : Math.round((cov.authored / cov.total) * 100);
    const bar = "█".repeat(Math.round(pct / 5)).padEnd(20, "·");
    console.log(`${cov.school} ${cov.subject.padEnd(26)} ${bar} ${String(cov.authored).padStart(2)}/${String(cov.total).padStart(2)} (${pct}%)`);
    for (const l of cov.lessons.filter((x) => !x.authored).slice(0, 3)) {
      console.log(`      · pending: ${l.ref} ${l.title}`);
    }
  }
  console.log("-".repeat(64));
  const decisions = bundle.coverage.map(subjectPublishDecision);
  const visible = decisions.filter((d) => d.publishable);
  console.log(`registry lessons (structure defined): ${totalLessons}`);
  console.log(`lessons with authored content:        ${authored}`);
  console.log(`subjects learner-visible (100% published): ${visible.length}`);
  if (visible.length === 0) {
    console.log("  → no subject is learner-visible yet — subjects appear only when every");
    console.log("    lesson is authored and published. Counts are never inflated.");
  }
  process.exit(0);
}

function cmdScaffold(argv: string[]) {
  const rest = argv.slice(argv.indexOf("--") + 1);
  if (rest.length === 0 || rest[0] === "--next") {
    // pick the first unauthored lesson of a subject
    const subject = rest[1] ?? availableSubjects[0].slug;
    const subjectDef = subjectBySlug(subject);
    if (!subjectDef) {
      console.error(`unknown subject '${subject}'`);
      process.exit(2);
    }
    const bundle = compileContent(defaultContentRoot());
    const authoredRefs = new Set(bundle.lessons.map((l) => l.ref));
    const next = registryLessonsFor(subjectDef).find(
      (r) => !authoredRefs.has(`${r.subject}/m${r.moduleIndex}/c${r.chapterIndex}/${r.lessonIndex}`)
    );
    if (!next) {
      console.error(`subject '${subject}' is fully authored — nothing to scaffold`);
      process.exit(2);
    }
    runScaffold(next.subject, next.moduleIndex, next.chapterIndex, next.lessonIndex, rest[2] as Archetype | undefined);
    return;
  }
  const [subject, m, c, l, archetype] = rest;
  if (!subject || !m || !c || !l) {
    console.error("usage: content:scaffold -- <subject-slug> <module#> <chapter#> <lesson#> [archetype]");
    process.exit(2);
  }
  runScaffold(subject, parseInt(m, 10), parseInt(c, 10), parseInt(l, 10), archetype as Archetype | undefined);
}

function runScaffold(subject: string, m: number, c: number, l: number, archetype?: Archetype) {
  try {
    const dir = scaffoldLesson({
      subject,
      moduleIndex: m,
      chapterIndex: c,
      lessonIndex: l,
      archetype,
      outRoot: defaultContentRoot(),
      author: "you@dataverse.academy",
    });
    console.log(`scaffolded lesson at ${dir}`);
    console.log("next: fill every section, then bump status to self-review (see docs/content/AUTHORING_GUIDE.md)");
    process.exit(0);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(2);
  }
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = new Set(process.argv);
  argvRest = rest;
  switch (cmd) {
    case "validate":
      return cmdValidate(args);
    case "stats":
      return cmdStats();
    case "scaffold":
      return cmdScaffold(process.argv);
    default:
      console.log("usage: bun src/lib/content/cli.ts <validate|stats|scaffold> [args]");
      console.log("  validate [--no-verify] [--root DIR]   run the full quality gate");
      console.log("  stats                                  honest coverage report");
      console.log("  scaffold -- <subject> <m> <c> <l> [archetype]");
      process.exit(cmd ? 2 : 0);
  }
}

main();
