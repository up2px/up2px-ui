"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { BayerDitherBg } from "./bayer-dither-bg";
import { DotMatrixLedBg } from "./dot-matrix-led-bg";
import { PixelGridPulseBg } from "./pixel-grid-pulse-bg";
import { HalftoneSpotlightBg } from "./halftone-spotlight-bg";

const BACKGROUNDS = [
  {
    id: "bayer-dither",
    label: "Bayer Dither",
    hint: "WebGL2 4x4 ordered dither shader • move cursor",
  },
  {
    id: "dot-matrix",
    label: "LED Matrix",
    hint: "Interactive dot field • hover & click to ripple",
  },
  {
    id: "pixel-grid",
    label: "Pixel Grid",
    hint: "Hairline grid telemetry cells • hover cells",
  },
  {
    id: "halftone",
    label: "Halftone",
    hint: "Dynamic radial dot spotlight • follows cursor",
  },
] as const;

type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

export function HeroBackgroundShowcase({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeBg, setActiveBg] = useState<BackgroundId>("bayer-dither");
  const currentMeta =
    BACKGROUNDS.find((b) => b.id === activeBg) ?? BACKGROUNDS[0];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-4xl border border-border/70 bg-background p-6">
      {/* Active Background Layer */}
      {activeBg === "bayer-dither" && <BayerDitherBg />}
      {activeBg === "dot-matrix" && <DotMatrixLedBg />}
      {activeBg === "pixel-grid" && <PixelGridPulseBg />}
      {activeBg === "halftone" && <HalftoneSpotlightBg />}

      {/* Hero Foreground Content */}
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
        {children}
      </div>

      {/* Bottom Background Picker Bar */}
      <div className="absolute right-4 bottom-4 left-4 z-20 flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-full bg-surface/65 p-1 text-xs inset-shadow-[0px_0px_6px_2px_rgba(255,59,0,0.22)] backdrop-blur-2xl">
          {BACKGROUNDS.map((bg) => {
            const isSelected = activeBg === bg.id;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => setActiveBg(bg.id)}
                className="relative flex h-7 cursor-pointer items-center rounded-full px-3 text-[11px] font-medium transition-colors"
              >
                {isSelected && (
                  <motion.span
                    layoutId="hero-bg-picker"
                    transition={{ type: "spring", stiffness: 440, damping: 32 }}
                    className="absolute inset-0 rounded-full border border-accent/45 bg-surface/90 inset-shadow-[0px_0px_8px_1px_rgba(255,59,0,0.25)]"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10",
                    isSelected
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {bg.label}
                </span>
              </button>
            );
          })}
        </div>
        <span className="rounded-full bg-background/70 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
          {currentMeta.hint}
        </span>
      </div>
    </div>
  );
}
