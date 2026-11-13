# Changelog

## 1.0.0 - 2026-11-13

### Features
- **Pool Card** (`custom:pool-card`): animated pool or spa scene (water rippling while the pump filters, spa bubbles, heat pump fan and flame while it heats, underwater light glowing in its color, roller cover unrolling and rolling back, the water turning green when the disinfection is too low), water temperature, air temperature, colored gauges with ideal ranges for pH, ORP, free chlorine, salt, TDS and water temperature, advice for every value out of its range and for equipment running without water flow, filtration state, speed and time of the day against a daily target, control buttons and an equipment section (heat pump target, electrolyser, cover, light).
- **Pool Mini Card** (`custom:pool-mini-card`): compact summary (scene, values with their level, filtration of the day, first advice, pump and light buttons) with a detail button that switches to the full card.
- Entities discovered from a device (iopool, ESPHome, Pentair ScreenLogic and IntelliCenter, Hayward OmniLogic, Jandy iAquaLink, Blue Riiot through MQTT…), whatever their ids or language, each one replaceable in the options; pump as a switch, a select (speeds) or a fan (presets).
- Filtration time of the day from a sensor (a `history_stats` sensor, a controller's counter) or computed from the pump's history; target from the options, from iopool's recommendation or water temperature ÷ 2.
- Ideal ranges configurable per measure (`ranges`), in the unit of each sensor (°C / °F, g/L / ppm).
- Stopping the pump while the heat pump heats (pump button, or the *off* option of its speed select) asks for a confirmation (popup at the top of the card, Cancel focused).
- Default ideal ranges after the CDC, the CDC MAHC and the WHO, with spa-specific chlorine and temperature, salt per unit (ppm for US controllers, g/L for European cells) and a salt pool's TDS including its salt.
- Visual editor for both cards, 22 languages (English in the bundle, the others loaded on demand), light and dark themes, `prefers-reduced-motion` honoured.
