"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Code2, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { RegistryComponentMeta } from "@/lib/registry";
import { ThemeToggle } from "@/components/navbar/theme-toggle";
import { InspectorPanel } from "@/components/studio/inspector-panel";
import { StudioInstallBar } from "@/components/studio/install-bar";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import type { PackageManager } from "@/components/studio/package-manager";
import { cn } from "@/lib/utils";

const NAV_WIDTH = 268;
const INFO_WIDTH = 520;
const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

interface StudioShellProps {
  components: RegistryComponentMeta[];
  children: React.ReactNode;
}

export function StudioShell({ components, children }: StudioShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [pm, setPm] = useState<PackageManager>("pnpm");

  const activeSlug = pathname?.startsWith("/components/")
    ? pathname.replace("/components/", "").split("/")[0]
    : null;
  const activeIndex = activeSlug
    ? components.findIndex((c) => c.slug === activeSlug)
    : -1;
  const activeComponent = activeIndex >= 0 ? components[activeIndex] : null;

  return (
    <div className="h-screen w-full overflow-hidden bg-surface">
      {/* Desktop Studio Layout */}
      <div className="relative hidden h-full w-full lg:block">
        {/* Top-left Sidebar Toggle (always reachable) */}
        <button
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          aria-label={navOpen ? "Close sidebar" : "Open sidebar"}
          className="absolute top-3 left-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background/80 text-muted-foreground shadow-xs backdrop-blur-xl transition-colors hover:text-foreground"
        >
          {navOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        {/* Left Glassy Overlay Sidebar (rounded on right side) */}
        <motion.aside
          initial={false}
          animate={{ x: navOpen ? 0 : -(NAV_WIDTH + 24) }}
          transition={SPRING}
          style={{ width: NAV_WIDTH }}
          className="absolute top-0 bottom-0 left-0 z-30 flex flex-col rounded-r-3xl border-y border-r border-border/80 bg-background/25 pt-14 pr-3 pb-3 pl-3 shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-2xl backdrop-saturate-150 dark:bg-background/30 dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
          <StudioSidebar components={components} />
        </motion.aside>

        {/* Top-right Floating Utility Pill */}
        <div className="absolute top-3 right-3 z-40 flex items-center gap-1 rounded-full border border-border/80 bg-background/80 p-1 shadow-xs backdrop-blur-xl">
          {activeComponent && (
            <>
              <StudioInstallBar
                slug={activeComponent.slug}
                installCommand={activeComponent.installCommand}
                pm={pm}
                onPmChange={setPm}
              />

              <button
                type="button"
                onClick={() => setInfoOpen((v) => !v)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                  infoOpen
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground",
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>{infoOpen ? "Hide Code" : "Code"}</span>
              </button>
            </>
          )}

          <div className="flex h-8 w-8 items-center justify-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Right Glassy Inspector / Code Drawer */}
        {activeComponent && (
          <motion.aside
            initial={false}
            animate={{ x: infoOpen ? 0 : INFO_WIDTH + 24 }}
            transition={SPRING}
            style={{ width: INFO_WIDTH }}
            className="absolute top-0 right-0 bottom-0 z-30 flex flex-col rounded-l-3xl border-y border-l border-border/80 bg-background/25 shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-2xl backdrop-saturate-150 dark:bg-background/30 dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            <InspectorPanel
              key={activeComponent.slug}
              component={activeComponent}
              pm={pm}
              onPmChange={setPm}
            />
          </motion.aside>
        )}

        {/* Fullscreen Stage that shrinks/expands when sidebars open/close */}
        <motion.div
          initial={false}
          animate={{
            paddingLeft: navOpen ? NAV_WIDTH : 0,
            paddingRight: infoOpen && activeComponent ? INFO_WIDTH : 0,
          }}
          transition={SPRING}
          className="relative h-full w-full overflow-hidden"
        >
          {children}
        </motion.div>
      </div>

      {/* Mobile Studio Layout */}
      <div className="flex h-full w-full flex-col lg:hidden">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/70 bg-background/80 px-3 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-medium text-foreground"
          >
            <Menu className="h-4 w-4" />
            <span>Components</span>
          </button>

          <div className="flex items-center gap-1.5">
            {activeComponent && (
              <button
                type="button"
                onClick={() => setMobileInfoOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 text-xs font-medium text-foreground"
              >
                <Code2 className="h-3.5 w-3.5 text-accent" />
                <span>Code</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Mobile Left Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 bg-overlay backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={SPRING}
              className="relative h-full w-72 max-w-[85vw] border-r border-border bg-background p-4"
            >
              <StudioSidebar
                components={components}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Code Sheet */}
      <AnimatePresence>
        {mobileInfoOpen && activeComponent && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileInfoOpen(false)}
              className="absolute inset-0 bg-overlay backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING}
              className="absolute inset-x-0 bottom-0 h-[85vh] rounded-t-3xl border-t border-border bg-background"
            >
              <button
                type="button"
                onClick={() => setMobileInfoOpen(false)}
                className="absolute top-4 right-4 z-10 rounded-full border border-border bg-surface p-1.5 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <InspectorPanel
                key={activeComponent.slug}
                component={activeComponent}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
