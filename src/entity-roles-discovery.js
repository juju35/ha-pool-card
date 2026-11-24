// ---------------------------------------------------------------------------
// Entity roles and discovery
// ---------------------------------------------------------------------------
import { domainOf, norm } from "./helpers.js";
import { SAUNA_RE } from "./sauna.js";

// What the card can show, one entity each. Sensors first: they are the gauges, in this order.
export const METRIC_ROLES = ["water_temperature", "ph", "orp", "chlorine", "salt", "tds"];
export const SENSOR_ROLES = [...METRIC_ROLES, "air_temperature"];
export const EQUIPMENT_ROLES = ["pump", "pump_speed", "filtration_time", "filtration_target", "heat_pump", "electrolyser", "light", "cover", "robot"];
export const ENERGY_ROLES = ["power", "energy"];
export const ROLES = [...SENSOR_ROLES, ...EQUIPMENT_ROLES, ...ENERGY_ROLES];
export const DEFAULT_COLLAPSED = ["equipment"];
export const SECTIONS = ["advice", "filtration", "robot", "equipment"];

// Role of an entity from its domain, device class, unit and names (entity id, translation key, names): the
// integrations name them in English (iopool, ScreenLogic, IntelliCenter, OmniLogic, iAquaLink…), ESPHome and template
// entities in the user's language, hence a few French, German and Spanish words. Ids use "_" between words, so word
// boundaries are written (^|[^a-z]) … ([^a-z]|$) rather than \b.
export const W = (words) => new RegExp(`(^|[^a-z])(${words})([^a-z]|$)`);
export const LIGHT_RE = /light|lumi|eclairage|lamp|licht|beleuchtung|luz/;
export const LIGHT_WORD_RE = W("led|spot");
export const ELECTRO_RE = /electroly|chlorinat|salt.?cell|elektroly/;
// A switch / input_boolean that drives the roller cover (DIY and template setups that expose it as a switch).
export const COVER_RE = /cover|volet|couverture|roller|shutter|rollladen|rolladen|abdeckung|lamell|persienne|b(a|â)che/;
// Things that are not the filtration pump: heat pump, dosing pumps, cleaner, booster, modes.
export const NOT_PUMP_RE = /heat.?pump|pompe.?a.?chaleur|warmepumpe|bomba.?de.?calor|dos(e|ing|age|euse|ier)|peristalt|chlor|acid|booster|cleaner|robot|boost|mode|winter|hivern|super/;
export const NOT_PUMP_WORD_RE = W("ph|pac|swg");
// A pool cleaner: on the pool's device (a vacuum entity, or a plug or relay powering it in its automation mode), or a
// robot of its own named like one or from a pool robot integration (MyDolphin Plus, Maytronics One, iAqualink Robots).
export const ROBOT_RE = /robot|cleaner|nettoyeur|dolphin|polaris|zodiac|aiper|beatbot|wybot|maytronic|reiniger|limpiafondos|pulitore|robo/;
export const POOL_ROBOT_RE = /dolphin|maytronic|aqualink|polaris|zodiac|aiper|beatbot|wybot|pool|piscine|piscina|schwimm|zwembad|basen/;
// A measure the card must not read as the water quality itself: set points, dosing, tanks, alarms…
export const NOT_MEASURE_RE = /setpoint|set.?point|set.?pt|consigne|target|sollwert|desired|cible|suppl|dose|dosing|tank|reservoir|bidon|volume|state|status|alarm|lockout|limit|probe.?fault|_set([^a-z]|$)|_sp([^a-z]|$)/;
// Temperatures that are not the water's: the controller's own, solar panels…
export const NOT_WATER_TEMP_RE = /internal|cpu|chip|esp32|esp8266|board|cabinet|enclosure|boitier|solar|roof|panel|exchanger/;
export const AIR_RE = /(^|[^a-z])air([^a-z]|$)|outdoor|outside|exterieur|ambient|aussen|luft/;
export const unitIs = (unit, list) => list.includes(unit.toLowerCase().replace(/\s/g, ""));

