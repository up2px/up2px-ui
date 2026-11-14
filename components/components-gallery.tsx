"use client";

import React from "react";
import Link from "next/link";
import type { RegistryComponentMeta } from "@/lib/registry";
import { getDemoComponent } from "@/registry/__generated__/demo-map";
import { ArrowUpRight } from "lucide-react";

interface ComponentsGalleryProps {
  components: RegistryComponentMeta[];
}

function renderDemo(slug: string) {
  const Demo = getDemoComponent(slug);
  if (!Demo) {
    return (
      <span className="text-xs text-muted-foreground">Preview unavailable</span>
    );
  }
  return React.createElement(Demo);
}

function GalleryCard({ comp }: { comp: RegistryComponentMeta }) {
  return (
    <div className="group flex flex-col gap-2 rounded-4xl border border-border bg-surface p-2">
      {/* Live Preview Stage */}
      <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl border border-border bg-background bg-[radial-gradient(color-mix(in_srgb,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-size:18px_18px] p-6">
        {renderDemo(comp.slug)}
      </div>

      {/* Bottom Metadata & Action Bar */}
      <div className="flex items-center justify-between gap-4 pl-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {comp.title}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {comp.tagline ?? comp.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center">
          <Link
            href={`/components/${comp.slug}`}
            className="group/link inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-surface-secondary"
          >
            <span>Open</span>
            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ComponentsGallery({ components }: ComponentsGalleryProps) {
  return (
    <div className="h-full w-full overflow-y-auto p-6 sm:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Components
        </h1>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {components.map((comp) => (
            <GalleryCard key={comp.slug} comp={comp} />
          ))}
        </div>
      </div>
    </div>
  );
}
