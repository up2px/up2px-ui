"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { RegistryComponentMeta } from "@/lib/registry";
import { cn } from "@/lib/utils";
import { getDemoComponent } from "@/registry/__generated__/demo-map";
import { FadeIn } from "@/components/ui/fade-in";

interface ComponentShowcaseProps {
  components: RegistryComponentMeta[];
}

const AUTO_ADVANCE_MS = 7000;

function renderDemo(slug: string) {
  const Demo = getDemoComponent(slug);
  if (!Demo) {
    return (
      <span className="text-xs text-muted-foreground">Preview unavailable</span>
    );
  }
  return React.createElement(Demo);
}

/** Prestige-style tabbed interactive component showcase for the landing page. */
export function ComponentShowcase({ components }: ComponentShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const active = components[activeIndex] ?? components[0];
  const hasMultiple = components.length > 1;

  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % components.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [hasMultiple, isPaused, components.length, activeIndex]);

  if (!active) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 md:py-24">
      <FadeIn inView className="mb-12 flex flex-col items-center text-center">
        <h2 className="font-display max-w-2xl text-center text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          <span className="font-doto text-accent">Interactive</span> out of the
          box.
          <span className="block text-muted-foreground">
            Yours to edit line by line.
          </span>
        </h2>
      </FadeIn>

      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex flex-col gap-2 rounded-4xl border border-border bg-surface p-2"
      >
        {/* Tab Bar */}
        <div
          role="tablist"
          aria-label="Featured components"
          className="flex [scrollbar-width:none] items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {components.map((comp, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={comp.slug}
                type="button"
                role="tab"
                id={`showcase-tab-${comp.slug}`}
                aria-selected={isSelected}
                aria-controls="showcase-stage"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative inline-flex h-9 min-w-max shrink-0 cursor-pointer overflow-hidden rounded-full p-px transition-colors duration-200 focus-visible:outline-none",
                  isSelected ? "bg-border shadow-xs" : "bg-transparent",
                )}
              >
                {isSelected && (
                  <span
                    key={`${comp.slug}-${activeIndex}`}
                    aria-hidden="true"
                    style={{
                      animationDuration: `${AUTO_ADVANCE_MS}ms`,
                      animationIterationCount: hasMultiple ? 1 : "infinite",
                      animationPlayState: isPaused ? "paused" : "running",
                    }}
                    className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[240%] -translate-x-1/2 -translate-y-1/2 animate-spin bg-[conic-gradient(from_0deg,transparent_0deg_280deg,color-mix(in_srgb,var(--accent)_75%,transparent)_325deg,transparent_360deg)] motion-reduce:animate-none"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 inline-flex h-full w-full items-center gap-2 rounded-full px-4 text-xs font-medium whitespace-nowrap transition-colors duration-200",
                    isSelected
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:bg-surface-secondary/70 hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      isSelected ? "bg-accent" : "bg-border",
                    )}
                  />
                  <span>{comp.title}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Stage */}
        <div
          id="showcase-stage"
          role="tabpanel"
          aria-labelledby={`showcase-tab-${active.slug}`}
          className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-3xl border border-border bg-background bg-[radial-gradient(color-mix(in_srgb,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-size:18px_18px] p-6 sm:min-h-[440px] sm:p-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.slug}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full items-center justify-center"
            >
              {renderDemo(active.slug)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Metadata & Action Bar */}
        <div className="flex items-center justify-between gap-4 pl-3">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <span className="shrink-0 text-sm font-semibold text-foreground">
              {active.title}
            </span>
            <span className="hidden truncate text-xs text-muted-foreground sm:block">
              {active.tagline ?? active.description}
            </span>
          </div>

          <div className="flex shrink-0 items-center">
            <Link
              href={`/components/${active.slug}`}
              className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-surface-secondary"
            >
              <span>View code</span>
              <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
