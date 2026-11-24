// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, keeping HA's region when its base matches (pt-BR, de-CH); a bare "pt"
// (European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
export const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

export const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);
export const num = (s) => {
  if (!valid(s)) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const svgIcon = (path, cls = "") => `<svg class="icon${cls ? ` ${cls}` : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
export const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
export const domainOf = (id) => String(id || "").split(".")[0];
// An option or state written by an integration in snake_case, as words.
export const humanize = (v) => {
  const w = String(v ?? "").replace(/_/g, " ").trim();
  return w ? w[0].toUpperCase() + w.slice(1) : "";
};
export const fmtNum = (v, digits, locale) =>
  v === null || v === undefined ? "—" : Number(v).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const c2f = (c) => Math.round((c * 9) / 5 + 32);
// Hours as "5 h 15 min" (Intl units in the card's language).
export const UNIT_FMT = {};
export const fmtUnit = (v, unit, locale) => (UNIT_FMT[`${locale}|${unit}`] ??= new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short" })).format(v);
export const fmtHours = (h, locale) => {
  if (h === null || h === undefined || !Number.isFinite(h)) return "—";
  const total = Math.max(0, Math.round(h * 60));
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  if (!hh) return fmtUnit(mm, "minute", locale);
  return mm ? `${fmtUnit(hh, "hour", locale)} ${fmtUnit(mm, "minute", locale)}` : fmtUnit(hh, "hour", locale);
};
// A duration sensor (iopool "Elapsed filtration duration", a history_stats sensor…) in hours.
export const toHours = (s) => {
  const v = num(s);
  if (v === null) return null;
  const unit = String(s.attributes?.unit_of_measurement || "h").toLowerCase();
  if (unit === "min") return v / 60;
  if (unit === "s") return v / 3600;
  if (unit === "d") return v * 24;
  return v;
};
