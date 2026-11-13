import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, poolConfig, problems, pumpHistory, spaConfig, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const pc = load();

const makeHass = (overrides = {}, extra = {}) => {
  const st = { ...states };
  for (const [id, o] of Object.entries(overrides)) st[id] = { ...st[id], ...o };
  const calls = [];
  const ws = [];
  return {
    calls,
    ws,
    states: st,
    entities,
    devices,
    language: "en",
    config: { unit_system: { temperature: "°C" } },
    callService: (...a) => calls.push(a),
    callWS: async (msg) => {
      ws.push(msg);
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return pumpHistory(d.getTime());
    },
    ...extra,
  };
};

const newCard = (config = poolConfig, hass = makeHass(), Card = pc.PoolCard) => {
  const card = new Card();
  card.setConfig(config);
  card.hass = hass;
  return card;
};
const html = (card) => card.shadowRoot.innerHTML;
const click = (card, dataset, path = []) => card._onClick({ composedPath: () => [{ dataset }, ...path], stopPropagation() {} });
const tick = () => new Promise((r) => setTimeout(r, 0));
const plain = (v) => JSON.parse(JSON.stringify(v));

test("roles are discovered from the device whatever the entity ids, the options complete them", () => {
  const hass = makeHass();
  const pool = pc.setupOf(hass, poolConfig);
  assert.equal(pool.roles.ph, "sensor.piscine_ph");
  assert.equal(pool.roles.orp, "sensor.piscine_orp");
  assert.equal(pool.roles.water_temperature, "sensor.piscine_temperature");
  assert.equal(pool.roles.filtration_time, "sensor.piscine_duree_filtration");
  assert.equal(pool.roles.filtration_target, "sensor.piscine_recommandation");
  assert.equal(pool.roles.pump, "switch.pompe_piscine");
  const spa = pc.setupOf(hass, spaConfig);
  assert.deepEqual(plain(spa.roles), {
    water_temperature: "sensor.spa_temperature",
    ph: "sensor.spa_ph",
    chlorine: "sensor.spa_chlore",
    tds: "sensor.spa_tds",
    pump: "switch.spa_pompe",
    heat_pump: "climate.spa_chauffage",
    light: "light.spa_lumiere",
  });
});

test("with no option at all, the device with the most water sensors is picked", () => {
  const hass = makeHass();
  assert.ok(["pool", "spa"].includes(pc.autoDevice(hass)));
  assert.deepEqual(plain(pc.PoolCard.getStubConfig(hass)), { device: pc.autoDevice(hass) });
  assert.equal(pc.setupOf(hass, { device: "Nowhere" }).error, "unknown_device");
  assert.equal(pc.setupOf({ ...hass, entities: {}, devices: {} }, {}).error, "no_entities");
});

test("a few role names from other integrations and languages", () => {
  const hass = {
    entities: {},
    states: {
      "sensor.flipr_red_ox": { attributes: { unit_of_measurement: "mV" } },
      "sensor.screenlogic_salt_ppm": { attributes: { unit_of_measurement: "ppm" } },
      "sensor.omnilogic_air_temperature": { attributes: { device_class: "temperature", unit_of_measurement: "°C" } },
      "sensor.ph_setpoint": { attributes: {} },
      "select.pompe_vitesse": { attributes: {} },
      "switch.eclairage_piscine": { attributes: {} },
      "switch.electrolyseur": { attributes: {} },
      "sensor.pool_battery": { attributes: { device_class: "battery", unit_of_measurement: "%" } },
    },
  };
  assert.equal(pc.roleOf("sensor.flipr_red_ox", hass), "orp");
  assert.equal(pc.roleOf("sensor.screenlogic_salt_ppm", hass), "salt");
  assert.equal(pc.roleOf("sensor.omnilogic_air_temperature", hass), "air_temperature");
  assert.equal(pc.roleOf("sensor.ph_setpoint", hass), null);
  assert.equal(pc.roleOf("select.pompe_vitesse", hass), "pump_speed");
  assert.equal(pc.roleOf("switch.eclairage_piscine", hass), "light");
  assert.equal(pc.roleOf("switch.electrolyseur", hass), "electrolyser");
  assert.equal(pc.roleOf("sensor.pool_battery", hass), null);
});

