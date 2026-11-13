/*
 * Pool Card for Home Assistant
 * https://github.com/juju35/ha-pool-card
 *
 * Lovelace cards for a swimming pool or a spa, whatever the integration: water quality sensors (pH, ORP, free
 * chlorine, salt, TDS, water and air temperature) of iopool, Flipr, Blue Riiot / Blue Connect, ESPHome, Pentair
 * ScreenLogic / IntelliCenter, Hayward OmniLogic, Jandy iAquaLink…, and the equipment around them: filtration pump
 * (switch, select or fan with its speed), salt electrolyser, heat pump (climate), lighting and cover.
 * Entities are discovered from a device through the entity registry (whatever the language of their ids) and can
 * all be set one by one.
 */

const VERSION = "__VERSION__";

const ICONS = {
  pool: "M2,15C3.67,14.25 5.33,13.5 7,13.17V5A3,3 0 0,1 10,2C11.31,2 12.42,2.83 12.83,4H10A1,1 0 0,0 9,5V6H14V5A3,3 0 0,1 17,2C18.31,2 19.42,2.83 19.83,4H17A1,1 0 0,0 16,5V14.94C18,14.62 20,13 22,13V15C19.78,15 17.56,17 15.33,17C13.11,17 10.89,15 8.67,15C6.44,15 4.22,16 2,17V15M14,8H9V10H14V8M14,12H9V13C10.67,13.16 12.33,14.31 14,14.79V12M2,19C4.22,18 6.44,17 8.67,17C10.89,17 13.11,19 15.33,19C17.56,19 19.78,17 22,17V19C19.78,19 17.56,21 15.33,21C13.11,21 10.89,19 8.67,19C6.44,19 4.22,20 2,21V19Z",
  spa: "M7,4A2,2 0 0,1 9,6A2,2 0 0,1 7,8A2,2 0 0,1 5,6A2,2 0 0,1 7,4M11.15,12H22V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12H5V11.25C5,10 6,9 7.25,9H7.28C7.62,9 7.95,9.09 8.24,9.23C8.5,9.35 8.74,9.5 8.93,9.73L10.33,11.28C10.56,11.54 10.84,11.78 11.15,12M7,20V14H5V20H7M11,20V14H9V20H11M15,20V14H13V20H15M19,20V14H17V20H19M18.65,5.86C19.68,6.86 20.16,8.21 19.95,9.57L19.89,10H18L18.09,9.41C18.24,8.62 18,7.83 17.42,7.21L17.35,7.15C16.32,6.14 15.85,4.79 16.05,3.43L16.11,3H18L17.91,3.59C17.76,4.38 18,5.17 18.58,5.79L18.65,5.86M14.65,5.86C15.68,6.86 16.16,8.21 15.95,9.57L15.89,10H14L14.09,9.41C14.24,8.62 14,7.83 13.42,7.21L13.35,7.15C12.32,6.14 11.85,4.79 12.05,3.43L12.11,3H14L13.91,3.59C13.76,4.38 14,5.17 14.58,5.79L14.65,5.86Z",
  thermometer: "M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z",
  water_temp: "M10 13V5C10 3.34 8.66 2 7 2S4 3.34 4 5V13C1.79 14.66 1.34 17.79 3 20S7.79 22.66 10 21 12.66 16.21 11 14C10.72 13.62 10.38 13.28 10 13M7 4C7.55 4 8 4.45 8 5V8H6V5C6 4.45 6.45 4 7 4M18 7C18 7 14 11.34 14 14.07C14 19.31 22 19.31 22 14.07C22 11.34 18 7 18 7Z",
  air: "M10 2L7.6 5.4C8.4 5.2 9.2 5 10 5S11.6 5.2 12.4 5.4L10 2M21 13.8V7C21 5.9 20.1 5 19 5S17 5.9 17 7V13.8C16.4 14.4 16 15.2 16 16C16 17.7 17.3 19 19 19S22 17.7 22 16C22 15.1 21.6 14.3 21 13.8M20 8H18V7C18 6.4 18.4 6 19 6S20 6.4 20 7V8M5.5 6.7L1.3 7L3.1 10.8C3.2 10 3.5 9.2 3.9 8.5C4.4 7.8 4.9 7.2 5.5 6.7M10 7C7.2 7 5 9.2 5 12S7.2 17 10 17 15 14.8 15 12 12.8 7 10 7M10 15C8.3 15 7 13.7 7 12S8.3 9 10 9 13 10.3 13 12 11.7 15 10 15M3.2 13.2L1.4 17L5.5 17.4C5 16.9 4.4 16.2 4 15.5C3.5 14.8 3.3 14 3.2 13.2M7.6 18.6L10 22L12.4 18.6C11.6 18.8 10.8 19 10 19C9.1 19 8.3 18.8 7.6 18.6Z",
  ph: "M13 7V17H15V13H17V17H19V7H17V11H15V7H13M11 15V13C11 11.9 10.11 11 9 11H5V21H7V17H9C10.11 17 11 16.11 11 15M9 15H7V13H9V15Z",
  orp: "M12 2L1 21H23M12 6L19.5 19H4.5M14 14H12.5L14 11H10V15H11V18L14 14Z",
  chlorine: "M5,19A1,1 0 0,0 6,20H18A1,1 0 0,0 19,19C19,18.79 18.93,18.59 18.82,18.43L13,8.35V4H11V8.35L5.18,18.43C5.07,18.59 5,18.79 5,19M6,22A3,3 0 0,1 3,19C3,18.4 3.18,17.84 3.5,17.37L9,7.81V6A1,1 0 0,1 8,5V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V5A1,1 0 0,1 15,6V7.81L20.5,17.37C20.82,17.84 21,18.4 21,19A3,3 0 0,1 18,22H6M13,16L14.34,14.66L16.27,18H7.73L10.39,13.39L13,16M12.5,12A0.5,0.5 0 0,1 13,12.5A0.5,0.5 0 0,1 12.5,13A0.5,0.5 0 0,1 12,12.5A0.5,0.5 0 0,1 12.5,12Z",
  salt: "M16.88 4L16.88 4L19.03 6.1L13.5 10.5L12.5 9.5L16.87 4L16.88 4M16.88 2C16.3 2 15.73 2.24 15.33 2.72L9.8 9.65L13.34 13.19L20.28 7.67C21.18 6.91 21.25 5.54 20.41 4.7L18.3 2.59C17.9 2.19 17.39 2 16.88 2M9.1 10.36L8.39 11.07C8 11.46 8 12.09 8.39 12.5L10.5 14.6C10.71 14.8 10.96 14.89 11.22 14.89S11.73 14.8 11.93 14.6L12.63 13.9L9.1 10.36M6 15C5.45 15 5 15.45 5 16C5 16.55 5.45 17 6 17C6.55 17 7 16.55 7 16C7 15.45 6.55 15 6 15M9 16C8.45 16 8 16.45 8 17S8.45 18 9 18C9.55 18 10 17.55 10 17S9.55 16 9 16M4 18C3.45 18 3 18.45 3 19S3.45 20 4 20C4.55 20 5 19.55 5 19S4.55 18 4 18M7 19C6.45 19 6 19.45 6 20S6.45 21 7 21C7.55 21 8 20.55 8 20S7.55 19 7 19Z",
  tds: "M10,12A2,2 0 0,0 8,14A2,2 0 0,0 10,16A2,2 0 0,0 12,14A2,2 0 0,0 10,12M6,8A2,2 0 0,0 4,10A2,2 0 0,0 6,12A2,2 0 0,0 8,10A2,2 0 0,0 6,8M6,16A2,2 0 0,0 4,18A2,2 0 0,0 6,20A2,2 0 0,0 8,18A2,2 0 0,0 6,16M18,8A2,2 0 0,0 20,6A2,2 0 0,0 18,4A2,2 0 0,0 16,6A2,2 0 0,0 18,8M14,16A2,2 0 0,0 12,18A2,2 0 0,0 14,20A2,2 0 0,0 16,18A2,2 0 0,0 14,16M18,12A2,2 0 0,0 16,14A2,2 0 0,0 18,16A2,2 0 0,0 20,14A2,2 0 0,0 18,12M14,8A2,2 0 0,0 12,10A2,2 0 0,0 14,12A2,2 0 0,0 16,10A2,2 0 0,0 14,8M10,4A2,2 0 0,0 8,6A2,2 0 0,0 10,8A2,2 0 0,0 12,6A2,2 0 0,0 10,4Z",
  pump: "M2 21V15H3.5C3.18 14.06 3 13.05 3 12C3 7.03 7.03 3 12 3H22V9H20.5C20.82 9.94 21 10.95 21 12C21 16.97 16.97 21 12 21H2M5 12C5 13.28 5.34 14.47 5.94 15.5L9.4 13.5C9.15 13.06 9 12.55 9 12C9 11.35 9.21 10.75 9.56 10.26L6.3 7.93C5.5 9.08 5 10.5 5 12M12 19C14.59 19 16.85 17.59 18.06 15.5L14.6 13.5C14.08 14.4 13.11 15 12 15L11.71 15L11.33 18.97L12 19M12 9C13.21 9 14.26 9.72 14.73 10.76L18.37 9.1C17.27 6.68 14.83 5 12 5V9M12 11C11.45 11 11 11.45 11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12C13 11.45 12.55 11 12 11Z",
  pump_off: "M22.1 21.5L2.4 1.7L1.1 3L4.8 6.7C3.7 8.2 3 10 3 12C3 13 3.2 14.1 3.5 15H2V21H12C14 21 15.8 20.3 17.3 19.2L20.8 22.7L22.1 21.5M5.9 15.5C5.3 14.5 5 13.3 5 12C5 10.6 5.5 9.2 6.2 8.1L9.2 11.1C9.1 11.3 9 11.7 9 12C9 12.5 9.2 13.1 9.4 13.5L5.9 15.5M12 19H11.3L11.7 15H12C12.3 15 12.6 14.9 12.9 14.8L15.9 17.8C14.8 18.5 13.4 19 12 19M12 8.8L7.4 4.2C8.8 3.5 10.3 3 12 3H22V9H20.5C20.8 9.9 21 11 21 12C21 13.7 20.5 15.2 19.8 16.6L12.2 9C13.3 9.1 14.3 9.8 14.7 10.7L18.3 9C17.3 6.7 14.8 5 12 5V8.8Z",
  light: "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z",
  light_on: "M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z",
  heat_pump: "M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M12 18C15.31 18 18 15.31 18 12S15.31 6 12 6 6 8.69 6 12 8.69 18 12 18M11.25 15.92C10.7 15.82 10.2 15.6 9.75 15.3L11.25 13.8V15.92M12.75 15.92V13.81L14.25 15.31C13.8 15.61 13.3 15.82 12.75 15.92M15.31 14.25L13.81 12.75H15.92C15.82 13.3 15.61 13.8 15.31 14.25M15.92 11.25H13.81L15.31 9.75C15.61 10.2 15.82 10.7 15.92 11.25M12.75 8.08C13.3 8.18 13.8 8.4 14.25 8.7L12.75 10.2V8.08M12 11C12.55 11 13 11.45 13 12S12.55 13 12 13 11 12.55 11 12 11.45 11 12 11M11.25 8.08V10.19L9.75 8.69C10.2 8.39 10.7 8.18 11.25 8.08M8.69 9.75L10.19 11.25H8.08C8.18 10.7 8.39 10.2 8.69 9.75M10.19 12.75L8.69 14.25C8.39 13.81 8.18 13.3 8.07 12.75H10.19Z",
  electrolyser: "M11 15H6L13 1V9H18L11 23V15Z",
  cover: "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z",
  cover_open: "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9Z",
  chevron: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  alert: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  check: "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z",
  info: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",
  timer: "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z",
  minus: "M19,13H5V11H19V13Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  power: "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
  speed: "M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z",
  water: "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z",
  advice: "M8 2C11.9 2 15 5.1 15 9C15 11.4 13.8 13.5 12 14.7V17C12 17.6 11.6 18 11 18H5C4.4 18 4 17.6 4 17V14.7C2.2 13.5 1 11.4 1 9C1 5.1 4.1 2 8 2M5 21V20H11V21C11 21.6 10.6 22 10 22H6C5.4 22 5 21.6 5 21M8 4C5.2 4 3 6.2 3 9C3 11.1 4.2 12.8 6 13.6V16H10V13.6C11.8 12.8 13 11.1 13 9C13 6.2 10.8 4 8 4M20.5 14.5V16H19V14.5H20.5M18.5 9.5H17V9C17 7.3 18.3 6 20 6S23 7.3 23 9C23 10 22.5 10.9 21.7 11.4L21.4 11.6C20.8 12 20.5 12.6 20.5 13.3V13.5H19V13.3C19 12.1 19.6 11 20.6 10.4L20.9 10.2C21.3 9.9 21.5 9.5 21.5 9C21.5 8.2 20.8 7.5 20 7.5S18.5 8.2 18.5 9V9.5Z",
  tools: "M21.71 20.29L20.29 21.71A1 1 0 0 1 18.88 21.71L7 9.85A3.81 3.81 0 0 1 6 10A4 4 0 0 1 2.22 4.7L4.76 7.24L5.29 6.71L6.71 5.29L7.24 4.76L4.7 2.22A4 4 0 0 1 10 6A3.81 3.81 0 0 1 9.85 7L21.71 18.88A1 1 0 0 1 21.71 20.29M2.29 18.88A1 1 0 0 0 2.29 20.29L3.71 21.71A1 1 0 0 0 5.12 21.71L10.59 16.25L7.76 13.42M20 2L16 4V6L13.83 8.17L15.83 10.17L18 8H20L22 4Z",
};

