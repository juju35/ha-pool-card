# Changelog

## 1.6.5 - 2026-11-27

### Fixes
- Idle states use the theme's secondary text colour (`--secondary-text-color`), like every ha-* card.

## 1.6.4 - 2026-11-24

### Maintenance
- The card source is split into ES modules: `src/` (entry `src/index.js`), cut at its sections, with the translations in one file per language (`i18n/<lang>.js`). `scripts/bundle.mjs` concatenates them back, in their original order, into the same single file and per-language files as before; the tests evaluate that bundle.

## 1.6.3 - 2026-11-22

### Performance
- Card picker: the previews are back (`preview: true`), and light. Each card's preview is drawn only once it scrolls into view of Home Assistant's card picker, which otherwise builds the preview of every card at once: until then it holds Home Assistant's state (no render, no history request, no animation). On a dashboard or in the card editor the card is drawn as before.

## 1.6.2 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.6.1 - 2026-11-20

### Performance
- The pool robot's parts (time left, cycle, mode, filter, battery) and a sauna's entities are read from an index of the entity registry by device, built once per registry, instead of a scan of the whole registry on every state change.
- The pool robot of its own is looked up again only when the entity registry or the number of entities changes, not on every state change; the entity ids are listed once per state update for every card.

### Maintenance
- README: `collapsed` also folds the `robot` section.
- Tests: the coverage report now measures the card source itself.

## 1.6.0 - 2026-11-18

### Features
- **Sauna**: a third kind beside pool and spa (`kind: sauna`, or a device named like a sauna in any language or made by Huum, Harvia or Tylö). Its heater (`climate`, or a `switch` / smart plug with `target_temperature`), temperature, humidity, door, time to temperature and session are found on its device or set one by one (`heater`, `temperature`, `humidity`, `door`, `ready_time`, `session`). A wooden cabin in the header: the fire burns in the heater while it is on, the stones glow and steam rises while it heats. *Heating*, *Ready* or *Door open* in the pill; *Ready in 18 min* or the session's time left under the title; a progress bar to the target, target − / + and heater buttons; an alert when the door is open while it heats. Its mini card shows the temperature and humidity with round buttons.

## 1.5.0 - 2026-11-18

### Features
- **Pool robot**: a `vacuum` (MyDolphin Plus, Maytronics One, iAqualink Robots…) or a plug powering the robot, found on the pool's device or as the pool robot of its own, or set with `robot` (`false` for none). It crawls along the floor of the pool in the scene while it cleans, a dotted trail behind it; a *Robot* button starts it and sends it back; its section shows its state or cleaning mode, the time left of its cycle (a ring when the cycle's length is known), Start / Pause / Return as the robot supports them, its cleaning modes as buttons, its filter basket and battery. `show_robot: false` hides it all.
- **Pool robot on the mini card**: a line while it cleans (*Robot · Cleaning · 1 hr 12 min left*) and a round button to start it or send it back.

## 1.4.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.4.0 - 2026-11-17

### Features
- Illustrated header on the full and the mini card (90 px): the pool seen from above on a lawn, with its animated scene (ripples and current while filtering, the cover unrolling, the light glowing, the heat pump), the title and subtitle on the grass at its left and a strip of coping stones along the bottom. It turns to night after sunset (`sun.sun`) or with the dark theme, and the new `illustration_theme` option (`auto`, `day`, `night`) forces it. `illustration: false` keeps the classic header. Both options are in the visual editor of both cards.
- The header icon's colour now always tells the state: red or amber when the water needs care, the accent while the filtration, the heating, the cover or the light is on, grey at rest.
- Each card draws its scene with its own SVG ids, so several pool cards on one page no longer share their gradients.
- The status pill sits in the header icon's colour, right after the title only when the whole title and its whole label fit there (the title is never cut for it), else on a line of its own under the subtitle (kept to one line); when even that does not fit in the header, and on cards 200 px wide or less, only its dot stays (the status in its tooltip). Measured on the rendered header, so it holds in every language, in both headers. The mini card's detail button is a small frosted round button in the banner's top right corner, the pool stepping aside for it (in the card's corner with the classic header).

### Fixes
- Night picture with the dark theme even while the sun is up (`illustration_theme: auto`): the header is night when `sun.sun` is below the horizon or Home Assistant's theme is dark; `day` / `night` still force it.

## 1.3.0 - 2026-11-15

### Features
- New `power` and `energy` options for the pool's electrical consumption: an instantaneous power sensor (W or kW) and a cumulative energy sensor (Wh, kWh or MWh), shown as two rows in the filtration section. The power also tells at a glance that the filtration is running. Both are discovered from the device (a sensor of device class `power` or `energy`) or set one by one, and are available in the visual editor (#14).

## 1.2.0 - 2026-11-15

### Features
- New `invert_cover` option for a cover driven by a `switch` or an `input_boolean`: when the relay is wired the other way round, `on` is read as rolled back and `off` as covering the pool. The state, the open / close button, the hero line, the scene and the equipment tile all follow it. It has no effect on a real `cover` entity, and is available in the visual editor (#12).

## 1.1.0 - 2026-11-14

### Features
- The cover can now be a `switch` or an `input_boolean`, not only a `cover` entity (for a roller cover driven by a relay): `on` means it covers the pool, `off` that it is rolled back. The open / close button, the hero line, the scene and the equipment tile follow it, and the button turns it on and off. A switch named *cover* / *volet* / *roller*… on the device is discovered as the cover too, a real `cover` entity still winning when both are present (#10).

## 1.0.2 - 2026-11-14

### Fixes
- Mini card visual editor: it now offers the full card's options that its detailed view uses (`show_advice`, `show_filtration`, `show_equipment`, `collapsed`), which could only be set in YAML.

## 1.0.1 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so the unfolded sections, the confirmation popup and the detail view of the mini card stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything, and keyboard clicks still work.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state, instead of coming back unfolded or with its popup open.
- Clicks no longer get lost under an update: Home Assistant updates the card several times a second, and a rewrite between the press and the release replaced the element pressed, so the click did nothing. The card is not rewritten while pressed; the pending update is drawn right after the click.
- No focus ring after a mouse click: the focus is put back on the clicked element after an update only for the keyboard.

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
