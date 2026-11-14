"use client";

import React, { useCallback, useRef } from "react";
import { rgbCss } from "./theme-colors";
import { use2DCanvasLoop, type CanvasLoopContext } from "./use-canvas-loop";

interface CellState {
  alpha: number;
  accent: boolean;
}

export function PixelGridPulseBg() {
  const cellsRef = useRef<CellState[]>([]);
  const spawnTimerRef = useRef(0);

  const drawFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { width, height, delta, pointer, palette }: CanvasLoopContext,
    ) => {
      const cellSize = 28;
      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);
      const total = cols * rows;

      if (cellsRef.current.length !== total) {
        cellsRef.current = Array.from({ length: total }, () => ({
          alpha: Math.random() < 0.08 ? Math.random() * 0.45 : 0,
          accent: Math.random() < 0.16,
        }));
      }

      const cells = cellsRef.current;

      // Clear background
      ctx.fillStyle = rgbCss(palette.background, 1);
      ctx.fillRect(0, 0, width, height);

      // Draw crisp hairline square grid
      ctx.strokeStyle = rgbCss(palette.border, palette.isDark ? 0.5 : 0.7);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = c * cellSize + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let r = 0; r <= rows; r++) {
        const y = r * cellSize + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Periodically ignite random telemetry cells
      spawnTimerRef.current += delta;
      if (spawnTimerRef.current > 0.12 && total > 0) {
        spawnTimerRef.current = 0;
        for (let k = 0; k < 3; k++) {
          const idx = Math.floor(Math.random() * total);
          cells[idx].alpha = 0.25 + Math.random() * 0.35;
          cells[idx].accent = Math.random() < 0.22;
        }
      }

      // Pointer cell light-up
      if (pointer.active) {
        const pc = Math.floor(pointer.x / cellSize);
        const pr = Math.floor(pointer.y / cellSize);
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = pr + dr;
            const cc = pc + dc;
            if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
              const idx = rr * cols + cc;
              const isCenter = dr === 0 && dc === 0;
              cells[idx].alpha = Math.max(
                cells[idx].alpha,
                isCenter ? 0.6 : 0.25,
              );
              if (isCenter) cells[idx].accent = true;
            }
          }
        }
      }

      // Draw and decay active square blocks
      const fade = delta * 0.7;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const cell = cells[idx];
          if (cell.alpha <= 0.01) continue;

          const x = c * cellSize + 2;
          const y = r * cellSize + 2;
          const size = cellSize - 4;

          // Keep center behind headline quieter
          const nx = ((c + 0.5) * cellSize) / Math.max(width, 1) - 0.5;
          const ny = ((r + 0.5) * cellSize) / Math.max(height, 1) - 0.5;
          const quiet = Math.min(
            1,
            Math.max(0.25, Math.hypot(nx * 2, ny * 2.2)),
          );

          const color = cell.accent ? palette.accent : palette.foreground;
          const maxOpacity = cell.accent ? 0.32 : palette.isDark ? 0.12 : 0.09;
          ctx.fillStyle = rgbCss(color, cell.alpha * maxOpacity * quiet);
          ctx.fillRect(x, y, size, size);

          cell.alpha = Math.max(0, cell.alpha - fade);
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
