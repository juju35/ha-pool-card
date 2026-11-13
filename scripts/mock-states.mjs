// Mock Home Assistant registries and states used to render the screenshots and by the tests: a pool measured by an
// iopool probe (device "Pool": water temperature, pH, ORP, filtration recommendation, and a filtration time sensor) with its
// equipment set in the card options (pump switch and speed select, heat pump, salt electrolyser, light, roller cover,
// salt and air temperature sensors), and a spa built with ESPHome (device "Garden spa": temperature, pH, free
// chlorine, TDS, pump, heater and light, all found from the device). Entity ids are in French on purpose (the card
// never relies on them); every name shown is English and neutral.
export const states = {};
export const entities = {};
export const devices = {};

const device = (id, name, model, platform) => (devices[id] = { id, name, model, name_by_user: null, identifiers: [[platform, id]] });
const entity = (entity_id, device_id, platform, state, attributes = {}, extra = {}) => {
  entities[entity_id] = { entity_id, device_id, platform, translation_key: null, ...extra };
  states[entity_id] = { entity_id, state: String(state), attributes, last_changed: "2026-07-14T08:00:00Z", last_updated: "2026-07-14T08:00:00Z" };
};

// Pool: iopool probe
device("pool", "Pool", "ECO", "iopool");
entity("sensor.piscine_temperature", "pool", "iopool", "27.4", { device_class: "temperature", unit_of_measurement: "°C", friendly_name: "Pool Temperature" }, { translation_key: "temperature" });
entity("sensor.piscine_ph", "pool", "iopool", "7.8", { device_class: "ph", friendly_name: "Pool pH" }, { translation_key: "ph" });
entity("sensor.piscine_orp", "pool", "iopool", "690", { unit_of_measurement: "mV", friendly_name: "Pool ORP" }, { translation_key: "orp" });
entity("sensor.piscine_recommandation", "pool", "iopool", "780", { unit_of_measurement: "min", friendly_name: "Pool Filtration recommendation" }, { original_name: "Filtration recommendation" });
entity("sensor.piscine_duree_filtration", "pool", "iopool", "315", { unit_of_measurement: "min", friendly_name: "Pool Elapsed filtration duration" }, { original_name: "Elapsed filtration duration" });
entity("sensor.piscine_mode", "pool", "iopool", "standard", { friendly_name: "Pool Mode" }, { translation_key: "mode" });
entity("binary_sensor.piscine_action", "pool", "iopool", "on", { friendly_name: "Pool Action required" }, { original_name: "Action required" });

// Pool equipment (other devices or helpers: set in the card options)
entity("sensor.temperature_exterieure", null, "met", "23.1", { device_class: "temperature", unit_of_measurement: "°C", friendly_name: "Outdoor temperature" });
entity("sensor.sel_piscine", null, "esphome", "3.6", { unit_of_measurement: "g/L", friendly_name: "Salt level" });
entity("switch.pompe_piscine", null, "shelly", "on", { friendly_name: "Filtration pump" });
entity("select.vitesse_pompe", null, "esphome", "Normal", { options: ["Eco", "Normal", "Boost"], friendly_name: "Pump speed" });
entity("climate.pac_piscine", null, "tuya", "heat", {
  hvac_modes: ["off", "heat", "cool"],
  hvac_action: "heating",
  current_temperature: 27.4,
  temperature: 28,
  target_temp_step: 0.5,
  min_temp: 15,
  max_temp: 40,
  friendly_name: "Heat pump",
});
entity("sensor.electrolyseur_production", null, "esphome", "60", { unit_of_measurement: "%", friendly_name: "Electrolyser production" });
entity("light.eclairage_piscine", null, "tuya", "off", { supported_color_modes: ["rgb"], friendly_name: "Pool light" });
entity("cover.volet_piscine", null, "somfy", "open", { current_position: 100, friendly_name: "Pool cover" });