test("entities of ScreenLogic, IntelliCenter, OmniLogic and dosing controllers get the right role, or none", () => {
  const S = (attributes = {}) => ({ attributes });
  const hass = {
    entities: {},
    states: {
      // ScreenLogic: the chlorinator's salt is salt, not chlorine; supply levels and dosing states are not the measure.
      "sensor.pentair_chlorinator_salt": S({ unit_of_measurement: "ppm" }),
      "sensor.pentair_ph_supply_level": S(),
      "sensor.pentair_orp_dosing_state": S({ device_class: "enum" }),
      "sensor.pentair_ph_last_dose_volume": S({ device_class: "volume", unit_of_measurement: "mL" }),
      "sensor.pentair_super_chlorination_timer": S({ unit_of_measurement: "h" }),
      "sensor.pentair_ph_probe_water_temperature": S({ device_class: "temperature", unit_of_measurement: "°F" }),
      // IntelliCenter: the desired temperature and the tank levels are left out, the superchlorinate switch too.
      "sensor.pool_desired_temp": S({ device_class: "temperature", unit_of_measurement: "°F" }),
      "sensor.intellichem_ph_tank_level": S(),
      "switch.intellichlor_superchlorinate": S(),
      "binary_sensor.pool_pump": S(),
      // OmniLogic: the chlorinator's output in % is the electrolyser, not the chlorine.
      "sensor.omnilogic_chlorinator": S({ unit_of_measurement: "%" }),
      // ESPHome controllers: dosing pumps and the heat pump's relay are not the filtration pump.
      "switch.ph_minus_pump": S(),
      "switch.pompe_doseuse_chlore": S(),
      "switch.heat_pump": S(),
      "switch.pac_piscine": S(),
      "sensor.esp32_temperature": S({ device_class: "temperature", unit_of_measurement: "°C" }),
    },
  };
  const roles = Object.fromEntries(Object.keys(hass.states).map((id) => [id, pc.roleOf(id, hass)]));
  assert.deepEqual(roles, {
    "sensor.pentair_chlorinator_salt": "salt",
    "sensor.pentair_ph_supply_level": null,
    "sensor.pentair_orp_dosing_state": null,
    "sensor.pentair_ph_last_dose_volume": null,
    "sensor.pentair_super_chlorination_timer": null,
    "sensor.pentair_ph_probe_water_temperature": "water_temperature",
    "sensor.pool_desired_temp": null,
    "sensor.intellichem_ph_tank_level": null,
    "switch.intellichlor_superchlorinate": null,
    "binary_sensor.pool_pump": "pump",
    "sensor.omnilogic_chlorinator": "electrolyser",
    "switch.ph_minus_pump": null,
    "switch.pompe_doseuse_chlore": null,
    "switch.heat_pump": null,
    "switch.pac_piscine": null,
    "sensor.esp32_temperature": null,
  });
});

test("a pump that can be commanded wins over its state sensor, and diagnostic water measures are found", () => {
  const hass = {
    devices: { d: { id: "d", name: "Pentair" } },
    entities: {
      "binary_sensor.pool_pump": { entity_id: "binary_sensor.pool_pump", device_id: "d" },
      "switch.pool_pump": { entity_id: "switch.pool_pump", device_id: "d" },
      "sensor.pentair_ph_now": { entity_id: "sensor.pentair_ph_now", device_id: "d", entity_category: "diagnostic" },
      "sensor.pentair_wifi": { entity_id: "sensor.pentair_wifi", device_id: "d", entity_category: "diagnostic" },
    },
    states: {
      "binary_sensor.pool_pump": { state: "on", attributes: {} },
      "switch.pool_pump": { state: "on", attributes: {} },
      "sensor.pentair_ph_now": { state: "7.4", attributes: { unit_of_measurement: "pH" } },
      "sensor.pentair_wifi": { state: "-60", attributes: { device_class: "signal_strength" } },
    },
  };
  assert.deepEqual(plain(pc.setupOf(hass, { device: "d" }).roles), { pump: "switch.pool_pump", ph: "sensor.pentair_ph_now" });
});

