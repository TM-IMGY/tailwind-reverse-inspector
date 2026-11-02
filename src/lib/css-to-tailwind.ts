import { colorToClassValue, parseColor } from "./color-match";
import {
  FONT_SIZE_SCALE_PX,
  FONT_WEIGHT_MAP,
  RADIUS_SCALE_PX,
  SHADOW_BUCKETS,
  SNAP_TOLERANCE_PX,
  SPACING_SCALE_PX,
} from "./tailwind-theme";

function closestToken(px: number, scale: Record<string, number>): string | null {
  let best: { token: string; diff: number } | null = null;
  for (const [token, value] of Object.entries(scale)) {
    const diff = Math.abs(value - px);
    if (!best || diff < best.diff) best = { token, diff };
  }
  if (best && best.diff <= SNAP_TOLERANCE_PX) return best.token;
  return null;
}

function spacingValue(px: number): string {
  if (px === 0) return "0";
  const token = closestToken(px, SPACING_SCALE_PX);
  if (token !== null) return token;
  return `[${px}px]`;
}

function fontSizeValue(px: number): string {
  const token = closestToken(px, FONT_SIZE_SCALE_PX);
  if (token !== null) return token;
  return `[${px}px]`;
}

function radiusValue(px: number): string {
  if (px >= 9999) return "full";
  if (px === 0) return "none";
  const token = closestToken(px, RADIUS_SCALE_PX);
  if (token === "DEFAULT") return "";
  if (token !== null) return `-${token}`;
  return `-[${px}px]`;
}

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Collapses 4 independent side values into a Tailwind-style shorthand: all/x+y/individual. */
function sidesToClasses(prefix: string, top: string, right: string, bottom: string, left: string): string[] {
  if (top === right && right === bottom && bottom === left) {
    return top === "0" ? [] : [`${prefix}-${top}`];
  }
  const classes: string[] = [];
  if (top === bottom && left === right) {
    if (top !== "0") classes.push(`${prefix}y-${top}`);
    if (left !== "0") classes.push(`${prefix}x-${left}`);
    return classes;
  }
  if (top !== "0") classes.push(`${prefix}t-${top}`);
  if (right !== "0") classes.push(`${prefix}r-${right}`);
  if (bottom !== "0") classes.push(`${prefix}b-${bottom}`);
  if (left !== "0") classes.push(`${prefix}l-${left}`);
  return classes;
}

function colorClass(prefix: string, cssColor: string): string | null {
  const parsed = parseColor(cssColor);
  if (!parsed) return null;
  if (parsed.a === 0) return null; // fully transparent, nothing to show
  return `${prefix}-${colorToClassValue(parsed)}`;
}

function shadowBucket(boxShadow: string): string | null {
  if (!boxShadow || boxShadow === "none") return null;
  // Sum blur+spread across comma-separated shadow layers as a rough "size" signal.
  const layers = boxShadow.split(/,(?![^(]*\))/);
  let maxSize = 0;
  for (const layer of layers) {
    const lengths = layer.match(/-?\d+(?:\.\d+)?px/g);
    if (!lengths || lengths.length < 3) continue;
    const blur = Math.abs(parseFloat(lengths[2]));
    const spread = lengths[3] ? Math.abs(parseFloat(lengths[3])) : 0;
    maxSize = Math.max(maxSize, blur + spread);
  }
  const bucket = SHADOW_BUCKETS.find((b) => maxSize <= b.max);
  return bucket ? bucket.token : "shadow-2xl";
}

export interface InspectResult {
  /** Free-tier classes: box model, size, typography, basic colors. */
  basic: string[];
  /** Pro-gated classes: border, radius, shadow, flex/grid layout, position, opacity. */
  advanced: string[];
  tagName: string;
}

