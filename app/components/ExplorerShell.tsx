"use client";

import React, { useState } from "react";
import FileExplorer from "./FileExplorer";
import AnnotationEditor from "./AnnotationEditor";
import { EditorProvider } from "./EditorContext";

export default function ExplorerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openedAnnotationId, setOpenedAnnotationId] = useState<string | null>(
    null
  );

  return (
    <EditorProvider value={{ openedAnnotationId, setOpenedAnnotationId }}>
      <div className="app-root">
        <aside className="sidebar">
          <div className="sidebar-header">Explorer</div>
          <FileExplorer
            onOpenAnnotation={(id: string | undefined | null) =>
              setOpenedAnnotationId(id ?? null)
            }
          />
        </aside>
        <main
          className={`main-content ${openedAnnotationId ? "editor-open" : ""}`}
        >
          {/* Conteúdo da página (children) fica em cima; editor fica abaixo */}
          {children}
          <div className="annotation-editor">
            <AnnotationEditor annotationId={openedAnnotationId} />
          </div>
        </main>
      </div>
    </EditorProvider>
  );
}