test("the status: a cold water alone is not a problem, a salt pool's TDS includes its salt", () => {
  const cold = newCard({ device: "Pool", collapsed: [] }, makeHass({ "sensor.piscine_temperature": { state: "15" }, "sensor.piscine_ph": { state: "7.4" } }));
  assert.match(html(cold), /class="chip ok"/);
  assert.doesNotMatch(html(cold), /status_cold/);
  const range = pc.tdsRange(pc.rangeOf("tds", "ppm", "pool"), { v: 3.2, unit: "g/L" }, null);
  assert.deepEqual(plain(range.ideal), [0, 4700]);
  assert.equal(pc.levelOf(range, 4200).cls, "ok");
  // A hot spa gets the health advice, not the algae one.
  const spa = newCard({ ...spaConfig, collapsed: [] }, makeHass({ "sensor.spa_temperature": { state: "40.6" } }));
  assert.match(html(spa), /Water too hot: above 40 °C/);
});

test("levels: ideal, warning margin, critical, cold water", () => {
  const ph = pc.rangeOf("ph", "", "pool");
  assert.equal(pc.levelOf(ph, 7.4).cls, "ok");
  assert.deepEqual(plain(pc.levelOf(ph, 7.7)), { cls: "warn", side: "high" });
  assert.deepEqual(plain(pc.levelOf(ph, 8.0)), { cls: "crit", side: "high" });
  assert.deepEqual(plain(pc.levelOf(ph, 6.9)), { cls: "crit", side: "low" });
  const temp = pc.rangeOf("water_temperature", "°C", "pool");
  assert.deepEqual(plain(pc.levelOf(temp, 15)), { cls: "cold", side: "low" });
  assert.deepEqual(plain(pc.rangeOf("water_temperature", "°F", "spa").ideal), [97, 102]);
  assert.deepEqual(plain(pc.rangeOf("salt", "ppm", "pool").ideal), [2700, 3400]);
  assert.deepEqual(plain(pc.rangeOf("chlorine", "mg/L", "spa").ideal), [3, 5]);
  // Free chlorine: 4 mg/L is a warning in a pool, not an action; 40.5 °C in a spa is critical.
  assert.equal(pc.levelOf(pc.rangeOf("chlorine", "mg/L", "pool"), 4).cls, "warn");
  assert.equal(pc.levelOf(pc.rangeOf("water_temperature", "°C", "spa"), 40.5).cls, "crit");
  // Ideal range of the options, in the unit of the entity.
  assert.deepEqual(plain(pc.rangeOf("ph", "", "pool", { ph_min: 7.0, ph_max: 7.4 }).ideal), [7, 7.4]);
  assert.deepEqual(plain(pc.scaleOf(ph, 9)), [6.6, 9]);
});

test("the full card shows the gauges, the advice and the filtration time of the day", () => {
  const card = newCard();
  const h = html(card);
  for (const label of ["Water temperature", "pH", "ORP (redox)", "Salt"]) assert.match(h, new RegExp(`class="g-label">${label.replace(/[()]/g, "\\$&")}<`));
  assert.match(h, /pH too high: add pH minus/);
  assert.match(h, /class="chip warn"/);
  assert.match(h, /5 hr 15 min of 13 hr/);
  assert.match(h, /Filtering · 5 hr 15 min today/);
  // Equipment folded by default, chevron included.
  assert.match(h, /data-section="equipment" aria-expanded="false"/);
  assert.match(h, /class="scene clickable water-ok running"/);
});

test("problems: the water turns green on a low ORP and the advice says what to do", () => {
  const card = newCard({ ...poolConfig, collapsed: [] }, makeHass(problems));
  const h = html(card);
  assert.match(h, /water-green/);
  assert.match(h, /class="chip crit"/);
  assert.match(h, /ORP too low/);
  assert.match(h, /Salt too low/);
  assert.match(h, /Open · 45 %/);
});

