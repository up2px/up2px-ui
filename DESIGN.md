---
colors:
  dark:
    background: "#111113"
    surface: "#18181b"
    surface_secondary: "#202024"
    surface_tertiary: "#28282e"
    foreground: "#ececef"
    muted_foreground: "#9f9fa8"
    border: "#2a2a30"
    accent: "#FF3B00"
    accent_foreground: "#ffffff"
  light:
    background: "#fafaf9"
    surface: "#f4f4f5"
    surface_secondary: "#ececef"
    surface_tertiary: "#e4e4e7"
    card: "#ffffff"
    foreground: "#18181b"
    muted_foreground: "#62626c"
    border: "#e4e4e7"
    accent: "#FF3B00"
    accent_foreground: "#ffffff"
typography:
  font_doto: "var(--font-pixel-doto), ui-monospace, monospace"
  font_sans: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
  font_mono: "var(--font-geist-mono), ui-monospace, monospace"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  hero: "32px (rounded-4xl)"
  full: "9999px"
spacing:
  unit: "4px"
---

# Design System & Aesthetic Reference: up2px-ui

## 1. Vision & Taste

`up2px-ui` is a standalone, open-source animated UI component library for React and Next.js.
The aesthetic blends **Linear/Raycast-grade calm contrast** with **tactile dot-matrix / pixel craft** (`Doto`, 4x4 Bayer ordered dithering, `#FF3B00` signal orange).

### Core Principles:
- **Easy on the Eyes, Never Pitch Black**: Avoid `#000`/`#0a0a0a` + `#fafafa` halation in dark mode (`#111113` ground, `#18181b` surface, `#ececef` text) and sterile `#ffffff` glare in light mode (`#fafaf9` ground, `#f4f4f5` surface, `#18181b` text).
- **Subtle Separation**: Hero and featured canvases sit on `--surface` (`#18181b` / `#f4f4f5`) so they lift gently off `--background` (`#111113` / `#fafaf9`).
- **Backgrounds Stay Subordinate**: Shaders/animations must frame and elevate typography, never overpower it. Use a wide center quiet zone + soft radial-feathered frosted blur (`mask-[radial-gradient(closest-side,black_65%,transparent_100%)]`) behind hero copy and CLI bars.
- **Confident, Non-Cringe Copy**: Avoid generic hype/AI-slop (`"10x better"`, `"Built To Stand Out"`, `"it's not X, it's Y"`). Keep micro-copy crisp and grounded (e.g. `"Interfaces with character"`, `"Aesthetic Components, Crafted To The Pixel."`).
- **The Component Isolation Rule**: Files in `registry/components/<name>/` contain only exportable, production-ready code. Demos in `registry/demos/<name>-demo.tsx` hold sample data strictly for live preview.

---

## 2. Typography (`next/font/google` only)

All fonts are loaded via `next/font/google` in `app/layout.tsx` and mapped inside `@theme inline` in `app/globals.css`:
- **Sans**: `Inter` (`--font-inter` → `--font-sans`)
- **Mono**: `Geist_Mono` (`--font-geist-mono` → `--font-mono`)
- **Pixel Display**: `Doto` (`--font-pixel-doto` → `--font-doto`, variable weight `100–900` — use `font-black` for chunky dot-matrix hero accents; avoid self-referencing `--font-doto: var(--font-doto)`).
- **Mobile Headline Rule**: Keep key phrases intact on phones using `whitespace-nowrap` + `clamp(...)` (e.g., `text-[clamp(1.65rem,7.2vw,3rem)] sm:text-7xl`).

---

## 3. Motion & Micro-Interaction Preferences

- **Library**: `motion/react` (`motion`, `AnimatePresence`, `useReducedMotion`). Always honor `prefers-reduced-motion`.
- **Entrances (`components/ui/fade-in.tsx`)**: Combined subtle rise + fade (`y: 14px → 0`, `opacity: 0 → 1`, `0.45s–0.55s` exp-out `[0.22, 1, 0.36, 1]`, `60–80ms` stagger; optional `blur(4px) → 0px` on hero elements). Reserve drop-down (`y < 0`) for popovers/dropdowns.
- **Inline Tech Pills (`inline-pill.tsx`, `switching-pill.tsx`)**:
  - `em`-scaled rounded-full pills (`bg-surface-secondary/90 border-border`) with `size-[1.25em]` icon circle.
  - Alternating pills (`React` ↔ `Next.js`) use `motion.span layout` + vertical `AnimatePresence mode="popLayout"` slot-roll on text and spring rotate/scale/blur cross-morph on icons (`stiffness: 320, damping: 24`).
- **Status Badge Rim**: Subtle rotating `conic-gradient` `--accent` glint over `bg-border` (`p-px overflow-hidden`, solid `bg-surface` inner pill so gradient never bleeds behind text).
- **Navbar Pill (`components/navbar/nav-pill.tsx`)**: Stateful sliding highlight pill (`layoutId` / shared measured indicator) — never fade-out/fade-in between adjacent nav items.
- **Hero Shader (`components/backgrounds/bayer-dither-bg.tsx`)**: WebGL2 4×4 Bayer ordered dither on `5px` dot-pixel cells, `--surface` base, 3 randomized-direction domain-warped colorful waves (`#FF3B00`, indigo, cyan) kept sparse on crests, and wide center quiet zone.

---

## 4. Working Conventions

- **Brand Logos / SVGs**: Do not invent custom brand logos (`Tailwind`, `Motion`, `React`, `Next.js`); leave an `icon?: ReactNode` slot or ask/use user-provided SVGs.
- **Checks**: Run `prettier` / `eslint` on modified files. Do not run `pnpm run build` after minor UI/copy tweaks unless explicitly verifying a build-affecting change.
