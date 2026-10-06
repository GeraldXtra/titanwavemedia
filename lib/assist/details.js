import { isEmail, LIMITS } from "../validate";

// "Leave your details" in the chat: a name, plus a phone number or an email. The chat page and
// the server run the same check. Returns { ok, values: { name, phone, email }, errors }, where
// errors maps a field to a code: name, contact (neither a phone nor an email), phone or email.
// The words for the codes are in content/assist.js, handover.errors.
export function checkDetails(fields = {}) {
  const s = (v) => (typeof v === "string" ? v.replace(/\u0000/g, "").trim() : "");
  const name = s(fields.name).replace(/\s+/g, " ");
  const phone = s(fields.phone).replace(/\s+/g, " ");
  const email = s(fields.email);
  const errors = {};
  if (!name || name.length > LIMITS.name) errors.name = "name";
  if (!phone && !email) errors.contact = "contact";
  if (phone) {
    const digits = phone.replace(/\D/g, "").length;
    if (phone.length > 40 || !/^\+?[\d ]+$/.test(phone) || digits < 7 || digits > 15) errors.phone = "phone";
  }
  if (email && !isEmail(email)) errors.email = "email";
  return { ok: Object.keys(errors).length === 0, values: { name, phone, email }, errors };
}