test("without a filtration sensor the pump history gives the time of the day", async () => {
  const hass = makeHass();
  const card = newCard(spaConfig, hass);
  await tick();
  await tick();
  assert.equal(hass.ws[0]?.type, "history/history_during_period");
  assert.deepEqual(plain(hass.ws[0].entity_ids), ["switch.spa_pompe"]);
  assert.ok(pc.runHours(pumpHistory(0)["switch.spa_pompe"], 0, 15.5 * 3600e3) === 4);
  assert.match(html(card), /Filtering · /);
});

test("no pump history (recorder excluded): no filtration time rather than the time since the last try", async () => {
  const hass = makeHass({}, { callWS: async () => Promise.reject(new Error("no history")) });
  const card = newCard(spaConfig, hass);
  await tick();
  await tick();
  card._rt.at -= 30 * 60000;
  card._lastDeps = null;
  card.hass = hass;
  assert.doesNotMatch(html(card), /today/);
  assert.match(html(card), /Filtering</);
});

test("pump, light, cover, heat pump and speed buttons call their services", () => {
  const hass = makeHass({ "climate.pac_piscine": { state: "off", attributes: { hvac_modes: ["off", "heat"], temperature: 28 } } });
  const card = newCard(poolConfig, hass);
  click(card, { action: "pump", entity: "switch.pompe_piscine" });
  click(card, { action: "toggle", entity: "light.eclairage_piscine" });
  click(card, { action: "cover", entity: "cover.volet_piscine" });
  click(card, { action: "heat_pump", entity: "climate.pac_piscine" });
  click(card, { action: "speed", entity: "select.vitesse_pompe", option: "Boost" });
  assert.deepEqual(plain(hass.calls), [
    ["switch", "turn_off", { entity_id: "switch.pompe_piscine" }],
    ["light", "turn_on", { entity_id: "light.eclairage_piscine" }],
    ["cover", "close_cover", { entity_id: "cover.volet_piscine" }],
    ["climate", "set_hvac_mode", { entity_id: "climate.pac_piscine", hvac_mode: "heat" }],
    ["select", "select_option", { entity_id: "select.vitesse_pompe", option: "Boost" }],
  ]);
});

test("stopping the pump while the heat pump heats asks first, in a popup at the top of the card", () => {
  const hass = makeHass();
  const card = newCard(poolConfig, hass);
  click(card, { action: "pump", entity: "switch.pompe_piscine" });
  assert.equal(hass.calls.length, 0);
  assert.match(html(card), /class="dialog-open"/);
  assert.match(html(card), /Stop the pump while the heat pump is heating\?/);
  click(card, { action: "confirm_cancel" });
  assert.equal(hass.calls.length, 0);
  // Clicks right after the popup closed are ignored (the second click of a double click).
  click(card, { action: "pump", entity: "switch.pompe_piscine" });
  assert.doesNotMatch(html(card), /class="dialog-open"/);
  card._confirmClosedAt = 0;
  click(card, { action: "pump", entity: "switch.pompe_piscine" });
  click(card, { action: "confirm_ok" });
  assert.deepEqual(plain(hass.calls), [["switch", "turn_off", { entity_id: "switch.pompe_piscine" }]]);
});

test("the off option of a speed select asks first too while the heat pump heats", () => {
  const hass = makeHass({ "select.vitesse_pompe": { state: "Normal", attributes: { options: ["Off", "Eco", "Normal"] } } });
  const card = newCard(poolConfig, hass);
  click(card, { action: "speed", entity: "select.vitesse_pompe", option: "Off" });
  assert.equal(hass.calls.length, 0);
  assert.match(html(card), /class="dialog-open"/);
  click(card, { action: "confirm_ok" });
  assert.deepEqual(plain(hass.calls), [["select", "select_option", { entity_id: "select.vitesse_pompe", option: "Off" }]]);
});

