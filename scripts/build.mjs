import * as esbuild from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";

const watch = process.argv.includes("--watch");
const outdir = "dist";

rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

const commonOptions = {
  bundle: true,
  sourcemap: watch ? "inline" : false,
  minify: !watch,
  target: ["chrome110"],
  logLevel: "info",
};

const contentScriptCtx = await esbuild.context({
  ...commonOptions,
  entryPoints: ["src/content/content-script.tsx"],
  outfile: `${outdir}/content-script.js`,
  format: "iife",
  jsx: "automatic",
});

const serviceWorkerCtx = await esbuild.context({
  ...commonOptions,
  entryPoints: ["src/background/service-worker.ts"],
  outfile: `${outdir}/service-worker.js`,
  format: "esm",
});

const extpayRelayCtx = await esbuild.context({
  ...commonOptions,
  entryPoints: ["src/background/extpay-relay.ts"],
  outfile: `${outdir}/extpay-relay.js`,
  format: "iife",
});

function copyStaticFiles() {
  cpSync("manifest.json", `${outdir}/manifest.json`);
  cpSync("public/icons", `${outdir}/icons`, { recursive: true });
}

if (watch) {
  await contentScriptCtx.watch();
  await serviceWorkerCtx.watch();
  await extpayRelayCtx.watch();
  copyStaticFiles();
  console.log("Watching for changes... (icons/manifest are not watched — rerun build after editing those)");
} else {
  await contentScriptCtx.rebuild();
  await serviceWorkerCtx.rebuild();
  await extpayRelayCtx.rebuild();
  copyStaticFiles();
  await contentScriptCtx.dispose();
  await serviceWorkerCtx.dispose();
  await extpayRelayCtx.dispose();
  console.log(`Built extension into ./${outdir} — load it unpacked via chrome://extensions`);
}
