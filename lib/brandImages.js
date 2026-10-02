import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Helpers for the generated images (sharing image and icons). They run when the site is built.

const svgUri = (data) => `data:image/svg+xml;base64,${data.toString("base64")}`;

// The favicon, app/icon.svg, which the PNG icons are drawn from.
export async function faviconUri() {
  return svgUri(await readFile(join(process.cwd(), "app", "icon.svg")));
}

// A logo file from assets/brand.
export async function brandUri(file) {
  return svgUri(await readFile(join(process.cwd(), "assets", "brand", file)));
}

export async function font(file) {
  return readFile(join(process.cwd(), "assets", "fonts", file));
}

// A still frame of the hero wave ("night", as wide as a desktop hero), drawn as SVG lines with
// the same shape and colours as the canvas in lib/wave.js.
export function waveSvg(W, H, t = 17) {
  const WHITE = [242, 236, 226];
  const RED = [214, 69, 47];
  const n = 110;
  const seg = 130;
  const s = { yc: (u) => H * (0.5 + 0.06 * u), a1: H * 0.16, a2: H * 0.18, spread: H * 0.14, wob: H * 0.025, f1: 0.75, f2: 0.5 };
  const p1 = t * 0.11;
  const p2 = -t * 0.083 + 2.1;
  const p3 = t * 0.19;
  const defs = [];
  const paths = [];
  for (let k = 0; k < n; k++) {
    const f = k / (n - 1);
    const e = f * f * (3 - 2 * f);
    const c = WHITE.map((w, i) => Math.round(w + (RED[i] - w) * e));
    const a = 0.06 + 0.34 * e;
    const rgb = `rgb(${c[0]},${c[1]},${c[2]})`;
    defs.push(
      `<linearGradient id="g${k}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">` +
        `<stop offset="0" stop-color="${rgb}" stop-opacity="${(a * 0.85).toFixed(3)}"/>` +
        `<stop offset="0.5" stop-color="${rgb}" stop-opacity="${a.toFixed(3)}"/>` +
        `<stop offset="1" stop-color="${rgb}" stop-opacity="${(a * 0.7).toFixed(3)}"/>` +
        `</linearGradient>`
    );
    let d = "";
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      const x = -0.02 * W + 1.04 * W * u;
      const top = s.yc(u) + s.a1 * Math.sin(Math.PI * 2 * s.f1 * u + p1);
      const bot = s.yc(u) + s.a2 * Math.sin(Math.PI * 2 * s.f2 * u + p2) + s.spread * u;
      const y = top + (bot - top) * f + s.wob * Math.sin(Math.PI * 2 * 2.1 * u + p3 + f * 3.4);
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    paths.push(`<path d="${d}" fill="none" stroke="url(#g${k})" stroke-width="0.9"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join("")}</defs>${paths.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
