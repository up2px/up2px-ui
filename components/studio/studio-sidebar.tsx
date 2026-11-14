"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import { Search, X } from "lucide-react";
import type { RegistryComponentMeta } from "@/lib/registry";
import { SquareLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

interface StudioSidebarProps {
  components: RegistryComponentMeta[];
  onNavigate?: () => void;
}

interface SidebarNavItemProps {
  href: string;
  label: string;
  isActive: boolean;
  onNavigate?: () => void;
}

function SidebarNavItem({
  href,
  label,
  isActive,
  onNavigate,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center rounded-r-xl py-1.5 pr-3 pl-3.5 text-[13px] transition-colors",
        isActive
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {/* Active spring highlight */}
      {isActive && (
        <motion.span
          layoutId="studio-nav-bg"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="absolute inset-0 -left-px rounded-r-xl bg-surface/85 shadow-2xs"
        />
      )}

      {/* Kinetic left rail hook */}
      {isActive ? (
        <motion.span
          layoutId="studio-nav-rail"
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="absolute top-1 bottom-1 -left-[1.5px] z-10 w-[2.5px] rounded-full bg-accent shadow-[0_0_8px_rgba(255,59,0,0.45)]"
        />
      ) : (
        <span className="absolute top-2 bottom-2 -left-px w-[1.5px] rounded-full bg-foreground/45 opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      <span className="relative z-10 truncate transition-transform duration-150 group-hover:translate-x-0.5">
        {label}
      </span>
    </Link>
  );
}

/** Left navigation sidebar for the component studio with a kinetic left rail. */
export function StudioSidebar({ components, onNavigate }: StudioSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredComponents = components.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <LayoutGroup id="studio-sidebar-nav">
      <div className="flex h-full flex-col gap-5">
        {/* Brand Lockup */}
        <div className="flex items-center px-1 pt-0.5">
          <Link
            href="/"
            onClick={onNavigate}
            className="font-display inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            <span className="relative size-5 shrink-0">
              <SquareLogo />
            </span>
            <span>up2px UI</span>
          </Link>
        </div>

        {/* Minimal Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/75" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 w-full rounded-xl border border-border/60 bg-background/45 pr-8 pl-8 text-xs text-foreground placeholder:text-muted-foreground/55 focus:border-accent/45 focus:bg-surface/80 focus:outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border/70 bg-surface/70 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground/65">
              /
            </kbd>
          )}
        </div>

        {/* Kinetic Rail Navigation */}
        <nav className="thin-scrollbar flex-1 space-y-5 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <div className="px-1 text-[11px] font-medium text-muted-foreground/65">
              Overview
            </div>
            <div className="ml-1.5 border-l border-dashed border-foreground/25 dark:border-foreground/20">
              <SidebarNavItem
                href="/components"
                label="All Components"
                isActive={pathname === "/components"}
                onNavigate={onNavigate}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="px-1 text-[11px] font-medium text-muted-foreground/65">
              Components
            </div>
            <div className="ml-1.5 space-y-0.5 border-l border-dashed border-foreground/25 dark:border-foreground/20">
              {filteredComponents.length === 0 ? (
                <p className="py-2 pl-3.5 text-xs text-muted-foreground/60">
                  No matches
                </p>
              ) : (
                filteredComponents.map((c) => (
                  <SidebarNavItem
                    key={c.slug}
                    href={`/components/${c.slug}`}
                    label={c.title}
                    isActive={pathname === `/components/${c.slug}`}
                    onNavigate={onNavigate}
                  />
                ))
              )}
            </div>
          </div>
        </nav>
      </div>
    </LayoutGroup>
  );
}
