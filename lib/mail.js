import "server-only";
import { Resend } from "resend";
import emails from "@/content/console/emails";
import site from "@/content/site";
import { siteUrl } from "./seo";

// The emails the console sends: plain and white, our logo, one red button, Open Sans with an
// Arial fallback, and the company line at the bottom. The words are in content/console/emails.js.
//
// They go through Resend. Until a domain is verified there, they come from onboarding@resend.dev
// (CONTACT_FROM_EMAIL changes that) and Resend only delivers them to the address you signed up
// to Resend with. With EMAIL_LOG_ONLY=1, or before RESEND_API_KEY is set, they are written to the
// server log instead of sent.

const FROM = process.env.CONTACT_FROM_EMAIL || "Titan Wave Media <onboarding@resend.dev>";
const C = { ink: "#0B0B0B", ink2: "#4A4945", ink3: "#6C6A64", line: "#D5D3CC", tint: "#F3F1EC", action: "#D7261E" };
const FONT = "'Open Sans', Arial, Helvetica, sans-serif";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// {tokens} from the data, then our own details.
function fill(text, data) {
  const own = { rc: site.rc, phone: site.phone, company: site.legalName };
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (k in data ? String(data[k] ?? "") : k in own ? own[k] : m));
}

// Escapes the text, then turns **this** into bold.
function rich(text) {
  return esc(text).replace(/\*\*(.+?)\*\*/g, '<b style="font-weight:700">$1</b>');
}
const plain = (text) => String(text).replace(/\*\*(.+?)\*\*/g, "$1");

function blockHtml(b, data, url) {
  if (b.h) return `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:700;color:${C.ink}">${rich(fill(b.h, data))}</h1>`;
  if (b.p) return `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.55;color:${C.ink2}">${rich(fill(b.p, data))}</p>`;
  if (b.link) return `<p style="margin:0 0 16px;font-family:${FONT};font-size:13px;line-height:1.5;color:${C.ink3};word-break:break-all">${rich(fill(b.link, { ...data, url }))}</p>`;
  if (b.quote)
    return `<div style="margin:0 0 20px;padding:14px 16px;border:1px solid ${C.line};background:${C.tint};font-family:${FONT};font-size:16px;line-height:1.55;color:${C.ink};white-space:pre-wrap">${esc(fill(b.quote, data))}</div>`;
  if (b.box) {
    const rows = b.box
      .map(
        ([label, value]) =>
          `<tr><td style="padding:8px 14px;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:14px;color:${C.ink3};width:38%;vertical-align:top">${esc(fill(label, data))}</td><td style="padding:8px 14px;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:14px;font-weight:700;color:${C.ink};vertical-align:top">${esc(fill(value, data))}</td></tr>`
      )
      .join("");
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid ${C.line};border-bottom:0;background:${C.tint};border-collapse:collapse">${rows}</table>`;
  }
  if (b.button && url)
    return `<p style="margin:4px 0 22px"><a href="${esc(url)}" style="display:inline-block;padding:13px 24px;background:${C.action};border:1px solid ${C.action};color:#ffffff;font-family:${FONT};font-size:16px;font-weight:700;line-height:1.2;text-decoration:none">${esc(fill(b.button, data))}</a></p>`;
  return "";
}

function blockText(b, data, url) {
  if (b.h) return plain(fill(b.h, data)).toUpperCase();
  if (b.p) return plain(fill(b.p, data));
  if (b.link) return plain(fill(b.link, { ...data, url }));
  if (b.quote) return fill(b.quote, data).split("\n").map((l) => `> ${l}`).join("\n");
  if (b.box) return b.box.map(([l, v]) => `${fill(l, data)}: ${fill(v, data)}`).join("\n");
  if (b.button && url) return `${fill(b.button, data)}: ${url}`;
  return "";
}

// The subject, preview line, HTML and plain text of one email. `url` is where its button goes;
// without one the button is left out (and `noButtonText` can stand in for it).
export function renderEmail(key, data = {}, { url = null, subject: subjectKey = "subject", noButtonText = null } = {}) {
  const t = emails.templates[key];
  if (!t) throw new Error(`mail: no email called ${key}`);
  const values = { first: emails.firstFallback, ...data };
  let blocks = t.blocks;
  if (!url) blocks = blocks.filter((b) => !b.button && !b.link).map((b) => (noButtonText && /reply to this email/i.test(b.p || "") ? { p: noButtonText } : b));
  const subject = plain(fill(t[subjectKey] || t.subject, values));
  const preview = plain(fill(t.preview, values)).slice(0, 140);
  const foot = [fill(emails.footer, values), t.reason || emails.reason];
  const logo = `${siteUrl}/email-logo.png`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 20px;border-bottom:1px solid ${C.line}"><img src="${esc(logo)}" width="220" height="36" alt="${esc(emails.logoAlt)}" style="display:block;border:0;width:220px;height:36px"></td></tr>
<tr><td style="padding:28px 0 8px">${blocks.map((b) => blockHtml(b, values, url)).join("\n")}</td></tr>
<tr><td style="padding:18px 0 0;border-top:1px solid ${C.line};font-family:${FONT};font-size:13px;line-height:1.5;color:${C.ink3}">${foot.map(esc).join("<br>")}</td></tr>
</table></td></tr></table>
</body></html>`;

  const text = [...blocks.map((b) => blockText(b, values, url)).filter(Boolean), "--", ...foot].join("\n\n");
  return { subject, preview, html, text };
}

let resend = null;

// Sends one email. Returns { sent: true } or { logged: true }; throws when Resend refuses it.
export async function sendEmail({ to, key, data, url, subject, noButtonText, replyTo = site.email }) {
  const email = renderEmail(key, data, { url, subject, noButtonText });
  if (process.env.EMAIL_LOG_ONLY === "1" || !process.env.RESEND_API_KEY) {
    const full = process.env.EMAIL_LOG_ONLY === "1" || process.env.NODE_ENV !== "production";
    console.log(`[email] ${key} to ${to}: ${email.subject}${full ? `\n${email.text}\n[/email]` : " (not sent: RESEND_API_KEY is not set)"}`);
    return { logged: true };
  }
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, to: [to], replyTo, subject: email.subject, html: email.html, text: email.text });
  if (error) throw new Error(`Resend: ${error.name || "error"}: ${error.message || ""}`);
  return { sent: true };
}
