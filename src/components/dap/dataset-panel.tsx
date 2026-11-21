"use client";

/**
 * DatasetPanel — the project's dataset: live preview of the seeded
 * generator's output, a column profile (missingness, uniqueness),
 * the data dictionary, and the CSV download.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import type { DapProject } from "@/lib/dap/types";
import { buildDataset, downloadDataset, profileDataset } from "@/lib/dap/datasets";
import { cn } from "@/lib/utils";

export function DatasetPanel({ project }: { project: DapProject }) {
  const [showAllRows, setShowAllRows] = useState(false);
  const [busy, setBusy] = useState(false);

  const table = useMemo(() => buildDataset(project), [project]);
  const profile = useMemo(() => profileDataset(table), [table]);
  const previewRows = showAllRows ? table.rows.slice(0, 50) : table.rows.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------- intro */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border-subtle bg-card p-5">
        <div className="max-w-2xl">
          <h2 className="font-serif text-lg font-semibold text-ink">{project.dataset.name}</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{project.dataset.description}</p>
          <p className="mt-2.5 font-mono text-[12px] text-ink-3">
            {project.dataset.filename} · {profile.rows.toLocaleString()} rows · {profile.columns} columns
          </p>
          <p className="mt-2 rounded-lg border border-warning-border bg-warning-bg px-3 py-2 text-[12.5px] leading-relaxed text-warning-text">
            <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />
            This dataset is deterministic (same project, same data every visit) and contains deliberately
            seeded quality defects — the data quality assessment is graded on finding them. Treat it like a
            real export from the client&apos;s systems.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            // let the spinner paint before the (synchronous) build+download
            setTimeout(() => {
              downloadDataset(project, table);
              setBusy(false);
            }, 30);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-viz-10 px-5 py-2.5 text-sm font-semibold text-ink-inverse shadow-e1 transition-colors hover:bg-viz-10/85 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download CSV
        </button>
      </div>

      {/* ----------------------------------------------------------- profile */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <StatCard label="Rows" value={profile.rows.toLocaleString()} />
        <StatCard label="Duplicate rows" value={profile.duplicateRows.toLocaleString()} tone={profile.duplicateRows > 0 ? "warn" : "ok"} />
        <StatCard label="Missing cells" value={`${profile.missingCells.toLocaleString()} (${profile.missingPct}%)`} tone={profile.missingPct > 1 ? "warn" : "ok"} />
        <StatCard label="Columns" value={String(profile.columns)} />
      </div>

      {/* ----------------------------------------------------------- preview */}
      <section className="rounded-xl border border-border-subtle bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-ink">Data preview</h3>
          <span className="font-mono text-[11px] text-ink-3">first {previewRows.length} of {profile.rows.toLocaleString()} rows</span>
        </div>
        <div className="mt-3 max-h-[24rem] overflow-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-subtle">
                {table.columns.map((c) => (
                  <th key={c} className="whitespace-nowrap border-b border-border-subtle px-2.5 py-2 font-mono text-[11px] font-semibold text-ink-2">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="odd:bg-surface-subtle/40">
                  {table.columns.map((c) => {
                    const v = row[c];
                    const missing = v === undefined || v === null || v === "";
                    return (
                      <td
                        key={c}
                        className={cn(
                          "whitespace-nowrap px-2.5 py-1.5 font-mono text-[11.5px]",
                          missing ? "bg-danger-bg/70 font-bold text-danger-text" : "text-ink-2"
                        )}
                      >
                        {missing ? "—" : String(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!showAllRows && table.rows.length > 8 ? (
          <button onClick={() => setShowAllRows(true)} className="mt-2.5 text-[12px] font-semibold text-viz-10 hover:underline">
            Show 50 rows
          </button>
        ) : null}
        <p className="mt-2 text-[12px] italic text-ink-3">
          Highlighted cells are missing values as they&apos;ll arrive in the CSV (empty fields → pandas NaN).
        </p>
      </section>

      {/* --------------------------------------------------- column profile */}
      <section className="rounded-xl border border-border-subtle bg-card p-5">
        <h3 className="font-serif text-lg font-semibold text-ink">Column profile</h3>
        <p className="mt-1 text-[12.5px] text-ink-3">
          What <code className="rounded bg-surface-subtle px-1 font-mono">df.isna().sum()</code> and{" "}
          <code className="rounded bg-surface-subtle px-1 font-mono">nunique()</code> would tell you —
          computed here so you know what you&apos;re walking into.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle text-[11px] uppercase tracking-wide text-ink-3">
                <th className="px-3 py-2 font-semibold">Column</th>
                <th className="px-3 py-2 font-semibold">Missing</th>
                <th className="px-3 py-2 font-semibold">Missing %</th>
                <th className="px-3 py-2 font-semibold">Unique values</th>
                <th className="px-3 py-2 font-semibold">Sample value</th>
              </tr>
            </thead>
            <tbody>
              {profile.columnProfiles.map((cp) => (
                <tr key={cp.column} className="border-b border-border-subtle/60 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-mono font-medium text-ink">{cp.column}</td>
                  <td className={cn("px-3 py-2 font-mono", cp.missing > 0 ? "font-semibold text-warning-text" : "text-ink-3")}>
                    {cp.missing.toLocaleString()}
                  </td>
                  <td className={cn("px-3 py-2 font-mono", cp.missingPct > 1 ? "font-semibold text-warning-text" : "text-ink-3")}>
                    {cp.missingPct}%
                  </td>
                  <td className="px-3 py-2 font-mono text-ink-3">{cp.unique.toLocaleString()}</td>
                  <td className="max-w-[16rem] truncate px-3 py-2 font-mono text-[11.5px] text-ink-3">{cp.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------------- re-seed */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border-subtle p-4 text-[12.5px] leading-relaxed text-ink-3">
        <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-semibold text-ink-2">Reproducibility:</span> the CSV you download is generated from a seed
          derived from the project id — every learner and every re-visit gets the identical file, so findings, cleaning
          logs and discussions are directly comparable. The full data dictionary is on the Project brief tab.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "ok" }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{label}</p>
      <p className={cn("mt-1 font-mono text-lg font-bold", tone === "warn" ? "text-warning-text" : "text-ink")}>{value}</p>
    </div>
  );
}
