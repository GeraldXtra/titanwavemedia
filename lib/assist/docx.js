import "server-only";
import { inflateRawSync } from "node:zlib";

const MAX_XML = 40 * 1024 * 1024;

function findEnd(buf) {
  const min = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= min; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) return i;
  }
  return -1;
}

function entry(buf, wanted) {
  const end = findEnd(buf);
  if (end < 0) return null;
  const count = buf.readUInt16LE(end + 10);
  let at = buf.readUInt32LE(end + 16);
  for (let n = 0; n < count && at + 46 <= buf.length; n++) {
    if (buf.readUInt32LE(at) !== 0x02014b50) return null;
    const method = buf.readUInt16LE(at + 10);
    const flags = buf.readUInt16LE(at + 8);
    const size = buf.readUInt32LE(at + 20);
    const nameLen = buf.readUInt16LE(at + 28);
    const extraLen = buf.readUInt16LE(at + 30);
    const commentLen = buf.readUInt16LE(at + 32);
    const local = buf.readUInt32LE(at + 42);
    const name = buf.toString("utf8", at + 46, at + 46 + nameLen);
    if (name === wanted) {
      if (flags & 1) return { locked: true };
      if (local + 30 > buf.length || buf.readUInt32LE(local) !== 0x04034b50) return null;
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const data = buf.subarray(start, start + size);
      if (data.length !== size) return null;
      if (method === 0) return { data };
      if (method === 8) return { data: inflateRawSync(data, { maxOutputLength: MAX_XML }) };
      return null;
    }
    at += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

const ENTITY = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };

function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|amp|quot|apos);/gi, (m, k) => {
    if (k[0] === "#") {
      const code = k[1] === "x" || k[1] === "X" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return ENTITY[k.toLowerCase()] || m;
  });
}

export function docxText(buf) {
  let found;
  try {
    found = entry(buf, "word/document.xml");
  } catch {
    return { ok: false, error: "read" };
  }
  if (!found) return { ok: false, error: "read" };
  if (found.locked) return { ok: false, error: "locked" };
  const xml = found.data.toString("utf8");
  const out = [];
  const re = /<(\/?)w:(p|r|t|tab|br|cr)\b([^>]*)>/g;
  let inRun = 0;
  let textStart = -1;
  for (const m of xml.matchAll(re)) {
    const closing = m[1] === "/";
    const tag = m[2];
    const selfClosing = /\/\s*$/.test(m[3]);
    if (tag === "t") {
      if (closing && textStart >= 0) {
        out.push(decode(xml.slice(textStart, m.index)));
        textStart = -1;
      } else if (!closing && !selfClosing) {
        textStart = m.index + m[0].length;
      }
    } else if (tag === "r") {
      if (closing) inRun = Math.max(0, inRun - 1);
      else if (!selfClosing) inRun++;
    } else if (tag === "p") {
      if (closing || selfClosing) out.push("\n");
    } else if (inRun && !closing) {
      out.push(tag === "tab" ? "\t" : "\n");
    }
  }
  return { ok: true, text: out.join("") };
}
