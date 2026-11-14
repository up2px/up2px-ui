"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export interface InlinePillProps {
  word: string;
  icon?: ReactNode;
  delay?: number;
  className?: string;
  iconClassName?: string;
}

/**
 * Animated inline tech/brand pill sized to sit inside body copy.
 */
export function InlinePill({
  word,
  icon,
  delay = 0,
  className,
  iconClassName,
}: InlinePillProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      initial={reduceMotion ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
      className={cn(
        "mx-[0.12em] inline-flex translate-y-[-0.05em] items-center gap-[0.32em] rounded-full border border-border bg-surface-secondary/90 py-[0.14em] pr-[0.52em] pl-[0.18em] align-middle text-[0.9em] leading-none font-medium text-foreground shadow-xs",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex size-[1.25em] shrink-0 items-center justify-center rounded-full bg-surface",
          iconClassName,
        )}
      >
        {icon ?? <span className="size-[0.36em] rounded-full bg-accent" />}
      </span>
      {word}
    </motion.span>
  );
}
