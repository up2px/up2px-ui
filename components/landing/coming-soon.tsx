"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { BayerDitherBg } from "@/components/backgrounds/bayer-dither-bg";
import { FadeIn } from "@/components/ui/fade-in";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%*+";
const TARGET_WORD = "COMING SOON";

export function ComingSoon() {
  const [text, setText] = useState(TARGET_WORD);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 22;

    const id = window.setInterval(() => {
      frame += 1;
      const settledCount = Math.floor(
        (frame / totalFrames) * TARGET_WORD.length,
      );

      const next = TARGET_WORD.split("")
        .map((char, idx) => {
          if (char === " ") return " ";
          if (idx < settledCount) return char;
          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        })
        .join("");

      setText(next);
      if (frame >= totalFrames) {
        setText(TARGET_WORD);
        window.clearInterval(id);
      }
    }, 36);

    return () => window.clearInterval(id);
  }, [tick]);

  return (
    <section className="flex h-screen w-full items-center justify-center p-2">
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-4xl border border-border bg-surface p-6">
        <BayerDitherBg />
        <FadeIn inView={false} delay={0.06} blur>
          <div className="relative z-10 flex flex-col items-center gap-8 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-24 -inset-y-20 -z-10 bg-surface/75 mask-[radial-gradient(closest-side,black_65%,transparent_100%)] backdrop-blur-md"
            />

            <button
              type="button"
              onClick={() => setTick((t) => t + 1)}
              title="Replay scramble"
              className="cursor-pointer font-doto text-5xl font-black tracking-tight text-accent sm:text-7xl"
            >
              {text}
            </button>

            <Link
              href="/components"
              className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-linear-to-b from-[#FF5E2E] to-accent px-4 py-2 text-base font-semibold tracking-wide text-white shadow-[0px_0px_10px_0px_rgba(255,255,255,0.2)_inset] ring ring-white/30 ring-offset-2 ring-offset-accent transition-all duration-200 ring-inset hover:shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)_inset] hover:ring-white/50 active:scale-98"
            >
              <Layers className="h-4 w-4" />
              <span>Browse Components</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
