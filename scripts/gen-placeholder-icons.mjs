// Generates a simple "crosshair / element picker" icon, rendered with basic
// supersampled anti-aliasing. Good enough for a real (if simple) first
// launch — not a substitute for a professionally designed icon later.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const SIZES = [16, 32, 48, 128];
const BG = [14, 165, 233]; // sky-500
const FG = [255, 255, 255];
const SUPERSAMPLE = 4;
const OUT_DIR = new URL("../public/icons/", import.meta.url);

mkdirSync(OUT_DIR, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Returns true if the normalized point (u,v in [0,1]) falls on the white glyph.
function isGlyph(u, v) {
  const dx = u - 0.5;
  const dy = v - 0.5;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const ringOuter = 0.3;
  const ringInner = 0.23;
  if (dist <= ringOuter && dist >= ringInner) return true;

  const dotR = 0.05;
  if (dist <= dotR) return true;

  const tickInner = ringOuter + 0.03;
  const tickOuter = ringOuter + 0.17;
  const tickHalfWidth = 0.028;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  // Vertical ticks (up/down): near the vertical axis, between inner/outer radius along y.
  if (ax <= tickHalfWidth && ay >= tickInner && ay <= tickOuter) return true;
  // Horizontal ticks (left/right)
  if (ay <= tickHalfWidth && ax >= tickInner && ax <= tickOuter) return true;

  return false;
}

function makePng(size) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let coverage = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const u = (x + (sx + 0.5) / SUPERSAMPLE) / size;
          const v = (y + (sy + 0.5) / SUPERSAMPLE) / size;
          if (isGlyph(u, v)) coverage++;
        }
      }
      const t = coverage / (SUPERSAMPLE * SUPERSAMPLE);
      const px = rowStart + 1 + x * 4;
      raw[px] = Math.round(BG[0] + (FG[0] - BG[0]) * t);
      raw[px + 1] = Math.round(BG[1] + (FG[1] - BG[1]) * t);
      raw[px + 2] = Math.round(BG[2] + (FG[2] - BG[2]) * t);
      raw[px + 3] = 255;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

for (const size of SIZES) {
  const png = makePng(size);
  writeFileSync(new URL(`icon${size}.png`, OUT_DIR), png);
  console.log(`wrote icon${size}.png (${png.length} bytes)`);
}
