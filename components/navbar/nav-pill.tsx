"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "components", label: "Components", href: "/components" },
  { id: "templates", label: "Templates", href: "/templates" },
  { id: "blocks", label: "Blocks", href: "/blocks" },
] as const;

interface HoverRect {
  id: string;
  left: number;
  width: number;
}

export function NavPill() {
  const pathname = usePathname();
  const [hoveredRect, setHoveredRect] = useState<HoverRect | null>(null);

  const activeId =
    NAV_ITEMS.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.id ?? null;

  function updateHover(id: string, el: HTMLAnchorElement) {
    setHoveredRect({
      id,
      left: el.offsetLeft,
      width: el.offsetWidth,
    });
  }

  return (
    <LayoutGroup id="navbar-nav-pill">
      <nav
        aria-label="Primary"
        onMouseLeave={() => setHoveredRect(null)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setHoveredRect(null);
          }
        }}
        className="pointer-events-auto relative flex h-10 items-center rounded-full bg-background p-1 text-sm inset-shadow-[0px_0px_6px_2px_rgba(255,59,0,0.3)]"
      >
        {/* Single Continuous Sliding Hover Pill (never unmounts between items) */}
        <AnimatePresence>
          {hoveredRect && (
            <motion.span
              key="nav-hover-pill"
              initial={{
                opacity: 0,
                scale: 0.94,
                x: hoveredRect.left,
                width: hoveredRect.width,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: hoveredRect.left,
                width: hoveredRect.width,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
              }}
              transition={{
                type: "spring",
                stiffness: 460,
                damping: 34,
                opacity: { duration: 0.14 },
                scale: { duration: 0.14 },
              }}
              className="pointer-events-none absolute top-1 left-0 h-8 rounded-full border border-accent/25 bg-background/95"
            />
          )}
        </AnimatePresence>

        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const isHovered = hoveredRect?.id === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onMouseEnter={(e) => updateHover(item.id, e.currentTarget)}
              onFocus={(e) => updateHover(item.id, e.currentTarget)}
              className="relative flex h-8 items-center justify-center rounded-full px-3 outline-none"
            >
              {/* Active Route Pill */}
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                  }}
                  className="absolute inset-0 rounded-full border border-accent/45 bg-background/95 inset-shadow-[0px_0px_8px_1px_rgba(255,59,0,0.25)]"
                />
              )}

              <span
                className={cn(
                  "relative z-10 transition-colors duration-150",
                  isActive
                    ? "font-semibold text-foreground"
                    : isHovered
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
