"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts, in seconds. */
  delay?: number;
  /** Animation duration, in seconds. */
  duration?: number;
  /** Initial vertical offset in pixels (positive = rise up, negative = drop down). */
  y?: number;
  /** Initial horizontal offset in pixels. */
  x?: number;
  /** Subtle de-blur on entry (works well on hero headlines). */
  blur?: boolean;
  /** Trigger when scrolled into view (`true`) or immediately on mount (`false`). */
  inView?: boolean;
}

/**
 * Graceful entrance wrapper combining subtle translate + opacity fade.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 14,
  x = 0,
  blur = false,
  inView = true,
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial = {
    opacity: 0,
    x,
    y,
    ...(blur ? { filter: "blur(4px)" } : {}),
  };

  const target = {
    opacity: 1,
    x: 0,
    y: 0,
    ...(blur ? { filter: "blur(0px)" } : {}),
  };

  const transition = {
    duration,
    delay,
    ease: EASE_OUT_EXPO,
  };

  if (inView) {
    return (
      <motion.div
        initial={initial}
        whileInView={target}
        viewport={{ once: true, amount: 0.15 }}
        transition={transition}
        className={cn(className)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      animate={target}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
