// The form checks. The browser and the server run the same rules.

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LIMITS = { name: 100, email: 254, message: 2000 };

const str = (v) => (typeof v === "string" ? v : "");

// Returns { field: message } for every field that fails, in the order of the form.
export function checkContact(fields, errors) {
  const name = str(fields.name).trim();
  const email = str(fields.email).trim();
  const need = str(fields.need);
  const message = str(fields.message).trim();
  const out = {};
  if (!name) out.name = errors.name;
  if (!email) out.email = errors.email;
  else if (!EMAIL.test(email)) out.email = errors.emailFormat;
  if (!need) out.need = errors.need;
  if (message.length < 10) out.message = errors.message;
  return out;
}

export function isEmail(value) {
  const v = str(value).trim();
  return v.length > 0 && v.length <= LIMITS.email && EMAIL.test(v);
}
