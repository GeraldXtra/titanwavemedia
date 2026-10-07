import "server-only";
import { docxText } from "./docx";

export const MAX_FILE = 4 * 1024 * 1024;
export const MAX_DOC_TEXT = 50000;
const READ_MS = 45_000;

export function kindOf(name, bytes) {
  const ext = String(name || "").toLowerCase().split(".").pop();
  if (ext === "pdf" && bytes.subarray(0, 1024).toString("latin1").includes("%PDF-")) return "pdf";
  if (ext === "docx" && bytes.length > 4 && bytes.readUInt32LE(0) === 0x04034b50) return "docx";
  if (ext === "txt") return "txt";
  return null;
}

export function cleanName(name) {
  const base = String(name || "").split(/[\\/]/).pop().replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  return base.slice(0, 200) || "Document";
}

export function tidyText(text) {
  return String(text || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00a0\t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function plainText(bytes) {
  let text;
  if (bytes[0] === 0xff && bytes[1] === 0xfe) text = new TextDecoder("utf-16le").decode(bytes.subarray(2));
  else if (bytes[0] === 0xfe && bytes[1] === 0xff) text = new TextDecoder("utf-16be").decode(bytes.subarray(2));
  else text = new TextDecoder("utf-8").decode(bytes);
  text = text.replace(/^\ufeff/, "");
  const odd = (text.match(/[\u0000-\u0008\u000e-\u001f\ufffd]/g) || []).length;
  if (text.length && odd / text.length > 0.02) return { ok: false, error: "read" };
  return { ok: true, text };
}

async function pdfText(bytes) {
  const { getDocumentProxy } = await import("unpdf");
  let pdf;
  try {
    pdf = await getDocumentProxy(new Uint8Array(bytes));
  } catch (error) {
    return { ok: false, error: /password/i.test(String(error && (error.name || error.message))) ? "locked" : "read" };
  }
  try {
    const parts = [];
    let size = 0;
    for (let i = 1; i <= pdf.numPages && size <= MAX_DOC_TEXT * 1.5; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => (typeof item.str === "string" ? item.str + (item.hasEOL ? "\n" : "") : "")).join("");
      parts.push(pageText);
      size += pageText.length;
    }
    return { ok: true, text: parts.join("\n") };
  } finally {
    try {
      await pdf.destroy();
    } catch {}
  }
}

function within(promise, ms) {
  let timer;
  return Promise.race([promise, new Promise((resolve) => (timer = setTimeout(() => resolve({ ok: false, error: "slow" }), ms)))]).finally(() => clearTimeout(timer));
}

function cut(text) {
  if (text.length <= MAX_DOC_TEXT) return { text, cut: false };
  const part = text.slice(0, MAX_DOC_TEXT);
  const end = part.lastIndexOf("\n");
  return { text: (end > MAX_DOC_TEXT * 0.8 ? part.slice(0, end) : part).trim(), cut: true };
}

export async function readDocument(name, bytes) {
  if (!bytes || !bytes.length) return { ok: false, error: "empty" };
  if (bytes.length > MAX_FILE) return { ok: false, error: "size" };
  const kind = kindOf(name, bytes);
  if (!kind) return { ok: false, error: "type" };
  let result;
  try {
    if (kind === "pdf") result = await within(pdfText(bytes), READ_MS);
    else if (kind === "docx") result = docxText(bytes);
    else result = plainText(bytes);
  } catch (error) {
    console.error("[assist] document:", error && error.message);
    result = { ok: false, error: "read" };
  }
  if (!result.ok) return result;
  const text = tidyText(result.text);
  if (text.replace(/\s+/g, "").length < 10) return { ok: false, error: kind === "pdf" ? "scan" : "empty" };
  return { ok: true, kind, name: cleanName(name), ...cut(text) };
}

