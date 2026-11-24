// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------
import { clamp, domainOf, norm, valid } from "./helpers.js";

export const OFF_STATES = /^(off|stop|stopped|arret|aus|apagado|spento|0|none|idle)$/;
export const isOffOption = (o) => OFF_STATES.test(norm(o));

// True when the pump runs: on (switch, fan, input_boolean, binary_sensor), or a speed that is not "off" (select).
export const pumpOn = (s) => {
  if (!valid(s)) return false;
  return domainOf(s.entity_id) === "select" ? !isOffOption(s.state) : s.state === "on";
};

export const isOn = (s) => valid(s) && !["off", "closed", "idle"].includes(s.state) && (domainOf(s.entity_id) !== "select" || !isOffOption(s.state));

// The pool cover as a `cover`, or as a `switch` / `input_boolean` (on = covering the pool, off = rolled back): what the
// rest of the card reads of it. `closed` offers the open action and shows the hero line; `shut` is fully closed (the
// closed icon and idle tile); `moving` is the opening / closing animation (covers only); `part` is how far it is drawn
// (1 closed … 0 open); `key` its state label; `pos` its position (covers that report one).
export const coverInfo = (s, invert) => {
  const d = domainOf(s.entity_id);
  if (d === "switch" || d === "input_boolean") {
    // The switch covers the pool when it is on, unless `invert_cover` is set for a relay wired the other way round.
    const shut = invert ? s.state === "off" : s.state === "on";
    return { closed: shut, shut, moving: "", part: shut ? 1 : 0, key: shut ? "cover_closed" : "cover_open", pos: Number.NaN };
  }
  const pos = Number(s.attributes?.current_position);
  return {
    closed: s.state === "closed" || s.state === "closing",
    shut: s.state === "closed",
    moving: s.state === "closing" || s.state === "opening" ? s.state : "",
    part: Number.isFinite(pos) ? clamp(1 - pos / 100, 0, 1) : s.state === "closed" ? 1 : 0,
    key: { open: "cover_open", closed: "cover_closed", opening: "opening", closing: "closing" }[s.state] || "cover_open",
    pos,
  };
};

// Heat pump heating: its action when it reports one, else its mode.
export const heating = (s) => valid(s) && (s.attributes?.hvac_action ? s.attributes.hvac_action === "heating" : s.state === "heat");

// Pump speeds the card can set: the options of the speed select, of the pump when it is a select (without its
// "off" option), or the preset modes of a fan.
export const speedsOf = (pump, speed) => {
  if (speed && domainOf(speed.entity_id) === "select") return { entity: speed, options: speed.attributes?.options || [], current: speed.state };
  if (pump && domainOf(pump.entity_id) === "select") return { entity: pump, options: (pump.attributes?.options || []).filter((o) => !isOffOption(o)), current: pump.state };
  if (pump && domainOf(pump.entity_id) === "fan" && pump.attributes?.preset_modes?.length)
    return { entity: pump, options: pump.attributes.preset_modes, current: pump.attributes.preset_mode, fan: true };
  return null;
};

// Hours a pump ran between `start` and `end` (ms) from a history list: compressed ({ s, lc / lu } in seconds) or full
// ({ state, last_changed }) states.
export const runHours = (list, start, end, on = (s) => s === "on") => {
  const pts = (list || [])
    .map((i) => {
      const s = i.s ?? i.state;
      const sec = i.lc ?? i.lu;
      const ts = Number.isFinite(sec) ? sec * 1000 : Date.parse(i.last_changed ?? i.last_updated ?? "");
      return { s, t: clamp(Number.isFinite(ts) ? ts : start, start, end) };
    })
    .sort((a, b) => a.t - b.t);
  let ms = 0;
  pts.forEach((p, i) => {
    const next = i + 1 < pts.length ? pts[i + 1].t : end;
    if (on(p.s)) ms += Math.max(0, next - p.t);
  });
  return ms / 3.6e6;
};

export const midnight = (now) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// The filtration history is read again at most this often (and whenever the pump changes state).
export const HISTORY_MS = 5 * 60000;
