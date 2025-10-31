"use client";

import React, { useEffect, useState } from "react";

type Node = {
  name: string;
  id?: string;
  type: "course" | "lesson" | "annotation";
  courseId?: string;
  children?: Node[];
};

export default function FileExplorer({
  onOpenAnnotation,
}: {
  onOpenAnnotation?: (id?: string | null) => void;
}) {
  const [tree, setTree] = useState<Node[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  async function fetchTree() {
    try {
      setErrorMsg(null);
      const r = await fetch("/api/explorer");
      let data: unknown = null;
      try {
        data = await r.json();
      } catch (e) {
        console.warn("Explorer: response not json", e);
      }

      if (!r.ok) {
        const obj = data as Record<string, unknown> | null;
        const msg =
          obj && typeof obj.message === "string"
            ? obj.message
            : (obj && (typeof obj.error === "string" ? obj.error : null)) ||
              r.statusText;
        setErrorMsg(String(msg ?? "Erro ao carregar explorer"));
        setTree([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Explorer: unexpected response", data);
        setErrorMsg("Resposta inesperada do servidor");
        setTree([]);
        return;
      }

      setTree(data as Node[]);
    } catch (e) {
      console.error("Explorer fetch error", e);
      setErrorMsg("Erro ao carregar explorer");
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchTree();
    };
    init();
  }, []);

  function toggle(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  function renderNodes(nodes?: Node[]) {
    if (!nodes) return null;
    return (
      <ul className="explorer-list">
        {nodes.map((n) => {
          const idKey = n.id ?? n.name;
          const isSelected = selected === idKey;
          const isExpanded = !!expanded[idKey];
          return (
            <li key={idKey} className={`explorer-item ${n.type}`}>
              {n.type === "course" ? (
                <>
                  <div
                    className={`explorer-row ${
                      isSelected ? "explorer-selected" : ""
                    }`}
                    onClick={() =>
                      setSelected((p) => (p === idKey ? null : idKey))
                    }
                  >
                    <button
                      className="explorer-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(idKey);
                      }}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "▾" : "▸"}
                    </button>
                    <span className="explorer-icon" aria-hidden>
                      {isExpanded ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                            fill="#9CDCFE"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                            fill="#6BA6FF"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="explorer-name">{n.name}</span>
                  </div>
                  {isExpanded && renderNodes(n.children)}
                </>
              ) : n.type === "lesson" ? (
                <>
                  <div
                    className={`explorer-row ${
                      isSelected ? "explorer-selected" : ""
                    }`}
                    onClick={() =>
                      setSelected((p) => (p === idKey ? null : idKey))
                    }
                  >
                    <button
                      className="explorer-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(idKey);
                      }}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "▾" : "▸"}
                    </button>
                    <span className="explorer-icon" aria-hidden>
                      {isExpanded ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                            fill="#FFCC66"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                            fill="#E6B86E"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="explorer-name">{n.name}</span>
                  </div>
                  {isExpanded && renderNodes(n.children)}
                </>
              ) : (
                <div
                  className={`explorer-row ${
                    isSelected ? "explorer-selected" : ""
                  }`}
                  onClick={() => {
                    setSelected((p) => (p === idKey ? null : idKey));
                    // open annotation in editor when clicking file
                    if (n.type === "annotation" && onOpenAnnotation) {
                      onOpenAnnotation(n.id);
                    }
                  }}
                >
                  <span className="explorer-icon" aria-hidden>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                        fill="#D4D4D4"
                      />
                    </svg>
                  </span>
                  <span className="explorer-file">{n.name}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  function findNodeById(nodes: Node[] | undefined, id?: string): Node | null {
    if (!nodes || !id) return null;
    for (const n of nodes) {
      if ((n.id ?? n.name) === id) return n;
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
    return null;
  }

  async function handleDeleteSelected() {
    if (!selected) return;
    const selNode = findNodeById(tree ?? undefined, selected);
    if (!selNode) return;
    const ok = confirm(
      `Deseja realmente excluir "${selNode.name}"? Esta ação é irreversível.`
    );
    if (!ok) return;
    setLoadingAction(true);
    try {
      if (selNode.type === "course") {
        await fetch("/api/courses", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: selNode.id }),
        });
      } else if (selNode.type === "lesson") {
        await fetch("/api/lessons", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: selNode.id }),
        });
      } else if (selNode.type === "annotation") {
        await fetch("/api/annotations", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: selNode.id }),
        });
      }
      setSelected(null);
      // if an annotation (or any parent) was deleted, close the editor
      try {
        if (typeof onOpenAnnotation === "function") onOpenAnnotation(null);
      } catch {}
      await fetchTree();
    } catch (e) {
      console.error("delete failed", e);
    } finally {
      setLoadingAction(false);
    }
  }

  return (
    <div className="file-explorer">
      {/* Contextual toolbar appears when a node is selected */}
      {selected && (
        <div className="explorer-toolbar">
          {(() => {
            const selNode = findNodeById(tree ?? undefined, selected);
            return (
              <>
                <button
                  className="icon-button"
                  title={
                    selNode?.type === "lesson" ? "Nova pasta" : "Novo capítulo"
                  }
                  onClick={async () => {
                    const name = prompt("Nome da nova pasta/capítulo:");
                    if (!name) return;
                    setLoadingAction(true);
                    try {
                      if (!selNode) return;
                      if (selNode.type === "course") {
                        await fetch("/api/lessons", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            courseId: selNode.id,
                            title: name,
                          }),
                        });
                      } else if (selNode.type === "lesson") {
                        await fetch("/api/lessons", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            courseId: selNode.courseId ?? null,
                            title: name,
                            parentId: selNode.id,
                          }),
                        });
                      }
                      await fetchTree();
                    } finally {
                      setLoadingAction(false);
                    }
                  }}
                >
                  {/* folder icon */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                      fill="#9CDCFE"
                    />
                  </svg>
                </button>
                <button
                  className="icon-button"
                  title="Novo arquivo (anotação)"
                  onClick={async () => {
                    const selNode = findNodeById(tree ?? undefined, selected);
                    if (!selNode || selNode.type !== "lesson") {
                      alert(
                        "Selecione uma aula/capítulo para criar uma anotação."
                      );
                      return;
                    }
                    // Only ask for title; create the annotation file now and let user fill content later in the editor
                    const title = prompt("Título da anotação (opcional):");
                    setLoadingAction(true);
                    try {
                      const res = await fetch("/api/annotations", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ lessonId: selNode.id, title }),
                      });
                      const data = await res.json();
                      // refresh tree and open the new annotation in the editor if possible
                      await fetchTree();
                      if (
                        data &&
                        data._id &&
                        typeof onOpenAnnotation === "function"
                      ) {
                        try {
                          onOpenAnnotation(String(data._id));
                        } catch {}
                      }
                    } finally {
                      setLoadingAction(false);
                    }
                  }}
                >
                  {/* file icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                      fill="#D4D4D4"
                    />
                  </svg>
                </button>
                <button
                  className="icon-button delete"
                  title="Excluir"
                  onClick={async () => {
                    await handleDeleteSelected();
                  }}
                  disabled={loadingAction}
                >
                  {/* trash icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6h18v2H3V6zm3 3h12l-1 11H7L6 9zm3-7h6l1 2H8L9 2z"
                      fill="#E06C75"
                    />
                  </svg>
                </button>
              </>
            );
          })()}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <button
          onClick={async () => {
            const name = prompt("Nome do novo curso:");
            if (!name) return;
            setLoadingAction(true);
            await fetch("/api/courses", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ title: name }),
            });
            setLoadingAction(false);
            await fetchTree();
          }}
          disabled={loadingAction}
        >
          + Curso
        </button>
        <button onClick={() => fetchTree()} disabled={loadingAction}>
          Atualizar
        </button>
      </div>
      {!tree && <div className="explorer-loading">carregando...</div>}
      {errorMsg && <div className="explorer-error">{errorMsg}</div>}
      {tree && renderNodes(tree)}
    </div>
  );
}
