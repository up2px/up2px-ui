"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Menu, X } from "lucide-react";
import { NavPill } from "./nav-pill";
import { SquareLogo } from "../brand/logo";
import { ThemeToggle } from "./theme-toggle";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

const SQUISH_GAP_PX = 16; // gap-4
const SQUISH_END_PROGRESS = 0.15;

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Templates", href: "/templates" },
  { label: "Blocks", href: "/blocks" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const isComponentsRoute = pathname?.startsWith("/components");

  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const mobileOpen = openPathname === pathname;

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLAnchorElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const [offsets, setOffsets] = useState({ left: 0, right: 0 });

  const { scrollYProgress } = useScroll();
  const rawProgress = useTransform(
    scrollYProgress,
    [0, SQUISH_END_PROGRESS],
    [0, 1],
    { clamp: true },
  );
  const progress = useSpring(rawProgress, {
    stiffness: 320,
    damping: 34,
    mass: 0.4,
  });

  const leftX = useTransform(progress, (t) => t * offsets.left);
  const rightX = useTransform(progress, (t) => t * offsets.right);

  useEffect(() => {
    if (isComponentsRoute) return;

    const measure = () => {
      const left = leftRef.current;
      const center = centerRef.current;
      const right = rightRef.current;
      if (!left || !center || !right) return;

      const leftRect = left.getBoundingClientRect();
      const centerRect = center.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();

      setOffsets({
        left: Math.max(0, centerRect.left - SQUISH_GAP_PX - leftRect.right),
        right: Math.min(0, centerRect.right + SQUISH_GAP_PX - rightRect.left),
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => ro.disconnect();
  }, [isComponentsRoute]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPathname(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  if (isComponentsRoute) {
    return null;
  }

  return (
    <>
      <header className="pointer-events-none fixed top-5 z-50 w-full px-4">
        <FadeIn inView={false} delay={0.06} blur>
          {/* Desktop Navbar (scroll-squish) */}
          <div
            ref={containerRef}
            className="mx-auto hidden w-full max-w-5xl grid-cols-3 items-start md:grid"
          >
            <div className="flex w-full items-center justify-start">
              <motion.div style={{ x: leftX }}>
                <Link
                  ref={leftRef}
                  href="/"
                  aria-label="Home"
                  className="font-display pointer-events-auto flex h-10 items-center justify-center gap-1 rounded-full bg-background p-3 text-sm font-semibold whitespace-nowrap inset-shadow-[0px_0px_6px_2px_rgba(255,59,0,0.3)]"
                >
                  <div className="relative size-6">
                    <SquareLogo />
                  </div>
                  up2px UI
                </Link>
              </motion.div>
            </div>
            <div className="flex w-full items-center justify-center">
              <div ref={centerRef}>
                <NavPill />
              </div>
            </div>
            <div className="flex w-full items-center justify-end">
              <motion.div style={{ x: rightX }}>
                <div
                  ref={rightRef}
                  className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-background p-2 inset-shadow-[0px_0px_6px_2px_rgba(255,59,0,0.3)]"
                >
                  <ThemeToggle />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile Navbar */}
          <div className="flex w-full items-center justify-between md:hidden">
            <Link
              href="/"
              aria-label="Home"
              onClick={() => setOpenPathname(null)}
              className="font-display pointer-events-auto flex h-10 items-center justify-center gap-1 rounded-full bg-background p-3 text-sm font-semibold whitespace-nowrap inset-shadow-[0px_0px_6px_2px_rgba(255,59,0,0.3)]"
            >
              <div className="relative size-6">
                <SquareLogo />
              </div>
              up2px UI
            </Link>

            <div className="pointer-events-auto flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-background p-2 inset-shadow-[0px_0px_6px_2px_rgba(255,59,0,0.3)]">
                <ThemeToggle />
              </div>

              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() =>
                  setOpenPathname((prev) =>
                    prev === pathname ? null : (pathname ?? "/"),
                  )
                }
                className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-background text-foreground inset-shadow-[0px_0px_6px_2px_rgba(255,59,0,0.3)]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span
                      key="close"
                      initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="size-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </FadeIn>
      </header>

      {/* Full-Screen Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-background px-6 pt-24 pb-10 md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-2">
              {MOBILE_NAV_ITEMS.map((item, idx) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{
                      duration: 0.28,
                      delay: 0.04 + idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpenPathname(null)}
                      className={cn(
                        "font-display flex items-center justify-between border-b border-border py-4 text-3xl font-bold tracking-tight transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full bg-accent"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.16 }}
              className="flex items-center justify-between text-xs text-muted-foreground"
            >
              <span>up2px UI</span>
              <span>
                Crafted to the{" "}
                <span className="font-doto font-bold text-accent">pixel.</span>
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
