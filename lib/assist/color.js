// The chat button's colours. Safe in the browser and on the server. The text on the button is
// white or black, whichever reads better, and it always reaches 4.6:1 against the button.

export const MIN_CONTRAST = 4.6;

// "#1a2b3c" from "#1A2B3C", "1a2b3c" or "#abc"; null when it is not a colour.
export function cleanColor(input) {
  let s = String(input ?? "").trim().toLowerCase();
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#[0-9a-f]{3}$/.test(s)) s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return /^#[0-9a-f]{6}$/.test(s) ? s : null;
}

function channels(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function toHex(rgb) {
  return `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("")}`;
}

// Relative luminance, as the accessibility guidelines define it.
function luminance(hex) {
  const [r, g, b] = channels(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// The contrast ratio between two colours, from 1 to 21.
export function contrast(a, b) {
  const x = cleanColor(a);
  const y = cleanColor(b);
  if (!x || !y) return 1;
  const [hi, lo] = [luminance(x), luminance(y)].sort((m, n) => n - m);
  return (hi + 0.05) / (lo + 0.05);
}

// { color, text, adjusted } for the colour a business picked, or null when it is not a colour.
// The text is "#ffffff" or "#000000", whichever reads better. In the few mid tones where neither
// reaches 4.6:1, the colour is darkened step by step until white text does, or lightened until
// black text does, whichever needs the smaller change; adjusted is then true.
export function buttonColors(input) {
  const color = cleanColor(input);
  if (!color) return null;
  const white = contrast(color, "#ffffff");
  const black = contrast(color, "#000000");
  if (Math.max(white, black) >= MIN_CONTRAST) {
    return { color, text: white >= black ? "#ffffff" : "#000000", adjusted: false };
  }
  const rgb = channels(color);
  for (let step = 1; step <= 50; step++) {
    const k = step / 50;
    const darker = toHex(rgb.map((c) => c * (1 - k)));
    if (contrast(darker, "#ffffff") >= MIN_CONTRAST) return { color: darker, text: "#ffffff", adjusted: true };
    const lighter = toHex(rgb.map((c) => c + (255 - c) * k));
    if (contrast(lighter, "#000000") >= MIN_CONTRAST) return { color: lighter, text: "#000000", adjusted: true };
  }
  return { color: "#0b0b0b", text: "#ffffff", adjusted: true };
}
