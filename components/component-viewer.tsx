"use client";

import React, { useState } from "react";
import type { RegistryComponentMeta } from "@/lib/registry";
import { getDemoComponent } from "@/registry/__generated__/demo-map";
import { Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComponentViewerProps {
  component: RegistryComponentMeta;
}

function renderDemo(slug: string, key: number) {
  const Demo = getDemoComponent(slug);
  if (!Demo) {
    return (
      <div className="text-xs text-muted-foreground">
        Demo component not found
      </div>
    );
  }
  return React.createElement(Demo, { key });
}

const HIDE_VIEWPORT_SWITCHER_SLUGS = new Set(["notification-island"]);

export function ComponentViewer({ component }: ComponentViewerProps) {
  const showViewportSwitcher = !HIDE_VIEWPORT_SWITCHER_SLUGS.has(
    component.slug,
  );
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [remountKey, setRemountKey] = useState(0);

  const effectiveViewport = showViewportSwitcher ? viewport : "desktop";
  const viewportWidthClass = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  }[effectiveViewport];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-auto p-6 sm:p-10">
      <div
        className={cn(
          "flex w-full justify-center transition-all duration-200",
          viewportWidthClass,
        )}
      >
        {renderDemo(component.slug, remountKey)}
      </div>

      {/* Subtle bottom-right stage controls */}
      <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full border border-border/80 bg-background/80 p-1 shadow-xs backdrop-blur-md">
        {showViewportSwitcher && (
          <div className="hidden items-center gap-0.5 sm:flex">
            {(
              [
                { id: "desktop", icon: Monitor, label: "Desktop" },
                { id: "tablet", icon: Tablet, label: "Tablet" },
                { id: "mobile", icon: Smartphone, label: "Mobile" },
              ] as const
            ).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewport(id)}
                title={label}
                className={cn(
                  "rounded-full p-1.5 transition-colors",
                  viewport === id
                    ? "bg-surface-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <span className="mx-0.5 h-3.5 w-px bg-border" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setRemountKey((k) => k + 1)}
          title="Replay animation"
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Replay</span>
        </button>
      </div>
    </div>
  );
}