export const roleOf = (id, hass) => {
  const domain = domainOf(id);
  const e = hass.entities?.[id] || {};
  const a = hass.states?.[id]?.attributes || {};
  const text = norm([id, e.translation_key, e.original_name, e.name, a.friendly_name].filter(Boolean).join(" "));
  const has = (re) => re.test(text);
  switch (domain) {
    case "climate":
      return "heat_pump";
    case "vacuum":
      return "robot";
    case "cover":
      return "cover";
    case "light":
      return "light";
    case "switch":
    case "input_boolean":
    case "fan":
    case "select":
      if (has(LIGHT_RE) || has(LIGHT_WORD_RE)) return domain === "select" ? null : "light";
      if (has(ELECTRO_RE) && !has(/super/)) return domain === "fan" ? null : "electrolyser";
      if ((domain === "switch" || domain === "input_boolean") && has(COVER_RE)) return "cover";
      if ((domain === "switch" || domain === "input_boolean") && has(ROBOT_RE)) return "robot";
      if (domain === "select" && has(/speed|vitesse|rpm|geschwindigkeit|velocidad/)) return "pump_speed";
      if (has(NOT_PUMP_RE) || has(NOT_PUMP_WORD_RE)) return null;
      if (has(/pump|pompe|filtrat|pumpe|bomba|depuradora/)) return "pump";
      return null;
    case "sensor": {
      const dc = a.device_class || e.device_class || e.original_device_class;
      const unit = String(a.unit_of_measurement || "");
      if (["battery", "signal_strength", "timestamp", "voltage", "current", "enum"].includes(dc)) return null;
      // Electrical consumption of the pool: instantaneous power (W) and cumulative energy (Wh). The device class wins,
      // then the unit, so a "filtration power" named sensor is still read as power and not mistaken for a filtration time.
      const u = unit.toLowerCase().replace(/\s/g, "");
      if (dc === "power" || (!dc && ["w", "kw", "mw"].includes(u))) return "power";
      if (dc === "energy" || (!dc && ["wh", "kwh", "mwh"].includes(u))) return "energy";
      if (has(/filtrat/)) {
        if (has(/recommend|target|objecti|recommand|empfehl|recomend/)) return "filtration_target";
        if (/^(min|h|s)$/.test(unit)) return "filtration_time";
        return null;
      }
      if (has(NOT_MEASURE_RE)) return null;
      if (dc === "temperature" || /°\s*[CF]/.test(unit)) {
        if (has(AIR_RE)) return "air_temperature";
        return has(NOT_WATER_TEMP_RE) ? null : "water_temperature";
      }
      if (dc === "ph" || has(W("ph"))) return unitIs(unit, ["", "ph"]) ? "ph" : null;
      if (has(/(^|[^a-z])orp|redox|red_ox/)) return unitIs(unit, ["", "mv"]) ? "orp" : null;
      // Salt before chlorine (ScreenLogic's "Chlorinator salt"), the chlorinator's output before the chlorine.
      if (has(/salt|salinit|salz/) || has(W("sel|sal"))) {
        if (unitIs(unit, ["", "g/l", "ppm", "mg/l"])) return "salt";
        return has(ELECTRO_RE) && unit === "%" ? "electrolyser" : null;
      }
      if (has(ELECTRO_RE) || has(/production/)) return unitIs(unit, ["%", "g/h", ""]) && !has(/super/) ? "electrolyser" : null;
      if (has(/chlor|cloro/)) return unitIs(unit, ["", "mg/l", "ppm", "mv"]) ? "chlorine" : null;
      if (has(W("tds")) || has(/dissolved/)) return unitIs(unit, ["", "ppm", "mg/l"]) ? "tds" : null;
      if (unit === "mV") return "orp";
      return null;
    }
    case "binary_sensor":
      return has(/filtrat|pump|pompe/) && !has(/error|alarm|fault|problem/) && !has(NOT_PUMP_RE) && !has(NOT_PUMP_WORD_RE) ? "pump" : null;
    default:
      return null;
  }
};