// Spa: ESPHome
device("spa", "Garden spa", "ESP32 spa controller", "esphome");
entity("sensor.spa_temperature", "spa", "esphome", "37.5", { device_class: "temperature", unit_of_measurement: "°C", friendly_name: "Garden spa Water temperature" });
entity("sensor.spa_ph", "spa", "esphome", "7.3", { device_class: "ph", friendly_name: "Garden spa pH" });
entity("sensor.spa_chlore", "spa", "esphome", "3.4", { unit_of_measurement: "mg/L", friendly_name: "Garden spa Free chlorine" });
entity("sensor.spa_tds", "spa", "esphome", "1800", { unit_of_measurement: "ppm", friendly_name: "Garden spa TDS" });
entity("switch.spa_pompe", "spa", "esphome", "on", { friendly_name: "Garden spa Pump" });
entity("climate.spa_chauffage", "spa", "esphome", "heat", {
  hvac_modes: ["off", "heat"],
  hvac_action: "idle",
  current_temperature: 37.5,
  temperature: 38,
  target_temp_step: 0.5,
  friendly_name: "Garden spa Heater",
});
entity("light.spa_lumiere", "spa", "esphome", "off", { supported_color_modes: ["rgb"], friendly_name: "Garden spa Light" });
entity("sensor.spa_wifi", "spa", "esphome", "-61", { device_class: "signal_strength", unit_of_measurement: "dBm" }, { entity_category: "diagnostic" });

// The pool card of the screenshots: the iopool device, and its equipment set one by one.
export const poolConfig = {
  device: "Pool",
  air_temperature: "sensor.temperature_exterieure",
  salt: "sensor.sel_piscine",
  pump: "switch.pompe_piscine",
  pump_speed: "select.vitesse_pompe",
  heat_pump: "climate.pac_piscine",
  electrolyser: "sensor.electrolyseur_production",
  light: "light.eclairage_piscine",
  cover: "cover.volet_piscine",
};
export const spaConfig = { device: "Garden spa" };

// The day of the screenshots, in the time zone of the machine (the page runs in the same one): 15:30.
export const MIDNIGHT = new Date(2026, 6, 14).getTime();
export const NOW = MIDNIGHT + 15.5 * 3600e3;

// The spa pump's history for the day (compressed states, as history/history_during_period returns them): on 08:00 to
// 10:30 and since 14:00, 4 h at 15:30. `midnight` defaults to the screenshots' day.
export const pumpHistory = (midnight = MIDNIGHT) => ({
  "switch.spa_pompe": [
    { s: "off", lu: midnight / 1000 },
    { s: "on", lu: (midnight + 8 * 3600e3) / 1000 },
    { s: "off", lu: (midnight + 10.5 * 3600e3) / 1000 },
    { s: "on", lu: (midnight + 14 * 3600e3) / 1000 },
  ],
});

// State overrides of the animated states (one GIF each) and of a few screenshots.
const calm = {
  "climate.pac_piscine": { state: "off", attributes: { ...states["climate.pac_piscine"].attributes, hvac_action: "off" } },
};
export const filtering = { ...calm };
export const heatingState = {};
export const lightOn = {
  ...calm,
  "switch.pompe_piscine": { state: "off" },
  "light.eclairage_piscine": { state: "on", attributes: { ...states["light.eclairage_piscine"].attributes, rgb_color: [196, 120, 255] } },
};
export const coverClosing = { ...calm, "switch.pompe_piscine": { state: "off" }, "cover.volet_piscine": { state: "closing", attributes: { friendly_name: "Pool cover" } } };
export const coverOpening = { ...calm, "switch.pompe_piscine": { state: "off" }, "cover.volet_piscine": { state: "opening", attributes: { friendly_name: "Pool cover" } } };
export const spaJets = {};
// A pool that needs care: disinfection too low (the water turns green), the cover half closed and the pump stopped.
export const problems = {
  ...calm,
  "switch.pompe_piscine": { state: "off" },
  "sensor.piscine_orp": { state: "560" },
  "sensor.piscine_ph": { state: "7.5" },
  "sensor.sel_piscine": { state: "2.4" },
  "cover.volet_piscine": { state: "open", attributes: { current_position: 45, friendly_name: "Pool cover" } },
};
