import { TAILWIND_COLORS } from "./tailwind-colors.generated";
import { COLOR_MATCH_TOLERANCE } from "./tailwind-theme";

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parses a computed-style color string (always rgb()/rgba() from getComputedStyle) into components. */
export function parseColor(value: string): Rgba | null {
  const match = value.match(
    /^rgba?\(\s*([\d.]+)\s*,?\s*([\d.]+)\s*,?\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i,
  );
  if (!match) return null;
  const [, rs, gs, bs, as] = match;
  const a = as === undefined ? 1 : as.endsWith("%") ? parseFloat(as) / 100 : parseFloat(as);
  return { r: Number(rs), g: Number(gs), b: Number(bs), a };
}

function hexToRgb(hex: string): Rgba {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
    a: 1,
  };
}

function distance(a: Rgba, b: Rgba): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export interface ColorMatch {
  /** e.g. "blue-500", or "white" / "black" for the two named extremes */
  token: string;
  distance: number;
}

const NAMED_EXTREMES: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
};

/** Finds the nearest Tailwind color token for a given rgb(a) color, within tolerance. Returns null if nothing is close enough. */
export function matchTailwindColor(color: Rgba): ColorMatch | null {
  let best: ColorMatch | null = null;

  for (const [name, hex] of Object.entries(NAMED_EXTREMES)) {
    const d = distance(color, hexToRgb(hex));
    if (!best || d < best.distance) best = { token: name, distance: d };
  }

  for (const [family, shades] of Object.entries(TAILWIND_COLORS)) {
    for (const [shade, hex] of Object.entries(shades)) {
      const d = distance(color, hexToRgb(hex));
      if (!best || d < best.distance) best = { token: `${family}-${shade}`, distance: d };
    }
  }

  if (!best || best.distance > COLOR_MATCH_TOLERANCE) return null;
  return best;
}

/** Formats a color as a Tailwind class suffix: a matched token, or an arbitrary hex value fallback. */
export function colorToClassValue(color: Rgba): string {
  const match = matchTailwindColor(color);
  if (match) return match.token;
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `[#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}]`;
}
