"use client";

import React, { useEffect, useState } from "react";
import { useEditorContext } from "./EditorContext";

type Props = {
  annotationId: string | null;
};

export default function AnnotationEditor({ annotationId }: Props) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [codeLang, setCodeLang] = useState<string>("javascript");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const { setOpenedAnnotationId } = useEditorContext();

  useEffect(() => {
    const load = async () => {
      if (!annotationId) {
        setTitle("");
        setContent("");
        return;
      }
      setLoading(true);
      try {
        const r = await fetch(`/api/annotations?id=${annotationId}`);
        const data = await r.json();
        if (data) {
          setTitle(data.title ?? "");
          setContent(data.content ?? "");
          setDirty(false);
        }
      } catch (e) {
        console.error("failed to load annotation", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [annotationId]);

  async function save() {
    if (!annotationId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/annotations`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: annotationId, title, content }),
      });
      const updated = await r.json();
      setTitle(updated?.title ?? title);
      setContent(updated?.content ?? content);
      setDirty(false);
    } catch (e) {
      console.error("save failed", e);
    } finally {
      setLoading(false);
    }
  }

  function insertCodeBlock() {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);
    const fence = "```" + (codeLang ? codeLang : "");
    const codeBlock = fence + "\n" + selected + "\n" + "```\n";
    const newContent = before + codeBlock + after;
    setContent(newContent);
    setDirty(true);
    // place cursor after the opening fence if nothing selected
    requestAnimationFrame(() => {
      if (!ta) return;
      const pos = before.length + codeBlock.length; // cursor after inserted block
      ta.focus();
      ta.selectionStart = ta.selectionEnd = pos;
    });
  }

  if (!annotationId)
    return (
      <div style={{ color: "#9aa4a6" }}>Selecione uma anotação para editar</div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          placeholder="Título da anotação"
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #2a2a2a",
            background: "#0f0f0f",
            color: "var(--foreground)",
          }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setOpenedAnnotationId(null)}
            title="Fechar anotação"
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              background: "transparent",
              color: "var(--foreground)",
              border: "1px solid transparent",
            }}
          >
            ✕
          </button>
          <select
            value={codeLang}
            onChange={(e) => setCodeLang(e.target.value)}
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              background: "#0f0f0f",
              color: "var(--foreground)",
              border: "1px solid #2a2a2a",
            }}
          >
            <option value="">fence</option>
            <option value="javascript">javascript</option>
            <option value="typescript">typescript</option>
            <option value="python">python</option>
            <option value="bash">bash</option>
            <option value="json">json</option>
            <option value="html">html</option>
          </select>
          <button
            onClick={insertCodeBlock}
            title="Inserir bloco de código"
            style={{ padding: "8px 12px", borderRadius: 6 }}
          >
            Inserir código
          </button>
          <button
            onClick={save}
            disabled={!dirty || loading}
            style={{ padding: "8px 12px", borderRadius: 6 }}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setDirty(true);
        }}
        placeholder="Escreva sua anotação aqui..."
        style={{
          width: "100%",
          minHeight: 320,
          padding: 12,
          borderRadius: 6,
          border: "1px solid #2a2a2a",
          background: "#0b0b0b",
          color: "var(--foreground)",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: 14,
        }}
      />
    </div>
  );
}
