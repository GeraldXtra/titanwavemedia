import { isEmail, LIMITS } from "../validate";

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