test("a select pump goes to its off option and back to its last speed", () => {
  const sel = { entity_id: "select.pompe", state: "Normal", attributes: { options: ["Off", "Eco", "Normal"] } };
  const hass = makeHass({}, {});
  hass.states["select.pompe"] = sel;
  const card = newCard({ pump: "select.pompe" }, hass);
  click(card, { action: "pump", entity: "select.pompe" });
  assert.deepEqual(plain(hass.calls.at(-1)), ["select", "select_option", { entity_id: "select.pompe", option: "Off" }]);
  hass.states["select.pompe"] = { ...sel, state: "Off" };
  card.hass = { ...hass, states: { ...hass.states } };
  click(card, { action: "pump", entity: "select.pompe" });
  assert.deepEqual(plain(hass.calls.at(-1)), ["select", "select_option", { entity_id: "select.pompe", option: "Normal" }]);
  assert.equal(pc.pumpOn({ entity_id: "select.p", state: "Off" }), false);
  assert.deepEqual(plain(pc.speedsOf(sel, null).options), ["Eco", "Normal"]);
});

test("heat pump target: one step up or down, within its limits", () => {
  const hass = makeHass();
  const card = newCard(poolConfig, hass);
  click(card, { action: "temp_up", entity: "climate.pac_piscine" });
  click(card, { action: "temp_down", entity: "climate.pac_piscine" });
  assert.deepEqual(plain(hass.calls), [
    ["climate", "set_temperature", { entity_id: "climate.pac_piscine", temperature: 28.5 }],
    ["climate", "set_temperature", { entity_id: "climate.pac_piscine", temperature: 27.5 }],
  ]);
});

test("sections fold and unfold, and fold back on a click elsewhere on the page", () => {
  const card = newCard();
  card.connectedCallback();
  click(card, { action: "toggle_section", section: "equipment" });
  assert.match(html(card), /data-section="equipment" aria-expanded="true"/);
  assert.match(html(card), /Heat pump/);
  // A click in the more-info dialog opened from the card keeps it.
  pc.fireDocument("click", { composedPath: () => [{ tagName: "HA-MORE-INFO-DIALOG" }] });
  assert.match(html(card), /data-section="equipment" aria-expanded="true"/);
  pc.fireDocument("click", { composedPath: () => [{ tagName: "DIV" }] });
  assert.match(html(card), /data-section="equipment" aria-expanded="false"/);
});

