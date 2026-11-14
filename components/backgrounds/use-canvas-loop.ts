"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { readCanvasPalette, type CanvasThemePalette } from "./theme-colors";

export interface CanvasLoopContext {
  width: number;
  height: number;
  time: number;
  delta: number;
  pointer: { x: number; y: number; active: boolean };
  palette: CanvasThemePalette;
}

export function use2DCanvasLoop(
  drawFrame: (ctx: CanvasRenderingContext2D, info: CanvasLoopContext) => void,
  onClick?: (x: number, y: number) => void,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const drawRef = useRef(drawFrame);
  const clickRef = useRef(onClick);

  useEffect(() => {
    drawRef.current = drawFrame;
  }, [drawFrame]);

  useEffect(() => {
    clickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let palette = readCanvasPalette();
    const pointer = { x: -9999, y: -9999, active: false };
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // Watch class/data-theme mutations on <html> for instant theme switches
    const mo = new MutationObserver(() => {
      palette = readCanvasPalette();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 &&
        pointer.x <= rect.width &&
        pointer.y >= 0 &&
        pointer.y <= rect.height;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        clickRef.current?.(x, y);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    parent.addEventListener("pointerleave", handlePointerLeave);

    let rafId = 0;
    const start = performance.now();
    let prev = start;

    const tick = (now: number) => {
      const time = (now - start) / 1000;
      const delta = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      drawRef.current(ctx, { width, height, time, delta, pointer, palette });
      if (!reducedMotion) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      parent.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [resolvedTheme]);

  return canvasRef;
}
