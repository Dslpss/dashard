"use client";
import React from "react";
import { usePathname } from "next/navigation";
import ExplorerShell from "../components/ExplorerShell";

export default function ConditionalExplorer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't render the Explorer on the login page (and on any auth pages)
  if (pathname === "/login" || pathname?.startsWith("/api/auth")) {
    return <>{children}</>;
  }

  return <ExplorerShell>{children}</ExplorerShell>;
}
