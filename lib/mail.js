import "server-only";
import { Resend } from "resend";
import emails from "@/content/console/emails";
import site from "@/content/site";
import { EMAIL_IMAGES } from "./emailImages";
import { siteUrl } from "./seo";
import { setting } from "./settings.mjs";

const FROM = process.env.CONTACT_FROM_EMAIL || "Titan Wave Media <onboarding@resend.dev>";
const C = { page: "#0B0B0B", panel: "#151514", line: "#2B2A27", head: "#F2F0EB", text: "#A8A49C", quiet: "#8E8A82", action: "#D7261E", step: "#FF6B5E" };
const FONT = "'IBM Plex Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const F = `font-family:${FONT}`;
const FONT_LINK = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&display=swap";
const PREVIEW_FONTS = [
  [300, "Light"],
  [400, "Regular"],
  [600, "SemiBold"],
  [700, "Bold"],
]
  .flatMap(([weight, name]) =>
    ["Latin1", "Latin2"].map((part) => `@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:${weight};font-display:swap;src:url(/email/fonts/IBMPlexSans-${name}-${part}.woff2) format('woff2')${part === "Latin2" ? ";unicode-range:U+0100-024F,U+20A0-20CF" : ""}}`)
  )
  .join("");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function fill(text, data) {
  const own = { rc: site.rc, phone: site.phone, company: site.legalName };
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (k in data ? String(data[k] ?? "") : k in own ? own[k] : m));
}

function rich(text) {
  return esc(text).replace(/\*\*(.+?)\*\*/g, `<b style="color:${C.head};font-weight:600">$1</b>`);
}
const plain = (text) => String(text).replace(/\*\*(.+?)\*\*/g, "$1");

function panel(rows, top) {
  const cells = rows
    .map(
      ([label, value], i) =>
        `<tr><td style="padding:12px 16px;${i ? `border-top:1px solid ${C.line};` : ""}${F};font-size:13px;line-height:1.5;color:${C.quiet};vertical-align:top">${esc(label)}</td><td align="right" style="padding:12px 16px;${i ? `border-top:1px solid ${C.line};` : ""}${F};font-size:14px;line-height:1.5;font-weight:600;color:${C.head};text-align:right;vertical-align:top;word-break:break-word">${esc(value)}</td></tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="margin-top:${top}px;background:${C.panel};border:1px solid ${C.line};border-radius:6px;border-collapse:separate;text-align:left">${cells}</table>`;
}

function button(label, url, top) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:${top}px auto 0"><tr><td align="center" bgcolor="${C.action}" style="background:${C.action};border-radius:6px;mso-padding-alt:15px 34px"><a href="${esc(url)}" style="display:inline-block;padding:15px 34px;${F};font-size:15px;font-weight:700;line-height:1;color:#FFFFFF;text-decoration:none;border-radius:6px">${esc(label)}</a></td></tr></table>`;
}

