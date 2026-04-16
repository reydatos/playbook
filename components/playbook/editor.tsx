"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
} from "@codemirror/language";
import { lineNumbers, highlightActiveLine } from "@codemirror/view";

export interface MarkdownEditorHandle {
  insertText: (text: string) => void;
  getSelection: () => string;
  replaceSelection: (text: string) => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange?: (selection: string) => void;
  readOnly?: boolean;
}

export const MarkdownEditor = forwardRef<
  MarkdownEditorHandle,
  MarkdownEditorProps
>(function MarkdownEditor(
  { value, onChange, onSelectionChange, readOnly = false },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onSelectionRef = useRef(onSelectionChange);
  onSelectionRef.current = onSelectionChange;

  useImperativeHandle(ref, () => ({
    insertText(text: string) {
      const view = viewRef.current;
      if (!view) return;
      const { from } = view.state.selection.main;
      view.dispatch({
        changes: { from, to: from, insert: text },
        selection: { anchor: from + text.length },
      });
      view.focus();
    },
    getSelection() {
      const view = viewRef.current;
      if (!view) return "";
      const { from, to } = view.state.selection.main;
      return view.state.sliceDoc(from, to);
    },
    replaceSelection(text: string) {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      view.focus();
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
      if (update.selectionSet && onSelectionRef.current) {
        const { from, to } = update.state.selection.main;
        const selected = update.state.sliceDoc(from, to);
        onSelectionRef.current(selected);
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        updateListener,
        EditorView.lineWrapping,
        placeholder("Start writing your playbook content in Markdown..."),
        EditorState.readOnly.of(readOnly),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          },
          ".cm-content": {
            padding: "16px 0",
          },
          ".cm-line": {
            padding: "0 16px",
          },
          "&.cm-focused .cm-cursor": {
            borderLeftColor: "hsl(220, 90%, 56%)",
          },
          "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
            backgroundColor: "hsl(220, 90%, 56%, 0.2)",
          },
          ".cm-gutters": {
            backgroundColor: "hsl(220, 14%, 98%)",
            borderRight: "1px solid hsl(220, 13%, 91%)",
            color: "hsl(220, 9%, 66%)",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "hsl(220, 14%, 95%)",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  // Sync external value changes without losing cursor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-hidden rounded-md border bg-white"
    />
  );
});