// Diagnostic entities a role may come from: some integrations file their water measures there (ScreenLogic's
// IntelliChem and IntelliChlor sensors, its pH probe temperature).
export const DIAGNOSTIC_ROLES = new Set(["water_temperature", "ph", "orp", "chlorine", "salt", "tds"]);
// When a device has several candidates for a role, the one that can be commanded (pump, light), or named after the
// water (temperature), wins; then a non-diagnostic one; then the entity id order (stable across reloads).
export const PUMP_RANK = { switch: 4, select: 3, fan: 3, input_boolean: 2, binary_sensor: 0 };
export const WATER_RE = /water|pool|piscine|bassin|eau|wasser|agua|acqua|spa|basin/;
export const rankOf = (role, id, hass, diagnostic) => {
  let r = diagnostic ? -1 : 0;
  if (role === "pump") r += PUMP_RANK[domainOf(id)] ?? 0;
  if (role === "light") r += domainOf(id) === "light" ? 2 : 0;
  if (role === "cover") r += domainOf(id) === "cover" ? 2 : 0;
  if (role === "water_temperature" && WATER_RE.test(norm([id, hass.entities?.[id]?.original_name, hass.states?.[id]?.attributes?.friendly_name].join(" ")))) r += 2;
  return r;
};

// Devices by id with their entities, built once per registry object.
export const _byDevice = new WeakMap();
export const devicesOf = (hass) => {
  const cached = _byDevice.get(hass.entities);
  if (cached) return cached;
  const map = new Map();
  for (const e of Object.values(hass.entities || {})) {
    if (!e.device_id || e.hidden || e.disabled_by || e.entity_category === "config") continue;
    (map.get(e.device_id) || map.set(e.device_id, []).get(e.device_id)).push(e.entity_id);
  }
  _byDevice.set(hass.entities, map);
  return map;
};

export const deviceName = (d) => d?.name_by_user || d?.name || "";

// Every registry entry by device (hidden, disabled and configuration ones included), built once per registry object:
// the robot's and the sauna's own parts are read from their device's entries, not from a scan of the whole registry
// on every state change.
export const _allByDevice = new WeakMap();
export const entriesOf = (hass, deviceId) => {
  let map = _allByDevice.get(hass.entities);
  if (!map) {
    map = new Map();
    for (const e of Object.values(hass.entities || {})) if (e?.device_id) (map.get(e.device_id) || map.set(e.device_id, []).get(e.device_id)).push(e);
    if (hass.entities) _allByDevice.set(hass.entities, map);
  }
  return map.get(deviceId) || [];
};

// Roles found on a device: the best entity of each role (see rankOf), cached per registry and states objects.
export const _roles = new WeakMap();
export const rolesOf = (hass, deviceId) => {
  let byDevice = _roles.get(hass.states);
  if (!byDevice || byDevice.entities !== hass.entities) _roles.set(hass.states, (byDevice = { entities: hass.entities, map: new Map() }));
  if (byDevice.map.has(deviceId)) return byDevice.map.get(deviceId);
  const best = {};
  for (const id of [...(devicesOf(hass).get(deviceId) || [])].sort()) {
    const diagnostic = hass.entities?.[id]?.entity_category === "diagnostic";
    const role = roleOf(id, hass);
    if (!role || (diagnostic && !DIAGNOSTIC_ROLES.has(role))) continue;
    const rank = rankOf(role, id, hass, diagnostic);
    if (!best[role] || rank > best[role].rank) best[role] = { id, rank };
  }
  const roles = Object.fromEntries(Object.entries(best).map(([role, { id }]) => [role, id]));
  byDevice.map.set(deviceId, roles);
  return roles;
};

// The device of the pool when none is set: the one with the most water quality sensors (two at least).
export const _auto = new WeakMap();
export const autoDevice = (hass) => {
  if (!hass.entities || !hass.devices) return null;
  const cached = _auto.get(hass.entities);
  if (cached !== undefined && cached.devices === hass.devices) return cached.id;
  let best = null;
  let score = 1;
  for (const id of Object.keys(hass.devices)) {
    const dev = hass.devices[id];
    if (SAUNA_RE.test(norm([deviceName(dev), dev?.manufacturer].filter(Boolean).join(" ")))) continue;
    const roles = rolesOf(hass, id);
    const n = SENSOR_ROLES.filter((r) => roles[r] && r !== "air_temperature" && r !== "water_temperature").length + (roles.water_temperature ? 0.5 : 0);
    if (n > score) {
      best = id;
      score = n;
    }
  }
  _auto.set(hass.entities, { id: best, devices: hass.devices });
  return best;
};

export const findDeviceId = (hass, device) => {
  if (!device || !hass.devices) return null;
  if (hass.devices[device]) return device;
  const d = Object.values(hass.devices).find((x) => deviceName(x) === device || x.name === device);
  return d ? d.id : undefined;
};

