"use client";

import React, { useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { Check, Copy, FileCode2, Terminal } from "lucide-react";
import type { RegistryComponentMeta } from "@/lib/registry";
import { cn } from "@/lib/utils";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import {
  buildCliCommand,
  DependencyIcon,
  getRegistryUrl,
  PACKAGE_MANAGERS,
  PackageManagerIcon,
  PM_RUNNERS,
  type PackageManager,
} from "@/components/studio/package-manager";

interface InspectorPanelProps {
  component: RegistryComponentMeta;
  pm?: PackageManager;
  onPmChange?: (pm: PackageManager) => void;
}

export function InspectorPanel({
  component,
  pm: controlledPm,
  onPmChange,
}: InspectorPanelProps) {
  const [internalPm, setInternalPm] = useState<PackageManager>("pnpm");
  const pm = controlledPm ?? internalPm;
  const setPm = onPmChange ?? setInternalPm;
  const [selectedTab, setSelectedTab] = useState<string>("demo");
  const { copied: copiedCmd, copy: copyCmd } = useCopyFeedback();
  const { copied: copiedDeps, copy: copyDeps } = useCopyFeedback();
  const { copied: copiedCode, copy: copyCode } = useCopyFeedback();

  const registryUrl = getRegistryUrl(component.installCommand);
  const cliCommand = buildCliCommand(pm, component.installCommand);
  const depsCommand =
    component.dependencies.length > 0
      ? `${PM_RUNNERS[pm].add} ${component.dependencies.join(" ")}`
      : "";

  const codeTabs = [
    ...(component.hasDemo
      ? [
          {
            id: "demo",
            label: "demo.tsx",
            content: component.demoContent,
            highlightedHtml: component.demoHighlightedHtml,
          },
        ]
      : []),
    ...component.files.map((file) => ({
      id: file.relativePath,
      label: file.relativePath,
      content: file.content,
      highlightedHtml: file.highlightedHtml,
    })),
  ];

  const activeTab =
    codeTabs.find((t) => t.id === selectedTab) ?? codeTabs[0] ?? null;

  return (
    <LayoutGroup id={`inspector-${component.slug}`}>
      {/* p-3 (12px) + inner rounded-xl (12px) = 24px (rounded-l-3xl outer drawer) */}
      <div className="flex h-full flex-col gap-3.5 overflow-hidden p-3 pt-16">
        {/* Component Header */}
        <div className="shrink-0 space-y-1 px-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {component.title}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {component.description}
          </p>
        </div>

        {/* Install + Package Manager Switcher */}
        <div className="shrink-0 overflow-hidden rounded-xl border border-border/80 bg-surface/65 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/40 px-3 py-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              <span>CLI Install</span>
            </span>

            <div className="flex items-center gap-0.5 rounded-full border border-border/80 bg-background/70 p-1">
              {PACKAGE_MANAGERS.map((manager) => {
                const isSelected = pm === manager;
                return (
                  <button
                    key={manager}
                    type="button"
                    onClick={() => setPm(manager)}
                    className={cn(
                      "relative inline-flex h-6 items-center rounded-full pr-2.5 pl-1 font-mono text-[11px] leading-none transition-colors",
                      isSelected
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="inspector-pm-pill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                        className="absolute inset-0 rounded-full bg-surface shadow-xs ring-1 ring-border/60"
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      <PackageManagerIcon manager={manager} />
                      <span>{manager}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="thin-scrollbar min-w-0 flex-1 overflow-x-auto pb-0.5 font-mono text-[11px] whitespace-nowrap">
              <span className="mr-1.5 text-accent select-none">$</span>
              <span className="text-foreground">{PM_RUNNERS[pm].dlx}</span>{" "}
              <span className="text-muted-foreground">
                shadcn@latest add {registryUrl}
              </span>
            </div>

            <button
              type="button"
              onClick={() => copyCmd(cliCommand)}
              aria-label="Copy CLI command"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/80 bg-background/75 px-2.5 py-1 font-mono text-[10px] font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-background"
            >
              {copiedCmd ? (
                <Check className="h-3 w-3 text-accent" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
              <span>{copiedCmd ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {component.dependencies.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-background/30 px-3 py-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {component.dependencies.map((dep) => (
                  <span
                    key={dep}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-2 py-0.5 font-mono text-[10px] text-foreground"
                  >
                    <DependencyIcon name={dep} />
                    <span>{dep}</span>
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => copyDeps(depsCommand)}
                title={depsCommand}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
              >
                {copiedDeps ? (
                  <Check className="h-2.5 w-2.5 text-accent" />
                ) : (
                  <Copy className="h-2.5 w-2.5" />
                )}
                <span>{copiedDeps ? "Copied" : "Copy deps"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Code Card (concentric rounded-xl, underline tabs, floating Copy) */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-surface/90 backdrop-blur-md">
          {/* Sleek Underline Tab Bar */}
          <div className="flex shrink-0 [scrollbar-width:none] items-center gap-1 overflow-x-auto border-b border-border/70 bg-background/40 px-2.5 [&::-webkit-scrollbar]:hidden">
            {codeTabs.map((tab) => {
              const isActive = activeTab?.id === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-1.5 px-2.5 py-2.5 font-mono text-[11px] whitespace-nowrap transition-colors",
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileCode2
                    className={cn(
                      "h-3 w-3 transition-colors",
                      isActive ? "text-accent" : "text-muted-foreground/60",
                    )}
                  />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="inspector-code-underline"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute right-1.5 bottom-0 left-1.5 h-[2px] rounded-full bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scrollable Code Body */}
          <div
            className="thin-scrollbar flex-1 overflow-auto p-4 pb-12 font-mono text-[11.5px] leading-[1.65] [&_code]:!bg-transparent [&_pre]:!bg-transparent"
            dangerouslySetInnerHTML={{
              __html: activeTab?.highlightedHtml || "",
            }}
          />

          {activeTab && (
            <button
              type="button"
              onClick={() => copyCode(activeTab.content)}
              title="Copy code"
              className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/85 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-xl transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {copiedCode ? (
                <Check className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copiedCode ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      </div>
    </LayoutGroup>
  );
}
