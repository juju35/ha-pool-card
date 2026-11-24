// ---------------------------------------------------------------------------
// Sauna: its heater, temperature and humidity, door, time to temperature and session
// ---------------------------------------------------------------------------
import { domainOf, norm, toHours, valid } from "./helpers.js";
import { NOT_MEASURE_RE, deviceName, entriesOf, findDeviceId } from "./entity-roles-discovery.js";

// A sauna is told by its name (in any language) or its maker, or set with `kind: sauna`.
export const SAUNA_RE = /sauna|сауна|σαουνα|bastu|pirts|savna|szauna|kiuas|harvia|huum|tylo/;
export const SAUNA_ROLES = ["heater", "temperature", "humidity", "door", "session", "ready_time"];
export const SAUNA_DOMAINS = {
  heater: ["climate", "switch", "input_boolean"],
  temperature: ["sensor"],
  humidity: ["sensor"],
  door: ["binary_sensor"],
  session: ["sensor", "timer"],
  ready_time: ["sensor"],
};
export const HUMIDITY_RE = /humid|feucht|humed|umid|vocht|wilgot|влаж|vlh|vlaz|parat|mitrum|υγρ|fukt|fugt/;
export const READY_RE = /ready|heat.?up|time.?to|warm.?up|pret|chauffe|aufheiz|bereit|listo|pronto|klaar/;
export const SESSION_RE = /session|seance|remaining|left|restant|verbleib|bath|bad|sesion|sessione|sessie/;
export const DOOR_RE = /door|porte|tur|puerta|porta|deur|drzwi|dvere|ajto|vrata|durvis|πορτα|двер|врат/;
export const NOT_HEATER_RE = /light|lumi|licht|led|lamp|fan|vent|music|speaker/;

// The sauna's entities on its device, by kind and name.
export const saunaRolesOf = (hass, deviceId) => {
  const out = {};
  let sw = null;
  const ids = entriesOf(hass, deviceId)
    .filter((e) => !e.hidden && !e.disabled_by && e.entity_category !== "config" && hass.states?.[e.entity_id])
    .map((e) => e.entity_id)
    .sort();
  for (const id of ids) {
    const e = hass.entities[id];
    const a = hass.states[id].attributes || {};
    const d = domainOf(id);
    const unit = String(a.unit_of_measurement || "");
    const text = norm([id, e.translation_key, e.original_name, e.name, a.friendly_name].filter(Boolean).join(" "));
    if (d === "climate") out.heater ??= id;
    else if ((d === "switch" || d === "input_boolean") && !NOT_HEATER_RE.test(text)) sw ??= id;
    else if (d === "sensor") {
      if (a.device_class === "temperature" || /°[cf]/i.test(unit)) {
        if (!NOT_MEASURE_RE.test(text)) out.temperature ??= id;
      } else if (a.device_class === "humidity" || (unit === "%" && HUMIDITY_RE.test(text))) out.humidity ??= id;
      else if (a.device_class === "duration" || /^(min|h|s)$/.test(unit)) {
        if (READY_RE.test(text)) out.ready_time ??= id;
        else if (SESSION_RE.test(text)) out.session ??= id;
      }
    } else if (d === "binary_sensor" && (["door", "opening"].includes(a.device_class) || DOOR_RE.test(text))) out.door ??= id;
    else if (d === "timer") out.session ??= id;
  }
  if (!out.heater && sw) out.heater = sw;
  return out;
};

// The sauna of the card, or null when the card is a pool or a spa: `kind: sauna`, or a device (or heater) named like a
// sauna or made by a sauna maker. Its entities: those of the device, each replaced by the one set in the options.
export const saunaSetupOf = (hass, config) => {
  if (config.kind && config.kind !== "auto" && config.kind !== "sauna") return null;
  const explicit = Object.fromEntries(SAUNA_ROLES.filter((r) => typeof config[r] === "string" && config[r]).map((r) => [r, config[r]]));
  let deviceId = null;
  if (config.device) {
    deviceId = findDeviceId(hass, config.device);
    if (deviceId === undefined) return config.kind === "sauna" ? { error: "unknown_device" } : null;
  }
  const device = deviceId ? hass.devices?.[deviceId] : null;
  const heaterName = explicit.heater ? [explicit.heater, hass.states?.[explicit.heater]?.attributes?.friendly_name] : [];
  if (config.kind !== "sauna" && !SAUNA_RE.test(norm([config.title, deviceName(device), device?.manufacturer, device?.model, ...heaterName].filter(Boolean).join(" ")))) return null;
  const roles = { ...(deviceId ? saunaRolesOf(hass, deviceId) : {}), ...explicit };
  if (!roles.heater && !roles.temperature) return { error: "no_entities" };
  return { roles, deviceId, device };
};

// Hours left of a session: a timer (its end, or its remaining time while paused) or a duration sensor.
export const sessionHours = (s, now = Date.now()) => {
  if (!valid(s)) return null;
  if (domainOf(s.entity_id) !== "timer") {
    const h = toHours(s);
    return h !== null && h > 0 ? h : null;
  }
  if (s.state === "active" && s.attributes?.finishes_at) return Math.max(0, (Date.parse(s.attributes.finishes_at) - now) / 3.6e6);
  if (s.state === "paused" && typeof s.attributes?.remaining === "string") {
    const [hh = 0, mm = 0, ss = 0] = s.attributes.remaining.split(":").map(Number);
    return hh + mm / 60 + ss / 3600;
  }
  return null;
};
