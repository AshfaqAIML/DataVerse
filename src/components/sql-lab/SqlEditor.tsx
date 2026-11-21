"use client";

/**
 * SqlEditor — a CodeMirror 6 SQL editor (thin React wrapper around the
 * raw CodeMirror packages, avoiding duplicate-instance issues).
 *
 * Features: SQL syntax highlighting for PostgreSQL, history, bracket
 * matching, autocompletion of table/column names when a live schema is
 * supplied, and Ctrl/Cmd+Enter wired to "run".
 */
import { useEffect, useMemo, useRef } from "react";
import { EditorState, Compartment, Prec, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
  placeholder as cmPlaceholder,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { bracketMatching } from "@codemirror/language";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import type { SchemaTable } from "@/lib/sql-lab/useSqlEngine";

export interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Live schema for autocomplete (table -> columns). */
  schema?: SchemaTable[] | null;
  /** Height in tailwind h-N form (e.g. "h-44") or raw px ("176px"). */
  height?: string;
  /** Fired on Ctrl/Cmd+Enter — the "run" shortcut. */
  onRunShortcut?: () => void;
  placeholderText?: string;
  readOnly?: boolean;
  /** Accessible name for the editing surface (WCAG 4.1.2). */
  ariaLabel?: string;
}

export function SqlEditor({
  value,
  onChange,
  schema,
  height = "h-44",
  onRunShortcut,
  placeholderText,
  readOnly,
  ariaLabel = "SQL query editor",
}: SqlEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const runRef = useRef(onRunShortcut);
  const changeRef = useRef(onChange);
  const sqlComp = useMemo(() => new Compartment(), []);

  useEffect(() => {
    // keep the latest callbacks on refs after every render
    runRef.current = onRunShortcut;
    changeRef.current = onChange;
  });

  const pxHeight = height.startsWith("h-")
    ? `${Number(height.slice(2)) * 4}px`
    : height;

  const schemaExtension = useMemo(() => {
    const spec: Record<string, string[]> = {};
    if (schema && schema.length > 0) {
      for (const t of schema) spec[t.name] = t.columns.map((c) => c.name);
    }
    return sql({
      dialect: PostgreSQL,
      ...(Object.keys(spec).length > 0 ? { schema: spec } : {}),
      upperCaseKeywords: true,
    });
  }, [schema]);

  /* create the editor once */
  useEffect(() => {
    if (!hostRef.current) return;
    const runBinding = {
      key: "Mod-Enter",
      run: () => {
        runRef.current?.();
        return true;
      },
    };
    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      drawSelection(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      EditorView.lineWrapping,
      /* accessible name for the editable region (axe aria-input-field-name) */
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      Prec.highest(keymap.of([runBinding, indentWithTab, ...defaultKeymap, ...historyKeymap])),
      sqlComp.of(schemaExtension),
      oneDark,
      /* Our chrome must outrank one-dark's own theme — see the note in
         CodeEditor.tsx; on --dv-editor-bg the palette clears AA. */
      Prec.high(
        EditorView.theme({
          "&": { height: "100%", fontSize: "13px", backgroundColor: "var(--dv-editor-bg)" },
          ".cm-scroller": { fontFamily: "var(--font-mono, ui-monospace, monospace)", overflow: "auto" },
          ".cm-gutters": { backgroundColor: "var(--dv-editor-bg)", border: "none", color: "var(--dv-editor-gutter)" },
          ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.04)" },
          ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,0.06)", color: "var(--dv-editor-ink)" },
        }),
      ),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          changeRef.current(update.state.doc.toString());
        }
      }),
      cmPlaceholder(placeholderText ?? "-- Write your SQL here, then press Run (Ctrl/Cmd+Enter)"),
    ];
    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true), EditorView.editable.of(false));
    }
    const state = EditorState.create({ doc: value, extensions });
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  /* swap the language/autocomplete extension when the schema changes */
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: sqlComp.reconfigure(schemaExtension) });
  }, [schemaExtension, sqlComp]);

  /* external value updates (Reset button, starter swap) */
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="overflow-hidden rounded-lg border border-editor-border bg-editor-bg"
      style={{ height: pxHeight }}
    />
  );
}
