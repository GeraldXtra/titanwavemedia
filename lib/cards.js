// How a saved card is named on screen: "Visa ending 4081", its short brand for the small badge,
// and its expiry. Safe in the browser and on the server.
import { format } from "./text";
import billing from "@/content/console/billing";

export function cardBrand(type) {
  const word = String(type || "").trim().split(/\s+/)[0].toLowerCase();
  return word ? word[0].toUpperCase() + word.slice(1) : "";
}

export function cardLabel(c) {
  return format(billing.method.card, { brand: cardBrand(c.card_type) || "Card", last4: c.last4 });
}

export function cardBadge(c) {
  const b = cardBrand(c.card_type).toLowerCase();
  return b === "mastercard" ? "MC" : b ? b.toUpperCase().slice(0, 6) : "CARD";
}

export function cardExpiry(c) {
  return c.exp_month && c.exp_year ? `${String(c.exp_month).padStart(2, "0")}/${String(c.exp_year).slice(-2)}` : "";
}
