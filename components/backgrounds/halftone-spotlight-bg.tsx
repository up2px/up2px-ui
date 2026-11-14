"use client";

import React, { useCallback, useRef } from "react";
import { rgbCss } from "./theme-colors";
import { use2DCanvasLoop, type CanvasLoopContext } from "./use-canvas-loop";

export function HalftoneSpotlightBg() {
  const smoothPosRef = useRef<{ x: number; y: number; initialized: boolean }>({
    x: 0,
    y: 0,
    initialized: false,
  });

  const drawFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { width, height, time, pointer, palette }: CanvasLoopContext,
    ) => {
      const targetX = pointer.active
        ? pointer.x
        : width * (0.5 + Math.cos(time * 0.45) * 0.22);
      const targetY = pointer.active
        ? pointer.y
        : height * (0.45 + Math.sin(time * 0.35) * 0.16);

      if (!smoothPosRef.current.initialized) {
        smoothPosRef.current = { x: targetX, y: targetY, initialized: true };
      } else {
        smoothPosRef.current.x += (targetX - smoothPosRef.current.x) * 0.1;
        smoothPosRef.current.y += (targetY - smoothPosRef.current.y) * 0.1;
      }

      const sx = smoothPosRef.current.x;
      const sy = smoothPosRef.current.y;

      ctx.fillStyle = rgbCss(palette.background, 1);
      ctx.fillRect(0, 0, width, height);

      const spacing = 16;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const offsetX = (width - (cols - 1) * spacing) * 0.5;
      const offsetY = (height - (rows - 1) * spacing) * 0.5;
      const maxSpot = Math.min(width, height) * 0.55;

      for (let r = 0; r < rows; r++) {
        const y = offsetY + r * spacing;
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * spacing;

          // Edge radial vignette fade
          const vx = (x / Math.max(width, 1) - 0.5) * 2;
          const vy = (y / Math.max(height, 1) - 0.5) * 2;
          const edgeFade = Math.max(0, 1 - Math.hypot(vx, vy) * 0.72);
          if (edgeFade <= 0.02) continue;

          // Distance from spotlight
          const dist = Math.hypot(x - sx, y - sy);
          const spot = Math.max(0, 1 - dist / Math.max(maxSpot, 1));
          const spotSmooth = spot * spot * (3 - 2 * spot);

          const radius = (0.7 + spotSmooth * 3.1) * edgeFade;
          if (radius < 0.25) continue;

          // Blend dot color from subtle foreground -> accent near spotlight center
          const accentMix = Math.pow(spotSmooth, 2.2);
          const rCol = Math.round(
            palette.foreground[0] +
              (palette.accent[0] - palette.foreground[0]) * accentMix,
          );
          const gCol = Math.round(
            palette.foreground[1] +
              (palette.accent[1] - palette.foreground[1]) * accentMix,
          );
          const bCol = Math.round(
            palette.foreground[2] +
              (palette.accent[2] - palette.foreground[2]) * accentMix,
          );

          const alpha = (palette.isDark ? 0.16 : 0.14) + spotSmooth * 0.42;

          ctx.fillStyle = rgbCss([rCol, gCol, bCol], alpha * edgeFade);
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    [],
  );

  const canvasRef = use2DCanvasLoop(drawFrame);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
