// ---------------------------------------------------------------------------
// Water quality: ideal ranges, levels and advice
// ---------------------------------------------------------------------------
import { c2f, clamp } from "./helpers.js";

// Gauge scale, ideal range and the margins below and above it that are a warning (beyond: critical), per measure.
// Sources: CDC (free chlorine 1 ppm at least in a pool, 3 ppm in a hot tub; pH 7.0–7.8), CDC MAHC (ORP 600–900 mV,
// chlorine 10 ppm at most), WHO (ORP 720 mV, Ag/AgCl), CPSC (hot tub 40 °C / 104 °F at most), the electrolyser
// makers (salt 2700–3400 ppm for Pentair, Hayward and Jandy cells, 3–5 g/L for most European ones).
export const BASE_RANGES = {
  ph: { scale: [6.6, 8.2], ideal: [7.2, 7.6], margin: [0.2, 0.2], digits: 1 },
  orp: { scale: [400, 900], ideal: [650, 800], margin: [50, 50], digits: 0, unit: "mV" },
  chlorine: { scale: [0, 5], ideal: [1, 3], margin: [0.5, 2], digits: 1, unit: "mg/L" },
  spa_chlorine: { scale: [0, 8], ideal: [3, 5], margin: [1, 5], digits: 1, unit: "mg/L" },
  salt: { scale: [0, 8], ideal: [3, 5], margin: [0.5, 1], digits: 1, unit: "g/L" },
  salt_ppm: { scale: [1500, 4500], ideal: [2700, 3400], margin: [400, 600], digits: 0, unit: "ppm" },
  tds: { scale: [0, 3000], ideal: [0, 1500], margin: [0, 500], digits: 0, unit: "ppm" },
  pool_temp: { scale: [10, 36], ideal: [24, 30], margin: [3, 3], digits: 1, unit: "°C", cold: true },
  spa_temp: { scale: [25, 42], ideal: [36, 39], margin: [1, 1], digits: 1, unit: "°C", cold: true },
};

// The range of a measure in the unit of its entity, with the ideal range of the options (`ranges`) when set.
export const rangeOf = (role, unit, kind, ranges = {}) => {
  let r;
  if (role === "water_temperature" || role === "air_temperature") {
    r = BASE_RANGES[kind === "spa" ? "spa_temp" : "pool_temp"];
    if (/F/.test(unit || "")) r = { ...r, scale: r.scale.map(c2f), ideal: r.ideal.map(c2f), margin: r.margin.map((m) => m * 1.8), unit: "°F" };
  } else if (role === "salt" && /ppm|mg/i.test(unit || "")) r = BASE_RANGES.salt_ppm;
  else if (role === "chlorine" && unit === "mV") r = BASE_RANGES.orp;
  else if (role === "chlorine" && kind === "spa") r = BASE_RANGES.spa_chlorine;
  else r = BASE_RANGES[role];
  const min = parseFloat(ranges[`${role}_min`]);
  const max = parseFloat(ranges[`${role}_max`]);
  const ideal = [Number.isFinite(min) ? min : r.ideal[0], Number.isFinite(max) ? max : r.ideal[1]];
  if (ideal[0] > ideal[1]) ideal.reverse();
  return { ...r, ideal, unit: unit || r.unit || "" };
};

// Level of a value: ok in the ideal range, warn within the margin around it, crit beyond. A cold water is "cold"
// (shown in blue, it is not a water quality problem). side: "low" or "high" (for the advice).
export const levelOf = (range, v) => {
  if (v === null) return { cls: "idle", side: null };
  const [lo, hi] = range.ideal;
  const [mLo, mHi] = range.margin;
  if (v < lo) {
    if (range.cold) return { cls: "cold", side: "low" };
    return { cls: v < lo - mLo ? "crit" : "warn", side: "low" };
  }
  if (v > hi) return { cls: v > hi + mHi ? "crit" : "warn", side: "high" };
  return { cls: "ok", side: null };
};

export const RANK = { crit: 3, warn: 2, ok: 1, cold: 1, idle: 0 };
export const worst = (levels) => levels.reduce((w, l) => (RANK[l] > RANK[w] ? l : w), "idle");

// Gauge scale: the measure's scale, widened to show the margins around the ideal range and the value itself.
export const scaleOf = (range, v) => {
  const [lo, hi] = range.ideal;
  const [mLo, mHi] = range.margin;
  let min = Math.min(range.scale[0], lo - 2 * mLo);
  let max = Math.max(range.scale[1], hi + 2 * mHi);
  if (range.scale[0] >= 0) min = Math.max(0, min);
  if (v !== null && v < min) min = v;
  if (v !== null && v > max) max = v;
  return [min, max];
};

// The track of a gauge: critical, warning, ideal, warning, critical zones as hard color stops.
export const trackOf = (range, [min, max]) => {
  const p = (x) => `${clamp(((x - min) / (max - min)) * 100, 0, 100).toFixed(2)}%`;
  const [lo, hi] = range.ideal;
  const [mLo, mHi] = range.margin;
  const low = range.cold ? ["var(--pc-cold-z)", "var(--pc-cold-z)"] : ["var(--pc-crit-z)", "var(--pc-warn-z)"];
  return `linear-gradient(90deg, ${low[0]} 0 ${p(lo - mLo)}, ${low[1]} ${p(lo - mLo)} ${p(lo)}, var(--pc-ok-z) ${p(lo)} ${p(hi)}, var(--pc-warn-z) ${p(hi)} ${p(hi + mHi)}, var(--pc-crit-z) ${p(hi + mHi)} 100%)`;
};

// A salt pool's TDS includes its salt: its ideal maximum is the salt level plus the usual 1500 ppm (the salt sensor's
// value, else the 3000 ppm of a typical salt cell when the pool has an electrolyser).
export const saltPpm = (salt) => (salt?.v == null ? null : /ppm|mg/i.test(salt.unit) ? salt.v : salt.v * 1000);
export const tdsRange = (range, salt, electrolyser, ranges = {}) => {
  if (Number.isFinite(parseFloat(ranges.tds_max))) return range;
  const base = saltPpm(salt) ?? (electrolyser ? 3000 : null);
  if (base === null) return range;
  const ideal = [range.ideal[0], Math.round((base + 1500) / 100) * 100];
  return { ...range, ideal, scale: [0, Math.max(range.scale[1], ideal[1] + 1500)] };
};
