// Generates simple solid-color placeholder PNG icons so the extension has
// valid icon files to load unpacked / submit for initial review. Swap these
// for real designed icons before a real Chrome Web Store launch.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const SIZES = [16, 32, 48, 128];
const BG = [14, 165, 233]; // sky-500-ish, placeholder brand color
const OUT_DIR = new URL("../public/icons/", import.meta.url);

mkdirSync(OUT_DIR, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
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

function makePng(size) {
  const [r, g, b] = BG;
  const margin = Math.max(1, Math.round(size * 0.18));

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const inMargin = x < margin || x >= size - margin || y < margin || y >= size - margin;
      const px = rowStart + 1 + x * 4;
      if (inMargin) {
        raw[px] = r;
        raw[px + 1] = g;
        raw[px + 2] = b;
        raw[px + 3] = 255;
      } else {
        // white inset square = simple placeholder mark
        raw[px] = 255;
        raw[px + 1] = 255;
        raw[px + 2] = 255;
        raw[px + 3] = 255;
      }
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw);
  const iend = Buffer.alloc(0);

  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", iend)]);
}

for (const size of SIZES) {
  const png = makePng(size);
  writeFileSync(new URL(`icon${size}.png`, OUT_DIR), png);
  console.log(`wrote icon${size}.png (${png.length} bytes)`);
}