const STRINGS = {
  en: {
    pool: "Pool",
    spa: "Spa",
    water: "Water",
    air: "Air",
    water_temperature: "Water temperature",
    air_temperature: "Air temperature",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Free chlorine",
    salt: "Salt",
    tds: "TDS",
    pump: "Pump",
    pump_speed: "Pump speed",
    filtration_time: "Filtration time today",
    filtration_target: "Filtration target",
    heat_pump: "Heat pump",
    electrolyser: "Electrolyser",
    light: "Light",
    cover: "Cover",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Salt",
    tds_short: "TDS",
    water_quality: "Water quality",
    advice: "Advice",
    filtration: "Filtration",
    equipment: "Equipment",
    status_ok: "Water OK",
    status_warn: "Check the water",
    status_crit: "Action needed",
    status_idle: "No data",
    filtering: "Filtering",
    stopped: "Pump stopped",
    today: "Today",
    today_time: "{time} today",
    of_target: "{done} of {target}",
    target_rule: "Target: water temperature ÷ 2, in hours",
    speed: "Speed",
    ideal: "Ideal {range}",
    heating: "Heating",
    idle: "Idle",
    on: "On",
    off: "Off",
    unavailable: "Unavailable",
    cover_open: "Open",
    cover_closed: "Closed",
    opening: "Opening",
    closing: "Closing",
    open_cover: "Open cover",
    close_cover: "Close cover",
    target: "Target",
    lower_target: "Lower the target",
    raise_target: "Raise the target",
    ph_high: "pH too high: add pH minus and check again in a few hours.",
    ph_low: "pH too low: add pH plus and check again in a few hours.",
    orp_low: "ORP too low: the disinfection is weak, raise the chlorine or the electrolyser output.",
    orp_high: "ORP too high: lower the chlorine or the electrolyser output.",
    chlorine_low: "Free chlorine too low: add chlorine or raise the electrolyser output.",
    chlorine_high: "Free chlorine too high: stop the chlorination and wait before swimming.",
    salt_low: "Salt too low for the electrolyser: add salt with the pump running.",
    salt_high: "Salt too high: replace part of the water with fresh water.",
    tds_low: "TDS very low: check the sensor.",
    tds_high: "TDS too high: renew part of the water.",
    temp_low: "Water cold for swimming.",
    temp_high: "Water very warm: algae risk, filter longer and keep an eye on the chlorine.",
    temp_high_spa: "Water too hot: above 40 °C (104 °F) bathing is unsafe, lower the heater's target.",
    heat_no_flow: "The heat pump is heating while the pump is stopped: it needs the water flow.",
    electrolyser_no_flow: "The electrolyser is on while the pump is stopped.",
    all_good: "All measures are in their ideal range.",
    confirm_pump_off: "Stop the pump while the heat pump is heating? It needs the water flow.",
    stop: "Stop",
    cancel: "Cancel",
    no_entities: "No pool sensor found. Pick a device or the entities in the card options.",
    unknown_device: "Device not found",
    zoom_in: "Show details",
    zoom_out: "Back to the compact view",
    zoom: "Detail button",
    zoom_helper: "Top right of the mini card: shows the full card and back; a click outside the card also goes back.",
    device: "Device",
    device_helper: "Its sensors and equipment are found automatically; set the entities below to change or complete them.",
    title: "Title (optional)",
    kind: "Type",
    kind_auto: "Automatic",
    kind_pool: "Pool",
    kind_spa: "Spa",
    entities: "Entities",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    show_controls: "Show control buttons",
    show_advice: "Show advice",
    show_filtration: "Show filtration",
    show_equipment: "Show equipment",
    filtration_hours: "Daily filtration target (h, empty: automatic)",
    collapsed: "Sections folded by default",
    ranges: "Ideal ranges",
    min: "min",
    max: "max",
    language: "Language",
    lang_auto: "Automatic (Home Assistant language)",
  },
  fr: {
    pool: "Piscine",
    spa: "Spa",
    water: "Eau",
    air: "Air",
    water_temperature: "Température de l'eau",
    air_temperature: "Température de l'air",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Chlore libre",
    salt: "Sel",
    tds: "TDS",
    pump: "Pompe",
    pump_speed: "Vitesse de la pompe",
    filtration_time: "Temps de filtration du jour",
    filtration_target: "Objectif de filtration",
    heat_pump: "Pompe à chaleur",
    electrolyser: "Électrolyseur",
    light: "Éclairage",
    cover: "Couverture",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sel",
    tds_short: "TDS",
    water_quality: "Qualité de l'eau",
    advice: "Conseils",
    filtration: "Filtration",
    equipment: "Équipements",
    status_ok: "Eau OK",
    status_warn: "Eau à surveiller",
    status_crit: "Action requise",
    status_idle: "Aucune donnée",
    filtering: "Filtration en cours",
    stopped: "Pompe arrêtée",
    today: "Aujourd'hui",
    today_time: "{time} aujourd'hui",
    of_target: "{done} sur {target}",
    target_rule: "Objectif : température de l'eau ÷ 2, en heures",
    speed: "Vitesse",
    ideal: "Idéal {range}",
    heating: "Chauffe",
    idle: "En veille",
    on: "Allumé",
    off: "Éteint",
    unavailable: "Indisponible",
    cover_open: "Ouverte",
    cover_closed: "Fermée",
    opening: "Ouverture",
    closing: "Fermeture",
    open_cover: "Ouvrir la couverture",
    close_cover: "Fermer la couverture",
    target: "Consigne",
    lower_target: "Baisser la consigne",
    raise_target: "Monter la consigne",
    ph_high: "pH trop haut : ajoutez du pH moins et contrôlez à nouveau dans quelques heures.",
    ph_low: "pH trop bas : ajoutez du pH plus et contrôlez à nouveau dans quelques heures.",
    orp_low: "ORP trop bas : désinfection insuffisante, augmentez le chlore ou la production de l'électrolyseur.",
    orp_high: "ORP trop haut : baissez le chlore ou la production de l'électrolyseur.",
    chlorine_low: "Chlore libre trop bas : ajoutez du chlore ou augmentez la production de l'électrolyseur.",
    chlorine_high: "Chlore libre trop haut : arrêtez la chloration et attendez avant de vous baigner.",
    salt_low: "Sel insuffisant pour l'électrolyseur : ajoutez du sel pompe en marche.",
    salt_high: "Sel trop élevé : remplacez une partie de l'eau par de l'eau neuve.",
    tds_low: "TDS très bas : vérifiez la sonde.",
    tds_high: "TDS trop élevé : renouvelez une partie de l'eau.",
    temp_low: "Eau froide pour la baignade.",
    temp_high: "Eau très chaude : risque d'algues, filtrez plus longtemps et surveillez le chlore.",
    temp_high_spa: "Eau trop chaude : au-delà de 40 °C, le bain est dangereux, baissez la consigne du chauffage.",
    heat_no_flow: "La pompe à chaleur chauffe alors que la pompe est arrêtée : elle a besoin du débit d'eau.",
    electrolyser_no_flow: "L'électrolyseur est allumé alors que la pompe est arrêtée.",
    all_good: "Toutes les mesures sont dans leur plage idéale.",
    confirm_pump_off: "Arrêter la pompe pendant que la pompe à chaleur chauffe ? Elle a besoin du débit d'eau.",
    stop: "Arrêter",
    cancel: "Annuler",
    no_entities: "Aucun capteur de piscine trouvé. Choisissez un appareil ou les entités dans les options de la carte.",
    unknown_device: "Appareil introuvable",
    zoom_in: "Afficher les détails",
    zoom_out: "Revenir à la vue compacte",
    zoom: "Bouton de détail",
    zoom_helper: "En haut à droite de la mini-carte : affiche la carte complète et revient ; un clic hors de la carte revient aussi.",
    device: "Appareil",
    device_helper: "Ses capteurs et équipements sont trouvés automatiquement ; renseignez les entités ci-dessous pour les changer ou les compléter.",
    title: "Titre (facultatif)",
    kind: "Type",
    kind_auto: "Automatique",
    kind_pool: "Piscine",
    kind_spa: "Spa",
    entities: "Entités",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    show_controls: "Afficher les boutons de commande",
    show_advice: "Afficher les conseils",
    show_filtration: "Afficher la filtration",
    show_equipment: "Afficher les équipements",
    filtration_hours: "Objectif de filtration journalier (h, vide : automatique)",
    collapsed: "Sections repliées par défaut",
    ranges: "Plages idéales",
    min: "min",
    max: "max",
    language: "Langue",
    lang_auto: "Automatique (langue de Home Assistant)",
  },
  de: {
    pool: "Pool",
    spa: "Whirlpool",
    water: "Wasser",
    air: "Luft",
    water_temperature: "Wassertemperatur",
    air_temperature: "Lufttemperatur",
    ph: "pH",
    orp: "Redox (ORP)",
    chlorine: "Freies Chlor",
    salt: "Salz",
    tds: "TDS",
    pump: "Pumpe",
    pump_speed: "Pumpendrehzahl",
    filtration_time: "Filterzeit heute",
    filtration_target: "Filterziel",
    heat_pump: "Wärmepumpe",
    electrolyser: "Elektrolyse",
    light: "Beleuchtung",
    cover: "Abdeckung",
    ph_short: "pH",
    orp_short: "Redox",
    chlorine_short: "Cl",
    salt_short: "Salz",
    tds_short: "TDS",
    water_quality: "Wasserqualität",
    advice: "Hinweise",
    filtration: "Filterung",
    equipment: "Ausstattung",
    status_ok: "Wasser OK",
    status_warn: "Wasser prüfen",
    status_crit: "Handlung nötig",
    status_idle: "Keine Daten",
    filtering: "Filtert",
    stopped: "Pumpe aus",
    today: "Heute",
    today_time: "{time} heute",
    of_target: "{done} von {target}",
    target_rule: "Ziel: Wassertemperatur ÷ 2, in Stunden",
    speed: "Drehzahl",
    ideal: "Ideal {range}",
    heating: "Heizt",
    idle: "Bereit",
    on: "Ein",
    off: "Aus",
    unavailable: "Nicht verfügbar",
    cover_open: "Offen",
    cover_closed: "Geschlossen",
    opening: "Öffnet",
    closing: "Schließt",
    open_cover: "Abdeckung öffnen",
    close_cover: "Abdeckung schließen",
    target: "Sollwert",
    lower_target: "Sollwert senken",
    raise_target: "Sollwert erhöhen",
    ph_high: "pH zu hoch: pH-Minus zugeben und in einigen Stunden erneut messen.",
    ph_low: "pH zu niedrig: pH-Plus zugeben und in einigen Stunden erneut messen.",
    orp_low: "Redox zu niedrig: schwache Desinfektion, Chlor oder Elektrolyseleistung erhöhen.",
    orp_high: "Redox zu hoch: Chlor oder Elektrolyseleistung senken.",
    chlorine_low: "Freies Chlor zu niedrig: Chlor zugeben oder Elektrolyseleistung erhöhen.",
    chlorine_high: "Freies Chlor zu hoch: Chlorung stoppen und vor dem Baden warten.",
    salt_low: "Zu wenig Salz für die Elektrolyse: Salz bei laufender Pumpe zugeben.",
    salt_high: "Zu viel Salz: einen Teil des Wassers durch Frischwasser ersetzen.",
    tds_low: "TDS sehr niedrig: Sensor prüfen.",
    tds_high: "TDS zu hoch: einen Teil des Wassers erneuern.",
    temp_low: "Wasser zum Baden kalt.",
    temp_high: "Wasser sehr warm: Algengefahr, länger filtern und das Chlor im Auge behalten.",
    temp_high_spa: "Wasser zu heiß: über 40 °C ist das Baden gefährlich, den Sollwert der Heizung senken.",
    heat_no_flow: "Die Wärmepumpe heizt, während die Pumpe steht: sie braucht den Wasserdurchfluss.",
    electrolyser_no_flow: "Die Elektrolyse ist an, während die Pumpe steht.",
    all_good: "Alle Messwerte liegen im Idealbereich.",
    confirm_pump_off: "Pumpe stoppen, während die Wärmepumpe heizt? Sie braucht den Wasserdurchfluss.",
    stop: "Stoppen",
    cancel: "Abbrechen",
    no_entities: "Kein Poolsensor gefunden. Wähle ein Gerät oder die Entitäten in den Kartenoptionen.",
    unknown_device: "Gerät nicht gefunden",
    zoom_in: "Details anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    zoom: "Detailansicht",
    zoom_helper: "Oben rechts auf der Mini-Karte: zeigt die vollständige Karte und zurück; ein Klick außerhalb der Karte kehrt ebenfalls zurück.",
    device: "Gerät",
    device_helper: "Seine Sensoren und Geräte werden automatisch gefunden; lege unten die Entitäten fest, um sie zu ändern oder zu ergänzen.",
    title: "Titel (optional)",
    kind: "Typ",
    kind_auto: "Automatisch",
    kind_pool: "Pool",
    kind_spa: "Whirlpool",
    entities: "Entitäten",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    show_controls: "Bedientasten anzeigen",
    show_advice: "Hinweise anzeigen",
    show_filtration: "Filterung anzeigen",
    show_equipment: "Ausstattung anzeigen",
    filtration_hours: "Tägliches Filterziel (h, leer: automatisch)",
    collapsed: "Standardmäßig eingeklappte Bereiche",
    ranges: "Idealbereiche",
    min: "min",
    max: "max",
    language: "Sprache",
    lang_auto: "Automatisch (Sprache von Home Assistant)",
  },
  es: {
    pool: "Piscina",
    spa: "Spa",
    water: "Agua",
    air: "Aire",
    water_temperature: "Temperatura del agua",
    air_temperature: "Temperatura del aire",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Cloro libre",
    salt: "Sal",
    tds: "TDS",
    pump: "Bomba",
    pump_speed: "Velocidad de la bomba",
    filtration_time: "Tiempo de filtración hoy",
    filtration_target: "Objetivo de filtración",
    heat_pump: "Bomba de calor",
    electrolyser: "Clorador salino",
    light: "Iluminación",
    cover: "Cubierta",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sal",
    tds_short: "TDS",
    water_quality: "Calidad del agua",
    advice: "Consejos",
    filtration: "Filtración",
    equipment: "Equipos",
    status_ok: "Agua OK",
    status_warn: "Revisar el agua",
    status_crit: "Acción necesaria",
    status_idle: "Sin datos",
    filtering: "Filtrando",
    stopped: "Bomba parada",
    today: "Hoy",
    today_time: "{time} hoy",
    of_target: "{done} de {target}",
    target_rule: "Objetivo: temperatura del agua ÷ 2, en horas",
    speed: "Velocidad",
    ideal: "Ideal {range}",
    heating: "Calentando",
    idle: "En espera",
    on: "Encendido",
    off: "Apagado",
    unavailable: "No disponible",
    cover_open: "Abierta",
    cover_closed: "Cerrada",
    opening: "Abriendo",
    closing: "Cerrando",
    open_cover: "Abrir la cubierta",
    close_cover: "Cerrar la cubierta",
    target: "Consigna",
    lower_target: "Bajar la consigna",
    raise_target: "Subir la consigna",
    ph_high: "pH demasiado alto: añada reductor de pH y vuelva a medir en unas horas.",
    ph_low: "pH demasiado bajo: añada incrementador de pH y vuelva a medir en unas horas.",
    orp_low: "ORP demasiado bajo: desinfección débil, suba el cloro o la producción del clorador.",
    orp_high: "ORP demasiado alto: baje el cloro o la producción del clorador.",
    chlorine_low: "Cloro libre demasiado bajo: añada cloro o suba la producción del clorador.",
    chlorine_high: "Cloro libre demasiado alto: detenga la cloración y espere antes de bañarse.",
    salt_low: "Poca sal para el clorador: añada sal con la bomba en marcha.",
    salt_high: "Demasiada sal: sustituya parte del agua por agua nueva.",
    tds_low: "TDS muy bajo: revise la sonda.",
    tds_high: "TDS demasiado alto: renueve parte del agua.",
    temp_low: "Agua fría para el baño.",
    temp_high: "Agua muy caliente: riesgo de algas, filtre más tiempo y vigile el cloro.",
    temp_high_spa: "Agua demasiado caliente: por encima de 40 °C el baño es peligroso, baje la consigna del calentador.",
    heat_no_flow: "La bomba de calor calienta con la bomba parada: necesita el caudal de agua.",
    electrolyser_no_flow: "El clorador está encendido con la bomba parada.",
    all_good: "Todas las medidas están en su rango ideal.",
    confirm_pump_off: "¿Parar la bomba mientras la bomba de calor calienta? Necesita el caudal de agua.",
    stop: "Parar",
    cancel: "Cancelar",
    no_entities: "No se encontró ningún sensor de piscina. Elija un dispositivo o las entidades en las opciones de la tarjeta.",
    unknown_device: "Dispositivo no encontrado",
    zoom_in: "Mostrar detalles",
    zoom_out: "Volver a la vista compacta",
    zoom: "Botón de detalle",
    zoom_helper: "Arriba a la derecha de la minitarjeta: muestra la tarjeta completa y vuelve; un clic fuera de la tarjeta también vuelve.",
    device: "Dispositivo",
    device_helper: "Sus sensores y equipos se detectan automáticamente; indique abajo las entidades para cambiarlos o completarlos.",
    title: "Título (opcional)",
    kind: "Tipo",
    kind_auto: "Automático",
    kind_pool: "Piscina",
    kind_spa: "Spa",
    entities: "Entidades",
    show_title: "Mostrar el título",
    show_subtitle: "Mostrar el subtítulo",
    show_controls: "Mostrar los botones de control",
    show_advice: "Mostrar los consejos",
    show_filtration: "Mostrar la filtración",
    show_equipment: "Mostrar los equipos",
    filtration_hours: "Objetivo diario de filtración (h, vacío: automático)",
    collapsed: "Secciones plegadas por defecto",
    ranges: "Rangos ideales",
    min: "mín",
    max: "máx",
    language: "Idioma",
    lang_auto: "Automático (idioma de Home Assistant)",
  },
  sr: {
    pool: "Базен",
    spa: "Спа",
    water: "Вода",
    air: "Ваздух",
    water_temperature: "Температура воде",
    air_temperature: "Температура ваздуха",
    ph: "pH",
    orp: "ORP (редокс)",
    chlorine: "Слободни хлор",
    salt: "Со",
    tds: "TDS",
    pump: "Пумпа",
    pump_speed: "Брзина пумпе",
    filtration_time: "Време филтрације данас",
    filtration_target: "Циљ филтрације",
    heat_pump: "Топлотна пумпа",
    electrolyser: "Електролизер",
    light: "Осветљење",
    cover: "Покривач",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Со",
    tds_short: "TDS",
    water_quality: "Квалитет воде",
    advice: "Савети",
    filtration: "Филтрација",
    equipment: "Опрема",
    status_ok: "Вода у реду",
    status_warn: "Проверите воду",
    status_crit: "Потребна радња",
    status_idle: "Нема података",
    filtering: "Филтрира",
    stopped: "Пумпа заустављена",
    today: "Данас",
    today_time: "{time} данас",
    of_target: "{done} од {target}",
    target_rule: "Циљ: температура воде ÷ 2, у сатима",
    speed: "Брзина",
    ideal: "Идеално {range}",
    heating: "Греје",
    idle: "Мирује",
    on: "Укључено",
    off: "Искључено",
    unavailable: "Недоступно",
    cover_open: "Отворен",
    cover_closed: "Затворен",
    opening: "Отвара се",
    closing: "Затвара се",
    open_cover: "Отвори покривач",
    close_cover: "Затвори покривач",
    target: "Задата вредност",
    lower_target: "Смањи задату вредност",
    raise_target: "Повећај задату вредност",
    ph_high: "pH превисок: додајте pH минус и поново измерите за неколико сати.",
    ph_low: "pH пренизак: додајте pH плус и поново измерите за неколико сати.",
    orp_low: "ORP пренизак: слаба дезинфекција, повећајте хлор или производњу електролизера.",
    orp_high: "ORP превисок: смањите хлор или производњу електролизера.",
    chlorine_low: "Слободни хлор пренизак: додајте хлор или повећајте производњу електролизера.",
    chlorine_high: "Слободни хлор превисок: зауставите хлорисање и сачекајте пре купања.",
    salt_low: "Премало соли за електролизер: додајте со док пумпа ради.",
    salt_high: "Превише соли: замените део воде свежом водом.",
    tds_low: "TDS веома низак: проверите сензор.",
    tds_high: "TDS превисок: замените део воде.",
    temp_low: "Вода је хладна за купање.",
    temp_high: "Вода је веома топла: ризик од алги, филтрирајте дуже и пратите хлор.",
    temp_high_spa: "Вода је превише топла: изнад 40 °C купање није безбедно, смањите задату вредност грејача.",
    heat_no_flow: "Топлотна пумпа греје док је пумпа заустављена: потребан јој је проток воде.",
    electrolyser_no_flow: "Електролизер је укључен док је пумпа заустављена.",
    all_good: "Сва мерења су у идеалном опсегу.",
    confirm_pump_off: "Зауставити пумпу док топлотна пумпа греје? Потребан јој је проток воде.",
    stop: "Заустави",
    cancel: "Откажи",
    no_entities: "Није пронађен сензор базена. Изаберите уређај или ентитете у опцијама картице.",
    unknown_device: "Уређај није пронађен",
    zoom_in: "Прикажи детаље",
    zoom_out: "Назад на компактни приказ",
    zoom: "Дугме за детаље",
    zoom_helper: "Горе десно на мини картици: приказује целу картицу и враћа назад; клик ван картице такође враћа.",
    device: "Уређај",
    device_helper: "Његови сензори и опрема се проналазе аутоматски; подесите ентитете испод да их промените или допуните.",
    title: "Наслов (опционо)",
    kind: "Тип",
    kind_auto: "Аутоматски",
    kind_pool: "Базен",
    kind_spa: "Спа",
    entities: "Ентитети",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    show_controls: "Прикажи командна дугмад",
    show_advice: "Прикажи савете",
    show_filtration: "Прикажи филтрацију",
    show_equipment: "Прикажи опрему",
    filtration_hours: "Дневни циљ филтрације (h, празно: аутоматски)",
    collapsed: "Подразумевано скупљени одељци",
    ranges: "Идеални опсези",
    min: "мин",
    max: "макс",
    language: "Језик",
    lang_auto: "Аутоматски (језик Home Assistant-а)",
  },
  "sr-Latn": {
    pool: "Bazen",
    spa: "Spa",
    water: "Voda",
    air: "Vazduh",
    water_temperature: "Temperatura vode",
    air_temperature: "Temperatura vazduha",
    ph: "pH",
    orp: "ORP (redoks)",
    chlorine: "Slobodni hlor",
    salt: "So",
    tds: "TDS",
    pump: "Pumpa",
    pump_speed: "Brzina pumpe",
    filtration_time: "Vreme filtracije danas",
    filtration_target: "Cilj filtracije",
    heat_pump: "Toplotna pumpa",
    electrolyser: "Elektrolizer",
    light: "Osvetljenje",
    cover: "Pokrivač",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "So",
    tds_short: "TDS",
    water_quality: "Kvalitet vode",
    advice: "Saveti",
    filtration: "Filtracija",
    equipment: "Oprema",
    status_ok: "Voda u redu",
    status_warn: "Proverite vodu",
    status_crit: "Potrebna radnja",
    status_idle: "Nema podataka",
    filtering: "Filtrira",
    stopped: "Pumpa zaustavljena",
    today: "Danas",
    today_time: "{time} danas",
    of_target: "{done} od {target}",
    target_rule: "Cilj: temperatura vode ÷ 2, u satima",
    speed: "Brzina",
    ideal: "Idealno {range}",
    heating: "Greje",
    idle: "Miruje",
    on: "Uključeno",
    off: "Isključeno",
    unavailable: "Nedostupno",
    cover_open: "Otvoren",
    cover_closed: "Zatvoren",
    opening: "Otvara se",
    closing: "Zatvara se",
    open_cover: "Otvori pokrivač",
    close_cover: "Zatvori pokrivač",
    target: "Zadata vrednost",
    lower_target: "Smanji zadatu vrednost",
    raise_target: "Povećaj zadatu vrednost",
    ph_high: "pH previsok: dodajte pH minus i ponovo izmerite za nekoliko sati.",
    ph_low: "pH prenizak: dodajte pH plus i ponovo izmerite za nekoliko sati.",
    orp_low: "ORP prenizak: slaba dezinfekcija, povećajte hlor ili proizvodnju elektrolizera.",
    orp_high: "ORP previsok: smanjite hlor ili proizvodnju elektrolizera.",
    chlorine_low: "Slobodni hlor prenizak: dodajte hlor ili povećajte proizvodnju elektrolizera.",
    chlorine_high: "Slobodni hlor previsok: zaustavite hlorisanje i sačekajte pre kupanja.",
    salt_low: "Premalo soli za elektrolizer: dodajte so dok pumpa radi.",
    salt_high: "Previše soli: zamenite deo vode svežom vodom.",
    tds_low: "TDS veoma nizak: proverite senzor.",
    tds_high: "TDS previsok: zamenite deo vode.",
    temp_low: "Voda je hladna za kupanje.",
    temp_high: "Voda je veoma topla: rizik od algi, filtrirajte duže i pratite hlor.",
    temp_high_spa: "Voda je previše topla: iznad 40 °C kupanje nije bezbedno, smanjite zadatu vrednost grejača.",
    heat_no_flow: "Toplotna pumpa greje dok je pumpa zaustavljena: potreban joj je protok vode.",
    electrolyser_no_flow: "Elektrolizer je uključen dok je pumpa zaustavljena.",
    all_good: "Sva merenja su u idealnom opsegu.",
    confirm_pump_off: "Zaustaviti pumpu dok toplotna pumpa greje? Potreban joj je protok vode.",
    stop: "Zaustavi",
    cancel: "Otkaži",
    no_entities: "Nije pronađen senzor bazena. Izaberite uređaj ili entitete u opcijama kartice.",
    unknown_device: "Uređaj nije pronađen",
    zoom_in: "Prikaži detalje",
    zoom_out: "Nazad na kompaktni prikaz",
    zoom: "Dugme za detalje",
    zoom_helper: "Gore desno na mini kartici: prikazuje celu karticu i vraća nazad; klik van kartice takođe vraća.",
    device: "Uređaj",
    device_helper: "Njegovi senzori i oprema se pronalaze automatski; podesite entitete ispod da ih promenite ili dopunite.",
    title: "Naslov (opciono)",
    kind: "Tip",
    kind_auto: "Automatski",
    kind_pool: "Bazen",
    kind_spa: "Spa",
    entities: "Entiteti",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_controls: "Prikaži komandna dugmad",
    show_advice: "Prikaži savete",
    show_filtration: "Prikaži filtraciju",
    show_equipment: "Prikaži opremu",
    filtration_hours: "Dnevni cilj filtracije (h, prazno: automatski)",
    collapsed: "Podrazumevano skupljeni odeljci",
    ranges: "Idealni opsezi",
    min: "min",
    max: "maks",
    language: "Jezik",
    lang_auto: "Automatski (jezik Home Assistant-a)",
  },
  it: {
    pool: "Piscina",
    spa: "Spa",
    water: "Acqua",
    air: "Aria",
    water_temperature: "Temperatura dell'acqua",
    air_temperature: "Temperatura dell'aria",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Cloro libero",
    salt: "Sale",
    tds: "TDS",
    pump: "Pompa",
    pump_speed: "Velocità della pompa",
    filtration_time: "Tempo di filtrazione oggi",
    filtration_target: "Obiettivo di filtrazione",
    heat_pump: "Pompa di calore",
    electrolyser: "Elettrolizzatore",
    light: "Illuminazione",
    cover: "Copertura",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sale",
    tds_short: "TDS",
    water_quality: "Qualità dell'acqua",
    advice: "Consigli",
    filtration: "Filtrazione",
    equipment: "Dotazioni",
    status_ok: "Acqua OK",
    status_warn: "Controllare l'acqua",
    status_crit: "Intervento necessario",
    status_idle: "Nessun dato",
    filtering: "In filtrazione",
    stopped: "Pompa ferma",
    today: "Oggi",
    today_time: "{time} oggi",
    of_target: "{done} su {target}",
    target_rule: "Obiettivo: temperatura dell'acqua ÷ 2, in ore",
    speed: "Velocità",
    ideal: "Ideale {range}",
    heating: "Riscaldamento",
    idle: "In attesa",
    on: "Acceso",
    off: "Spento",
    unavailable: "Non disponibile",
    cover_open: "Aperta",
    cover_closed: "Chiusa",
    opening: "In apertura",
    closing: "In chiusura",
    open_cover: "Apri la copertura",
    close_cover: "Chiudi la copertura",
    target: "Impostazione",
    lower_target: "Abbassa l'impostazione",
    raise_target: "Alza l'impostazione",
    ph_high: "pH troppo alto: aggiungi pH meno e ricontrolla tra qualche ora.",
    ph_low: "pH troppo basso: aggiungi pH più e ricontrolla tra qualche ora.",
    orp_low: "ORP troppo basso: disinfezione debole, aumenta il cloro o la produzione dell'elettrolizzatore.",
    orp_high: "ORP troppo alto: riduci il cloro o la produzione dell'elettrolizzatore.",
    chlorine_low: "Cloro libero troppo basso: aggiungi cloro o aumenta la produzione dell'elettrolizzatore.",
    chlorine_high: "Cloro libero troppo alto: ferma la clorazione e aspetta prima di fare il bagno.",
    salt_low: "Sale insufficiente per l'elettrolizzatore: aggiungi sale con la pompa in funzione.",
    salt_high: "Sale troppo alto: sostituisci parte dell'acqua con acqua nuova.",
    tds_low: "TDS molto basso: controlla la sonda.",
    tds_high: "TDS troppo alto: rinnova parte dell'acqua.",
    temp_low: "Acqua fredda per il bagno.",
    temp_high: "Acqua molto calda: rischio di alghe, filtra più a lungo e tieni d'occhio il cloro.",
    temp_high_spa: "Acqua troppo calda: oltre 40 °C il bagno è pericoloso, abbassa la temperatura impostata del riscaldatore.",
    heat_no_flow: "La pompa di calore riscalda con la pompa ferma: ha bisogno del flusso d'acqua.",
    electrolyser_no_flow: "L'elettrolizzatore è acceso con la pompa ferma.",
    all_good: "Tutte le misure sono nel loro intervallo ideale.",
    confirm_pump_off: "Fermare la pompa mentre la pompa di calore riscalda? Ha bisogno del flusso d'acqua.",
    stop: "Ferma",
    cancel: "Annulla",
    no_entities: "Nessun sensore della piscina trovato. Scegli un dispositivo o le entità nelle opzioni della scheda.",
    unknown_device: "Dispositivo non trovato",
    zoom_in: "Mostra i dettagli",
    zoom_out: "Torna alla vista compatta",
    zoom: "Pulsante dettagli",
    zoom_helper: "In alto a destra della mini scheda: mostra la scheda completa e torna indietro; anche un clic fuori dalla scheda torna indietro.",
    device: "Dispositivo",
    device_helper: "I suoi sensori e dotazioni vengono trovati automaticamente; imposta le entità qui sotto per cambiarli o completarli.",
    title: "Titolo (facoltativo)",
    kind: "Tipo",
    kind_auto: "Automatico",
    kind_pool: "Piscina",
    kind_spa: "Spa",
    entities: "Entità",
    show_title: "Mostra il titolo",
    show_subtitle: "Mostra il sottotitolo",
    show_controls: "Mostra i pulsanti di comando",
    show_advice: "Mostra i consigli",
    show_filtration: "Mostra la filtrazione",
    show_equipment: "Mostra le dotazioni",
    filtration_hours: "Obiettivo di filtrazione giornaliero (h, vuoto: automatico)",
    collapsed: "Sezioni chiuse per impostazione predefinita",
    ranges: "Intervalli ideali",
    min: "min",
    max: "max",
    language: "Lingua",
    lang_auto: "Automatica (lingua di Home Assistant)",
  },
  nl: {
    pool: "Zwembad",
    spa: "Spa",
    water: "Water",
    air: "Lucht",
    water_temperature: "Watertemperatuur",
    air_temperature: "Luchttemperatuur",
    ph: "pH",
    orp: "Redox (ORP)",
    chlorine: "Vrij chloor",
    salt: "Zout",
    tds: "TDS",
    pump: "Pomp",
    pump_speed: "Pompsnelheid",
    filtration_time: "Filtertijd vandaag",
    filtration_target: "Filterdoel",
    heat_pump: "Warmtepomp",
    electrolyser: "Zoutelektrolyse",
    light: "Verlichting",
    cover: "Afdekking",
    ph_short: "pH",
    orp_short: "Redox",
    chlorine_short: "Cl",
    salt_short: "Zout",
    tds_short: "TDS",
    water_quality: "Waterkwaliteit",
    advice: "Advies",
    filtration: "Filtratie",
    equipment: "Apparatuur",
    status_ok: "Water OK",
    status_warn: "Water controleren",
    status_crit: "Actie nodig",
    status_idle: "Geen gegevens",
    filtering: "Filtert",
    stopped: "Pomp uit",
    today: "Vandaag",
    today_time: "{time} vandaag",
    of_target: "{done} van {target}",
    target_rule: "Doel: watertemperatuur ÷ 2, in uren",
    speed: "Snelheid",
    ideal: "Ideaal {range}",
    heating: "Verwarmt",
    idle: "Stand-by",
    on: "Aan",
    off: "Uit",
    unavailable: "Niet beschikbaar",
    cover_open: "Open",
    cover_closed: "Gesloten",
    opening: "Gaat open",
    closing: "Gaat dicht",
    open_cover: "Afdekking openen",
    close_cover: "Afdekking sluiten",
    target: "Doelwaarde",
    lower_target: "Doelwaarde verlagen",
    raise_target: "Doelwaarde verhogen",
    ph_high: "pH te hoog: voeg pH-min toe en meet over een paar uur opnieuw.",
    ph_low: "pH te laag: voeg pH-plus toe en meet over een paar uur opnieuw.",
    orp_low: "Redox te laag: zwakke desinfectie, verhoog het chloor of de productie van de elektrolyse.",
    orp_high: "Redox te hoog: verlaag het chloor of de productie van de elektrolyse.",
    chlorine_low: "Vrij chloor te laag: voeg chloor toe of verhoog de productie van de elektrolyse.",
    chlorine_high: "Vrij chloor te hoog: stop het chloreren en wacht met zwemmen.",
    salt_low: "Te weinig zout voor de elektrolyse: voeg zout toe terwijl de pomp draait.",
    salt_high: "Te veel zout: vervang een deel van het water door vers water.",
    tds_low: "TDS zeer laag: controleer de sensor.",
    tds_high: "TDS te hoog: ververs een deel van het water.",
    temp_low: "Water koud om te zwemmen.",
    temp_high: "Water erg warm: kans op algen, filter langer en houd het chloor in de gaten.",
    temp_high_spa: "Water te heet: boven 40 °C is baden onveilig, verlaag de ingestelde temperatuur van de verwarming.",
    heat_no_flow: "De warmtepomp verwarmt terwijl de pomp stilstaat: hij heeft de waterstroom nodig.",
    electrolyser_no_flow: "De elektrolyse staat aan terwijl de pomp stilstaat.",
    all_good: "Alle metingen liggen in hun ideale bereik.",
    confirm_pump_off: "De pomp stoppen terwijl de warmtepomp verwarmt? Hij heeft de waterstroom nodig.",
    stop: "Stoppen",
    cancel: "Annuleren",
    no_entities: "Geen zwembadsensor gevonden. Kies een apparaat of de entiteiten in de kaartopties.",
    unknown_device: "Apparaat niet gevonden",
    zoom_in: "Details tonen",
    zoom_out: "Terug naar de compacte weergave",
    zoom: "Detailknop",
    zoom_helper: "Rechtsboven op de minikaart: toont de volledige kaart en terug; een klik buiten de kaart gaat ook terug.",
    device: "Apparaat",
    device_helper: "De sensoren en apparatuur worden automatisch gevonden; stel hieronder de entiteiten in om ze te wijzigen of aan te vullen.",
    title: "Titel (optioneel)",
    kind: "Type",
    kind_auto: "Automatisch",
    kind_pool: "Zwembad",
    kind_spa: "Spa",
    entities: "Entiteiten",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    show_controls: "Bedieningsknoppen tonen",
    show_advice: "Advies tonen",
    show_filtration: "Filtratie tonen",
    show_equipment: "Apparatuur tonen",
    filtration_hours: "Dagelijks filterdoel (u, leeg: automatisch)",
    collapsed: "Standaard ingeklapte secties",
    ranges: "Ideale bereiken",
    min: "min",
    max: "max",
    language: "Taal",
    lang_auto: "Automatisch (taal van Home Assistant)",
  },
  pt: {
    pool: "Piscina",
    spa: "Spa",
    water: "Água",
    air: "Ar",
    water_temperature: "Temperatura da água",
    air_temperature: "Temperatura do ar",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Cloro livre",
    salt: "Sal",
    tds: "TDS",
    pump: "Bomba",
    pump_speed: "Velocidade da bomba",
    filtration_time: "Tempo de filtração hoje",
    filtration_target: "Objetivo de filtração",
    heat_pump: "Bomba de calor",
    electrolyser: "Eletrolisador",
    light: "Iluminação",
    cover: "Cobertura",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sal",
    tds_short: "TDS",
    water_quality: "Qualidade da água",
    advice: "Conselhos",
    filtration: "Filtração",
    equipment: "Equipamentos",
    status_ok: "Água OK",
    status_warn: "Verificar a água",
    status_crit: "Ação necessária",
    status_idle: "Sem dados",
    filtering: "A filtrar",
    stopped: "Bomba parada",
    today: "Hoje",
    today_time: "{time} hoje",
    of_target: "{done} de {target}",
    target_rule: "Objetivo: temperatura da água ÷ 2, em horas",
    speed: "Velocidade",
    ideal: "Ideal {range}",
    heating: "A aquecer",
    idle: "Em espera",
    on: "Ligado",
    off: "Desligado",
    unavailable: "Indisponível",
    cover_open: "Aberta",
    cover_closed: "Fechada",
    opening: "A abrir",
    closing: "A fechar",
    open_cover: "Abrir a cobertura",
    close_cover: "Fechar a cobertura",
    target: "Valor pretendido",
    lower_target: "Baixar o valor pretendido",
    raise_target: "Subir o valor pretendido",
    ph_high: "pH demasiado alto: adicione redutor de pH e volte a medir dentro de algumas horas.",
    ph_low: "pH demasiado baixo: adicione elevador de pH e volte a medir dentro de algumas horas.",
    orp_low: "ORP demasiado baixo: desinfeção fraca, aumente o cloro ou a produção do eletrolisador.",
    orp_high: "ORP demasiado alto: reduza o cloro ou a produção do eletrolisador.",
    chlorine_low: "Cloro livre demasiado baixo: adicione cloro ou aumente a produção do eletrolisador.",
    chlorine_high: "Cloro livre demasiado alto: pare a cloragem e espere antes de tomar banho.",
    salt_low: "Sal insuficiente para o eletrolisador: adicione sal com a bomba a funcionar.",
    salt_high: "Sal demasiado alto: substitua parte da água por água nova.",
    tds_low: "TDS muito baixo: verifique a sonda.",
    tds_high: "TDS demasiado alto: renove parte da água.",
    temp_low: "Água fria para tomar banho.",
    temp_high: "Água muito quente: risco de algas, filtre durante mais tempo e vigie o cloro.",
    temp_high_spa: "Água demasiado quente: acima de 40 °C o banho é perigoso, baixe a temperatura definida do aquecedor.",
    heat_no_flow: "A bomba de calor está a aquecer com a bomba parada: precisa do caudal de água.",
    electrolyser_no_flow: "O eletrolisador está ligado com a bomba parada.",
    all_good: "Todas as medições estão no seu intervalo ideal.",
    confirm_pump_off: "Parar a bomba enquanto a bomba de calor aquece? Precisa do caudal de água.",
    stop: "Parar",
    cancel: "Cancelar",
    no_entities: "Nenhum sensor de piscina encontrado. Escolha um dispositivo ou as entidades nas opções do cartão.",
    unknown_device: "Dispositivo não encontrado",
    zoom_in: "Mostrar detalhes",
    zoom_out: "Voltar à vista compacta",
    zoom: "Botão de detalhe",
    zoom_helper: "No canto superior direito do minicartão: mostra o cartão completo e volta; um clique fora do cartão também volta.",
    device: "Dispositivo",
    device_helper: "Os seus sensores e equipamentos são encontrados automaticamente; defina as entidades abaixo para os alterar ou completar.",
    title: "Título (opcional)",
    kind: "Tipo",
    kind_auto: "Automático",
    kind_pool: "Piscina",
    kind_spa: "Spa",
    entities: "Entidades",
    show_title: "Mostrar o título",
    show_subtitle: "Mostrar o subtítulo",
    show_controls: "Mostrar os botões de comando",
    show_advice: "Mostrar os conselhos",
    show_filtration: "Mostrar a filtração",
    show_equipment: "Mostrar os equipamentos",
    filtration_hours: "Objetivo diário de filtração (h, vazio: automático)",
    collapsed: "Secções recolhidas por predefinição",
    ranges: "Intervalos ideais",
    min: "mín",
    max: "máx",
    language: "Idioma",
    lang_auto: "Automático (idioma do Home Assistant)",
  },
  pl: {
    pool: "Basen",
    spa: "Spa",
    water: "Woda",
    air: "Powietrze",
    water_temperature: "Temperatura wody",
    air_temperature: "Temperatura powietrza",
    ph: "pH",
    orp: "ORP (redoks)",
    chlorine: "Wolny chlor",
    salt: "Sól",
    tds: "TDS",
    pump: "Pompa",
    pump_speed: "Prędkość pompy",
    filtration_time: "Czas filtracji dzisiaj",
    filtration_target: "Cel filtracji",
    heat_pump: "Pompa ciepła",
    electrolyser: "Elektrolizer",
    light: "Oświetlenie",
    cover: "Przykrycie",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sól",
    tds_short: "TDS",
    water_quality: "Jakość wody",
    advice: "Porady",
    filtration: "Filtracja",
    equipment: "Wyposażenie",
    status_ok: "Woda OK",
    status_warn: "Sprawdź wodę",
    status_crit: "Wymagane działanie",
    status_idle: "Brak danych",
    filtering: "Filtruje",
    stopped: "Pompa wyłączona",
    today: "Dzisiaj",
    today_time: "{time} dzisiaj",
    of_target: "{done} z {target}",
    target_rule: "Cel: temperatura wody ÷ 2, w godzinach",
    speed: "Prędkość",
    ideal: "Idealnie {range}",
    heating: "Grzeje",
    idle: "Bezczynny",
    on: "Włączony",
    off: "Wyłączony",
    unavailable: "Niedostępny",
    cover_open: "Otwarte",
    cover_closed: "Zamknięte",
    opening: "Otwieranie",
    closing: "Zamykanie",
    open_cover: "Otwórz przykrycie",
    close_cover: "Zamknij przykrycie",
    target: "Nastawa",
    lower_target: "Obniż nastawę",
    raise_target: "Podnieś nastawę",
    ph_high: "pH za wysokie: dodaj pH minus i zmierz ponownie za kilka godzin.",
    ph_low: "pH za niskie: dodaj pH plus i zmierz ponownie za kilka godzin.",
    orp_low: "ORP za niskie: słaba dezynfekcja, zwiększ chlor lub wydajność elektrolizera.",
    orp_high: "ORP za wysokie: zmniejsz chlor lub wydajność elektrolizera.",
    chlorine_low: "Wolny chlor za niski: dodaj chlor lub zwiększ wydajność elektrolizera.",
    chlorine_high: "Wolny chlor za wysoki: zatrzymaj chlorowanie i odczekaj przed kąpielą.",
    salt_low: "Za mało soli dla elektrolizera: dodaj sól przy pracującej pompie.",
    salt_high: "Za dużo soli: wymień część wody na świeżą.",
    tds_low: "TDS bardzo niskie: sprawdź czujnik.",
    tds_high: "TDS za wysokie: wymień część wody.",
    temp_low: "Woda za zimna do kąpieli.",
    temp_high: "Woda bardzo ciepła: ryzyko glonów, filtruj dłużej i pilnuj chloru.",
    temp_high_spa: "Woda za gorąca: powyżej 40 °C kąpiel jest niebezpieczna, obniż temperaturę zadaną grzałki.",
    heat_no_flow: "Pompa ciepła grzeje, gdy pompa stoi: potrzebuje przepływu wody.",
    electrolyser_no_flow: "Elektrolizer jest włączony, gdy pompa stoi.",
    all_good: "Wszystkie pomiary mieszczą się w idealnym zakresie.",
    confirm_pump_off: "Zatrzymać pompę, gdy pompa ciepła grzeje? Potrzebuje przepływu wody.",
    stop: "Zatrzymaj",
    cancel: "Anuluj",
    no_entities: "Nie znaleziono czujnika basenu. Wybierz urządzenie lub encje w opcjach karty.",
    unknown_device: "Nie znaleziono urządzenia",
    zoom_in: "Pokaż szczegóły",
    zoom_out: "Wróć do widoku kompaktowego",
    zoom: "Przycisk szczegółów",
    zoom_helper: "W prawym górnym rogu mini karty: pokazuje pełną kartę i wraca; kliknięcie poza kartą też wraca.",
    device: "Urządzenie",
    device_helper: "Jego czujniki i wyposażenie są wykrywane automatycznie; ustaw encje poniżej, aby je zmienić lub uzupełnić.",
    title: "Tytuł (opcjonalnie)",
    kind: "Typ",
    kind_auto: "Automatycznie",
    kind_pool: "Basen",
    kind_spa: "Spa",
    entities: "Encje",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    show_controls: "Pokaż przyciski sterowania",
    show_advice: "Pokaż porady",
    show_filtration: "Pokaż filtrację",
    show_equipment: "Pokaż wyposażenie",
    filtration_hours: "Dzienny cel filtracji (h, puste: automatycznie)",
    collapsed: "Sekcje domyślnie zwinięte",
    ranges: "Zakresy idealne",
    min: "min",
    max: "maks",
    language: "Język",
    lang_auto: "Automatycznie (język Home Assistant)",
  },
  ro: {
    pool: "Piscină",
    spa: "Spa",
    water: "Apă",
    air: "Aer",
    water_temperature: "Temperatura apei",
    air_temperature: "Temperatura aerului",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Clor liber",
    salt: "Sare",
    tds: "TDS",
    pump: "Pompă",
    pump_speed: "Viteza pompei",
    filtration_time: "Timp de filtrare azi",
    filtration_target: "Obiectiv de filtrare",
    heat_pump: "Pompă de căldură",
    electrolyser: "Electrolizor",
    light: "Iluminare",
    cover: "Prelată",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sare",
    tds_short: "TDS",
    water_quality: "Calitatea apei",
    advice: "Sfaturi",
    filtration: "Filtrare",
    equipment: "Echipamente",
    status_ok: "Apă OK",
    status_warn: "Verificați apa",
    status_crit: "Acțiune necesară",
    status_idle: "Fără date",
    filtering: "Filtrează",
    stopped: "Pompă oprită",
    today: "Azi",
    today_time: "{time} azi",
    of_target: "{done} din {target}",
    target_rule: "Obiectiv: temperatura apei ÷ 2, în ore",
    speed: "Viteză",
    ideal: "Ideal {range}",
    heating: "Încălzește",
    idle: "În așteptare",
    on: "Pornit",
    off: "Oprit",
    unavailable: "Indisponibil",
    cover_open: "Deschisă",
    cover_closed: "Închisă",
    opening: "Se deschide",
    closing: "Se închide",
    open_cover: "Deschide prelata",
    close_cover: "Închide prelata",
    target: "Valoare setată",
    lower_target: "Scade valoarea setată",
    raise_target: "Crește valoarea setată",
    ph_high: "pH prea mare: adăugați pH minus și verificați din nou peste câteva ore.",
    ph_low: "pH prea mic: adăugați pH plus și verificați din nou peste câteva ore.",
    orp_low: "ORP prea mic: dezinfecție slabă, creșteți clorul sau producția electrolizorului.",
    orp_high: "ORP prea mare: reduceți clorul sau producția electrolizorului.",
    chlorine_low: "Clor liber prea mic: adăugați clor sau creșteți producția electrolizorului.",
    chlorine_high: "Clor liber prea mare: opriți clorinarea și așteptați înainte de baie.",
    salt_low: "Prea puțină sare pentru electrolizor: adăugați sare cu pompa pornită.",
    salt_high: "Prea multă sare: înlocuiți o parte din apă cu apă proaspătă.",
    tds_low: "TDS foarte mic: verificați senzorul.",
    tds_high: "TDS prea mare: înlocuiți o parte din apă.",
    temp_low: "Apă rece pentru baie.",
    temp_high: "Apă foarte caldă: risc de alge, filtrați mai mult și urmăriți clorul.",
    temp_high_spa: "Apă prea caldă: peste 40 °C baia este periculoasă, reduceți temperatura setată a încălzitorului.",
    heat_no_flow: "Pompa de căldură încălzește cu pompa oprită: are nevoie de debitul de apă.",
    electrolyser_no_flow: "Electrolizorul este pornit cu pompa oprită.",
    all_good: "Toate măsurătorile sunt în intervalul ideal.",
    confirm_pump_off: "Opriți pompa cât timp pompa de căldură încălzește? Are nevoie de debitul de apă.",
    stop: "Oprește",
    cancel: "Anulează",
    no_entities: "Niciun senzor de piscină găsit. Alegeți un dispozitiv sau entitățile în opțiunile cardului.",
    unknown_device: "Dispozitiv negăsit",
    zoom_in: "Arată detaliile",
    zoom_out: "Înapoi la vizualizarea compactă",
    zoom: "Buton de detalii",
    zoom_helper: "În dreapta sus pe mini-card: arată cardul complet și revine; un clic în afara cardului revine și el.",
    device: "Dispozitiv",
    device_helper: "Senzorii și echipamentele sale sunt găsite automat; setați entitățile de mai jos pentru a le schimba sau completa.",
    title: "Titlu (opțional)",
    kind: "Tip",
    kind_auto: "Automat",
    kind_pool: "Piscină",
    kind_spa: "Spa",
    entities: "Entități",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    show_controls: "Afișează butoanele de comandă",
    show_advice: "Afișează sfaturile",
    show_filtration: "Afișează filtrarea",
    show_equipment: "Afișează echipamentele",
    filtration_hours: "Obiectiv zilnic de filtrare (h, gol: automat)",
    collapsed: "Secțiuni restrânse implicit",
    ranges: "Intervale ideale",
    min: "min",
    max: "max",
    language: "Limbă",
    lang_auto: "Automat (limba Home Assistant)",
  },
  da: {
    pool: "Pool",
    spa: "Spa",
    water: "Vand",
    air: "Luft",
    water_temperature: "Vandtemperatur",
    air_temperature: "Lufttemperatur",
    ph: "pH",
    orp: "Redox (ORP)",
    chlorine: "Frit klor",
    salt: "Salt",
    tds: "TDS",
    pump: "Pumpe",
    pump_speed: "Pumpehastighed",
    filtration_time: "Filtreringstid i dag",
    filtration_target: "Filtreringsmål",
    heat_pump: "Varmepumpe",
    electrolyser: "Saltklorinator",
    light: "Belysning",
    cover: "Overdækning",
    ph_short: "pH",
    orp_short: "Redox",
    chlorine_short: "Cl",
    salt_short: "Salt",
    tds_short: "TDS",
    water_quality: "Vandkvalitet",
    advice: "Råd",
    filtration: "Filtrering",
    equipment: "Udstyr",
    status_ok: "Vand OK",
    status_warn: "Tjek vandet",
    status_crit: "Handling påkrævet",
    status_idle: "Ingen data",
    filtering: "Filtrerer",
    stopped: "Pumpe stoppet",
    today: "I dag",
    today_time: "{time} i dag",
    of_target: "{done} af {target}",
    target_rule: "Mål: vandtemperatur ÷ 2, i timer",
    speed: "Hastighed",
    ideal: "Ideelt {range}",
    heating: "Varmer",
    idle: "Standby",
    on: "Tændt",
    off: "Slukket",
    unavailable: "Utilgængelig",
    cover_open: "Åben",
    cover_closed: "Lukket",
    opening: "Åbner",
    closing: "Lukker",
    open_cover: "Åbn overdækningen",
    close_cover: "Luk overdækningen",
    target: "Indstillet værdi",
    lower_target: "Sænk den indstillede værdi",
    raise_target: "Hæv den indstillede værdi",
    ph_high: "pH for høj: tilsæt pH-minus og mål igen om nogle timer.",
    ph_low: "pH for lav: tilsæt pH-plus og mål igen om nogle timer.",
    orp_low: "Redox for lav: svag desinfektion, øg kloren eller klorinatorens produktion.",
    orp_high: "Redox for høj: sænk kloren eller klorinatorens produktion.",
    chlorine_low: "Frit klor for lavt: tilsæt klor eller øg klorinatorens produktion.",
    chlorine_high: "Frit klor for højt: stop kloreringen og vent med at bade.",
    salt_low: "For lidt salt til klorinatoren: tilsæt salt, mens pumpen kører.",
    salt_high: "For meget salt: udskift en del af vandet med frisk vand.",
    tds_low: "TDS meget lav: tjek sensoren.",
    tds_high: "TDS for høj: udskift en del af vandet.",
    temp_low: "Vandet er koldt at bade i.",
    temp_high: "Vandet er meget varmt: risiko for alger, filtrer længere og hold øje med kloren.",
    temp_high_spa: "Vandet er for varmt: over 40 °C er badning usikkert, sænk varmerens indstillede temperatur.",
    heat_no_flow: "Varmepumpen varmer, mens pumpen står stille: den har brug for vandgennemstrømningen.",
    electrolyser_no_flow: "Klorinatoren er tændt, mens pumpen står stille.",
    all_good: "Alle målinger er inden for deres ideelle område.",
    confirm_pump_off: "Stop pumpen, mens varmepumpen varmer? Den har brug for vandgennemstrømningen.",
    stop: "Stop",
    cancel: "Annuller",
    no_entities: "Ingen poolsensor fundet. Vælg en enhed eller entiteterne i kortets indstillinger.",
    unknown_device: "Enhed ikke fundet",
    zoom_in: "Vis detaljer",
    zoom_out: "Tilbage til kompakt visning",
    zoom: "Detaljeknap",
    zoom_helper: "Øverst til højre på minikortet: viser hele kortet og tilbage; et klik uden for kortet går også tilbage.",
    device: "Enhed",
    device_helper: "Dens sensorer og udstyr findes automatisk; angiv entiteterne nedenfor for at ændre eller supplere dem.",
    title: "Titel (valgfri)",
    kind: "Type",
    kind_auto: "Automatisk",
    kind_pool: "Pool",
    kind_spa: "Spa",
    entities: "Entiteter",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    show_controls: "Vis betjeningsknapper",
    show_advice: "Vis råd",
    show_filtration: "Vis filtrering",
    show_equipment: "Vis udstyr",
    filtration_hours: "Dagligt filtreringsmål (t, tomt: automatisk)",
    collapsed: "Sektioner foldet sammen som standard",
    ranges: "Ideelle områder",
    min: "min",
    max: "maks",
    language: "Sprog",
    lang_auto: "Automatisk (Home Assistant-sprog)",
  },
  sv: {
    pool: "Pool",
    spa: "Spa",
    water: "Vatten",
    air: "Luft",
    water_temperature: "Vattentemperatur",
    air_temperature: "Lufttemperatur",
    ph: "pH",
    orp: "Redox (ORP)",
    chlorine: "Fritt klor",
    salt: "Salt",
    tds: "TDS",
    pump: "Pump",
    pump_speed: "Pumphastighet",
    filtration_time: "Filtreringstid i dag",
    filtration_target: "Filtreringsmål",
    heat_pump: "Värmepump",
    electrolyser: "Saltklorinator",
    light: "Belysning",
    cover: "Pooltäckning",
    ph_short: "pH",
    orp_short: "Redox",
    chlorine_short: "Cl",
    salt_short: "Salt",
    tds_short: "TDS",
    water_quality: "Vattenkvalitet",
    advice: "Råd",
    filtration: "Filtrering",
    equipment: "Utrustning",
    status_ok: "Vatten OK",
    status_warn: "Kontrollera vattnet",
    status_crit: "Åtgärd krävs",
    status_idle: "Inga data",
    filtering: "Filtrerar",
    stopped: "Pump stoppad",
    today: "I dag",
    today_time: "{time} i dag",
    of_target: "{done} av {target}",
    target_rule: "Mål: vattentemperatur ÷ 2, i timmar",
    speed: "Hastighet",
    ideal: "Idealt {range}",
    heating: "Värmer",
    idle: "Vilar",
    on: "På",
    off: "Av",
    unavailable: "Inte tillgänglig",
    cover_open: "Öppen",
    cover_closed: "Stängd",
    opening: "Öppnas",
    closing: "Stängs",
    open_cover: "Öppna täckningen",
    close_cover: "Stäng täckningen",
    target: "Börvärde",
    lower_target: "Sänk börvärdet",
    raise_target: "Höj börvärdet",
    ph_high: "pH för högt: tillsätt pH-minus och mät igen om några timmar.",
    ph_low: "pH för lågt: tillsätt pH-plus och mät igen om några timmar.",
    orp_low: "Redox för lågt: svag desinfektion, höj kloret eller klorinatorns produktion.",
    orp_high: "Redox för högt: sänk kloret eller klorinatorns produktion.",
    chlorine_low: "Fritt klor för lågt: tillsätt klor eller höj klorinatorns produktion.",
    chlorine_high: "Fritt klor för högt: stoppa kloreringen och vänta innan du badar.",
    salt_low: "För lite salt för klorinatorn: tillsätt salt medan pumpen går.",
    salt_high: "För mycket salt: byt ut en del av vattnet mot färskt vatten.",
    tds_low: "TDS mycket lågt: kontrollera givaren.",
    tds_high: "TDS för högt: byt ut en del av vattnet.",
    temp_low: "Vattnet är kallt för bad.",
    temp_high: "Vattnet är mycket varmt: risk för alger, filtrera längre och håll koll på kloret.",
    temp_high_spa: "Vattnet är för varmt: över 40 °C är bad osäkert, sänk värmarens börvärde.",
    heat_no_flow: "Värmepumpen värmer medan pumpen står still: den behöver vattenflödet.",
    electrolyser_no_flow: "Klorinatorn är på medan pumpen står still.",
    all_good: "Alla mätvärden ligger inom sitt idealområde.",
    confirm_pump_off: "Stoppa pumpen medan värmepumpen värmer? Den behöver vattenflödet.",
    stop: "Stoppa",
    cancel: "Avbryt",
    no_entities: "Ingen poolgivare hittades. Välj en enhet eller entiteterna i kortets inställningar.",
    unknown_device: "Enheten hittades inte",
    zoom_in: "Visa detaljer",
    zoom_out: "Tillbaka till kompakt vy",
    zoom: "Detaljknapp",
    zoom_helper: "Uppe till höger på minikortet: visar hela kortet och tillbaka; ett klick utanför kortet går också tillbaka.",
    device: "Enhet",
    device_helper: "Dess givare och utrustning hittas automatiskt; ange entiteterna nedan för att ändra eller komplettera dem.",
    title: "Titel (valfri)",
    kind: "Typ",
    kind_auto: "Automatisk",
    kind_pool: "Pool",
    kind_spa: "Spa",
    entities: "Entiteter",
    show_title: "Visa titel",
    show_subtitle: "Visa underrubrik",
    show_controls: "Visa kontrollknappar",
    show_advice: "Visa råd",
    show_filtration: "Visa filtrering",
    show_equipment: "Visa utrustning",
    filtration_hours: "Dagligt filtreringsmål (h, tomt: automatiskt)",
    collapsed: "Sektioner hopfällda som standard",
    ranges: "Idealområden",
    min: "min",
    max: "max",
    language: "Språk",
    lang_auto: "Automatiskt (Home Assistants språk)",
  },
  bg: {
    pool: "Басейн",
    spa: "Спа",
    water: "Вода",
    air: "Въздух",
    water_temperature: "Температура на водата",
    air_temperature: "Температура на въздуха",
    ph: "pH",
    orp: "ORP (редокс)",
    chlorine: "Свободен хлор",
    salt: "Сол",
    tds: "TDS",
    pump: "Помпа",
    pump_speed: "Скорост на помпата",
    filtration_time: "Време на филтриране днес",
    filtration_target: "Цел на филтрирането",
    heat_pump: "Термопомпа",
    electrolyser: "Електролизер",
    light: "Осветление",
    cover: "Покривало",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Сол",
    tds_short: "TDS",
    water_quality: "Качество на водата",
    advice: "Съвети",
    filtration: "Филтриране",
    equipment: "Оборудване",
    status_ok: "Водата е наред",
    status_warn: "Проверете водата",
    status_crit: "Нужно е действие",
    status_idle: "Няма данни",
    filtering: "Филтрира",
    stopped: "Помпата е спряна",
    today: "Днес",
    today_time: "{time} днес",
    of_target: "{done} от {target}",
    target_rule: "Цел: температура на водата ÷ 2, в часове",
    speed: "Скорост",
    ideal: "Идеално {range}",
    heating: "Загрява",
    idle: "В готовност",
    on: "Вкл.",
    off: "Изкл.",
    unavailable: "Недостъпно",
    cover_open: "Отворено",
    cover_closed: "Затворено",
    opening: "Отваря се",
    closing: "Затваря се",
    open_cover: "Отвори покривалото",
    close_cover: "Затвори покривалото",
    target: "Зададена стойност",
    lower_target: "Намали зададената стойност",
    raise_target: "Увеличи зададената стойност",
    ph_high: "pH е твърде високо: добавете pH минус и измерете отново след няколко часа.",
    ph_low: "pH е твърде ниско: добавете pH плюс и измерете отново след няколко часа.",
    orp_low: "ORP е твърде нисък: слаба дезинфекция, увеличете хлора или производството на електролизера.",
    orp_high: "ORP е твърде висок: намалете хлора или производството на електролизера.",
    chlorine_low: "Свободният хлор е твърде нисък: добавете хлор или увеличете производството на електролизера.",
    chlorine_high: "Свободният хлор е твърде висок: спрете хлорирането и изчакайте преди къпане.",
    salt_low: "Твърде малко сол за електролизера: добавете сол при работеща помпа.",
    salt_high: "Твърде много сол: сменете част от водата с прясна.",
    tds_low: "TDS е много нисък: проверете сензора.",
    tds_high: "TDS е твърде висок: сменете част от водата.",
    temp_low: "Водата е студена за къпане.",
    temp_high: "Водата е много топла: риск от водорасли, филтрирайте по-дълго и следете хлора.",
    temp_high_spa: "Водата е твърде топла: над 40 °C къпането е опасно, намалете зададената температура на нагревателя.",
    heat_no_flow: "Термопомпата загрява, докато помпата е спряна: нужен ѝ е воден поток.",
    electrolyser_no_flow: "Електролизерът е включен, докато помпата е спряна.",
    all_good: "Всички измервания са в идеалния си диапазон.",
    confirm_pump_off: "Да се спре ли помпата, докато термопомпата загрява? Нужен ѝ е воден поток.",
    stop: "Спри",
    cancel: "Отказ",
    no_entities: "Не е намерен сензор за басейн. Изберете устройство или обектите в опциите на картата.",
    unknown_device: "Устройството не е намерено",
    zoom_in: "Покажи подробности",
    zoom_out: "Обратно към компактния изглед",
    zoom: "Бутон за подробности",
    zoom_helper: "Горе вдясно на мини картата: показва цялата карта и обратно; щракване извън картата също връща.",
    device: "Устройство",
    device_helper: "Сензорите и оборудването му се намират автоматично; задайте обектите по-долу, за да ги промените или допълните.",
    title: "Заглавие (по избор)",
    kind: "Тип",
    kind_auto: "Автоматично",
    kind_pool: "Басейн",
    kind_spa: "Спа",
    entities: "Обекти",
    show_title: "Показване на заглавието",
    show_subtitle: "Показване на подзаглавието",
    show_controls: "Показване на бутоните за управление",
    show_advice: "Показване на съветите",
    show_filtration: "Показване на филтрирането",
    show_equipment: "Показване на оборудването",
    filtration_hours: "Дневна цел на филтрирането (ч, празно: автоматично)",
    collapsed: "Секции, свити по подразбиране",
    ranges: "Идеални диапазони",
    min: "мин",
    max: "макс",
    language: "Език",
    lang_auto: "Автоматично (езикът на Home Assistant)",
  },
  ru: {
    pool: "Бассейн",
    spa: "Спа",
    water: "Вода",
    air: "Воздух",
    water_temperature: "Температура воды",
    air_temperature: "Температура воздуха",
    ph: "pH",
    orp: "ОВП (редокс)",
    chlorine: "Свободный хлор",
    salt: "Соль",
    tds: "TDS",
    pump: "Насос",
    pump_speed: "Скорость насоса",
    filtration_time: "Время фильтрации сегодня",
    filtration_target: "Цель фильтрации",
    heat_pump: "Тепловой насос",
    electrolyser: "Электролизёр",
    light: "Подсветка",
    cover: "Покрытие",
    ph_short: "pH",
    orp_short: "ОВП",
    chlorine_short: "Cl",
    salt_short: "Соль",
    tds_short: "TDS",
    water_quality: "Качество воды",
    advice: "Советы",
    filtration: "Фильтрация",
    equipment: "Оборудование",
    status_ok: "Вода в норме",
    status_warn: "Проверьте воду",
    status_crit: "Нужны действия",
    status_idle: "Нет данных",
    filtering: "Фильтрация",
    stopped: "Насос остановлен",
    today: "Сегодня",
    today_time: "{time} сегодня",
    of_target: "{done} из {target}",
    target_rule: "Цель: температура воды ÷ 2, в часах",
    speed: "Скорость",
    ideal: "Норма {range}",
    heating: "Нагрев",
    idle: "Ожидание",
    on: "Вкл.",
    off: "Выкл.",
    unavailable: "Недоступно",
    cover_open: "Открыто",
    cover_closed: "Закрыто",
    opening: "Открывается",
    closing: "Закрывается",
    open_cover: "Открыть покрытие",
    close_cover: "Закрыть покрытие",
    target: "Уставка",
    lower_target: "Понизить уставку",
    raise_target: "Повысить уставку",
    ph_high: "pH слишком высокий: добавьте pH-минус и проверьте снова через несколько часов.",
    ph_low: "pH слишком низкий: добавьте pH-плюс и проверьте снова через несколько часов.",
    orp_low: "ОВП слишком низкий: слабая дезинфекция, увеличьте хлор или производительность электролизёра.",
    orp_high: "ОВП слишком высокий: уменьшите хлор или производительность электролизёра.",
    chlorine_low: "Свободного хлора слишком мало: добавьте хлор или увеличьте производительность электролизёра.",
    chlorine_high: "Свободного хлора слишком много: остановите хлорирование и подождите перед купанием.",
    salt_low: "Мало соли для электролизёра: добавьте соль при работающем насосе.",
    salt_high: "Слишком много соли: замените часть воды свежей.",
    tds_low: "TDS очень низкий: проверьте датчик.",
    tds_high: "TDS слишком высокий: замените часть воды.",
    temp_low: "Вода холодная для купания.",
    temp_high: "Вода очень тёплая: риск водорослей, фильтруйте дольше и следите за хлором.",
    temp_high_spa: "Вода слишком горячая: выше 40 °C купаться опасно, снизьте заданную температуру нагревателя.",
    heat_no_flow: "Тепловой насос греет при остановленном насосе: ему нужен поток воды.",
    electrolyser_no_flow: "Электролизёр включён при остановленном насосе.",
    all_good: "Все показатели в пределах нормы.",
    confirm_pump_off: "Остановить насос, пока тепловой насос греет? Ему нужен поток воды.",
    stop: "Остановить",
    cancel: "Отмена",
    no_entities: "Датчик бассейна не найден. Выберите устройство или объекты в настройках карточки.",
    unknown_device: "Устройство не найдено",
    zoom_in: "Показать подробности",
    zoom_out: "Вернуться к компактному виду",
    zoom: "Кнопка подробностей",
    zoom_helper: "В правом верхнем углу мини-карточки: показывает полную карточку и обратно; щелчок вне карточки тоже возвращает.",
    device: "Устройство",
    device_helper: "Его датчики и оборудование находятся автоматически; укажите объекты ниже, чтобы изменить или дополнить их.",
    title: "Заголовок (необязательно)",
    kind: "Тип",
    kind_auto: "Автоматически",
    kind_pool: "Бассейн",
    kind_spa: "Спа",
    entities: "Объекты",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    show_controls: "Показывать кнопки управления",
    show_advice: "Показывать советы",
    show_filtration: "Показывать фильтрацию",
    show_equipment: "Показывать оборудование",
    filtration_hours: "Суточная цель фильтрации (ч, пусто: автоматически)",
    collapsed: "Разделы, свёрнутые по умолчанию",
    ranges: "Нормы",
    min: "мин.",
    max: "макс.",
    language: "Язык",
    lang_auto: "Автоматически (язык Home Assistant)",
  },
  uk: {
    pool: "Басейн",
    spa: "Спа",
    water: "Вода",
    air: "Повітря",
    water_temperature: "Температура води",
    air_temperature: "Температура повітря",
    ph: "pH",
    orp: "ОВП (редокс)",
    chlorine: "Вільний хлор",
    salt: "Сіль",
    tds: "TDS",
    pump: "Насос",
    pump_speed: "Швидкість насоса",
    filtration_time: "Час фільтрації сьогодні",
    filtration_target: "Мета фільтрації",
    heat_pump: "Тепловий насос",
    electrolyser: "Електролізер",
    light: "Підсвічування",
    cover: "Покриття",
    ph_short: "pH",
    orp_short: "ОВП",
    chlorine_short: "Cl",
    salt_short: "Сіль",
    tds_short: "TDS",
    water_quality: "Якість води",
    advice: "Поради",
    filtration: "Фільтрація",
    equipment: "Обладнання",
    status_ok: "Вода в нормі",
    status_warn: "Перевірте воду",
    status_crit: "Потрібні дії",
    status_idle: "Немає даних",
    filtering: "Фільтрація",
    stopped: "Насос зупинено",
    today: "Сьогодні",
    today_time: "{time} сьогодні",
    of_target: "{done} з {target}",
    target_rule: "Мета: температура води ÷ 2, у годинах",
    speed: "Швидкість",
    ideal: "Норма {range}",
    heating: "Нагрів",
    idle: "Очікування",
    on: "Увімк.",
    off: "Вимк.",
    unavailable: "Недоступно",
    cover_open: "Відкрито",
    cover_closed: "Закрито",
    opening: "Відкривається",
    closing: "Закривається",
    open_cover: "Відкрити покриття",
    close_cover: "Закрити покриття",
    target: "Уставка",
    lower_target: "Знизити уставку",
    raise_target: "Підвищити уставку",
    ph_high: "pH занадто високий: додайте pH-мінус і перевірте знову за кілька годин.",
    ph_low: "pH занадто низький: додайте pH-плюс і перевірте знову за кілька годин.",
    orp_low: "ОВП занадто низький: слабка дезінфекція, збільште хлор або продуктивність електролізера.",
    orp_high: "ОВП занадто високий: зменште хлор або продуктивність електролізера.",
    chlorine_low: "Вільного хлору замало: додайте хлор або збільште продуктивність електролізера.",
    chlorine_high: "Вільного хлору забагато: зупиніть хлорування й зачекайте перед купанням.",
    salt_low: "Замало солі для електролізера: додайте сіль при працюючому насосі.",
    salt_high: "Забагато солі: замініть частину води свіжою.",
    tds_low: "TDS дуже низький: перевірте датчик.",
    tds_high: "TDS занадто високий: замініть частину води.",
    temp_low: "Вода холодна для купання.",
    temp_high: "Вода дуже тепла: ризик водоростей, фільтруйте довше й стежте за хлором.",
    temp_high_spa: "Вода надто гаряча: понад 40 °C купатися небезпечно, знизьте задану температуру нагрівача.",
    heat_no_flow: "Тепловий насос гріє, коли насос зупинено: йому потрібен потік води.",
    electrolyser_no_flow: "Електролізер увімкнено, коли насос зупинено.",
    all_good: "Усі показники в межах норми.",
    confirm_pump_off: "Зупинити насос, поки тепловий насос гріє? Йому потрібен потік води.",
    stop: "Зупинити",
    cancel: "Скасувати",
    no_entities: "Датчик басейну не знайдено. Виберіть пристрій або об'єкти в налаштуваннях картки.",
    unknown_device: "Пристрій не знайдено",
    zoom_in: "Показати подробиці",
    zoom_out: "Повернутися до компактного вигляду",
    zoom: "Кнопка подробиць",
    zoom_helper: "У правому верхньому куті міні-картки: показує повну картку й назад; клацання поза карткою теж повертає.",
    device: "Пристрій",
    device_helper: "Його датчики й обладнання знаходяться автоматично; вкажіть об'єкти нижче, щоб змінити або доповнити їх.",
    title: "Заголовок (необов'язково)",
    kind: "Тип",
    kind_auto: "Автоматично",
    kind_pool: "Басейн",
    kind_spa: "Спа",
    entities: "Об'єкти",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    show_controls: "Показувати кнопки керування",
    show_advice: "Показувати поради",
    show_filtration: "Показувати фільтрацію",
    show_equipment: "Показувати обладнання",
    filtration_hours: "Добова мета фільтрації (год, порожньо: автоматично)",
    collapsed: "Розділи, згорнуті за замовчуванням",
    ranges: "Норми",
    min: "мін.",
    max: "макс.",
    language: "Мова",
    lang_auto: "Автоматично (мова Home Assistant)",
  },
  hu: {
    pool: "Medence",
    spa: "Pezsgőfürdő",
    water: "Víz",
    air: "Levegő",
    water_temperature: "Vízhőmérséklet",
    air_temperature: "Léghőmérséklet",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Szabad klór",
    salt: "Só",
    tds: "TDS",
    pump: "Szivattyú",
    pump_speed: "Szivattyú fordulatszáma",
    filtration_time: "Mai szűrési idő",
    filtration_target: "Szűrési cél",
    heat_pump: "Hőszivattyú",
    electrolyser: "Sóbontó",
    light: "Világítás",
    cover: "Takarás",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Só",
    tds_short: "TDS",
    water_quality: "Vízminőség",
    advice: "Tanácsok",
    filtration: "Szűrés",
    equipment: "Berendezések",
    status_ok: "Víz rendben",
    status_warn: "Ellenőrizze a vizet",
    status_crit: "Beavatkozás szükséges",
    status_idle: "Nincs adat",
    filtering: "Szűr",
    stopped: "Szivattyú leállítva",
    today: "Ma",
    today_time: "ma {time}",
    of_target: "{done} / {target}",
    target_rule: "Cél: vízhőmérséklet ÷ 2, órában",
    speed: "Fordulatszám",
    ideal: "Ideális: {range}",
    heating: "Fűt",
    idle: "Készenlét",
    on: "Be",
    off: "Ki",
    unavailable: "Nem elérhető",
    cover_open: "Nyitva",
    cover_closed: "Zárva",
    opening: "Nyílik",
    closing: "Záródik",
    open_cover: "Takarás nyitása",
    close_cover: "Takarás zárása",
    target: "Beállított érték",
    lower_target: "Beállított érték csökkentése",
    raise_target: "Beállított érték növelése",
    ph_high: "Túl magas pH: adjon hozzá pH-mínuszt, és néhány óra múlva mérjen újra.",
    ph_low: "Túl alacsony pH: adjon hozzá pH-pluszt, és néhány óra múlva mérjen újra.",
    orp_low: "Túl alacsony ORP: gyenge fertőtlenítés, növelje a klórt vagy a sóbontó teljesítményét.",
    orp_high: "Túl magas ORP: csökkentse a klórt vagy a sóbontó teljesítményét.",
    chlorine_low: "Túl kevés szabad klór: adjon hozzá klórt, vagy növelje a sóbontó teljesítményét.",
    chlorine_high: "Túl sok szabad klór: állítsa le a klórozást, és várjon a fürdéssel.",
    salt_low: "Túl kevés só a sóbontóhoz: adjon hozzá sót működő szivattyú mellett.",
    salt_high: "Túl sok só: cserélje a víz egy részét friss vízre.",
    tds_low: "Nagyon alacsony TDS: ellenőrizze az érzékelőt.",
    tds_high: "Túl magas TDS: cserélje a víz egy részét.",
    temp_low: "A víz hideg a fürdéshez.",
    temp_high: "A víz nagyon meleg: algaveszély, szűrjön tovább, és figyelje a klórt.",
    temp_high_spa: "Túl meleg a víz: 40 °C felett veszélyes a fürdés, csökkentse a fűtés célhőmérsékletét.",
    heat_no_flow: "A hőszivattyú fűt, miközben a szivattyú áll: szüksége van a vízáramlásra.",
    electrolyser_no_flow: "A sóbontó be van kapcsolva, miközben a szivattyú áll.",
    all_good: "Minden mért érték az ideális tartományban van.",
    confirm_pump_off: "Leállítja a szivattyút, miközben a hőszivattyú fűt? Szüksége van a vízáramlásra.",
    stop: "Leállítás",
    cancel: "Mégse",
    no_entities: "Nem található medenceérzékelő. Válasszon eszközt vagy entitásokat a kártya beállításaiban.",
    unknown_device: "Az eszköz nem található",
    zoom_in: "Részletek megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    zoom: "Részletek gomb",
    zoom_helper: "A mini kártya jobb felső sarkában: megmutatja a teljes kártyát, majd vissza; a kártyán kívüli kattintás is visszavált.",
    device: "Eszköz",
    device_helper: "Az érzékelői és berendezései automatikusan megtalálhatók; lent állítsa be az entitásokat a módosításukhoz vagy kiegészítésükhöz.",
    title: "Cím (nem kötelező)",
    kind: "Típus",
    kind_auto: "Automatikus",
    kind_pool: "Medence",
    kind_spa: "Pezsgőfürdő",
    entities: "Entitások",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    show_controls: "Vezérlőgombok megjelenítése",
    show_advice: "Tanácsok megjelenítése",
    show_filtration: "Szűrés megjelenítése",
    show_equipment: "Berendezések megjelenítése",
    filtration_hours: "Napi szűrési cél (óra, üres: automatikus)",
    collapsed: "Alapértelmezetten összecsukott szakaszok",
    ranges: "Ideális tartományok",
    min: "min.",
    max: "max.",
    language: "Nyelv",
    lang_auto: "Automatikus (a Home Assistant nyelve)",
  },
  sk: {
    pool: "Bazén",
    spa: "Vírivka",
    water: "Voda",
    air: "Vzduch",
    water_temperature: "Teplota vody",
    air_temperature: "Teplota vzduchu",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Voľný chlór",
    salt: "Soľ",
    tds: "TDS",
    pump: "Čerpadlo",
    pump_speed: "Rýchlosť čerpadla",
    filtration_time: "Čas filtrácie dnes",
    filtration_target: "Cieľ filtrácie",
    heat_pump: "Tepelné čerpadlo",
    electrolyser: "Elektrolyzér",
    light: "Osvetlenie",
    cover: "Zakrytie",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Soľ",
    tds_short: "TDS",
    water_quality: "Kvalita vody",
    advice: "Rady",
    filtration: "Filtrácia",
    equipment: "Vybavenie",
    status_ok: "Voda v poriadku",
    status_warn: "Skontrolujte vodu",
    status_crit: "Potrebný zásah",
    status_idle: "Žiadne údaje",
    filtering: "Filtruje",
    stopped: "Čerpadlo zastavené",
    today: "Dnes",
    today_time: "{time} dnes",
    of_target: "{done} z {target}",
    target_rule: "Cieľ: teplota vody ÷ 2, v hodinách",
    speed: "Rýchlosť",
    ideal: "Ideálne {range}",
    heating: "Ohrieva",
    idle: "Nečinné",
    on: "Zapnuté",
    off: "Vypnuté",
    unavailable: "Nedostupné",
    cover_open: "Otvorené",
    cover_closed: "Zatvorené",
    opening: "Otvára sa",
    closing: "Zatvára sa",
    open_cover: "Otvoriť zakrytie",
    close_cover: "Zatvoriť zakrytie",
    target: "Nastavená hodnota",
    lower_target: "Znížiť nastavenú hodnotu",
    raise_target: "Zvýšiť nastavenú hodnotu",
    ph_high: "Príliš vysoké pH: pridajte pH mínus a o niekoľko hodín zmerajte znova.",
    ph_low: "Príliš nízke pH: pridajte pH plus a o niekoľko hodín zmerajte znova.",
    orp_low: "Príliš nízke ORP: slabá dezinfekcia, zvýšte chlór alebo výkon elektrolyzéra.",
    orp_high: "Príliš vysoké ORP: znížte chlór alebo výkon elektrolyzéra.",
    chlorine_low: "Príliš málo voľného chlóru: pridajte chlór alebo zvýšte výkon elektrolyzéra.",
    chlorine_high: "Príliš veľa voľného chlóru: zastavte chlórovanie a pred kúpaním počkajte.",
    salt_low: "Príliš málo soli pre elektrolyzér: pridajte soľ pri bežiacom čerpadle.",
    salt_high: "Príliš veľa soli: vymeňte časť vody za čerstvú.",
    tds_low: "Veľmi nízke TDS: skontrolujte snímač.",
    tds_high: "Príliš vysoké TDS: vymeňte časť vody.",
    temp_low: "Voda je na kúpanie studená.",
    temp_high: "Voda je veľmi teplá: riziko rias, filtrujte dlhšie a sledujte chlór.",
    temp_high_spa: "Voda je príliš teplá: nad 40 °C je kúpanie nebezpečné, znížte nastavenú teplotu ohrievača.",
    heat_no_flow: "Tepelné čerpadlo ohrieva, kým čerpadlo stojí: potrebuje prietok vody.",
    electrolyser_no_flow: "Elektrolyzér je zapnutý, kým čerpadlo stojí.",
    all_good: "Všetky merania sú v ideálnom rozsahu.",
    confirm_pump_off: "Zastaviť čerpadlo, kým tepelné čerpadlo ohrieva? Potrebuje prietok vody.",
    stop: "Zastaviť",
    cancel: "Zrušiť",
    no_entities: "Nenašiel sa žiadny snímač bazéna. Vyberte zariadenie alebo entity v možnostiach karty.",
    unknown_device: "Zariadenie sa nenašlo",
    zoom_in: "Zobraziť podrobnosti",
    zoom_out: "Späť na kompaktné zobrazenie",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Vpravo hore na mini karte: zobrazí celú kartu a späť; kliknutie mimo karty sa tiež vráti.",
    device: "Zariadenie",
    device_helper: "Jeho snímače a vybavenie sa nájdu automaticky; nižšie nastavte entity, ak ich chcete zmeniť alebo doplniť.",
    title: "Názov (voliteľný)",
    kind: "Typ",
    kind_auto: "Automaticky",
    kind_pool: "Bazén",
    kind_spa: "Vírivka",
    entities: "Entity",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    show_controls: "Zobraziť ovládacie tlačidlá",
    show_advice: "Zobraziť rady",
    show_filtration: "Zobraziť filtráciu",
    show_equipment: "Zobraziť vybavenie",
    filtration_hours: "Denný cieľ filtrácie (h, prázdne: automaticky)",
    collapsed: "Predvolene zbalené sekcie",
    ranges: "Ideálne rozsahy",
    min: "min",
    max: "max",
    language: "Jazyk",
    lang_auto: "Automaticky (jazyk Home Assistant)",
  },
  cs: {
    pool: "Bazén",
    spa: "Vířivka",
    water: "Voda",
    air: "Vzduch",
    water_temperature: "Teplota vody",
    air_temperature: "Teplota vzduchu",
    ph: "pH",
    orp: "ORP (redox)",
    chlorine: "Volný chlor",
    salt: "Sůl",
    tds: "TDS",
    pump: "Čerpadlo",
    pump_speed: "Rychlost čerpadla",
    filtration_time: "Doba filtrace dnes",
    filtration_target: "Cíl filtrace",
    heat_pump: "Tepelné čerpadlo",
    electrolyser: "Elektrolyzér",
    light: "Osvětlení",
    cover: "Zakrytí",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sůl",
    tds_short: "TDS",
    water_quality: "Kvalita vody",
    advice: "Rady",
    filtration: "Filtrace",
    equipment: "Vybavení",
    status_ok: "Voda v pořádku",
    status_warn: "Zkontrolujte vodu",
    status_crit: "Nutný zásah",
    status_idle: "Žádná data",
    filtering: "Filtruje",
    stopped: "Čerpadlo zastaveno",
    today: "Dnes",
    today_time: "{time} dnes",
    of_target: "{done} z {target}",
    target_rule: "Cíl: teplota vody ÷ 2, v hodinách",
    speed: "Rychlost",
    ideal: "Ideálně {range}",
    heating: "Ohřívá",
    idle: "Nečinné",
    on: "Zapnuto",
    off: "Vypnuto",
    unavailable: "Nedostupné",
    cover_open: "Otevřeno",
    cover_closed: "Zavřeno",
    opening: "Otevírá se",
    closing: "Zavírá se",
    open_cover: "Otevřít zakrytí",
    close_cover: "Zavřít zakrytí",
    target: "Nastavená hodnota",
    lower_target: "Snížit nastavenou hodnotu",
    raise_target: "Zvýšit nastavenou hodnotu",
    ph_high: "Příliš vysoké pH: přidejte pH mínus a za několik hodin změřte znovu.",
    ph_low: "Příliš nízké pH: přidejte pH plus a za několik hodin změřte znovu.",
    orp_low: "Příliš nízké ORP: slabá dezinfekce, zvyšte chlor nebo výkon elektrolyzéru.",
    orp_high: "Příliš vysoké ORP: snižte chlor nebo výkon elektrolyzéru.",
    chlorine_low: "Příliš málo volného chloru: přidejte chlor nebo zvyšte výkon elektrolyzéru.",
    chlorine_high: "Příliš mnoho volného chloru: zastavte chlorování a před koupáním počkejte.",
    salt_low: "Příliš málo soli pro elektrolyzér: přidejte sůl při běžícím čerpadle.",
    salt_high: "Příliš mnoho soli: vyměňte část vody za čerstvou.",
    tds_low: "Velmi nízké TDS: zkontrolujte čidlo.",
    tds_high: "Příliš vysoké TDS: vyměňte část vody.",
    temp_low: "Voda je na koupání studená.",
    temp_high: "Voda je velmi teplá: riziko řas, filtrujte déle a hlídejte chlor.",
    temp_high_spa: "Voda je příliš teplá: nad 40 °C je koupání nebezpečné, snižte nastavenou teplotu ohřívače.",
    heat_no_flow: "Tepelné čerpadlo ohřívá, zatímco čerpadlo stojí: potřebuje průtok vody.",
    electrolyser_no_flow: "Elektrolyzér je zapnutý, zatímco čerpadlo stojí.",
    all_good: "Všechna měření jsou v ideálním rozsahu.",
    confirm_pump_off: "Zastavit čerpadlo, zatímco tepelné čerpadlo ohřívá? Potřebuje průtok vody.",
    stop: "Zastavit",
    cancel: "Zrušit",
    no_entities: "Nebylo nalezeno žádné čidlo bazénu. Vyberte zařízení nebo entity v možnostech karty.",
    unknown_device: "Zařízení nenalezeno",
    zoom_in: "Zobrazit podrobnosti",
    zoom_out: "Zpět na kompaktní zobrazení",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Vpravo nahoře na mini kartě: zobrazí celou kartu a zpět; kliknutí mimo kartu se také vrátí.",
    device: "Zařízení",
    device_helper: "Jeho čidla a vybavení se najdou automaticky; níže nastavte entity, chcete-li je změnit nebo doplnit.",
    title: "Název (volitelný)",
    kind: "Typ",
    kind_auto: "Automaticky",
    kind_pool: "Bazén",
    kind_spa: "Vířivka",
    entities: "Entity",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podtitul",
    show_controls: "Zobrazit ovládací tlačítka",
    show_advice: "Zobrazit rady",
    show_filtration: "Zobrazit filtraci",
    show_equipment: "Zobrazit vybavení",
    filtration_hours: "Denní cíl filtrace (h, prázdné: automaticky)",
    collapsed: "Výchozí sbalené sekce",
    ranges: "Ideální rozsahy",
    min: "min",
    max: "max",
    language: "Jazyk",
    lang_auto: "Automaticky (jazyk Home Assistant)",
  },
  sl: {
    pool: "Bazen",
    spa: "Masažni bazen",
    water: "Voda",
    air: "Zrak",
    water_temperature: "Temperatura vode",
    air_temperature: "Temperatura zraka",
    ph: "pH",
    orp: "ORP (redoks)",
    chlorine: "Prosti klor",
    salt: "Sol",
    tds: "TDS",
    pump: "Črpalka",
    pump_speed: "Hitrost črpalke",
    filtration_time: "Čas filtracije danes",
    filtration_target: "Cilj filtracije",
    heat_pump: "Toplotna črpalka",
    electrolyser: "Elektrolizer",
    light: "Osvetlitev",
    cover: "Pokrivalo",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sol",
    tds_short: "TDS",
    water_quality: "Kakovost vode",
    advice: "Nasveti",
    filtration: "Filtracija",
    equipment: "Oprema",
    status_ok: "Voda v redu",
    status_warn: "Preverite vodo",
    status_crit: "Potreben ukrep",
    status_idle: "Ni podatkov",
    filtering: "Filtrira",
    stopped: "Črpalka ustavljena",
    today: "Danes",
    today_time: "{time} danes",
    of_target: "{done} od {target}",
    target_rule: "Cilj: temperatura vode ÷ 2, v urah",
    speed: "Hitrost",
    ideal: "Idealno {range}",
    heating: "Greje",
    idle: "Mirovanje",
    on: "Vklopljeno",
    off: "Izklopljeno",
    unavailable: "Ni na voljo",
    cover_open: "Odprto",
    cover_closed: "Zaprto",
    opening: "Se odpira",
    closing: "Se zapira",
    open_cover: "Odpri pokrivalo",
    close_cover: "Zapri pokrivalo",
    target: "Nastavljena vrednost",
    lower_target: "Znižaj nastavljeno vrednost",
    raise_target: "Zvišaj nastavljeno vrednost",
    ph_high: "pH previsok: dodajte pH minus in čez nekaj ur ponovno izmerite.",
    ph_low: "pH prenizek: dodajte pH plus in čez nekaj ur ponovno izmerite.",
    orp_low: "ORP prenizek: šibka dezinfekcija, povečajte klor ali proizvodnjo elektrolizerja.",
    orp_high: "ORP previsok: zmanjšajte klor ali proizvodnjo elektrolizerja.",
    chlorine_low: "Premalo prostega klora: dodajte klor ali povečajte proizvodnjo elektrolizerja.",
    chlorine_high: "Preveč prostega klora: ustavite kloriranje in počakajte pred kopanjem.",
    salt_low: "Premalo soli za elektrolizer: dodajte sol, ko črpalka deluje.",
    salt_high: "Preveč soli: del vode zamenjajte s svežo.",
    tds_low: "TDS zelo nizek: preverite tipalo.",
    tds_high: "TDS previsok: zamenjajte del vode.",
    temp_low: "Voda je hladna za kopanje.",
    temp_high: "Voda je zelo topla: nevarnost alg, filtrirajte dlje in spremljajte klor.",
    temp_high_spa: "Voda je prevroča: nad 40 °C kopanje ni varno, znižajte nastavljeno temperaturo grelnika.",
    heat_no_flow: "Toplotna črpalka greje, medtem ko črpalka stoji: potrebuje pretok vode.",
    electrolyser_no_flow: "Elektrolizer je vklopljen, medtem ko črpalka stoji.",
    all_good: "Vse meritve so v idealnem območju.",
    confirm_pump_off: "Ustaviti črpalko, medtem ko toplotna črpalka greje? Potrebuje pretok vode.",
    stop: "Ustavi",
    cancel: "Prekliči",
    no_entities: "Tipalo bazena ni najdeno. V možnostih kartice izberite napravo ali entitete.",
    unknown_device: "Naprava ni najdena",
    zoom_in: "Prikaži podrobnosti",
    zoom_out: "Nazaj na strnjen prikaz",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Zgoraj desno na mini kartici: prikaže celotno kartico in nazaj; klik zunaj kartice prav tako vrne.",
    device: "Naprava",
    device_helper: "Njena tipala in oprema se najdejo samodejno; spodaj nastavite entitete, da jih spremenite ali dopolnite.",
    title: "Naslov (neobvezno)",
    kind: "Vrsta",
    kind_auto: "Samodejno",
    kind_pool: "Bazen",
    kind_spa: "Masažni bazen",
    entities: "Entitete",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_controls: "Prikaži gumbe za upravljanje",
    show_advice: "Prikaži nasvete",
    show_filtration: "Prikaži filtracijo",
    show_equipment: "Prikaži opremo",
    filtration_hours: "Dnevni cilj filtracije (h, prazno: samodejno)",
    collapsed: "Privzeto strnjeni razdelki",
    ranges: "Idealna območja",
    min: "min",
    max: "maks",
    language: "Jezik",
    lang_auto: "Samodejno (jezik Home Assistanta)",
  },
  lv: {
    pool: "Baseins",
    spa: "Spa",
    water: "Ūdens",
    air: "Gaiss",
    water_temperature: "Ūdens temperatūra",
    air_temperature: "Gaisa temperatūra",
    ph: "pH",
    orp: "ORP (redokss)",
    chlorine: "Brīvais hlors",
    salt: "Sāls",
    tds: "TDS",
    pump: "Sūknis",
    pump_speed: "Sūkņa ātrums",
    filtration_time: "Filtrācijas laiks šodien",
    filtration_target: "Filtrācijas mērķis",
    heat_pump: "Siltumsūknis",
    electrolyser: "Elektrolizators",
    light: "Apgaismojums",
    cover: "Pārsegs",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Sāls",
    tds_short: "TDS",
    water_quality: "Ūdens kvalitāte",
    advice: "Padomi",
    filtration: "Filtrācija",
    equipment: "Aprīkojums",
    status_ok: "Ūdens kārtībā",
    status_warn: "Pārbaudiet ūdeni",
    status_crit: "Nepieciešama rīcība",
    status_idle: "Nav datu",
    filtering: "Filtrē",
    stopped: "Sūknis apturēts",
    today: "Šodien",
    today_time: "{time} šodien",
    of_target: "{done} no {target}",
    target_rule: "Mērķis: ūdens temperatūra ÷ 2, stundās",
    speed: "Ātrums",
    ideal: "Ideāli {range}",
    heating: "Silda",
    idle: "Gaidstāve",
    on: "Ieslēgts",
    off: "Izslēgts",
    unavailable: "Nav pieejams",
    cover_open: "Atvērts",
    cover_closed: "Aizvērts",
    opening: "Atveras",
    closing: "Aizveras",
    open_cover: "Atvērt pārsegu",
    close_cover: "Aizvērt pārsegu",
    target: "Iestatītā vērtība",
    lower_target: "Samazināt iestatīto vērtību",
    raise_target: "Palielināt iestatīto vērtību",
    ph_high: "Pārāk augsts pH: pievienojiet pH mīnus un pēc dažām stundām mēriet vēlreiz.",
    ph_low: "Pārāk zems pH: pievienojiet pH plus un pēc dažām stundām mēriet vēlreiz.",
    orp_low: "Pārāk zems ORP: vāja dezinfekcija, palieliniet hloru vai elektrolizatora jaudu.",
    orp_high: "Pārāk augsts ORP: samaziniet hloru vai elektrolizatora jaudu.",
    chlorine_low: "Pārāk maz brīvā hlora: pievienojiet hloru vai palieliniet elektrolizatora jaudu.",
    chlorine_high: "Pārāk daudz brīvā hlora: apturiet hlorēšanu un pagaidiet pirms peldes.",
    salt_low: "Par maz sāls elektrolizatoram: pievienojiet sāli, kamēr sūknis darbojas.",
    salt_high: "Pārāk daudz sāls: nomainiet daļu ūdens ar svaigu.",
    tds_low: "Ļoti zems TDS: pārbaudiet sensoru.",
    tds_high: "Pārāk augsts TDS: nomainiet daļu ūdens.",
    temp_low: "Ūdens ir auksts peldei.",
    temp_high: "Ūdens ir ļoti silts: aļģu risks, filtrējiet ilgāk un sekojiet hloram.",
    temp_high_spa: "Ūdens ir pārāk karsts: virs 40 °C peldēties ir bīstami, samaziniet sildītāja iestatīto temperatūru.",
    heat_no_flow: "Siltumsūknis silda, kamēr sūknis stāv: tam vajadzīga ūdens plūsma.",
    electrolyser_no_flow: "Elektrolizators ir ieslēgts, kamēr sūknis stāv.",
    all_good: "Visi mērījumi ir ideālajā diapazonā.",
    confirm_pump_off: "Apturēt sūkni, kamēr siltumsūknis silda? Tam vajadzīga ūdens plūsma.",
    stop: "Apturēt",
    cancel: "Atcelt",
    no_entities: "Baseina sensors nav atrasts. Kartes opcijās izvēlieties ierīci vai entītijas.",
    unknown_device: "Ierīce nav atrasta",
    zoom_in: "Rādīt detaļas",
    zoom_out: "Atpakaļ uz kompakto skatu",
    zoom: "Detaļu poga",
    zoom_helper: "Mini kartes augšējā labajā stūrī: parāda pilno karti un atpakaļ; klikšķis ārpus kartes arī atgriež.",
    device: "Ierīce",
    device_helper: "Tās sensori un aprīkojums tiek atrasti automātiski; zemāk iestatiet entītijas, lai tās mainītu vai papildinātu.",
    title: "Virsraksts (neobligāts)",
    kind: "Veids",
    kind_auto: "Automātiski",
    kind_pool: "Baseins",
    kind_spa: "Spa",
    entities: "Entītijas",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    show_controls: "Rādīt vadības pogas",
    show_advice: "Rādīt padomus",
    show_filtration: "Rādīt filtrāciju",
    show_equipment: "Rādīt aprīkojumu",
    filtration_hours: "Dienas filtrācijas mērķis (h, tukšs: automātiski)",
    collapsed: "Pēc noklusējuma sakļautās sadaļas",
    ranges: "Ideālie diapazoni",
    min: "min.",
    max: "maks.",
    language: "Valoda",
    lang_auto: "Automātiski (Home Assistant valoda)",
  },
  el: {
    pool: "Πισίνα",
    spa: "Σπα",
    water: "Νερό",
    air: "Αέρας",
    water_temperature: "Θερμοκρασία νερού",
    air_temperature: "Θερμοκρασία αέρα",
    ph: "pH",
    orp: "ORP (οξειδοαναγωγή)",
    chlorine: "Ελεύθερο χλώριο",
    salt: "Αλάτι",
    tds: "TDS",
    pump: "Αντλία",
    pump_speed: "Ταχύτητα αντλίας",
    filtration_time: "Χρόνος φιλτραρίσματος σήμερα",
    filtration_target: "Στόχος φιλτραρίσματος",
    heat_pump: "Αντλία θερμότητας",
    electrolyser: "Ηλεκτρόλυση",
    light: "Φωτισμός",
    cover: "Κάλυμμα",
    ph_short: "pH",
    orp_short: "ORP",
    chlorine_short: "Cl",
    salt_short: "Αλάτι",
    tds_short: "TDS",
    water_quality: "Ποιότητα νερού",
    advice: "Συμβουλές",
    filtration: "Φιλτράρισμα",
    equipment: "Εξοπλισμός",
    status_ok: "Νερό εντάξει",
    status_warn: "Ελέγξτε το νερό",
    status_crit: "Απαιτείται ενέργεια",
    status_idle: "Χωρίς δεδομένα",
    filtering: "Φιλτράρει",
    stopped: "Αντλία σταματημένη",
    today: "Σήμερα",
    today_time: "{time} σήμερα",
    of_target: "{done} από {target}",
    target_rule: "Στόχος: θερμοκρασία νερού ÷ 2, σε ώρες",
    speed: "Ταχύτητα",
    ideal: "Ιδανικό {range}",
    heating: "Θερμαίνει",
    idle: "Αναμονή",
    on: "Ενεργό",
    off: "Ανενεργό",
    unavailable: "Μη διαθέσιμο",
    cover_open: "Ανοιχτό",
    cover_closed: "Κλειστό",
    opening: "Ανοίγει",
    closing: "Κλείνει",
    open_cover: "Άνοιγμα καλύμματος",
    close_cover: "Κλείσιμο καλύμματος",
    target: "Επιθυμητή τιμή",
    lower_target: "Μείωση επιθυμητής τιμής",
    raise_target: "Αύξηση επιθυμητής τιμής",
    ph_high: "Πολύ υψηλό pH: προσθέστε pH μείον και μετρήστε ξανά σε λίγες ώρες.",
    ph_low: "Πολύ χαμηλό pH: προσθέστε pH συν και μετρήστε ξανά σε λίγες ώρες.",
    orp_low: "Πολύ χαμηλό ORP: ασθενής απολύμανση, αυξήστε το χλώριο ή την απόδοση της ηλεκτρόλυσης.",
    orp_high: "Πολύ υψηλό ORP: μειώστε το χλώριο ή την απόδοση της ηλεκτρόλυσης.",
    chlorine_low: "Πολύ λίγο ελεύθερο χλώριο: προσθέστε χλώριο ή αυξήστε την απόδοση της ηλεκτρόλυσης.",
    chlorine_high: "Πολύ ελεύθερο χλώριο: σταματήστε τη χλωρίωση και περιμένετε πριν από το μπάνιο.",
    salt_low: "Λίγο αλάτι για την ηλεκτρόλυση: προσθέστε αλάτι με την αντλία σε λειτουργία.",
    salt_high: "Πολύ αλάτι: αντικαταστήστε μέρος του νερού με φρέσκο.",
    tds_low: "Πολύ χαμηλό TDS: ελέγξτε τον αισθητήρα.",
    tds_high: "Πολύ υψηλό TDS: ανανεώστε μέρος του νερού.",
    temp_low: "Το νερό είναι κρύο για μπάνιο.",
    temp_high: "Πολύ ζεστό νερό: κίνδυνος για άλγη, φιλτράρετε περισσότερο και προσέχετε το χλώριο.",
    temp_high_spa: "Υπερβολικά ζεστό νερό: πάνω από 40 °C το μπάνιο δεν είναι ασφαλές, χαμηλώστε τη ρύθμιση του θερμαντήρα.",
    heat_no_flow: "Η αντλία θερμότητας θερμαίνει ενώ η αντλία είναι σταματημένη: χρειάζεται ροή νερού.",
    electrolyser_no_flow: "Η ηλεκτρόλυση είναι ενεργή ενώ η αντλία είναι σταματημένη.",
    all_good: "Όλες οι μετρήσεις είναι στο ιδανικό εύρος τους.",
    confirm_pump_off: "Να σταματήσει η αντλία ενώ η αντλία θερμότητας θερμαίνει; Χρειάζεται ροή νερού.",
    stop: "Διακοπή",
    cancel: "Ακύρωση",
    no_entities: "Δεν βρέθηκε αισθητήρας πισίνας. Επιλέξτε μια συσκευή ή τις οντότητες στις επιλογές της κάρτας.",
    unknown_device: "Η συσκευή δεν βρέθηκε",
    zoom_in: "Εμφάνιση λεπτομερειών",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Πάνω δεξιά στη μίνι κάρτα: δείχνει την πλήρη κάρτα και επιστρέφει· ένα κλικ έξω από την κάρτα επιστρέφει επίσης.",
    device: "Συσκευή",
    device_helper: "Οι αισθητήρες και ο εξοπλισμός της βρίσκονται αυτόματα· ορίστε τις οντότητες παρακάτω για να τις αλλάξετε ή να τις συμπληρώσετε.",
    title: "Τίτλος (προαιρετικό)",
    kind: "Τύπος",
    kind_auto: "Αυτόματα",
    kind_pool: "Πισίνα",
    kind_spa: "Σπα",
    entities: "Οντότητες",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    show_controls: "Εμφάνιση κουμπιών ελέγχου",
    show_advice: "Εμφάνιση συμβουλών",
    show_filtration: "Εμφάνιση φιλτραρίσματος",
    show_equipment: "Εμφάνιση εξοπλισμού",
    filtration_hours: "Ημερήσιος στόχος φιλτραρίσματος (ώ, κενό: αυτόματα)",
    collapsed: "Ενότητες συμπτυγμένες από προεπιλογή",
    ranges: "Ιδανικά εύρη",
    min: "ελάχ.",
    max: "μέγ.",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα (γλώσσα του Home Assistant)",
  },
};

