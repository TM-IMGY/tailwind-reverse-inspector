// Tailwind's default design-token scales (spacing, font size, radius, weight).
// These are stable, well-published default values from Tailwind's default
// theme and change rarely between major versions.

/** Tailwind spacing scale: token -> pixel value (assumes the standard 16px root font size). */
export const SPACING_SCALE_PX: Record<string, number> = {
  "0": 0,
  px: 1,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "11": 44,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
  "24": 96,
  "28": 112,
  "32": 128,
  "36": 144,
  "40": 160,
  "44": 176,
  "48": 192,
  "52": 208,
  "56": 224,
  "60": 240,
  "64": 256,
  "72": 288,
  "80": 320,
  "96": 384,
};

/** Tailwind font-size scale: token -> pixel value (assumes 16px root). */
export const FONT_SIZE_SCALE_PX: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
  "8xl": 96,
  "9xl": 128,
};

/** Tailwind border-radius scale: token -> pixel value. "full" is handled separately (9999px). */
export const RADIUS_SCALE_PX: Record<string, number> = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
};

export const FONT_WEIGHT_MAP: Record<string, string> = {
  "100": "thin",
  "200": "extralight",
  "300": "light",
  "400": "normal",
  "500": "medium",
  "600": "semibold",
  "700": "bold",
  "800": "extrabold",
  "900": "black",
};

/** Rough box-shadow "size" buckets, keyed by total blur+spread in px. Heuristic, not exact-match. */
export const SHADOW_BUCKETS: Array<{ max: number; token: string }> = [
  { max: 3, token: "shadow-sm" },
  { max: 8, token: "shadow" },
  { max: 14, token: "shadow-md" },
  { max: 24, token: "shadow-lg" },
  { max: 40, token: "shadow-xl" },
  { max: Infinity, token: "shadow-2xl" },
];

/** Max allowed distance (px) for snapping a raw value to a scale token before falling back to arbitrary value syntax. */
export const SNAP_TOLERANCE_PX = 1;

/** Max color distance (0-441, max possible Euclidean RGB distance) to accept a nearest-color match. */
export const COLOR_MATCH_TOLERANCE = 12;
