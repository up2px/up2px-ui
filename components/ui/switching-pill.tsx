"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export interface SwitchingPillItem {
  id: string;
  word: string;
  icon?: ReactNode;
  iconClassName?: string;
}

export interface SwitchingPillProps {
  items: SwitchingPillItem[];
  intervalMs?: number;
  delay?: number;
  className?: string;
}

/**
 * Inline pill that smoothly cycles through labels and icon slots.
 */
export function SwitchingPill({
  items,
  intervalMs = 2600,
  delay = 0,
  className,
}: SwitchingPillProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || items.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [items.length, intervalMs, reduceMotion]);

  const current = items[index] ?? items[0];
  if (!current) return null;

  return (
    <motion.span
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        opacity: { duration: 0.55, ease: EASE_OUT, delay },
        y: { duration: 0.55, ease: EASE_OUT, delay },
        filter: { duration: 0.55, ease: EASE_OUT, delay },
        layout: { duration: 0.35, ease: EASE_OUT },
      }}
      className={cn(
        "mx-[0.12em] inline-flex translate-y-[-0.05em] items-center gap-[0.32em] rounded-full border border-border bg-surface-secondary/90 py-[0.14em] pr-[0.52em] pl-[0.18em] align-middle text-[0.9em] leading-none font-medium text-foreground shadow-xs",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex size-[1.25em] shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface shadow-[inset_0_0_0_1px_var(--border)]",
          current.iconClassName,
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current.id}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, scale: 0.55, rotate: -65, filter: "blur(3px)" }
            }
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, scale: 0.55, rotate: 65, filter: "blur(3px)" }
            }
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 24,
              mass: 0.8,
            }}
            className="inline-flex size-full items-center justify-center"
          >
            {current.icon ?? (
              <span className="size-[0.36em] rounded-full bg-accent" />
            )}
          </motion.span>
        </AnimatePresence>
      </span>

      <span className="relative inline-flex overflow-hidden py-[0.06em]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current.id}
            initial={
              reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(3px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, y: -10, filter: "blur(3px)" }
            }
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="inline-block whitespace-nowrap"
          >
            {current.word}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  );
}
