"use client";

import React, { useCallback, useRef } from "react";
import { rgbCss } from "./theme-colors";
import { use2DCanvasLoop, type CanvasLoopContext } from "./use-canvas-loop";

interface Ripple {
  x: number;
  y: number;
  born: number;
}

export function DotMatrixLedBg() {
  const heatRef = useRef<Float32Array>(new Float32Array(0));
  const ripplesRef = useRef<Ripple[]>([]);
  const timeRef = useRef(0);

  const handleClick = useCallback((x: number, y: number) => {
    ripplesRef.current.push({ x, y, born: timeRef.current });
    if (ripplesRef.current.length > 5) {
      ripplesRef.current.shift();
    }
  }, []);

  const drawFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { width, height, time, delta, pointer, palette }: CanvasLoopContext,
    ) => {
      timeRef.current = time;
      const spacing = 18;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const total = cols * rows;

      if (heatRef.current.length !== total) {
        heatRef.current = new Float32Array(total);
      }

      const heat = heatRef.current;
      const offsetX = (width - (cols - 1) * spacing) * 0.5;
      const offsetY = (height - (rows - 1) * spacing) * 0.5;

      // Clear background
      ctx.fillStyle = rgbCss(palette.background, 1);
      ctx.fillRect(0, 0, width, height);

      // Prune expired ripples
      ripplesRef.current = ripplesRef.current.filter(
        (r) => time - r.born < 1.6,
      );

      const baseDotAlpha = palette.isDark ? 0.16 : 0.14;
      const decay = Math.exp(-delta * 3.4);

      for (let r = 0; r < rows; r++) {
        const y = offsetY + r * spacing;
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * spacing;
          const idx = r * cols + c;

          // Decay previous phosphor heat
          let h = heat[idx] * decay;

          // Cursor excitation
          if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 110) {
              h = Math.max(h, Math.pow(1 - dist / 110, 1.6));
            }
          }

          // Click shockwave ripples
          let rippleEnergy = 0;
          for (const rp of ripplesRef.current) {
            const age = time - rp.born;
            const radius = age * 280;
            const dist = Math.hypot(x - rp.x, y - rp.y);
            const band = Math.abs(dist - radius);
            if (band < 26) {
              rippleEnergy = Math.max(
                rippleEnergy,
                (1 - band / 26) * (1 - age / 1.6),
              );
            }
          }

          h = Math.min(1, Math.max(h, rippleEnergy));
          heat[idx] = h;

          // Subtle ambient wave
          const wave =
            (Math.sin(c * 0.28 + r * 0.22 - time * 1.4) * 0.5 + 0.5) * 0.35;

          // Quiet center zone behind hero copy
          const nx = (x / Math.max(width, 1) - 0.5) * 2;
          const ny = (y / Math.max(height, 1) - 0.5) * 2;
          const centerQuiet = Math.min(
            1,
            Math.max(0.28, Math.hypot(nx * 0.85, ny * 1.1)),
          );

          const radius = 1.2 + wave * 0.5 + h * 1.5;

          if (h > 0.05) {
            ctx.fillStyle = rgbCss(
              palette.accent,
              Math.min(0.95, h * 0.9 + baseDotAlpha),
            );
          } else {
            ctx.fillStyle = rgbCss(
              palette.foreground,
              (baseDotAlpha + wave * 0.12) * centerQuiet,
            );
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    [],
  );

  const canvasRef = use2DCanvasLoop(drawFrame, handleClick);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
