export const PRICES_CHECKED = "6 October 2026";

const HAIKU_45 = { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 };
const SONNET_4 = { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 };
const SONNET_5 = { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 };
const OPUS_4 = { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 };
const OPUS_55 = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 };

export const PRICES = {
  "claude-haiku-4-5": HAIKU_45,
  "claude-sonnet-4-5": SONNET_4,
  "claude-sonnet-4-6": SONNET_4,
  "claude-sonnet-5": SONNET_5,
  "claude-sonnet-5-5": SONNET_5,
  "claude-opus-4-5": OPUS_4,
  "claude-opus-4-6": OPUS_4,
  "claude-opus-4-7": OPUS_4,
  "claude-opus-4-8": OPUS_4,
  "claude-opus-5": OPUS_4,
  "claude-opus-5-5": OPUS_55,
};

export function priceFor(model) {
  const id = String(model || "").replace(/-\d{8}$/, "");
  return PRICES[id] || null;
}

export function costUsd(model, usage) {
  const p = priceFor(model);
  if (!p || !usage) return 0;
  const n = (k) => Math.max(0, Number(usage[k]) || 0);
  const cost =
    n("input_tokens") * p.input +
    n("output_tokens") * p.output +
    n("cache_creation_input_tokens") * p.cacheWrite +
    n("cache_read_input_tokens") * p.cacheRead;
  return Math.round(cost) / 1e6;
}
