// Regenerates src/lib/tailwind-colors.generated.ts from Tailwind's canonical
// default color palette. Not run as part of the normal build — the output is
// checked into source. Re-run only if you want to refresh/re-derive the data.
//
// Requires a temporary devDependency: `npm install -D tailwindcss@3.4.17`
// (Tailwind v4 moved to CSS-first/oklch theming and no longer exports a plain
// hex color object the same way, so we pin v3 purely as a data source.)
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const colors = require("tailwindcss/colors");

const SKIP = new Set([
  "lightBlue",
  "warmGray",
  "trueGray",
  "coolGray",
  "blueGray",
  "inherit",
  "current",
  "transparent",
  "black",
  "white",
]);

const out = {};
for (const [name, value] of Object.entries(colors)) {
  if (SKIP.has(name) || typeof value === "string") continue;
  out[name] = value;
}

const header = `// AUTO-GENERATED from tailwindcss@3.4.17 colors (tailwindcss/colors).
// Regenerate via: node scripts/extract-colors.mjs (see comment above for setup)
// Do not hand-edit.

export const TAILWIND_COLORS: Record<string, Record<string, string>> = `;

writeFileSync("src/lib/tailwind-colors.generated.ts", header + JSON.stringify(out, null, 2) + ";\n");
console.log(`Wrote ${Object.keys(out).length} color families to src/lib/tailwind-colors.generated.ts`);