const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, keeping HA's region when its base matches (pt-BR, de-CH); a bare "pt"
// (European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);
const num = (s) => {
  if (!valid(s)) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const svgIcon = (path, cls = "") => `<svg class="icon${cls ? ` ${cls}` : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
const domainOf = (id) => String(id || "").split(".")[0];
const fmtNum = (v, digits, locale) =>
  v === null || v === undefined ? "—" : Number(v).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
const c2f = (c) => Math.round((c * 9) / 5 + 32);
// Hours as "5 h 15 min" (Intl units in the card's language).
const UNIT_FMT = {};
const fmtUnit = (v, unit, locale) => (UNIT_FMT[`${locale}|${unit}`] ??= new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short" })).format(v);
const fmtHours = (h, locale) => {
  if (h === null || h === undefined || !Number.isFinite(h)) return "—";
  const total = Math.max(0, Math.round(h * 60));
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  if (!hh) return fmtUnit(mm, "minute", locale);
  return mm ? `${fmtUnit(hh, "hour", locale)} ${fmtUnit(mm, "minute", locale)}` : fmtUnit(hh, "hour", locale);
};
// A duration sensor (iopool "Elapsed filtration duration", a history_stats sensor…) in hours.
const toHours = (s) => {
  const v = num(s);
  if (v === null) return null;
  const unit = String(s.attributes?.unit_of_measurement || "h").toLowerCase();
  if (unit === "min") return v / 60;
  if (unit === "s") return v / 3600;
  if (unit === "d") return v * 24;
  return v;
};

// ---------------------------------------------------------------------------
// Entity roles and discovery
// ---------------------------------------------------------------------------

// What the card can show, one entity each. Sensors first: they are the gauges, in this order.
const METRIC_ROLES = ["water_temperature", "ph", "orp", "chlorine", "salt", "tds"];
const SENSOR_ROLES = [...METRIC_ROLES, "air_temperature"];
const EQUIPMENT_ROLES = ["pump", "pump_speed", "filtration_time", "filtration_target", "heat_pump", "electrolyser", "light", "cover"];
const ROLES = [...SENSOR_ROLES, ...EQUIPMENT_ROLES];
const DEFAULT_COLLAPSED = ["equipment"];
const SECTIONS = ["advice", "filtration", "equipment"];

// Role of an entity from its domain, device class, unit and names (entity id, translation key, names): the
// integrations name them in English (iopool, ScreenLogic, IntelliCenter, OmniLogic, iAquaLink…), ESPHome and template
// entities in the user's language, hence a few French, German and Spanish words. Ids use "_" between words, so word
// boundaries are written (^|[^a-z]) … ([^a-z]|$) rather than \b.
const W = (words) => new RegExp(`(^|[^a-z])(${words})([^a-z]|$)`);
const LIGHT_RE = /light|lumi|eclairage|lamp|licht|beleuchtung|luz/;
const LIGHT_WORD_RE = W("led|spot");
const ELECTRO_RE = /electroly|chlorinat|salt.?cell|elektroly/;
// Things that are not the filtration pump: heat pump, dosing pumps, cleaner, booster, modes.
const NOT_PUMP_RE = /heat.?pump|pompe.?a.?chaleur|warmepumpe|bomba.?de.?calor|dos(e|ing|age|euse|ier)|peristalt|chlor|acid|booster|cleaner|robot|boost|mode|winter|hivern|super/;
const NOT_PUMP_WORD_RE = W("ph|pac|swg");
// A measure the card must not read as the water quality itself: set points, dosing, tanks, alarms…
const NOT_MEASURE_RE = /setpoint|set.?point|set.?pt|consigne|target|sollwert|desired|cible|suppl|dose|dosing|tank|reservoir|bidon|volume|state|status|alarm|lockout|limit|probe.?fault|_set([^a-z]|$)|_sp([^a-z]|$)/;
// Temperatures that are not the water's: the controller's own, solar panels…
const NOT_WATER_TEMP_RE = /internal|cpu|chip|esp32|esp8266|board|cabinet|enclosure|boitier|solar|roof|panel|exchanger/;
const AIR_RE = /(^|[^a-z])air([^a-z]|$)|outdoor|outside|exterieur|ambient|aussen|luft/;
const unitIs = (unit, list) => list.includes(unit.toLowerCase().replace(/\s/g, ""));

const roleOf = (id, hass) => {
  const domain = domainOf(id);
  const e = hass.entities?.[id] || {};
  const a = hass.states?.[id]?.attributes || {};
  const text = norm([id, e.translation_key, e.original_name, e.name, a.friendly_name].filter(Boolean).join(" "));
  const has = (re) => re.test(text);
  switch (domain) {
    case "climate":
      return "heat_pump";
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
      if (domain === "select" && has(/speed|vitesse|rpm|geschwindigkeit|velocidad/)) return "pump_speed";
      if (has(NOT_PUMP_RE) || has(NOT_PUMP_WORD_RE)) return null;
      if (has(/pump|pompe|filtrat|pumpe|bomba|depuradora/)) return "pump";
      return null;
    case "sensor": {
      const dc = a.device_class || e.device_class || e.original_device_class;
      const unit = String(a.unit_of_measurement || "");
      if (["battery", "signal_strength", "timestamp", "voltage", "power", "energy", "current", "enum"].includes(dc)) return null;
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
const DIAGNOSTIC_ROLES = new Set(["water_temperature", "ph", "orp", "chlorine", "salt", "tds"]);
// When a device has several candidates for a role, the one that can be commanded (pump, light), or named after the
// water (temperature), wins; then a non-diagnostic one; then the entity id order (stable across reloads).
const PUMP_RANK = { switch: 4, select: 3, fan: 3, input_boolean: 2, binary_sensor: 0 };
const WATER_RE = /water|pool|piscine|bassin|eau|wasser|agua|acqua|spa|basin/;
const rankOf = (role, id, hass, diagnostic) => {
  let r = diagnostic ? -1 : 0;
  if (role === "pump") r += PUMP_RANK[domainOf(id)] ?? 0;
  if (role === "light") r += domainOf(id) === "light" ? 2 : 0;
  if (role === "water_temperature" && WATER_RE.test(norm([id, hass.entities?.[id]?.original_name, hass.states?.[id]?.attributes?.friendly_name].join(" ")))) r += 2;
  return r;
};

// Devices by id with their entities, built once per registry object.
const _byDevice = new WeakMap();
const devicesOf = (hass) => {
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

const deviceName = (d) => d?.name_by_user || d?.name || "";

// Roles found on a device: the best entity of each role (see rankOf), cached per registry and states objects.
const _roles = new WeakMap();
const rolesOf = (hass, deviceId) => {
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
const _auto = new WeakMap();
const autoDevice = (hass) => {
  if (!hass.entities || !hass.devices) return null;
  const cached = _auto.get(hass.entities);
  if (cached !== undefined && cached.devices === hass.devices) return cached.id;
  let best = null;
  let score = 1;
  for (const id of Object.keys(hass.devices)) {
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

const findDeviceId = (hass, device) => {
  if (!device || !hass.devices) return null;
  if (hass.devices[device]) return device;
  const d = Object.values(hass.devices).find((x) => deviceName(x) === device || x.name === device);
  return d ? d.id : undefined;
};

// The entities of the card: those of the device (set, or found), each role replaced by the one set in the options.
const setupOf = (hass, config) => {
  const explicit = Object.fromEntries(ROLES.filter((r) => typeof config[r] === "string" && config[r]).map((r) => [r, config[r]]));
  let deviceId = null;
  if (config.device) {
    deviceId = findDeviceId(hass, config.device);
    if (deviceId === undefined) return { error: "unknown_device" };
  } else if (!Object.keys(explicit).length) deviceId = autoDevice(hass);
  const roles = { ...(deviceId ? rolesOf(hass, deviceId) : {}), ...explicit };
  if (!Object.keys(roles).length) return { error: "no_entities" };
  return { roles, deviceId, device: deviceId ? hass.devices?.[deviceId] : null };
};

const kindOf = (config, name) => {
  if (config.kind === "spa" || config.kind === "pool") return config.kind;
  return /\bspa\b|jacuzzi|hot.?tub|whirlpool|jacuzi|balneo|whirlpool/.test(norm(name)) ? "spa" : "pool";
};

// ---------------------------------------------------------------------------
// Water quality: ideal ranges, levels and advice
// ---------------------------------------------------------------------------

// Gauge scale, ideal range and the margins below and above it that are a warning (beyond: critical), per measure.
// Sources: CDC (free chlorine 1 ppm at least in a pool, 3 ppm in a hot tub; pH 7.0–7.8), CDC MAHC (ORP 600–900 mV,
// chlorine 10 ppm at most), WHO (ORP 720 mV, Ag/AgCl), CPSC (hot tub 40 °C / 104 °F at most), the electrolyser
// makers (salt 2700–3400 ppm for Pentair, Hayward and Jandy cells, 3–5 g/L for most European ones).
const BASE_RANGES = {
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
const rangeOf = (role, unit, kind, ranges = {}) => {
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
const levelOf = (range, v) => {
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

const RANK = { crit: 3, warn: 2, ok: 1, cold: 1, idle: 0 };
const worst = (levels) => levels.reduce((w, l) => (RANK[l] > RANK[w] ? l : w), "idle");

// Gauge scale: the measure's scale, widened to show the margins around the ideal range and the value itself.
const scaleOf = (range, v) => {
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
const trackOf = (range, [min, max]) => {
  const p = (x) => `${clamp(((x - min) / (max - min)) * 100, 0, 100).toFixed(2)}%`;
  const [lo, hi] = range.ideal;
  const [mLo, mHi] = range.margin;
  const low = range.cold ? ["var(--pc-cold-z)", "var(--pc-cold-z)"] : ["var(--pc-crit-z)", "var(--pc-warn-z)"];
  return `linear-gradient(90deg, ${low[0]} 0 ${p(lo - mLo)}, ${low[1]} ${p(lo - mLo)} ${p(lo)}, var(--pc-ok-z) ${p(lo)} ${p(hi)}, var(--pc-warn-z) ${p(hi)} ${p(hi + mHi)}, var(--pc-crit-z) ${p(hi + mHi)} 100%)`;
};

// A salt pool's TDS includes its salt: its ideal maximum is the salt level plus the usual 1500 ppm (the salt sensor's
// value, else the 3000 ppm of a typical salt cell when the pool has an electrolyser).
const saltPpm = (salt) => (salt?.v == null ? null : /ppm|mg/i.test(salt.unit) ? salt.v : salt.v * 1000);
const tdsRange = (range, salt, electrolyser, ranges = {}) => {
  if (Number.isFinite(parseFloat(ranges.tds_max))) return range;
  const base = saltPpm(salt) ?? (electrolyser ? 3000 : null);
  if (base === null) return range;
  const ideal = [range.ideal[0], Math.round((base + 1500) / 100) * 100];
  return { ...range, ideal, scale: [0, Math.max(range.scale[1], ideal[1] + 1500)] };
};

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

const OFF_STATES = /^(off|stop|stopped|arret|aus|apagado|spento|0|none|idle)$/;
const isOffOption = (o) => OFF_STATES.test(norm(o));

// True when the pump runs: on (switch, fan, input_boolean, binary_sensor), or a speed that is not "off" (select).
const pumpOn = (s) => {
  if (!valid(s)) return false;
  return domainOf(s.entity_id) === "select" ? !isOffOption(s.state) : s.state === "on";
};

const isOn = (s) => valid(s) && !["off", "closed", "idle"].includes(s.state) && (domainOf(s.entity_id) !== "select" || !isOffOption(s.state));

// Heat pump heating: its action when it reports one, else its mode.
const heating = (s) => valid(s) && (s.attributes?.hvac_action ? s.attributes.hvac_action === "heating" : s.state === "heat");

// Pump speeds the card can set: the options of the speed select, of the pump when it is a select (without its
// "off" option), or the preset modes of a fan.
const speedsOf = (pump, speed) => {
  if (speed && domainOf(speed.entity_id) === "select") return { entity: speed, options: speed.attributes?.options || [], current: speed.state };
  if (pump && domainOf(pump.entity_id) === "select") return { entity: pump, options: (pump.attributes?.options || []).filter((o) => !isOffOption(o)), current: pump.state };
  if (pump && domainOf(pump.entity_id) === "fan" && pump.attributes?.preset_modes?.length)
    return { entity: pump, options: pump.attributes.preset_modes, current: pump.attributes.preset_mode, fan: true };
  return null;
};

// Hours a pump ran between `start` and `end` (ms) from a history list: compressed ({ s, lc / lu } in seconds) or full
// ({ state, last_changed }) states.
const runHours = (list, start, end, on = (s) => s === "on") => {
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

const midnight = (now) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// The filtration history is read again at most this often (and whenever the pump changes state).
const HISTORY_MS = 5 * 60000;

// ---------------------------------------------------------------------------
// Animated water (hero)
// ---------------------------------------------------------------------------

// The scene: a pool (or a round spa) seen from above on its deck, 120 × 96, drawn and animated by state:
//   filtering — the water ripples and the return jets push a current across the pool
//   spa jets  — the spa's pump on: bubbles rise everywhere
//   heating   — the heat pump next to the pool spins its fan, its flame flickers and the water warms up
//   light     — the underwater light glows and pulses
//   cover     — the roller cover unrolls over the pool (closing) or rolls back (opening); drawn at its position
//               otherwise
const FIRE = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z";
const wavePath = (y, amp) => `M0 ${y} ${`q5 ${-amp} 10 0 t10 0 `.repeat(14)}V0 H0 Z`;
const FLOW = [
  [42, -0.2],
  [52, -1.1],
  [62, -2.0],
  [47, -2.6],
  [57, -0.7],
  [67, -1.6],
];
const BUBBLES = [
  [34, 2.4, -0.1],
  [46, 1.8, -0.9],
  [56, 2.8, -0.4],
  [66, 1.8, -1.3],
  [76, 2.4, -0.6],
  [86, 1.8, -1.1],
  [52, 2.2, -0.2],
  [72, 2.2, -1.4],
];

const sceneSvg = ({ filtering, spa, heat, heatPump, light, lightColor, cover, coverMove, hasCover }) => {
  const basin = spa ? { x: 22, y: 20, w: 76, h: 66, r: 30 } : { x: 12, y: 24, w: 96, h: 60, r: 10 };
  const rect = (b, extra = "") => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.r}"${extra}/>`;
  const slats = Array.from({ length: Math.ceil(basin.h / 6) }, (_, i) => `<rect x="${basin.x}" y="${basin.y + i * 6}" width="${basin.w}" height="5.5"/>`).join("");
  const glowStop = lightColor ? ` style="stop-color:${lightColor}"` : "";
  return `<svg viewBox="0 0 120 96" aria-hidden="true">
    <defs>
      <linearGradient id="pc-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="w1"/><stop offset="1" class="w2"/></linearGradient>
      <radialGradient id="pc-glow" cx="50%" cy="50%" r="55%"><stop offset="0" class="g1"${glowStop}/><stop offset="1" class="g2"${glowStop}/></radialGradient>
      <clipPath id="pc-basin">${rect(basin)}</clipPath>
    </defs>
    <rect class="deck" x="2" y="10" width="116" height="84" rx="16"/>
    <g clip-path="url(#pc-basin)">
      ${rect(basin, ' fill="url(#pc-water)"')}
      <path class="caustic" d="M10 46 q12 -5 24 0 t24 0 t24 0 t24 0 M18 66 q10 -4 20 0 t20 0 t20 0 t20 0"/>
      ${light ? `<ellipse class="glow" cx="${basin.x + basin.w / 2}" cy="${basin.y + basin.h / 2}" rx="${basin.w * 0.55}" ry="${basin.h * 0.6}" fill="url(#pc-glow)"/>` : ""}
      ${heat ? `${rect(basin, ' class="warm"')}` : ""}
      ${filtering && !spa ? `<g class="flow">${FLOW.map(([y, d]) => `<circle cx="10" cy="${y}" r="1.4" style="animation-delay:${d}s"/>`).join("")}</g>` : ""}
      ${filtering && spa ? `<g class="bubbles">${BUBBLES.map(([x, r, d]) => `<circle cx="${x}" cy="88" r="${r}" style="animation-delay:${d}s"/>`).join("")}</g>` : ""}
      <g class="waves${filtering ? " moving" : ""}" transform="translate(${basin.x} 0)"><path class="wave wa" d="${wavePath(basin.y + 7, 2.5)}"/><path class="wave wb" d="${wavePath(basin.y + 12, 1.6)}"/></g>
      ${cover > 0 || coverMove ? `<g class="slats${coverMove ? ` ${coverMove}` : ""}" style="transform-origin:0 ${basin.y}px;transform:scaleY(${coverMove ? 1 : cover.toFixed(2)})">${slats}</g>` : ""}
    </g>
    ${rect(basin, ' class="coping"')}
    ${light ? `<circle class="lamp" cx="${basin.x + basin.w / 2}" cy="${basin.y + basin.h - 4}" r="2.4"${lightColor ? ` style="fill:${lightColor}"` : ""}/>` : ""}
    ${spa ? "" : '<g class="ladder"><path d="M20 90 v-16 M28 90 v-16"/><path d="M20 84 h8 M20 79 h8"/></g>'}
    ${hasCover ? `<rect class="roller" x="${basin.x - 2}" y="${basin.y - 6}" width="${basin.w + 4}" height="5" rx="2.5"/>` : ""}
    ${
      heatPump
        ? `<g class="heatpump${heat ? " on" : ""}"><rect x="96" y="72" width="22" height="20" rx="4"/><circle class="fan-ring" cx="107" cy="82" r="6.5"/><g class="fan"><path d="M107 82 l0 -5.5 a2.4 2.4 0 0 1 2.4 2.4z M107 82 l5.5 0 a2.4 2.4 0 0 1 -2.4 2.4z M107 82 l0 5.5 a2.4 2.4 0 0 1 -2.4 -2.4z M107 82 l-5.5 0 a2.4 2.4 0 0 1 2.4 -2.4z"/></g>${
            heat ? `<g class="flame"><path transform="translate(98 56) scale(.75)" d="${FIRE}"/></g>` : ""
          }</g>`
        : ""
    }
  </svg>`;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --pc-accent: #0277bd; --pc-ok: var(--success-color, #43a047); --pc-warn: var(--warning-color, #ffa600);
          --pc-crit: var(--error-color, #db4437); --pc-idle: var(--disabled-text-color, #9e9e9e); --pc-cold: #2196f3;
          --pc-ok-z: color-mix(in srgb, var(--pc-ok) 55%, transparent); --pc-warn-z: color-mix(in srgb, var(--pc-warn) 45%, transparent);
          --pc-crit-z: color-mix(in srgb, var(--pc-crit) 32%, transparent); --pc-cold-z: color-mix(in srgb, var(--pc-cold) 30%, transparent);
          /* Text in a state or accent color is mixed with the text color so that it reads at 4.5:1 at least. */
          --pc-accent-text: color-mix(in srgb, var(--pc-accent) 55%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* Natural width in a parent that sizes to its content, without a minimum (see ha-vacuum-card). */
  :host { display: block; min-width: 0; --pc-natural-width: 380px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--pc-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible, button:focus-visible { outline: 2px solid var(--primary-color, var(--pc-accent)); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  .ok { --c: var(--pc-ok); } .warn { --c: var(--pc-warn); } .crit { --c: var(--pc-crit); } .idle { --c: var(--pc-idle); } .cold { --c: var(--pc-cold); } .active { --c: var(--pc-accent); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--pc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--pc-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--pc-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; line-height: 16px; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .type-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none;
               --pc-tint: var(--c, var(--pc-accent)); background: color-mix(in srgb, var(--pc-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--pc-tint) 65%, var(--primary-text-color)); transition: fill .3s ease; }
  .titles { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; }
  /* The status chip (and the detail button) sit on the title's line, at the right of the header. */
  .title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .name { flex: 1 1 0; min-width: 5ch; font-size: 16px; font-weight: 500; line-height: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :host([hide-title]) .name { visibility: hidden; }
  :host([hide-subtitle]) .sub { display: none; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--pc-warn) 50%, var(--primary-text-color)); }
  /* Buttons as on the other ha-* cards: never filled, a light tint; the icon takes the accent color when on. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; min-width: 0; color: var(--primary-text-color);
         background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn .icon { color: var(--secondary-text-color); }
  .btn.on { background: color-mix(in srgb, var(--pc-accent) 16%, transparent); color: var(--pc-accent-text); }
  .btn.on .icon { color: var(--pc-accent); }
  .btn:not(:disabled):hover { background: color-mix(in srgb, var(--pc-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn.on:not(:disabled):hover { background: color-mix(in srgb, var(--pc-accent) 24%, transparent); }
  .btn:disabled { opacity: .45; cursor: default; }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn.small { width: 28px; height: 28px; padding: 0; border-radius: 50%; flex: none; }
  .btn.small .icon { width: 16px; height: 16px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -2px -4px -2px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--pc-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--pc-accent)); outline-offset: 1px; }
  /* Scene (as the weather and device pictures of the other ha-* cards: a drawing next to the big value) */
  .hero { display: flex; align-items: center; gap: 14px; }
  .scene { position: relative; flex: none; width: 120px; height: 96px; --pc-w1: #7ccdf8; --pc-w2: #0b72b8; --pc-g1: #fff8d6; --pc-deck: #e9e2d6; }
  .scene.dark { --pc-w1: #4aa9de; --pc-w2: #084d80; --pc-deck: #5b5a57; }
  .scene.water-warn { --pc-w1: #7fd6d1; --pc-w2: #137d86; }
  .scene.water-warn.dark { --pc-w1: #4cb0aa; --pc-w2: #0b545b; }
  .scene.water-green { --pc-w1: #a8d67f; --pc-w2: #3f7d38; }
  .scene.water-green.dark { --pc-w1: #7fae5e; --pc-w2: #2a5226; }
  .scene svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 3px 5px rgba(0,0,0,.16)); }
  .scene .w1 { stop-color: var(--pc-w1); }
  .scene .w2 { stop-color: var(--pc-w2); }
  .scene .g1 { stop-color: var(--pc-g1); stop-opacity: 1; }
  .scene .g2 { stop-color: var(--pc-g1); stop-opacity: 0; }
  .scene .deck { fill: var(--pc-deck); }
  .scene .coping { fill: none; stroke: #f5f5f5; stroke-width: 3; }
  .scene.dark .coping { stroke: #bdbdbd; }
  .scene .caustic { fill: none; stroke: #fff; stroke-opacity: .2; stroke-width: 1.2; }
  .scene .wave { fill: #fff; }
  .scene .wa { fill-opacity: .24; }
  .scene .wb { fill-opacity: .14; }
  .scene .moving .wa { animation: pc-wave 1.5s linear infinite; }
  .scene .moving .wb { animation: pc-wave 3s linear infinite reverse; }
  .scene .flow circle { fill: #fff; fill-opacity: .8; animation: pc-flow 3s linear infinite; }
  .scene .bubbles circle { fill: #fff; fill-opacity: .45; stroke: #fff; stroke-opacity: .85; stroke-width: .6; animation: pc-bubble 1.5s ease-in infinite; }
  .scene .warm { fill: #ff8a3d; fill-opacity: .16; animation: pc-glow 1.5s ease-in-out infinite alternate; }
  .scene .glow { animation: pc-glow 1.5s ease-in-out infinite alternate; }
  .scene .lamp { fill: #fff8d6; stroke: #fff; stroke-width: 1; }
  .scene .ladder path { fill: none; stroke: #cfd8dc; stroke-width: 1.6; stroke-linecap: round; }
  .scene .roller { fill: #90a4ae; }
  .scene .slats { fill: #eceff1; stroke: #90a4ae; stroke-width: .6; }
  .scene.dark .slats { fill: #b0bec5; stroke: #607d8b; }
  .scene .slats.closing { animation: pc-unroll 3s ease-in-out infinite; }
  .scene .slats.opening { animation: pc-unroll 3s ease-in-out infinite reverse; }
  .scene .heatpump rect { fill: #cfd8dc; stroke: #90a4ae; stroke-width: .8; }
  .scene.dark .heatpump rect { fill: #78909c; stroke: #546e7a; }
  .scene .heatpump .fan-ring { fill: #eceff1; stroke: #90a4ae; stroke-width: .8; }
  .scene .heatpump .fan { fill: #78909c; transform-box: view-box; transform-origin: 107px 82px; }
  .scene .heatpump.on .fan { animation: pc-spin 1s linear infinite; }
  .scene .flame { fill: #ff7043; transform-box: fill-box; transform-origin: 50% 100%; animation: pc-flame 1s ease-in-out infinite; }
  @keyframes pc-wave { from { transform: translateX(0); } to { transform: translateX(-20px); } }
  @keyframes pc-flow { from { transform: translateX(0); opacity: 0; } 10% { opacity: 1; } 85% { opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
  @keyframes pc-bubble { from { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } to { transform: translateY(-64px); opacity: 0; } }
  @keyframes pc-glow { from { opacity: .45; } to { opacity: 1; } }
  @keyframes pc-unroll { 0%, 10% { transform: scaleY(0); } 85%, 100% { transform: scaleY(1); } }
  @keyframes pc-spin { to { transform: rotate(360deg); } }
  @keyframes pc-flame { 0%, 100% { transform: scale(1, 1); } 30% { transform: scale(.9, 1.12); } 60% { transform: scale(1.06, .92); } }
  @keyframes pc-blink { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
  /* The status dot blinks while something runs (filtration, heating, cover moving), as on the other ha-* cards. */
  ha-card:has(.scene.running) .header .dot { animation: pc-blink 1.6s ease-in-out infinite; }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .big { display: flex; align-items: baseline; gap: 8px; min-width: 0; flex-wrap: wrap; }
  .big .val { font-size: 30px; font-weight: 400; line-height: 1.1; color: var(--primary-text-color); white-space: nowrap; }
  .big .val small { font-size: 14px; margin-left: 2px; color: var(--secondary-text-color); }
  .big .lbl { font-size: 13px; font-weight: 500; color: var(--pc-accent-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 14px; height: 14px; color: var(--c, var(--secondary-text-color)); }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line b { color: var(--primary-text-color); font-weight: 500; }
  .line.tip-line { color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
  /* Gauges */
  .gauge { display: flex; flex-direction: column; gap: 5px; padding: 8px 10px; border-radius: 10px; min-width: 0;
           background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .g-head { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .g-head .icon { width: 16px; height: 16px; color: var(--c, var(--secondary-text-color)); }
  .g-label { flex: 1 1 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .g-value { font-size: 15px; font-weight: 500; color: var(--primary-text-color); white-space: nowrap; }
  .g-value small { font-size: 11px; font-weight: 400; margin-left: 2px; color: var(--secondary-text-color); }
  .gauge:is(.warn, .crit, .cold) .g-value { color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
  .g-track { position: relative; height: 6px; border-radius: 3px; }
  .g-mark { position: absolute; top: 50%; width: 12px; height: 12px; border-radius: 50%; transform: translate(-50%, -50%); box-sizing: border-box;
            background: var(--card-background-color, #fff); border: 3px solid color-mix(in srgb, var(--c, var(--pc-idle)) 75%, var(--primary-text-color));
            transition: left .6s ease; }
  .g-range { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar { height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; flex: 1 1 auto; min-width: 40px; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--pc-accent)); transition: width .6s ease; }
  ${"" /* placeholder kept empty: the shared style ends here */}
  /* In-card confirmation popup at the top of the card (not centered). */
  ha-card.dialog-open { position: relative; min-height: 160px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); box-sizing: border-box;
           border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
  @container (max-width: 230px) {
    .chip { padding: 4px; flex: none; }
    .chip-text { display: none; }
  }
`;

const FULL_STYLE = `
  .content { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .controls { display: flex; flex-wrap: wrap; gap: 6px; }
  .controls .btn { flex: 1 1 auto; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  /* Chevron to the right when folded, down when unfolded. */
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .section-title .count { font-size: 11px; padding: 0 6px; border-radius: 8px; text-transform: none; letter-spacing: 0;
                          background: color-mix(in srgb, var(--c, var(--pc-idle)) 18%, transparent); color: color-mix(in srgb, var(--c, var(--pc-idle)) 55%, var(--primary-text-color)); }
  .gauges { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  .advice { display: flex; flex-direction: column; gap: 6px; }
  .tip { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.35; padding: 6px 10px; border-radius: 10px;
         background: color-mix(in srgb, var(--c, var(--pc-ok)) 10%, transparent); }
  .tip .icon { width: 18px; height: 18px; color: var(--c, var(--pc-ok)); margin-top: 0; }
  .filtration { display: flex; flex-direction: column; gap: 8px; }
  .row { display: flex; align-items: center; gap: 8px; font-size: 13px; min-width: 0; flex-wrap: wrap; }
  .row .k { color: var(--secondary-text-color); display: inline-flex; align-items: center; gap: 6px; }
  .row .k .icon { width: 16px; height: 16px; }
  .row .v { font-weight: 500; white-space: nowrap; }
  .row .pct { font-size: 12px; color: var(--secondary-text-color); min-width: 3ch; text-align: right; }
  .row.runtime .bar { flex: 1 1 80px; }
  .speeds { display: flex; flex-wrap: wrap; gap: 6px; }
  .speeds .btn { padding: 4px 12px; font-size: 12px; }
  .note { font-size: 11px; color: var(--secondary-text-color); }
  .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  .tile { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .tile .k { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; }
  .tile .k span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .tile .k .icon { width: 16px; height: 16px; color: var(--c, var(--secondary-text-color)); }
  .tile .v { font-size: 14px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .tile .setpoint { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
  .tile .setpoint .v { flex: 1; text-align: center; }
  @container (max-width: 300px) {
    .gauges, .tiles { grid-template-columns: minmax(0, 1fr); }
    .hero { gap: 10px; }
    .scene { width: 96px; height: 77px; }
    .big .val { font-size: 26px; }
  }
`;

const MINI_STYLE = `
  :host { --pc-natural-width: 300px; }
  .content { padding: 10px 12px 12px; display: flex; align-items: center; gap: 12px; }
  .scene { width: 64px; height: 52px; }
  .pills { display: flex; flex-wrap: wrap; gap: 4px; }
  .pill { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 2px 8px; border-radius: 10px; white-space: nowrap;
          background: var(--secondary-background-color, rgba(127,127,127,.1)); }
  .pill .k { color: var(--secondary-text-color); }
  .pill .v { font-weight: 500; }
  .pill:is(.warn, .crit, .cold) .v { color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
  .controls { display: flex; gap: 6px; flex: none; }
  /* Narrow mini card: the buttons move under the info, then the scene gives way. */
  @container (max-width: 300px) {
    .content { flex-wrap: wrap; row-gap: 8px; }
    .info { flex: 0 0 calc(100% - 76px); }
    .controls { flex-basis: 100%; justify-content: flex-end; }
  }
  @container (max-width: 200px) {
    .scene { display: none; }
    .info { flex-basis: 100%; }
  }
`;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

// Home Assistant dialogs (more-info opened from the card): a click there is not a click elsewhere on the page.
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};
// After the popup closes, clicks are ignored this long (second click of a double click on OK).
const CONFIRM_GUARD_MS = 400;

class PoolCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._toggled = new Map();
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Enter / Space on an element with the button role acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key !== "Enter" && ev.key !== " ") || ev.target?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      ev.target.click();
    });
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._confirm) return;
      ev.stopPropagation();
      this._closeConfirm();
    };
  }

  static getConfigElement() {
    return document.createElement("pool-card-editor");
  }

  static getStubConfig(hass) {
    const id = hass && autoDevice(hass);
    return id ? { device: id } : {};
  }

  getCardSize() {
    return 9;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._update();
  }

  // Home Assistant pushes a new hass on every state change: the card is only rebuilt when something it shows changed.
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const setup = setupOf(h, this._config);
    if (setup.error) return null;
    const ids = Object.values(setup.roles);
    const rt = this._runtime(setup.roles);
    return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, rt === null ? null : Math.round(rt * 60), ...ids.map((id) => h.states[id])];
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._onOutside ??= (ev) => {
      if ((!this._toggled.size && !this._confirm) || !isOutside(this, ev)) return;
      this._toggled = new Map();
      if (this._confirm) this._closeConfirm();
      else this._update();
    };
    document.addEventListener("click", this._onOutside, true);
    if (this._confirm) window.addEventListener("keydown", this._onKey);
    // The filtration time of the day moves on its own while the pump runs: re-checked every minute.
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    this._tick = null;
    document.removeEventListener("click", this._onOutside, true);
    window.removeEventListener("keydown", this._onKey);
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return intlLocale(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled so that it is not "Uncaught (in promise)".
  _call(domain, service, data) {
    return Promise.resolve(this._hass.callService(domain, service, data)).catch(() => {});
  }

  _update() {
    if (!this._hass || !this._config) return;
    let html = this._render();
    if (this._confirm) html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    if (html === this._html) return;
    const focused = this.shadowRoot.activeElement;
    const key = focused?.dataset ? JSON.stringify({ ...focused.dataset }) : null;
    this._html = html;
    this.shadowRoot.innerHTML = html;
    // The element that had the keyboard focus gets it back once rewritten.
    // The popup's safe choice (Cancel) gets the focus: Enter or Space right after the click does not stop the pump.
    if (this._confirm) this.shadowRoot.querySelector('.modal [data-action="confirm_cancel"]')?.focus({ preventScroll: true });
    else if (key && key !== "{}") {
      for (const el of this.shadowRoot.querySelectorAll("[data-action], [data-entity]")) {
        if (JSON.stringify({ ...el.dataset }) === key) {
          el.focus({ preventScroll: true });
          break;
        }
      }
    }
  }

  // ----- Model -------------------------------------------------------------

  // Everything a render shows, computed once per render.
  _model() {
    const setup = setupOf(this._hass, this._config);
    if (setup.error) return setup;
    const { roles } = setup;
    const c = this._config;
    const name = c.title || deviceName(setup.device) || "";
    const kind = kindOf(c, `${name} ${deviceName(setup.device)}`);
    const metrics = {};
    for (const role of SENSOR_ROLES) {
      let s = this._s(roles[role]);
      // Water temperature: the heat pump's current temperature when there is no water sensor.
      if (!s && role === "water_temperature") {
        const hp = this._s(roles.heat_pump);
        const v = hp?.attributes?.current_temperature;
        if (Number.isFinite(v))
          s = { entity_id: hp.entity_id, state: String(v), attributes: { unit_of_measurement: this._hass.config?.unit_system?.temperature || "°C" } };
      }
      if (!s) continue;
      const unit = s.attributes?.unit_of_measurement || "";
      const range = rangeOf(role, unit, kind, c.ranges || {});
      const v = num(s);
      metrics[role] = { role, entity: s.entity_id, v, unit: range.unit, range, ...levelOf(range, v) };
    }
    if (metrics.tds) {
      const range = tdsRange(metrics.tds.range, metrics.salt, roles.electrolyser, c.ranges || {});
      metrics.tds = { ...metrics.tds, range, ...levelOf(range, metrics.tds.v) };
    }
    const quality = METRIC_ROLES.filter((r) => metrics[r]);
    const levels = quality.map((r) => metrics[r].cls).filter((l) => l !== "cold" && l !== "idle");
    const pump = this._s(roles.pump);
    const hp = this._s(roles.heat_pump);
    const electro = this._s(roles.electrolyser);
    const tips = [];
    for (const r of quality) {
      const m = metrics[r];
      if (!m.side) continue;
      // A spa too hot is a health matter (40 °C at most), a pool too warm an algae matter.
      const key = r === "water_temperature" ? `temp_${m.side}${m.side === "high" && kind === "spa" ? "_spa" : ""}` : `${r}_${m.side}`;
      tips.push({ cls: m.cls === "cold" ? "cold" : m.cls, key });
    }
    // Equipment that needs water flow, running while the pump is stopped.
    if (pump && valid(pump) && !pumpOn(pump)) {
      if (heating(hp)) tips.push({ cls: "crit", key: "heat_no_flow" });
      if (electro && ["switch", "input_boolean"].includes(domainOf(electro.entity_id)) && electro.state === "on") tips.push({ cls: "warn", key: "electrolyser_no_flow" });
    }
    tips.sort((a, b) => RANK[b.cls] - RANK[a.cls]);
    // A cold water is not a water quality problem: it counts as a measure in range.
    const measured = quality.map((r) => metrics[r].cls).filter((l) => l !== "idle").map((l) => (l === "cold" ? "ok" : l));
    const status = worst([...measured, ...tips.map((tip) => tip.cls).filter((l) => l !== "cold")]);
    // The water turns green when the disinfection is too low, teal on any other critical value.
    const disinfection = ["orp", "chlorine"].some((r) => metrics[r]?.cls === "crit" && metrics[r].side === "low");
    const water = disinfection ? "water-green" : levels.includes("crit") ? "water-warn" : "water-ok";
    return { ...setup, name: name || this._t(kind), kind, metrics, quality, tips, status, water, pump, hp, electro };
  }

  // Hours the pump ran today: the filtration time sensor when set, else the pump's history (read with the history
  // websocket API, at most every 5 minutes and whenever the pump changes state), plus the time since while it runs.
  _runtime(roles) {
    const sensor = this._s(roles.filtration_time);
    if (sensor) return toHours(sensor);
    const pump = this._s(roles.pump);
    if (!pump || typeof this._hass.callWS !== "function") return null;
    const now = Date.now();
    const day = midnight(now);
    const rt = this._rt;
    const fresh = rt && rt.id === pump.entity_id && rt.day === day && rt.changed === pump.last_changed && now - rt.at < HISTORY_MS;
    if (!fresh) this._fetchRuntime(pump, day, now);
    if (!rt || rt.id !== pump.entity_id || rt.day !== day || rt.hours === null) return null;
    return rt.hours + (pumpOn(pump) ? Math.max(0, now - rt.at) / 3.6e6 : 0);
  }

  _fetchRuntime(pump, day, now) {
    const id = pump.entity_id;
    if (this._rtLoading === id) return;
    this._rtLoading = id;
    const isSelect = domainOf(id) === "select";
    Promise.resolve(
      this._hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(day).toISOString(),
        end_time: new Date(now).toISOString(),
        entity_ids: [id],
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      }),
    )
      .then((res) => {
        const on = isSelect ? (s) => !!s && !isOffOption(s) && !["unknown", "unavailable"].includes(s) : (s) => s === "on";
        this._rt = { id, day, at: now, changed: pump.last_changed, hours: runHours(res?.[id], day, now, on) };
      })
      .catch(() => {
        // No history (recorder excluded…): no time shown, tried again later.
        this._rt = { id, day, at: now, changed: pump.last_changed, hours: null };
      })
      .finally(() => {
        this._rtLoading = null;
        this._lastDeps = null;
        if (this._hass) this.hass = this._hass;
      });
  }

  // Daily target in hours: the option, the target sensor (iopool's recommendation), or the usual rule for a pool,
  // water temperature in °C divided by two.
  _target(m) {
    const opt = parseFloat(this._config.filtration_hours);
    if (Number.isFinite(opt) && opt > 0) return { hours: clamp(opt, 0, 24), rule: false };
    const s = this._s(m.roles.filtration_target);
    const h = toHours(s);
    if (h !== null && h > 0) return { hours: clamp(h, 0, 24), rule: false };
    const w = m.metrics.water_temperature;
    if (m.kind === "pool" && w && w.v !== null) {
      const c = /F/.test(w.unit) ? ((w.v - 32) * 5) / 9 : w.v;
      if (c > 0) return { hours: clamp(Math.round(c) / 2, 1, 24), rule: true };
    }
    return null;
  }

  // ----- Rendering ---------------------------------------------------------

  _statusText(status) {
    return this._t(`status_${status}`);
  }

  _header(m, sub) {
    const label = this._statusText(m.status);
    return `
      <div class="header">
        <div class="type-icon ${m.status === "idle" ? "" : m.status}">${svgIcon(m.kind === "spa" ? ICONS.spa : ICONS.pool)}</div>
        <div class="titles">
          <div class="title-row">
            <div class="name">${esc(m.name)}</div>
            <span class="chip ${m.status}" title="${esc(label)}" aria-label="${esc(label)}"><span class="dot"></span><span class="chip-text">${esc(label)}</span></span>
            ${this._zoomButton()}
          </div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(
      key === "unknown_device" ? `${this._t(key)}: ${this._config.device}` : this._t(key),
    )}</div></ha-card>`;
  }

  _value(metric) {
    const unit = metric.role === "ph" ? "" : metric.unit;
    const v = fmtNum(metric.v, metric.range.digits, this._locale());
    return { v, unit };
  }

  _subtitle(m) {
    if (!m.pump) return this._t(m.kind);
    if (!valid(m.pump)) return this._t("unavailable");
    const rt = this._runtime(m.roles);
    const state = this._t(pumpOn(m.pump) ? "filtering" : "stopped");
    return rt === null ? state : `${state} · ${this._t("today_time", { time: fmtHours(rt, this._locale()) })}`;
  }

  // State of the scene: what animates it, and what it draws.
  _scene(m) {
    const light = this._s(m.roles.light);
    const cover = this._s(m.roles.cover);
    const lightOn = isOn(light);
    const rgb = light?.attributes?.rgb_color;
    const lightColor = lightOn && Array.isArray(rgb) && rgb.length === 3 ? `rgb(${rgb.map((x) => clamp(Math.round(x), 0, 255)).join(",")})` : "";
    // Cover: fully drawn when closed, by its position when it reports one; animated while it moves.
    let coverPart = 0;
    let coverMove = "";
    if (valid(cover)) {
      const pos = Number(cover.attributes?.current_position);
      coverPart = Number.isFinite(pos) ? clamp(1 - pos / 100, 0, 1) : cover.state === "closed" ? 1 : 0;
      if (cover.state === "closing" || cover.state === "opening") coverMove = cover.state;
    }
    const s = {
      filtering: pumpOn(m.pump),
      spa: m.kind === "spa",
      heat: heating(m.hp),
      heatPump: !!m.hp,
      light: lightOn,
      lightColor,
      cover: coverPart,
      coverMove,
      hasCover: !!cover,
    };
    s.running = s.filtering || s.heat || !!coverMove;
    return s;
  }

  _sceneHtml(m) {
    const s = this._scene(m);
    const dark = this._hass.themes?.darkMode ? " dark" : "";
    return `<div class="scene clickable ${m.water}${dark}${s.running ? " running" : ""}" role="button" tabindex="0" aria-label="${esc(m.name)}" data-entity="${esc(m.metrics.water_temperature?.entity || m.roles.pump || "")}">${sceneSvg(s)}</div>`;
  }

  _hero(m) {
    const w = m.metrics.water_temperature;
    const air = m.metrics.air_temperature;
    const cover = this._s(m.roles.cover);
    const lines = [];
    if (air) {
      const a = this._value(air);
      lines.push(`<div class="line clickable" role="button" tabindex="0" data-entity="${esc(air.entity)}">${svgIcon(ICONS.air)}<span>${esc(this._t("air"))} <b>${esc(a.v)} ${esc(a.unit)}</b></span></div>`);
    }
    if (heating(m.hp)) lines.push(`<div class="line warn">${svgIcon(ICONS.heat_pump)}<span>${esc(this._t("heating"))}</span></div>`);
    if (valid(cover) && cover.state !== "open") {
      const key = { closed: "cover_closed", opening: "opening", closing: "closing" }[cover.state] || "cover_open";
      lines.push(`<div class="line">${svgIcon(ICONS.cover)}<span>${esc(`${this._t("cover")} · ${this._t(key)}`)}</span></div>`);
    }
    const big = w
      ? `<div class="big clickable" role="button" tabindex="0" data-entity="${esc(w.entity)}" aria-label="${esc(`${this._t("water_temperature")} ${this._value(w).v} ${w.unit}`)}"><span class="val">${esc(this._value(w).v)}<small>${esc(w.unit)}</small></span><span class="lbl">${esc(this._t("water"))}</span></div>`
      : "";
    return `<div class="hero">${this._sceneHtml(m)}<div class="info">${big}${lines.join("")}</div></div>`;
  }

  // Control buttons of the equipment that can be switched: pump, light, heat pump, cover, electrolyser.
  _controls(m, round = false) {
    if (this._config.show_controls === false) return "";
    const list = [];
    const btn = (action, entity, icon, label, on) => {
      const s = this._s(entity);
      const off = !valid(s);
      return `<button class="btn${round ? " round" : ""}${on ? " on" : ""}" data-action="${action}" data-entity="${esc(entity)}" title="${esc(label)}" aria-label="${esc(label)}" aria-pressed="${on ? "true" : "false"}"${off ? " disabled" : ""}>${svgIcon(icon)}${round ? "" : `<span>${esc(label)}</span>`}</button>`;
    };
    const r = m.roles;
    if (m.pump && domainOf(r.pump) !== "binary_sensor") list.push(btn("pump", r.pump, ICONS.pump, this._t("pump"), pumpOn(m.pump)));
    const light = this._s(r.light);
    if (light && ["light", "switch", "input_boolean"].includes(domainOf(r.light))) list.push(btn("toggle", r.light, lightIcon(light), this._t("light"), isOn(light)));
    if (round) return list.join("");
    if (m.hp) list.push(btn("heat_pump", r.heat_pump, ICONS.heat_pump, this._t("heat_pump"), valid(m.hp) && m.hp.state !== "off"));
    const cover = this._s(r.cover);
    if (cover) {
      const closed = cover.state === "closed" || cover.state === "closing";
      list.push(btn("cover", r.cover, closed ? ICONS.cover : ICONS.cover_open, this._t(closed ? "open_cover" : "close_cover"), !closed));
    }
    if (m.electro && ["switch", "input_boolean"].includes(domainOf(r.electrolyser)))
      list.push(btn("toggle", r.electrolyser, ICONS.electrolyser, this._t("electrolyser"), m.electro.state === "on"));
    return list.join("");
  }

  _isCollapsed(key) {
    if (this._toggled.has(key)) return this._toggled.get(key);
    const def = Array.isArray(this._config.collapsed) ? this._config.collapsed : DEFAULT_COLLAPSED;
    return def.includes(key);
  }

  _section(key, icon, title, body, extra = "") {
    const collapsed = this._isCollapsed(key);
    return `<div class="section">
        <div class="section-title toggle" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${collapsed ? "false" : "true"}">${svgIcon(icon)}<span>${esc(title)}</span>${extra}${svgIcon(ICONS.chevron, "chevron")}</div>
        ${collapsed ? "" : body}
      </div>`;
  }

  _gauge(metric) {
    const [min, max] = scaleOf(metric.range, metric.v);
    const { v, unit } = this._value(metric);
    const loc = this._locale();
    const d = metric.range.digits;
    const ideal = `${fmtNum(metric.range.ideal[0], d, loc)}–${fmtNum(metric.range.ideal[1], d, loc)}${metric.role === "ph" ? "" : ` ${metric.unit}`}`;
    const pos = metric.v === null ? null : clamp(((metric.v - min) / (max - min)) * 100, 0, 100);
    const label = this._t(metric.role);
    return `<div class="gauge clickable ${metric.cls}" role="button" tabindex="0" data-entity="${esc(metric.entity)}" aria-label="${esc(`${label} ${v} ${unit}, ${this._t("ideal", { range: ideal })}`)}">
        <div class="g-head">${svgIcon(METRIC_ICONS[metric.role])}<span class="g-label">${esc(label)}</span><span class="g-value">${esc(v)}${unit ? `<small>${esc(unit)}</small>` : ""}</span></div>
        <div class="g-track" style="background:${trackOf(metric.range, [min, max])}">${pos === null ? "" : `<div class="g-mark" style="left:${pos.toFixed(2)}%"></div>`}</div>
        <div class="g-range">${esc(this._t("ideal", { range: ideal }))}</div>
      </div>`;
  }

  _advice(m) {
    const items = m.tips.length
      ? m.tips.map((tip) => `<div class="tip ${tip.cls}">${svgIcon(tip.cls === "crit" ? ICONS.alert : ICONS.info)}<span>${esc(this._t(tip.key))}</span></div>`)
      : [`<div class="tip ok">${svgIcon(ICONS.check)}<span>${esc(this._t("all_good"))}</span></div>`];
    const count = m.tips.length ? `<span class="count ${worst(m.tips.map((tip) => tip.cls))}">${m.tips.length}</span>` : "";
    return this._section("advice", ICONS.advice, this._t("advice"), `<div class="advice">${items.join("")}</div>`, count);
  }

  _filtration(m) {
    const r = m.roles;
    const rows = [];
    const loc = this._locale();
    if (m.pump) {
      const on = pumpOn(m.pump);
      const cls = !valid(m.pump) ? "idle" : on ? "active" : "idle";
      const label = !valid(m.pump) ? this._t("unavailable") : this._t(on ? "filtering" : "stopped");
      rows.push(
        `<div class="row"><span class="k">${svgIcon(ICONS.pump)}${esc(this._t("pump"))}</span><span class="chip clickable ${cls}" role="button" tabindex="0" data-entity="${esc(r.pump)}"><span class="dot"></span><span class="chip-text">${esc(label)}</span></span></div>`,
      );
    }
    const speeds = speedsOf(m.pump, this._s(r.pump_speed));
    if (speeds?.options.length) {
      const off = !valid(speeds.entity);
      rows.push(
        `<div class="row"><span class="k">${svgIcon(ICONS.speed)}${esc(this._t("speed"))}</span><div class="speeds">${speeds.options
          .map(
            (o) =>
              `<button class="btn${o === speeds.current ? " on" : ""}" data-action="speed" data-entity="${esc(speeds.entity.entity_id)}" data-option="${esc(o)}" aria-pressed="${o === speeds.current ? "true" : "false"}"${off ? " disabled" : ""}><span>${esc(o)}</span></button>`,
          )
          .join("")}</div></div>`,
      );
    }
    const rt = this._runtime(r);
    const target = this._target(m);
    if (rt !== null || target) {
      const done = rt === null ? "—" : fmtHours(rt, loc);
      const pct = rt !== null && target ? Math.round(clamp((rt / target.hours) * 100, 0, 100)) : null;
      const text = target ? this._t("of_target", { done, target: fmtHours(target.hours, loc) }) : done;
      const entity = r.filtration_time || r.pump;
      rows.push(
        `<div class="row runtime clickable" role="button" tabindex="0" data-entity="${esc(entity)}"><span class="k">${svgIcon(ICONS.timer)}${esc(this._t("today"))}</span><span class="v">${esc(text)}</span>${
          pct === null ? "" : `<div class="bar ${pct >= 100 ? "ok" : "active"}"><div style="width:${pct}%"></div></div><span class="pct">${pct} %</span>`
        }</div>`,
      );
      if (target?.rule) rows.push(`<div class="note">${esc(this._t("target_rule"))}</div>`);
    }
    if (!rows.length) return "";
    return this._section("filtration", ICONS.pump, this._t("filtration"), `<div class="filtration">${rows.join("")}</div>`);
  }

  _equipment(m) {
    const r = m.roles;
    const tiles = [];
    const loc = this._locale();
    const tile = (entity, icon, label, value, cls = "", extra = "") =>
      `<div class="tile ${cls}"><div class="k clickable" role="button" tabindex="0" data-entity="${esc(entity)}">${svgIcon(icon)}<span>${esc(label)}</span></div><div class="v">${esc(value)}</div>${extra}</div>`;
    if (m.hp) {
      const a = m.hp.attributes || {};
      const mode = !valid(m.hp) ? this._t("unavailable") : heating(m.hp) ? this._t("heating") : m.hp.state === "off" ? this._t("off") : this._t("idle");
      const unit = this._hass.config?.unit_system?.temperature || m.metrics.water_temperature?.unit || "°C";
      const target = Number.isFinite(a.temperature) ? `${fmtNum(a.temperature, 1, loc)} ${unit}` : "";
      const off = !valid(m.hp) || !Number.isFinite(a.temperature) || m.hp.state === "off";
      const setpoint = Number.isFinite(a.temperature)
        ? `<div class="setpoint"><button class="btn small" data-action="temp_down" data-entity="${esc(r.heat_pump)}" title="−" aria-label="${esc(this._t("lower_target"))}"${off ? " disabled" : ""}>${svgIcon(ICONS.minus)}</button><span class="v" title="${esc(this._t("target"))}">${esc(target)}</span><button class="btn small" data-action="temp_up" data-entity="${esc(r.heat_pump)}" title="+" aria-label="${esc(this._t("raise_target"))}"${off ? " disabled" : ""}>${svgIcon(ICONS.plus)}</button></div>`
        : "";
      tiles.push(tile(r.heat_pump, ICONS.heat_pump, this._t("heat_pump"), mode, heating(m.hp) ? "warn" : valid(m.hp) && m.hp.state !== "off" ? "active" : "idle", setpoint));
    }
    if (m.electro) {
      const s = m.electro;
      const d = domainOf(s.entity_id);
      let value;
      if (!valid(s)) value = this._t("unavailable");
      else if (["switch", "input_boolean"].includes(d)) value = this._t(s.state === "on" ? "on" : "off");
      else {
        const v = num(s);
        const unit = s.attributes?.unit_of_measurement || "";
        value = v === null ? s.state : `${unit === "%" ? Math.round(v) : fmtNum(v, Number.isInteger(v) ? 0 : 1, loc)}${unit ? ` ${unit}` : ""}`;
      }
      tiles.push(tile(r.electrolyser, ICONS.electrolyser, this._t("electrolyser"), value, isOn(s) ? "active" : "idle"));
    }
    const cover = this._s(r.cover);
    if (cover) {
      const key = { open: "cover_open", closed: "cover_closed", opening: "opening", closing: "closing" }[cover.state];
      const pos = Number(cover.attributes?.current_position);
      const value = !valid(cover) ? this._t("unavailable") : `${this._t(key || "cover_open")}${Number.isFinite(pos) && pos > 0 && pos < 100 ? ` · ${Math.round(pos)} %` : ""}`;
      tiles.push(tile(r.cover, cover.state === "closed" ? ICONS.cover : ICONS.cover_open, this._t("cover"), value, cover.state === "closed" ? "idle" : "active"));
    }
    const light = this._s(r.light);
    if (light) tiles.push(tile(r.light, lightIcon(light), this._t("light"), !valid(light) ? this._t("unavailable") : this._t(isOn(light) ? "on" : "off"), isOn(light) ? "active" : "idle"));
    if (!tiles.length) return "";
    return this._section("equipment", ICONS.tools, this._t("equipment"), `<div class="tiles">${tiles.join("")}</div>`);
  }

  _render() {
    const m = this._model();
    if (m.error) return this._errorCard(m.error);
    this._m = m;
    const c = this._config;
    const parts = [this._hero(m)];
    const controls = this._controls(m);
    if (controls) parts.push(`<div class="controls">${controls}</div>`);
    if (m.quality.length) {
      parts.push(
        `<div class="section"><div class="section-title">${svgIcon(ICONS.water)}<span>${esc(this._t("water_quality"))}</span></div><div class="gauges">${m.quality.map((r) => this._gauge(m.metrics[r])).join("")}</div></div>`,
      );
    }
    if (c.show_advice !== false) parts.push(this._advice(m));
    if (c.show_filtration !== false) parts.push(this._filtration(m));
    if (c.show_equipment !== false) parts.push(this._equipment(m));
    return `<style>${BASE_STYLE}${FULL_STYLE}${accentStyle(this._hass)}</style>
      <ha-card>
        ${this._header(m, this._subtitle(m))}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  // ----- Actions -----------------------------------------------------------

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n?.dataset && (n.dataset.action || n.dataset.entity));
    if (this._confirm) {
      const action = el?.dataset?.action;
      if (action === "confirm_ok") {
        const run = this._confirm.run;
        this._closeConfirm();
        run();
      } else if (action === "confirm_cancel" || (action === "confirm_backdrop" && path[0] === el)) this._closeConfirm();
      return;
    }
    if (!el) return;
    if (this._confirmClosedAt && Date.now() - this._confirmClosedAt < CONFIRM_GUARD_MS) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    const s = this._s(entity);
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle_section") {
      const key = el.dataset.section;
      this._toggled = new Map(this._toggled).set(key, !this._isCollapsed(key));
      return this._update();
    }
    if (action && action !== "toggle_section" && !valid(s)) return;
    if (action === "pump") return this._togglePump(s);
    if (action === "toggle") {
      const d = domainOf(entity);
      return this._call(d === "light" ? "light" : d, isOn(s) ? "turn_off" : "turn_on", { entity_id: entity });
    }
    if (action === "speed") {
      const option = el.dataset.option;
      const run = () =>
        domainOf(entity) === "fan"
          ? this._call("fan", "set_preset_mode", { entity_id: entity, preset_mode: option })
          : this._call("select", "select_option", { entity_id: entity, option });
      // A speed select's "off" option stops the pump too: same confirmation as the pump button.
      if (isOffOption(option) && pumpOn(this._m?.pump) && heating(this._m?.hp)) return this._openConfirm({ text: this._t("confirm_pump_off"), ok: this._t("stop"), run });
      return run();
    }
    if (action === "heat_pump") {
      const modes = s.attributes?.hvac_modes || ["off", "heat"];
      const mode = s.state === "off" ? (modes.includes("heat") ? "heat" : modes.find((x) => x !== "off") || "heat") : "off";
      return this._call("climate", "set_hvac_mode", { entity_id: entity, hvac_mode: mode });
    }
    if (action === "temp_up" || action === "temp_down") {
      const a = s.attributes || {};
      const step = a.target_temp_step || (/F/.test(this._hass.config?.unit_system?.temperature || "") ? 1 : 0.5);
      let v = a.temperature + (action === "temp_up" ? step : -step);
      if (Number.isFinite(a.min_temp)) v = Math.max(a.min_temp, v);
      if (Number.isFinite(a.max_temp)) v = Math.min(a.max_temp, v);
      return this._call("climate", "set_temperature", { entity_id: entity, temperature: Math.round(v * 10) / 10 });
    }
    if (action === "cover") {
      const closed = s.state === "closed" || s.state === "closing";
      return this._call("cover", closed ? "open_cover" : "close_cover", { entity_id: entity });
    }
    if (entity) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
  }

  // Pump on / off. A select pump goes to its "off" option, or back to its first speed. Stopping the pump while the
  // heat pump heats asks for a confirmation first: a heat pump needs the water flow.
  _togglePump(s) {
    const id = s.entity_id;
    const d = domainOf(id);
    const on = pumpOn(s);
    let run;
    if (d === "select") {
      const options = s.attributes?.options || [];
      const option = on ? options.find(isOffOption) : this._lastSpeed?.[id] || options.find((o) => !isOffOption(o));
      if (!option) return;
      if (on) this._lastSpeed = { ...this._lastSpeed, [id]: s.state };
      run = () => this._call("select", "select_option", { entity_id: id, option });
    } else run = () => this._call(d, on ? "turn_off" : "turn_on", { entity_id: id });
    if (on && heating(this._m?.hp)) return this._openConfirm({ text: this._t("confirm_pump_off"), ok: this._t("stop"), run });
    return run();
  }

  _openConfirm(confirm) {
    this._confirm = confirm;
    window.addEventListener("keydown", this._onKey);
    this._update();
  }

  _closeConfirm() {
    this._confirm = null;
    this._confirmClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  _confirmHtml() {
    const c = this._confirm;
    return `<div class="backdrop" data-action="confirm_backdrop"><div class="modal" role="alertdialog" aria-modal="true" aria-label="${esc(c.text)}">
        <div class="msg">${esc(c.text)}</div>
        <div class="modal-actions"><button class="btn" data-action="confirm_cancel"><span>${esc(this._t("cancel"))}</span></button><button class="btn on" data-action="confirm_ok"><span>${esc(c.ok)}</span></button></div>
      </div></div>`;
  }

  _toggleZoom() {}
}

const METRIC_ICONS = {
  water_temperature: ICONS.water_temp,
  air_temperature: ICONS.air,
  ph: ICONS.ph,
  orp: ICONS.orp,
  chlorine: ICONS.chlorine,
  salt: ICONS.salt,
  tds: ICONS.tds,
};
const lightIcon = (s) => (isOn(s) ? ICONS.light_on : ICONS.light);
const accentStyle = (hass) => `:host { --pc-accent: ${hass?.themes?.darkMode ? "#4fc3f7" : "#0277bd"}; }`;

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
class PoolMiniCard extends PoolCard {
  constructor() {
    super();
    this._onUnzoom = (ev) => {
      if (this._zoomed && isOutside(this, ev)) this._setZoom(false);
    };
  }

  static getConfigElement() {
    return document.createElement("pool-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onUnzoom, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onUnzoom, true);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const label = esc(this._t(this._zoomed ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}" aria-expanded="${this._zoomed ? "true" : "false"}">${svgIcon(this._zoomed ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev?.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _render() {
    if (this._zoomed) return super._render();
    const m = this._model();
    if (m.error) return this._errorCard(m.error);
    this._m = m;
    const pills = [...m.quality]
      .slice(0, 4)
      .map((r) => {
        const x = m.metrics[r];
        const { v, unit } = this._value(x);
        const k = r === "water_temperature" ? "" : `<span class="k">${esc(this._t(`${r}_short`))}</span>`;
        return `<span class="pill clickable ${x.cls}" role="button" tabindex="0" data-entity="${esc(x.entity)}" title="${esc(this._t(r))}"><span class="dot"></span>${k}<span class="v">${esc(v)}${unit ? ` ${esc(unit)}` : ""}</span></span>`;
      })
      .join("");
    const lines = [];
    if (m.pump) {
      const on = pumpOn(m.pump);
      lines.push(`<div class="line ${on ? "active" : "idle"}">${svgIcon(ICONS.pump)}<span>${esc(this._subtitle(m))}</span></div>`);
    }
    const tip = m.tips[0];
    if (tip) lines.push(`<div class="line tip-line ${tip.cls}">${svgIcon(tip.cls === "crit" ? ICONS.alert : ICONS.info)}<span>${esc(this._t(tip.key))}</span></div>`);
    const controls = this._controls(m, true);
    return `<style>${BASE_STYLE}${MINI_STYLE}${accentStyle(this._hass)}</style>
      <ha-card>
        ${this._header(m, "")}
        <div class="content">
          ${this._sceneHtml(m)}
          <div class="info">
            ${pills ? `<div class="pills">${pills}</div>` : ""}
            ${lines.join("")}
          </div>
          ${controls ? `<div class="controls">${controls}</div>` : ""}
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const ENTITY_DOMAINS = {
  water_temperature: ["sensor"],
  air_temperature: ["sensor"],
  ph: ["sensor"],
  orp: ["sensor"],
  chlorine: ["sensor"],
  salt: ["sensor"],
  tds: ["sensor"],
  pump: ["switch", "select", "fan", "input_boolean", "binary_sensor"],
  pump_speed: ["select"],
  filtration_time: ["sensor"],
  filtration_target: ["sensor"],
  heat_pump: ["climate"],
  electrolyser: ["switch", "input_boolean", "sensor", "number", "select"],
  light: ["light", "switch", "input_boolean"],
  cover: ["cover"],
};

class PoolEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  static extraFields() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "device", selector: { device: {} } },
      { name: "title", selector: { text: {} } },
      { name: "kind", selector: { select: { mode: "dropdown", options: ["auto", "pool", "spa"].map((v) => ({ value: v, label: tr(`kind_${v}`) })) } } },
      {
        type: "expandable",
        name: "",
        flatten: true,
        title: tr("entities"),
        icon: "mdi:format-list-bulleted",
        schema: ROLES.map((name) => ({ name, selector: { entity: { domain: ENTITY_DOMAINS[name] } } })),
      },
      ...this.constructor.extraFields(tr),
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _label(name) {
    const m = /^(.*)_(min|max)$/.exec(name);
    if (m && METRIC_ROLES.includes(m[1])) return `${t(this._hass, this._config, m[1])} · ${t(this._hass, this._config, m[2])}`;
    return t(this._hass, this._config, name);
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => this._label(s.name);
      this._form.computeHelper = (s) => (s.name === "device" ? t(this._hass, this._config, "device_helper") : s.name === "zoom" ? t(this._hass, this._config, "zoom_helper") : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = { ...Object.fromEntries(toggles), kind: "auto", collapsed: DEFAULT_COLLAPSED };
        for (let [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and options left at their default.
          if (v && typeof v === "object" && !Array.isArray(v)) {
            v = config[k] = { ...v };
            for (const [sk, sv] of Object.entries(v)) if (sv === "" || sv === undefined || sv === null) delete v[sk];
            if (!Object.keys(v).length) delete config[k];
          } else if (v === "" || v === undefined || v === null || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { kind: "auto", collapsed: DEFAULT_COLLAPSED, ...this._config };
    for (const f of this.constructor.extraFields(() => "")) if (f.type === "expandable" && f.name) data[f.name] = { ...data[f.name] };
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    this._form.hass = this._hass;
    if (this._dataFor !== this._config) {
      this._dataFor = this._config;
      this._form.data = data;
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

class PoolCardEditor extends PoolEditorBase {
  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["show_controls", true],
      ["show_advice", true],
      ["show_filtration", true],
      ["show_equipment", true],
    ];
  }

  static extraFields(tr) {
    return [
      { name: "filtration_hours", selector: { number: { min: 0, max: 24, step: 0.5, mode: "box", unit_of_measurement: "h" } } },
      {
        name: "collapsed",
        selector: { select: { multiple: true, mode: "list", options: SECTIONS.map((value) => ({ value, label: tr(value) })) } },
      },
      {
        type: "expandable",
        name: "ranges",
        title: tr("ranges"),
        icon: "mdi:tune-vertical",
        schema: METRIC_ROLES.flatMap((r) => ["min", "max"].map((b) => ({ name: `${r}_${b}`, selector: { number: { mode: "box", step: "any" } } }))),
      },
    ];
  }
}

class PoolMiniCardEditor extends PoolEditorBase {
  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["show_controls", true],
      ["zoom", true],
    ];
  }

  // The detailed view of the mini card draws the full card: its ranges and filtration target apply there too.
  static extraFields(tr) {
    return PoolCardEditor.extraFields(tr).filter((f) => f.name !== "collapsed");
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("pool-card", PoolCard);
define("pool-mini-card", PoolMiniCard);
define("pool-card-editor", PoolCardEditor);
define("pool-mini-card-editor", PoolMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "pool-card",
    name: "Pool Card",
    description: "Swimming pool or spa: water quality gauges with ideal ranges and advice, animated water, filtration time of the day, pump, lighting, heat pump, electrolyser and cover.",
  },
  {
    type: "pool-mini-card",
    name: "Pool Mini Card",
    description: "Compact pool or spa summary: water temperature, pH, ORP or chlorine, filtration and quick pump and light buttons.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-pool-card" });
}

console.info(`%c POOL-CARD %c v${VERSION} `, "color: white; background: #0277bd; font-weight: 700;", "color: #0277bd; background: white; font-weight: 700;");