// The entities of the card: those of the device (set, or found), each role replaced by the one set in the options.
export const setupOf = (hass, config) => {
  const explicit = Object.fromEntries(ROLES.filter((r) => typeof config[r] === "string" && config[r]).map((r) => [r, config[r]]));
  let deviceId = null;
  if (config.device) {
    deviceId = findDeviceId(hass, config.device);
    if (deviceId === undefined) return { error: "unknown_device" };
  } else if (!Object.keys(explicit).length) deviceId = autoDevice(hass);
  const roles = { ...(deviceId ? rolesOf(hass, deviceId) : {}), ...explicit };
  if (!Object.keys(roles).length) return { error: "no_entities" };
  // The pool robot: on the device or set, else the pool robot of its own; `robot: false` for none.
  if (config.robot === false) delete roles.robot;
  else if (!roles.robot) {
    const robot = poolRobot(hass);
    if (robot) roles.robot = robot;
  }
  return { roles, deviceId, device: deviceId ? hass.devices?.[deviceId] : null };
};

// The entity ids of a states object, listed once per states object (shared by every card and call).
export const _stateIds = new WeakMap();
export const stateIds = (states) => {
  if (!states) return [];
  let ids = _stateIds.get(states);
  if (!ids) _stateIds.set(states, (ids = Object.keys(states)));
  return ids;
};

// The pool robot of its own device: a vacuum entity from a pool robot integration or named like one.
// Looked up again only when the entity registry or the number of entities changes (a vacuum added outside the
// registry changes the count), not on every state change.
export const _robot = new WeakMap();
export const poolRobot = (hass) => {
  const ids = stateIds(hass.states);
  const reg = hass.entities || _robot;
  const hit = _robot.get(reg);
  if (hit && hit.n === ids.length && (!hit.id || hass.states[hit.id])) return hit.id;
  const id = ids
    .filter((x) => x.startsWith("vacuum.") && !hass.entities?.[x]?.hidden)
    .find((x) => POOL_ROBOT_RE.test(norm([hass.entities?.[x]?.platform, x, hass.states[x]?.attributes?.friendly_name].filter(Boolean).join(" "))));
  _robot.set(reg, { n: ids.length, id });
  return id;
};

// What the robot's device tells besides its state: the time left of the cycle (and the cycle's length), its cleaning
// mode (a select), its filter basket (full or not) and its battery, by name in any language.
export const ROBOT_PARTS = {
  left: /time.?left|remaining|restant|restante|verbleib|rimanent|cycle.?left|time.?to.?(end|finish)/,
  total: /cycle.?(time|duration|length)|duree|dauer|durata|duracion|cleaning.?time/,
  mode: /mode|cycle|program|nettoyage|reinigung|limpieza|pulizia/,
  filter: /filter|filtre|filtro|basket|panier|korb/,
};
export const robotParts = (hass, id) => {
  const device = hass.entities?.[id]?.device_id;
  if (!device) return {};
  const out = {};
  for (const e of entriesOf(hass, device)) {
    if (e.entity_id === id || e.hidden || !hass.states[e.entity_id]) continue;
    const d = domainOf(e.entity_id);
    const st = hass.states[e.entity_id];
    const text = norm([e.entity_id, e.translation_key, e.original_name, e.name, st.attributes?.friendly_name].filter(Boolean).join(" "));
    const unit = String(st.attributes?.unit_of_measurement || "");
    if (d === "sensor" && /^(min|h|s)$/.test(unit)) {
      if (!out.left && ROBOT_PARTS.left.test(text)) out.left = e.entity_id;
      else if (!out.total && ROBOT_PARTS.total.test(text)) out.total = e.entity_id;
    } else if (d === "select" && !out.mode && ROBOT_PARTS.mode.test(text)) out.mode = e.entity_id;
    else if ((d === "binary_sensor" || d === "sensor") && !out.filter && ROBOT_PARTS.filter.test(text)) out.filter = e.entity_id;
    else if (d === "sensor" && !out.battery && (st.attributes?.device_class === "battery" || /battery|batterie|bateria/.test(text))) out.battery = e.entity_id;
  }
  return out;
};

export const kindOf = (config, name) => {
  if (["spa", "pool", "sauna"].includes(config.kind)) return config.kind;
  return /\bspa\b|jacuzzi|hot.?tub|whirlpool|jacuzi|balneo|whirlpool/.test(norm(name)) ? "spa" : "pool";
};
