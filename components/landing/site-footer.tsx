"use client";

import * as React from "react";
import Link from "next/link";
import { SquareLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Templates", href: "/templates" },
  { label: "Blocks", href: "/blocks" },
] as const;

/**
 * Edge-to-edge brand wordmark whose size tracks container width,
 * with a pointer-following spotlight tinted with `--accent`.
 */
function Wordmark({ text }: { text: string }) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;

    const fit = () => {
      const natural = measure.getBoundingClientRect().width + 6.5;
      if (natural <= 6.5) return;
      const size = (box.clientWidth / natural) * 100;
      box.style.setProperty("--wordmark-size", `${size}px`);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit).catch(() => {});

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(box);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [text]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--wx",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--wy",
      `${event.clientY - rect.top}px`,
    );
  };

  const typography =
    "font-display block whitespace-nowrap text-center font-bold leading-[0.8] tracking-[-0.055em] [font-size:var(--wordmark-size,18vw)]";

  return (
    <div
      ref={boxRef}
      aria-hidden
      onPointerMove={handlePointerMove}
      className="group/wm relative w-full overflow-hidden select-none [--wx:50%] [--wy:0px]"
      style={{ height: "calc(var(--wordmark-size, 18vw) * 0.68)" }}
    >
      <span
        ref={measureRef}
        className="font-display invisible absolute top-0 left-0 [font-size:100px] font-bold tracking-[-0.055em] whitespace-nowrap"
      >
        {text}
      </span>

      <div
        className={cn(
          "pt-[0.06em] [font-size:var(--wordmark-size,18vw)] transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          shown ? "translate-y-0 opacity-100" : "translate-y-[18%] opacity-0",
        )}
      >
        <div className="relative">
          {/* Resting ink */}
          <span
            className={cn(typography, "bg-clip-text text-transparent")}
            style={{
              backgroundImage:
                "linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 15%, transparent), color-mix(in oklab, var(--foreground) 3%, transparent) 90%)",
            }}
          >
            {text}
          </span>

          {/* Pointer-lit accent ink */}
          <span
            className={cn(
              typography,
              "absolute inset-0 bg-clip-text text-transparent opacity-0 transition-opacity duration-500 group-hover/wm:opacity-100 motion-reduce:hidden",
            )}
            style={{
              backgroundImage:
                "linear-gradient(to bottom, var(--accent), color-mix(in oklab, var(--accent) 45%, transparent) 90%)",
              WebkitMaskImage:
                "radial-gradient(circle 280px at var(--wx) var(--wy), #000 0%, transparent 72%)",
              maskImage:
                "radial-gradient(circle 280px at var(--wx) var(--wy), #000 0%, transparent 72%)",
            }}
          >
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-background text-foreground">
      <div className="flex w-full flex-col pt-10 sm:pt-14">
        <div className="w-full px-6 sm:px-10">
          <div className="h-px w-full bg-border" />

          {/* Top Bar: Brand + Horizontal Nav */}
          <div className="flex flex-wrap items-center justify-between gap-6 py-8">
            <Link
              href="/"
              className="font-display inline-flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
            >
              <span className="relative size-6 shrink-0">
                <SquareLogo />
              </span>
              <span>up2px UI</span>
            </Link>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center gap-x-7 gap-y-2"
            >
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Full-Width Cropped Wordmark */}
        <div className="w-full pt-8 sm:pt-12">
          <Wordmark text="up2px UI" />
        </div>
      </div>
    </footer>
  );
}