export function generateTailwindClasses(el: Element): InspectResult {
  const style = getComputedStyle(el);
  const basic: string[] = [];
  const advanced: string[] = [];

  // --- Display / position (advanced) ---
  const display = style.display;
  if (display && display !== "inline") {
    advanced.push(display === "flex" ? "flex" : display === "grid" ? "grid" : `[display:${display}]`);
  }
  if (style.position && style.position !== "static") advanced.push(style.position);

  // --- Flex / grid children layout (advanced) ---
  if (display === "flex" || display === "inline-flex") {
    if (style.flexDirection === "column") advanced.push("flex-col");
    if (style.flexWrap === "wrap") advanced.push("flex-wrap");
    const justifyMap: Record<string, string> = {
      center: "justify-center",
      "flex-end": "justify-end",
      "space-between": "justify-between",
      "space-around": "justify-around",
      "space-evenly": "justify-evenly",
    };
    if (justifyMap[style.justifyContent]) advanced.push(justifyMap[style.justifyContent]);
    const alignMap: Record<string, string> = {
      center: "items-center",
      "flex-end": "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    };
    if (alignMap[style.alignItems]) advanced.push(alignMap[style.alignItems]);
  }
  const gapPx = parsePx(style.gap || style.columnGap || "0");
  if (gapPx > 0) advanced.push(`gap-${spacingValue(gapPx)}`);

  // --- Box model: margin / padding (basic) ---
  basic.push(
    ...sidesToClasses(
      "m",
      spacingValue(parsePx(style.marginTop)),
      spacingValue(parsePx(style.marginRight)),
      spacingValue(parsePx(style.marginBottom)),
      spacingValue(parsePx(style.marginLeft)),
    ),
  );
  basic.push(
    ...sidesToClasses(
      "p",
      spacingValue(parsePx(style.paddingTop)),
      spacingValue(parsePx(style.paddingRight)),
      spacingValue(parsePx(style.paddingBottom)),
      spacingValue(parsePx(style.paddingLeft)),
    ),
  );

  // --- Size (basic) ---
  const widthPx = parsePx(style.width);
  const heightPx = parsePx(style.height);
  if (widthPx > 0) basic.push(`w-${spacingValue(widthPx)}`);
  if (heightPx > 0) basic.push(`h-${spacingValue(heightPx)}`);

  // --- Typography (basic) ---
  const fontSizePx = parsePx(style.fontSize);
  if (fontSizePx > 0) basic.push(`text-${fontSizeValue(fontSizePx)}`);
  const weightToken = FONT_WEIGHT_MAP[String(Math.round(Number(style.fontWeight) / 100) * 100)];
  if (weightToken && weightToken !== "normal") basic.push(`font-${weightToken}`);
  const textAlignMap: Record<string, string> = { center: "text-center", right: "text-right", justify: "text-justify" };
  if (textAlignMap[style.textAlign]) basic.push(textAlignMap[style.textAlign]);

  // --- Colors (basic) ---
  const bg = colorClass("bg", style.backgroundColor);
  if (bg) basic.push(bg);
  const text = colorClass("text", style.color);
  if (text) basic.push(text);

  // --- Border (advanced) ---
  const borderWidthPx = parsePx(style.borderTopWidth);
  if (borderWidthPx > 0 && style.borderTopStyle !== "none") {
    advanced.push(borderWidthPx === 1 ? "border" : `border-${spacingValue(borderWidthPx)}`);
    const borderColor = colorClass("border", style.borderTopColor);
    if (borderColor) advanced.push(borderColor);
  }
  const radiusPx = parsePx(style.borderTopLeftRadius);
  if (radiusPx > 0) {
    const value = radiusValue(radiusPx);
    advanced.push(value ? `rounded${value}` : "rounded");
  }

  // --- Effects (advanced) ---
  const shadow = shadowBucket(style.boxShadow);
  if (shadow) advanced.push(shadow);
  const opacity = parseFloat(style.opacity);
  if (opacity < 1) advanced.push(`opacity-${Math.round(opacity * 100)}`);

  return { basic, advanced, tagName: el.tagName.toLowerCase() };
}
