# Tailwind Reverse Inspector

Chrome extension (Manifest V3). Click any element on any page and get the matching Tailwind CSS utility classes — entirely client-side, no backend.

## How it works

1. Click the toolbar icon to inject the inspector into the current tab.
2. Hover to highlight elements, click one to inspect it.
3. The floating panel shows the Tailwind classes that reproduce that element's computed styles (box model, color, typography on the free tier; border/shadow/layout on Pro).
4. Press `Esc` or click the icon again to close.

See the design proposal shared in chat for the CSS → Tailwind mapping approach (nearest-scale-token snapping with arbitrary-value fallback, nearest-color matching) — implemented in `src/lib/`.

## Development

```bash
npm install
npm run build     # one-shot build into ./dist
npm run watch      # rebuild on change (still reload the extension manually in chrome://extensions)
npm run lint
```

Load it unpacked: `chrome://extensions` → enable Developer Mode → "Load unpacked" → select the `dist/` folder. After any `npm run build`, click the reload icon on the extension's card in `chrome://extensions` to pick up changes.

## Monetization (ExtensionPay)

Uses [ExtensionPay](https://extensionpay.com) for the free/Pro paywall (Stripe-backed, no backend of our own needed).

**Before this works for real**, you need to:
1. Create an extension at https://extensionpay.com/extensions and note its exact id slug.
2. Replace the placeholder id `"tailwind-reverse-inspector"` in `src/background/service-worker.ts` with that exact id if it differs.
3. Configure your Pro plan's price on the ExtensionPay dashboard.

`src/background/extpay-relay.ts` + the `content_scripts` entry in `manifest.json` matching `https://extensionpay.com/*` are required by ExtensionPay's own integration contract — they relay the "payment succeeded" signal from the checkout page back to the extension. Don't remove them.

## Known v1 limitations

- Only the element's default (non-hover/non-focus) computed style is inspected.
- Spacing/font-size matching assumes a 16px root font size (true for the vast majority of sites).
- Box-shadow matching is a rough size-bucket heuristic, not an exact match.
- Grid-specific utilities (grid-template-columns, etc.) are not yet mapped — only flex layout and `display: grid` itself.

## Before a real Chrome Web Store launch

- [ ] Swap the placeholder solid-color icons in `public/icons/` for real designed icons (same file names/sizes).
- [ ] Finish ExtensionPay setup (see above).
- [ ] Host `PRIVACY.md`'s content somewhere public (e.g. a GitHub Pages page or simple static page) and link it in the Chrome Web Store listing's privacy policy field — the Store requires a URL, not a bundled file.
- [ ] Take real screenshots for the store listing.
