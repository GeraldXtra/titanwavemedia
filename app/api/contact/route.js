import contact from "@/content/contact";
import { clientIp, json, readJson, str } from "@/lib/http";
import { formLimit } from "@/lib/rateLimit";
import { keepMessage } from "@/lib/store";
import { checkContact, LIMITS } from "@/lib/validate";

export const runtime = "nodejs";

const NEEDS = contact.form.needs.map((o) => o.value).filter(Boolean);

function extra(need, data) {
  const group = contact.form.extra[need];
  if (!group) return null;
  const value = str(data[group.name]);
  const option = group.options.find((o) => o.value === value);
  if (!option) return null;
  return need === "tool" ? option.label : option.value;
}

export async function POST(request) {
  if (!formLimit(clientIp(request)).ok) return json({ ok: false, error: "busy" }, 429);
  const body = await readJson(request, 16 * 1024);
  if (body.error) return json({ ok: false, error: body.error }, body.error === "too_large" ? 413 : 400);
  const data = body.data && typeof body.data === "object" ? body.data : {};

  if (str(data.company).trim()) return json({ ok: true });

  const fields = {
    name: str(data.name).trim(),
    email: str(data.email).trim(),
    need: str(data.need),
    message: str(data.message).trim(),
  };
  const errors = checkContact(fields, contact.form.errors);
  if (!errors.need && !NEEDS.includes(fields.need)) errors.need = contact.form.errors.need;
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);
  if (fields.name.length > LIMITS.name || fields.email.length > LIMITS.email || fields.message.length > LIMITS.message) {
    return json({ ok: false, error: "too_long" }, 400);
  }

  const kept = await keepMessage({
    ...fields,
    channel: fields.need === "ai-setup" ? extra("ai-setup", data) : null,
    rows: fields.need === "data" ? extra("data", data) : null,
    product: fields.need === "tool" ? extra("tool", data) : null,
    source: "contact",
  });
  return kept ? json({ ok: true }) : json({ ok: false, error: "not_saved" }, 502);
}