test("the mini card shows a summary, its detail button switches to the full card and back", () => {
  const card = newCard(poolConfig, makeHass(), pc.PoolMiniCard);
  card.connectedCallback();
  assert.match(html(card), /class="pill clickable warn"/);
  assert.match(html(card), /class="zoom" data-action="zoom"/);
  assert.doesNotMatch(html(card), /WATER QUALITY|class="gauge/);
  click(card, { action: "zoom" });
  assert.match(html(card), /class="gauge/);
  pc.fireDocument("click", { composedPath: () => [{ tagName: "DIV" }] });
  assert.doesNotMatch(html(card), /class="gauge/);
  const off = newCard({ ...poolConfig, zoom: false }, makeHass(), pc.PoolMiniCard);
  assert.doesNotMatch(html(off), /data-action="zoom"/);
});

test("a click on a value opens its more-info dialog", () => {
  const card = newCard();
  click(card, { entity: "sensor.piscine_ph" });
  assert.equal(card.events.at(-1).type, "hass-more-info");
  assert.equal(card.events.at(-1).detail.entityId, "sensor.piscine_ph");
});

test("buttons are never filled and unavailable equipment cannot be commanded", () => {
  const hass = makeHass({ "switch.pompe_piscine": { state: "unavailable" } });
  const card = newCard(poolConfig, hass);
  assert.match(html(card), /data-action="pump" data-entity="switch.pompe_piscine"[^>]* disabled/);
  click(card, { action: "pump", entity: "switch.pompe_piscine" });
  assert.equal(hass.calls.length, 0);
  const css = html(card).match(/<style>([\s\S]*?)<\/style>/)[1];
  const btn = css.match(/\.btn \{([^}]*)\}/)[1];
  assert.doesNotMatch(btn, /background:\s*var\(--pc-accent\)/);
});

test("the header icon is always shown, in a 40 px round tinted badge, with the status pill on the title line", () => {
  const card = newCard({ ...poolConfig, show_icon: false });
  const h = html(card);
  assert.match(h, /<div class="type-icon warn"><svg/);
  assert.match(h, /<div class="title-row">\s*<div class="name">Pool<\/div>\s*<span class="chip warn"/);
  assert.match(h, /\.type-icon \{ width: 40px; height: 40px; border-radius: 50%;/);
});

test("the scene animates only what runs, and honours reduced motion", () => {
  const still = pc.sceneSvg({ filtering: false, spa: false, heat: false, heatPump: true, light: false, cover: 0, coverMove: "", hasCover: true });
  assert.doesNotMatch(still, /moving|class="flow"|class="flame"|class="glow"|closing/);
  const busy = pc.sceneSvg({ filtering: true, spa: false, heat: true, heatPump: true, light: true, lightColor: "rgb(1,2,3)", cover: 0, coverMove: "closing", hasCover: true });
  for (const k of [/waves moving/, /class="flow"/, /class="flame"/, /class="glow"/, /slats closing/, /heatpump on/]) assert.match(busy, k);
  assert.match(pc.sceneSvg({ filtering: true, spa: true, cover: 0 }), /class="bubbles"/);
  const card = newCard();
  assert.match(html(card), /@media \(prefers-reduced-motion: reduce\)/);
});

test("every language has every English text, and the editor labels resolve", () => {
  const en = Object.keys(pc.STRINGS.en);
  assert.equal(Object.keys(pc.STRINGS).length, 22);
  for (const [l, table] of Object.entries(pc.STRINGS)) assert.deepEqual(Object.keys(table), en, l);
  const card = newCard({ ...poolConfig, language: "fr" });
  assert.match(html(card), /pH trop haut/);
  assert.equal(pc.lang({ language: "pt-BR" }, {}), "pt");
  assert.equal(pc.lang({ language: "sr-Latn" }, {}), "sr-Latn");
});

test("hours and durations", () => {
  assert.equal(pc.fmtHours(5.25, "en"), "5 hr 15 min");
  assert.equal(pc.fmtHours(0.5, "en"), "30 min");
  assert.equal(pc.toHours({ state: "90", attributes: { unit_of_measurement: "min" } }), 1.5);
  assert.equal(pc.kindOf({}, "Garden spa"), "spa");
  assert.equal(pc.kindOf({ kind: "pool" }, "Garden spa"), "pool");
});

test("the visual editor lists the device, the entities (flat in the YAML) and the ideal ranges", () => {
  const ed = new pc.PoolCardEditor();
  ed.setConfig({ type: "custom:pool-card" });
  ed.hass = makeHass();
  const form = ed.children[0];
  assert.ok(form.schema.some((f) => f.name === "device"));
  assert.ok(form.schema.some((f) => f.flatten && f.schema.some((s) => s.name === "ph")));
  assert.ok(form.schema.some((f) => f.name === "ranges" && f.schema.some((s) => s.name === "ph_min")));
  assert.equal(form.computeLabel({ name: "ph_max" }), "pH · max");
  assert.equal(form.data.kind, "auto");
});

test("an unrelated state change does not rebuild the card", () => {
  const hass = makeHass();
  const card = newCard(poolConfig, hass);
  let renders = 0;
  const render = card._render.bind(card);
  card._render = () => {
    renders++;
    return render();
  };
  card.hass = { ...hass, states: { ...hass.states, "light.elsewhere": { entity_id: "light.elsewhere", state: "on", attributes: {} } } };
  assert.equal(renders, 0);
  card.hass = { ...hass, states: { ...hass.states, "sensor.piscine_ph": { ...hass.states["sensor.piscine_ph"], state: "7.4" } } };
  assert.equal(renders, 1);
});
