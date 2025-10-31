"use client";

import React, { createContext, useContext } from "react";

type EditorContextType = {
  openedAnnotationId: string | null;
  setOpenedAnnotationId: (id: string | null) => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: EditorContextType;
}) {
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx)
    throw new Error("useEditorContext must be used within EditorProvider");
  return ctx;
}
