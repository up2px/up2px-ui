import React from "react";
import { getAllComponents } from "@/lib/registry";
import { StudioShell } from "@/components/studio/studio-shell";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const components = getAllComponents();

  return <StudioShell components={components}>{children}</StudioShell>;
}
