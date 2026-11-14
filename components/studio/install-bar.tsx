"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronsUpDown, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import {
  buildCliCommand,
  PACKAGE_MANAGERS,
  PackageManagerIcon,
  PM_RUNNERS,
  type PackageManager,
} from "@/components/studio/package-manager";

interface StudioInstallBarProps {
  slug: string;
  installCommand: string;
  pm: PackageManager;
  onPmChange: (pm: PackageManager) => void;
}

/** Expandable RareUI-style inline CLI install bar with synced package manager selector. */
export function StudioInstallBar({
  slug,
  installCommand,
  pm,
  onPmChange,
}: StudioInstallBarProps) {
  const [installOpen, setInstallOpen] = useState(false);
  const [pmMenuOpen, setPmMenuOpen] = useState(false);
  const { copied, copy } = useCopyFeedback();
  const installRef = useRef<HTMLDivElement>(null);

  const cliCommand = buildCliCommand(pm, installCommand);

  useEffect(() => {
    if (!installOpen && !pmMenuOpen) return;
    function handleOutside(e: PointerEvent) {
      if (
        installRef.current &&
        !installRef.current.contains(e.target as Node)
      ) {
        setPmMenuOpen(false);
        setInstallOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPmMenuOpen(false);
        setInstallOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [installOpen, pmMenuOpen]);

  return (
    <div
      ref={installRef}
      className="relative flex h-8 items-center rounded-full bg-surface/75 p-0.5"
    >
      <button
        type="button"
        onClick={() => {
          setInstallOpen((v) => {
            if (v) setPmMenuOpen(false);
            return !v;
          });
        }}
        aria-expanded={installOpen}
        aria-label={
          installOpen ? "Close install command" : "Open install command"
        }
        className="flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-background/90 px-2.5 text-xs font-medium text-foreground shadow-2xs transition-colors hover:bg-background"
      >
        <span aria-hidden="true" className="grid place-items-center">
          <motion.span
            animate={{
              opacity: installOpen ? 0 : 1,
              filter: installOpen ? "blur(2.5px)" : "blur(0px)",
            }}
            transition={{ duration: 0.16 }}
            className="col-start-1 row-start-1 inline-flex items-center gap-1.5"
          >
            <PackageManagerIcon manager={pm} />
            <span>Install</span>
          </motion.span>
          <motion.span
            animate={{
              opacity: installOpen ? 1 : 0,
              filter: installOpen ? "blur(0px)" : "blur(2.5px)",
            }}
            transition={{ duration: 0.16 }}
            className="col-start-1 row-start-1 inline-flex items-center justify-center"
          >
            <X className="size-3.5" />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {installOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 32,
              mass: 0.85,
            }}
            className={cn(pmMenuOpen ? "overflow-visible" : "overflow-hidden")}
          >
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.16 }}
              className="flex w-max items-center gap-2.5 pr-1 pl-2 whitespace-nowrap"
            >
              {/* Package Manager Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPmMenuOpen((v) => !v)}
                  aria-expanded={pmMenuOpen}
                  aria-label="Change package manager"
                  className="flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-background/90 px-2.5 font-mono text-[11px] font-medium text-foreground shadow-2xs transition-colors hover:bg-background"
                >
                  <PackageManagerIcon manager={pm} />
                  <span>{pm}</span>
                  <ChevronsUpDown className="size-3 opacity-45" />
                </button>

                <AnimatePresence>
                  {pmMenuOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -6,
                        scale: 0.95,
                        filter: "blur(4px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: -6,
                        scale: 0.95,
                        filter: "blur(4px)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                        mass: 0.85,
                      }}
                      className="absolute top-[calc(100%+8px)] left-0 z-50 flex min-w-[120px] flex-col gap-0.5 rounded-2xl border border-border/80 bg-background/90 p-1 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-2xl backdrop-saturate-150 dark:bg-background/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
                    >
                      {PACKAGE_MANAGERS.map((manager) => {
                        const isSelected = pm === manager;
                        return (
                          <button
                            key={manager}
                            type="button"
                            onClick={() => {
                              onPmChange(manager);
                              setPmMenuOpen(false);
                            }}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 font-mono text-[11px] transition-colors",
                              isSelected
                                ? "bg-surface-secondary font-medium text-foreground"
                                : "text-muted-foreground hover:bg-surface-secondary/60 hover:text-foreground",
                            )}
                          >
                            <span className="inline-flex items-center gap-2">
                              <PackageManagerIcon manager={manager} />
                              <span>{manager}</span>
                            </span>
                            {isSelected && (
                              <Check className="h-3 w-3 text-accent" />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span aria-hidden="true" className="h-4 w-px bg-foreground/12" />

              <code
                title={cliCommand}
                className="max-w-[30vw] truncate font-mono text-[11px] tracking-tight text-muted-foreground"
              >
                {PM_RUNNERS[pm].dlx} shadcn@latest add{" "}
                <span className="font-semibold text-foreground">/{slug}</span>
              </code>

              <button
                type="button"
                onClick={() => copy(cliCommand)}
                aria-label="Copy command"
                title="Copy command"
                className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
              >
                <span className="grid size-3.5 shrink-0 place-items-center">
                  <motion.span
                    animate={{
                      opacity: copied ? 0 : 1,
                      filter: copied ? "blur(2.5px)" : "blur(0px)",
                    }}
                    transition={{ duration: 0.15 }}
                    className="col-start-1 row-start-1"
                  >
                    <Copy className="size-3.5" />
                  </motion.span>
                  <motion.span
                    animate={{
                      opacity: copied ? 1 : 0,
                      scale: copied ? 1 : 1.25,
                      filter: copied ? "blur(0px)" : "blur(2.5px)",
                    }}
                    transition={{ duration: 0.15 }}
                    className="col-start-1 row-start-1"
                  >
                    <Check className="size-3.5 text-accent" />
                  </motion.span>
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
