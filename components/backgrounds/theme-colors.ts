export interface CanvasThemePalette {
  background: [number, number, number];
  surface: [number, number, number];
  foreground: [number, number, number];
  muted: [number, number, number];
  border: [number, number, number];
  accent: [number, number, number];
  isDark: boolean;
}

function parseCssColor(
  value: string,
  fallback: [number, number, number],
): [number, number, number] {
  const raw = value.trim();
  if (raw.startsWith("#")) {
    const hex = raw.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    if (full.length === 6) {
      const n = parseInt(full, 16);
      if (!Number.isNaN(n)) {
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }
    }
  }
  const rgbMatch = raw.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  }
  return fallback;
}

export function readCanvasPalette(): CanvasThemePalette {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const isDark =
    root.classList.contains("dark") ||
    root.getAttribute("data-theme") === "dark";

  return {
    background: parseCssColor(
      styles.getPropertyValue("--background"),
      isDark ? [17, 17, 19] : [250, 250, 249],
    ),
    surface: parseCssColor(
      styles.getPropertyValue("--surface"),
      isDark ? [29, 29, 33] : [237, 237, 240],
    ),
    foreground: parseCssColor(
      styles.getPropertyValue("--foreground"),
      isDark ? [236, 236, 239] : [24, 24, 27],
    ),
    muted: parseCssColor(
      styles.getPropertyValue("--muted-foreground"),
      isDark ? [159, 159, 168] : [98, 98, 108],
    ),
    border: parseCssColor(
      styles.getPropertyValue("--border"),
      isDark ? [42, 42, 48] : [228, 228, 231],
    ),
    accent: parseCssColor(styles.getPropertyValue("--accent"), [255, 59, 0]),
    isDark,
  };
}

export function rgbCss(rgb: [number, number, number], alpha = 1): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}