function blockHtml(b, data, url, state) {
  const after = state.after;
  if (b.h) return `<h1 class="h1" style="margin:28px 0 0;${F};font-size:34px;font-weight:300;line-height:1.2;letter-spacing:-0.4px;color:${C.head}">${rich(fill(b.h, data))}</h1>`;
  if (b.p) {
    if (after) return `<p style="margin:24px 0 0;${F};font-size:14px;line-height:1.6;color:${C.quiet}">${rich(fill(b.p, data))}</p>`;
    return `<p style="margin:16px 0 0;${F};font-size:16px;line-height:1.6;color:${C.text}">${rich(fill(b.p, data))}</p>`;
  }
  if (b.link) {
    const [before] = String(b.link).split("{url}");
    return `<p style="margin:18px 0 0;${F};font-size:13px;line-height:1.6;color:${C.quiet}">${esc(fill(before, data).trim())}<br><a href="${esc(url)}" style="color:${C.text};word-break:break-all">${esc(url)}</a></p>`;
  }
  if (b.quote) {
    state.after = true;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="margin-top:${after ? 12 : 24}px;background:${C.panel};border:1px solid ${C.line};border-radius:6px;border-collapse:separate;text-align:left"><tr><td style="padding:16px;${F};font-size:15px;line-height:1.6;color:${C.head};white-space:pre-wrap;word-break:break-word">${esc(fill(b.quote, data))}</td></tr></table>`;
  }
  if (b.box) {
    const rows = b.box.map(([label, value, optional]) => [fill(label, data), fill(value, data), optional]).filter(([, value, optional]) => !optional || value.trim());
    const html = panel(rows.map(([l, v]) => [l, v]), after ? 12 : 28);
    state.after = true;
    return html;
  }
  if (b.steps) {
    const rows = b.steps
      .map(
        (s, i) =>
          `<tr><td width="44" valign="top" style="padding:${i ? 14 : 0}px 0 0;width:44px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="${C.panel}" style="width:30px;height:30px;background:${C.panel};border:1px solid ${C.line};border-radius:6px;${F};font-size:14px;font-weight:700;line-height:30px;color:${C.step}">${i + 1}</td></tr></table></td><td valign="middle" style="padding:${i ? 14 : 0}px 0 0;${F};font-size:15px;font-weight:600;line-height:1.45;color:${C.head}">${esc(fill(s, data))}</td></tr>`
      )
      .join("");
    state.after = true;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;text-align:left">${rows}</table>`;
  }
  if (b.amount) {
    const [label, value, due] = b.amount.map((t) => fill(t, data));
    state.after = true;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="margin-top:28px;background:${C.panel};border:1px solid ${C.line};border-radius:6px;border-collapse:separate"><tr><td align="center" style="padding:24px 16px 22px;${F};text-align:center"><div style="font-size:13px;line-height:1.5;color:${C.quiet}">${esc(label)}</div><div class="amt" style="margin-top:6px;font-size:40px;font-weight:300;line-height:1.1;letter-spacing:-0.5px;color:${C.head}">${esc(value)}</div><div style="margin-top:8px;font-size:14px;line-height:1.5;color:${C.text}">${esc(due)}</div></td></tr></table>`;
  }
  if (b.lines) {
    const [what, amount, total] = b.lines;
    const lines = Array.isArray(data.lines) ? data.lines : [];
    if (!lines.length) return "";
    const cell = (text, right, extra = "") => `<td${right ? ' align="right" valign="top"' : ""} style="${extra}${F};${right ? "white-space:nowrap;text-align:right;" : ""}">${text}</td>`;
    const head = `<tr>${cell(esc(what), false, `padding:0 0 10px;border-bottom:1px solid ${C.line};font-size:12px;font-weight:600;color:${C.quiet};`)}${cell(esc(amount), true, `padding:0 0 10px;border-bottom:1px solid ${C.line};font-size:12px;font-weight:600;color:${C.quiet};`)}</tr>`;
    const rows = lines.map((l) => `<tr>${cell(esc(l.what), false, `padding:14px 16px 14px 0;border-bottom:1px solid ${C.line};font-size:14px;line-height:1.5;color:${C.head};`)}${cell(esc(l.amount), true, `padding:14px 0;border-bottom:1px solid ${C.line};font-size:14px;line-height:1.5;color:${C.head};`)}</tr>`).join("");
    const sum = `<tr>${cell(esc(total), false, `padding:14px 16px 0 0;font-size:15px;font-weight:700;color:${C.head};`)}${cell(esc(data.total || ""), true, `padding:14px 0 0;font-size:15px;font-weight:700;color:${C.head};`)}</tr>`;
    state.after = true;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;text-align:left">${head}${rows}${sum}</table>`;
  }
  if (b.button && url) {
    const html = button(fill(b.button, data), url, after ? 30 : 28);
    state.after = true;
    return html;
  }
  return "";
}

function blockText(b, data, url) {
  if (b.h) return plain(fill(b.h, data)).toUpperCase();
  if (b.p) return plain(fill(b.p, data));
  if (b.link) return plain(fill(b.link, { ...data, url }));
  if (b.quote) return fill(b.quote, data).split("\n").map((l) => `> ${l}`).join("\n");
  if (b.box) return b.box.map(([l, v, optional]) => [fill(l, data), fill(v, data), optional]).filter(([, v, optional]) => !optional || v.trim()).map(([l, v]) => `${l}: ${v}`).join("\n");
  if (b.steps) return b.steps.map((s, i) => `${i + 1}: ${fill(s, data)}`).join("\n");
  if (b.amount) {
    const [label, value, due] = b.amount.map((t) => fill(t, data));
    return `${label}: ${value}\n${due}`;
  }
  if (b.lines) {
    const lines = Array.isArray(data.lines) ? data.lines : [];
    if (!lines.length) return "";
    return [`${b.lines[0]}:`, ...lines.map((l) => `- ${l.what}: ${l.amount}`), `${b.lines[2]}: ${data.total || ""}`].join("\n");
  }
  if (b.button && url) return `${fill(b.button, data)}: ${url}`;
  return "";
}

