"use client";

/**
 * CodeEditor — a CodeMirror 6 Python editor, the labs' shared writing surface.
 *
 * Mirrors the SqlEditor pattern (raw CodeMirror packages, no duplicate
 * instances): Python syntax highlighting, history, bracket matching,
 * auto-indent via Tab, and Ctrl/Cmd+Enter wired to "run".
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
import { bracketMatching, indentOnInput, foldGutter, indentUnit } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Height in raw px ("420px") — the editor owns its scroll region. */
  height?: string;
  /** Fired on Ctrl/Cmd+Enter — the "run" shortcut. */
  onRunShortcut?: () => void;
  placeholderText?: string;
  readOnly?: boolean;
  /** Accessible name for the editing surface (WCAG 4.1.2/4.1.3). */
  ariaLabel?: string;
}

export function CodeEditor({
  value,
  onChange,
  height = "320px",
  onRunShortcut,
  placeholderText,
  readOnly,
  ariaLabel = "Python code editor",
}: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const runRef = useRef(onRunShortcut);
  const changeRef = useRef(onChange);
  const themeComp = useMemo(() => new Compartment(), []);

  useEffect(() => {
    // keep the latest callbacks on refs after every render
    runRef.current = onRunShortcut;
    changeRef.current = onChange;
  });

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
      foldGutter(),
      highlightActiveLine(),
      history(),
      drawSelection(),
      bracketMatching(),
      indentOnInput(),
      indentUnit.of("    "),
      closeBrackets(),
      autocompletion(),
      EditorView.lineWrapping,
      /* the editable region is a text input — it must carry an accessible
         name (axe: aria-input-field-name). CodeMirror's own aria-label only
         appears when the `ariaLabel` prop is set; we always set it. */
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      Prec.highest(keymap.of([runBinding, indentWithTab, ...defaultKeymap, ...historyKeymap])),
      python(),
      themeComp.of(oneDark),
      /* Our chrome must outrank one-dark's own theme: one-dark paints its
         stock #282c34 background, which strands several of its token colors
         below AA (coral 4.38, stone 3.86). On the system editor surface
         (--dv-editor-bg #0C0E13) the entire palette clears 5.3:1+. */
      Prec.high(
        EditorView.theme({
          "&": { height: "100%", fontSize: "13px", backgroundColor: "var(--dv-editor-bg)" },
          ".cm-scroller": {
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            overflow: "auto",
            lineHeight: "1.65",
          },
          ".cm-gutters": { backgroundColor: "var(--dv-editor-bg)", border: "none", color: "var(--dv-editor-gutter)" },
          ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.04)" },
          ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,0.06)", color: "var(--dv-editor-ink)" },
          ".cm-content": { paddingBlock: "12px" },
        }),
      ),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          changeRef.current(update.state.doc.toString());
        }
      }),
      cmPlaceholder(placeholderText ?? "# Write your Python here, then press Run (Ctrl/Cmd+Enter)"),
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
      style={{ height }}
    />
  );
}