function picture(name, mode) {
  const img = EMAIL_IMAGES[name];
  return mode === "preview" ? `/email/${img.file}` : `cid:${img.id}`;
}

export function emailAttachments() {
  return Object.values(EMAIL_IMAGES).map((img) => ({ filename: img.file, content: img.base64, contentId: img.id, contentType: "image/png" }));
}

export function renderEmail(key, data = {}, { url = null, subject: subjectKey = "subject", noButtonText = null, images = "cid" } = {}) {
  const t = emails.templates[key];
  if (!t) throw new Error(`mail: no email called ${key}`);
  const values = { first: emails.firstFallback, ...data };
  let blocks = t.blocks;
  if (!url) blocks = blocks.filter((b) => !b.button && !b.link).map((b) => (noButtonText && /reply to this email/i.test(b.p || "") ? { p: noButtonText } : b));
  const subject = plain(fill(t[subjectKey] || t.subject, values));
  const preview = plain(fill(t.preview, values)).replace(/\s+/g, " ").slice(0, 140);
  const reason = t.reason || emails.reason;
  const footer = fill(emails.footer, values);
  const state = { after: false };
  const body = blocks.map((b) => blockHtml(b, values, url, state)).join("\n");
  const fonts = images === "preview" ? `<style>${PREVIEW_FONTS}</style>` : `<!--[if !mso]><!--><link href="${FONT_LINK}" rel="stylesheet"><!--<![endif]-->`;
  const filler = "&#847;&zwnj;&nbsp;".repeat(60);

  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
${fonts}
<style>
:root{color-scheme:dark;supported-color-schemes:dark}
body{margin:0;padding:0;background:${C.page}}
a{color:${C.text}}
@media (max-width:620px){.px{padding-left:24px!important;padding-right:24px!important}.h1{font-size:28px!important}.amt{font-size:34px!important}}
</style>
<!--[if mso]><style>body,table,td,p,a,h1,div,span{font-family:'Segoe UI',Arial,sans-serif!important}</style><![endif]-->
</head>
<body bgcolor="${C.page}" style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;mso-hide:all">${esc(preview)}${filler}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="width:100%;background:${C.page}">
<tr><td align="center" style="padding:0">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
<tr><td style="padding:0;line-height:0"><img src="${picture("wave", images)}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none"></td></tr>
<tr><td align="center" class="px" style="padding:4px 56px 0;text-align:center">
<img src="${picture("logo", images)}" width="56" height="56" alt="${esc(emails.logoAlt)}" style="display:block;margin:0 auto;border:0;outline:none;width:56px;height:56px;${F};font-size:11px;font-weight:700;line-height:14px;color:${C.head};text-align:center;word-break:break-word">
${body}
</td></tr>
<tr><td class="px" style="padding:44px 56px 40px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="border-top:1px solid ${C.line};padding-top:22px;text-align:center;${F};font-size:12px;line-height:1.7;color:${C.quiet}">
${esc(footer)}<br>${esc(reason)}<br>
<a href="${esc(`${siteUrl}/privacy-policy`)}" style="color:${C.text};text-decoration:underline">${esc(emails.privacy)}</a>&nbsp;&nbsp;&nbsp;<a href="${esc(`${siteUrl}/support`)}" style="color:${C.text};text-decoration:underline">${esc(emails.help)}</a>
</td></tr></table>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body>
</html>`;

  const text = [...blocks.map((b) => blockText(b, values, url)).filter(Boolean), "--", footer, reason].join("\n\n");
  return { subject, preview, html, text, attachments: images === "cid" ? emailAttachments() : [] };
}

let resend = null;

export async function sendEmail({ to, key, data, url, subject, noButtonText, replyTo = site.email }) {
  const email = renderEmail(key, data, { url, subject, noButtonText });
  if (process.env.EMAIL_LOG_ONLY === "1" || !setting("RESEND_API_KEY")) {
    const full = process.env.EMAIL_LOG_ONLY === "1" || process.env.NODE_ENV !== "production";
    console.log(`[email] ${key} to ${to}: ${email.subject}${full ? `\n${email.text}\n[/email]` : " (not sent: RESEND_API_KEY is not set)"}`);
    return { logged: true };
  }
  if (!resend) resend = new Resend(setting("RESEND_API_KEY"));
  const { error } = await resend.emails.send({ from: FROM, to: [to], replyTo, subject: email.subject, html: email.html, text: email.text, attachments: email.attachments });
  if (error) throw new Error(`Resend: ${error.name || "error"}: ${error.message || ""}`);
  return { sent: true };
}
