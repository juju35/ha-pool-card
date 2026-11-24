// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { clamp, domainOf, esc, fmtHours, fmtNum, humanize, intlLocale, norm, num, svgIcon, t, toHours, valid } from "./helpers.js";
import { DEFAULT_COLLAPSED, METRIC_ROLES, SENSOR_ROLES, autoDevice, deviceName, kindOf, robotParts, setupOf } from "./entity-roles-discovery.js";
import { saunaSetupOf, sessionHours } from "./sauna.js";
import { RANK, levelOf, rangeOf, scaleOf, tdsRange, trackOf, worst } from "./water-quality.js";
import { HISTORY_MS, coverInfo, heating, isOffOption, isOn, midnight, pumpOn, runHours, speedsOf } from "./equipment.js";
import { FIRE, isNight, lawnSvg, saunaSvg, sceneSvg } from "./animated-water.js";
import { BASE_STYLE, FULL_STYLE, MINI_STYLE } from "./styles.js";

export let pcUid = 0;

// Home Assistant dialogs (more-info opened from the card): a click there is not a click elsewhere on the page.
export const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
export const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};
// After the popup closes, clicks are ignored this long (second click of a double click on OK).
export const CONFIRM_GUARD_MS = 400;

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. The handler runs when the press and the release are both outside the card (a slider dragged out of the
// card does not count, and a scroll cancels the pointer); keyboard clicks (no click count) still go through the click
// event. The handler keeps its own checks (dialogs opened from the card…). `tap(ev)` is for the tests.
export const watchOutside = (card, handler) => {
  let downOutside = false;
  const outside = (ev) => !ev.composedPath().includes(card);
  const onDown = (ev) => {
    downOutside = outside(ev);
  };
  const onUp = (ev) => {
    if (downOutside && outside(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};

export class PoolCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = `-${++pcUid}`;
    this._html = "";
    this._toggled = new Map();
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Enter / Space on an element with the button role acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      // Used from the keyboard: the focus is kept across the rewrites again.
      this._byPointer = false;
      if ((ev.key !== "Enter" && ev.key !== " ") || ev.target?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      ev.target.click();
    });
    // No rewrite of the card between the press and the release: Home Assistant updates the card several times a
    // second, and a rewrite under the pointer replaces the element pressed, so that the click lands on the card
    // itself and does nothing. The pending render is done once released (after the click). A press also means the
    // pointer is in use: the focus is not put back on the clicked element after a rewrite (no focus ring).
    this.shadowRoot.addEventListener("pointerdown", () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    });
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        if (!this._pressing) return;
        this._pressing = false;
        if (this._dirty) {
          this._dirty = false;
          this._update();
        }
      }, 0);
    };
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
    const sauna = saunaSetupOf(h, this._config);
    if (sauna) {
      if (sauna.error) return null;
      // A timer's time left moves on its own: redrawn every minute (see the tick in connectedCallback).
      const timer = domainOf(sauna.roles.session) === "timer" ? Math.floor(Date.now() / 60000) : null;
      return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, timer, ...Object.values(sauna.roles).map((id) => h.states[id])];
    }
    const setup = setupOf(h, this._config);
    if (setup.error) return null;
    const ids = Object.values(setup.roles);
    if (setup.roles.robot) ids.push(...Object.values(robotParts(h, setup.roles.robot)));
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
    (this._onOutsideWatch ??= watchOutside(this, (ev) => this._onOutside(ev))).on();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    // Back on the page after leaving it: rendered again in its default state.
    this._update?.();
    if (this._confirm) window.addEventListener("keydown", this._onKey);
    // The filtration time of the day moves on its own while the pump runs: re-checked every minute.
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
  }

  // The status pill goes right after the title only when the whole title and the whole label fit there; otherwise it
  // takes a line of its own under the subtitle (.below, the subtitle kept to one line, its whole text in its tooltip).
  // When the label does not fit that line either, or the banner has no room for the lines above its ground strip, the
  // pill keeps its dot only (.dot-only, back beside the title when the dot fits there). Measured after render, so that
  // it holds in every language.
  _fitPill() {
    const root = this.shadowRoot;
    if (!root?.querySelectorAll || typeof getComputedStyle !== "function") return;
    for (const t of root.querySelectorAll(".titles")) {
      const chip = t.querySelector(".title-row > .chip");
      t.classList.remove("below", "dot-only");
      if (!chip?.getClientRects().length) continue;
      const row = chip.parentElement;
      const name = row.querySelector(".name");
      const fits = () => {
        let title = 0;
        if (name && getComputedStyle(name).display !== "none") {
          const range = document.createRange();
          range.selectNodeContents(name);
          const cs = getComputedStyle(name);
          title = Math.max(name.scrollWidth, range.getBoundingClientRect().width) + (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.marginRight) || 0) +
            (parseFloat(getComputedStyle(row).columnGap) || 0);
        }
        return title + chip.getBoundingClientRect().width <= row.getBoundingClientRect().width + 0.5;
      };
      if (fits()) continue;
      t.classList.add("below");
      for (const sub of t.querySelectorAll(".sub")) sub.title = sub.scrollWidth > sub.clientWidth ? sub.textContent.trim() : "";
      const text = chip.querySelector(".chip-text");
      const banner = t.closest(".banner");
      const tb = t.getBoundingClientRect();
      const bb = banner?.getBoundingClientRect();
      const ground = banner ? parseFloat(getComputedStyle(banner).getPropertyValue("--pc-g")) || 0 : 0;
      const tall = !!bb && (tb.top < bb.top - 0.5 || tb.bottom > bb.bottom - ground + 0.5);
      if (!tall && !(text && text.scrollWidth > text.clientWidth + 0.5)) continue;
      t.classList.add("dot-only");
      t.classList.remove("below");
      if (!fits()) t.classList.add("below");
    }
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    this._tick = null;
    this._onOutsideWatch?.off();
    this._resize?.disconnect();
    this._fitWidth = null;
    this._pressing = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    // Left (another dashboard view, a conditional card hidden): back to the default state, so that the card does
    // not come back unfolded or with its popup open.
    this._toggled = new Map();
    this._confirm = null;
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
    // Held while the card is pressed (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    let html = this._render();
    if (this._confirm) html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    if (html === this._html) return;
    // For the keyboard only: after a click, it would draw the focus ring on the clicked element.
    const focused = this._byPointer ? null : this.shadowRoot.activeElement;
    const key = focused?.dataset ? JSON.stringify({ ...focused.dataset }) : null;
    this._html = html;
    this.shadowRoot.innerHTML = html;
    this._fitPill();
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
    const sauna = saunaSetupOf(this._hass, this._config);
    if (sauna) return sauna.error ? sauna : this._saunaModel(sauna);
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
    const robot = roles.robot ? this._robot(roles.robot) : null;
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
    return { ...setup, name: name || this._t(kind), kind, metrics, quality, tips, status, water, pump, hp, electro, robot };
  }

  // The sauna: its heater (a climate, or a switch with `target_temperature`), temperature (the heater's current one
  // when there is no sensor), humidity, door, time to temperature and session. Ready once within 1 °C (2 °F) of the
  // target; the door open while it heats is an alert.
  _saunaModel(setup) {
    const c = this._config;
    const r = setup.roles;
    const heater = this._s(r.heater);
    const climate = domainOf(r.heater) === "climate";
    const tempS = this._s(r.temperature);
    let temp = num(tempS);
    let unit = tempS?.attributes?.unit_of_measurement || "";
    if (temp === null && climate && Number.isFinite(heater?.attributes?.current_temperature)) temp = heater.attributes.current_temperature;
    if (!unit) unit = this._hass.config?.unit_system?.temperature || "°C";
    const t = climate ? heater?.attributes?.temperature : parseFloat(c.target_temperature);
    const target = Number.isFinite(t) ? t : null;
    const online = valid(heater) || (!heater && temp !== null);
    const on = valid(heater) && (climate ? heater.state !== "off" : heater.state === "on");
    const ready = on && target !== null && temp !== null && temp >= target - (/F/.test(unit) ? 2 : 1);
    const heatingNow = on && !ready;
    const door = this._s(r.door);
    const doorOpen = valid(door) && door.state === "on";
    const readyIn = heatingNow ? toHours(this._s(r.ready_time)) : null;
    const sessionLeft = sessionHours(this._s(r.session));
    const tips = doorOpen && on ? [{ cls: "crit", key: "door_open_heating" }] : [];
    const cls = !online ? "idle" : doorOpen && on ? "crit" : heatingNow ? "warn" : ready ? "ok" : "idle";
    const label = !online ? "unavailable" : doorOpen && on ? "door_open" : heatingNow ? "heating" : ready ? "sauna_ready" : "off";
    const name = c.title || deviceName(setup.device) || this._t("sauna");
    return {
      ...setup,
      kind: "sauna",
      name,
      climate,
      temp,
      unit,
      target,
      humidity: num(this._s(r.humidity)),
      online,
      on,
      ready,
      heating: heatingNow,
      doorOpen,
      readyIn: readyIn !== null && readyIn > 0 ? readyIn : null,
      sessionLeft,
      tips,
      cls,
      status: cls,
      label: this._t(label),
      // How far the cabin is from the target, for the thermometer and the progress bar.
      level: target && temp !== null ? clamp(temp / target, 0, 1) : 0,
    };
  }

  // The pool robot: its state (a vacuum's, or on / off for a plug), whether it cleans, the time left of its cycle, its
  // mode, filter basket and battery.
  _robot(id) {
    const st = this._s(id);
    const d = domainOf(id);
    const parts = robotParts(this._hass, id);
    let state = !valid(st) ? "unavailable" : d === "vacuum" ? st.state : st.state === "on" ? "cleaning" : "off";
    if (!["cleaning", "returning", "docked", "paused", "error", "idle", "off", "unavailable"].includes(state)) state = "idle";
    const left = parts.left ? toHours(this._s(parts.left)) : null;
    const total = parts.total ? toHours(this._s(parts.total)) : null;
    const filter = this._s(parts.filter);
    let filterFull = null;
    if (valid(filter)) filterFull = domainOf(filter.entity_id) === "binary_sensor" ? filter.state === "on" : /full|plein|voll|lleno|pieno|clog|dirty|sale|sporco|sucio/.test(norm(filter.state));
    const mode = this._s(parts.mode);
    const battery = parts.battery ? num(this._s(parts.battery)) : Number.isFinite(st?.attributes?.battery_level) ? st.attributes.battery_level : null;
    const label = ["cleaning", "returning", "docked", "paused", "error"].includes(state) ? `robot_${state}` : state;
    return {
      id,
      d,
      st,
      state,
      on: state === "cleaning",
      label,
      left: state === "cleaning" || state === "paused" ? left : null,
      total,
      parts,
      mode: valid(mode) ? { id: mode.entity_id, options: mode.attributes?.options || [], current: mode.state } : null,
      filterFull,
      battery,
      features: Number(st?.attributes?.supported_features) || 0,
    };
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

  // The header icon's colour tells the state: red or amber when the water needs care, the accent while something
  // runs or shines (filtration, heating, cover moving, light on), grey at rest.
  _iconCls(m) {
    if (m.kind === "sauna") return m.cls;
    if (m.status === "crit" || m.status === "warn") return m.status;
    const s = this._scene(m);
    return s.running || s.light ? "active" : "idle";
  }

  _illustrated() {
    return this._config.illustration !== false;
  }

  // The illustrated banner (the pool on its lawn, the title on the grass), or the classic header with
  // `illustration: false`.
  _header(m, sub) {
    const label = m.kind === "sauna" ? m.label : this._statusText(m.status);
    const icon = `<div class="type-icon ${this._iconCls(m)}">${m.kind === "sauna" ? `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${FIRE}"/></svg>` : svgIcon(m.kind === "spa" ? ICONS.spa : ICONS.pool)}</div>`;
    // The status pill, in the header icon's colour.
    const chip = `<span class="chip ${this._iconCls(m)}" title="${esc(label)}" aria-label="${esc(label)}"><span class="dot"></span><span class="chip-text">${esc(label)}</span></span>`;
    const titles = (zoom) => `
        <div class="titles">
          <div class="title-row">
            <div class="name">${esc(m.name)}</div>
            ${chip}${zoom}
          </div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>`;
    if (!this._illustrated()) return `<div class="header">${icon}${titles(this._zoomButton())}</div>`;
    const night = isNight(this._hass, this._config);
    if (m.kind === "sauna")
      return `
      <div class="banner sauna${night ? " night" : ""}">
        ${this._saunaScene(m, night)}
        <div class="htext">${icon}${titles("")}</div>
        ${this._zoomButton()}
        <div class="ground g-bench"></div>
      </div>`;
    return `
      <div class="banner${night ? " night" : ""}">
        ${lawnSvg(this._uid, night)}${this._sceneHtml(m, night)}
        <div class="htext">${icon}${titles("")}</div>
        ${this._zoomButton()}
        <div class="ground g-coping"></div>
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
      const ci = coverInfo(cover, this._config.invert_cover);
      coverPart = ci.part;
      coverMove = ci.moving;
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
      robot: m.robot && this._config.show_robot !== false ? { on: m.robot.on } : null,
    };
    s.running = s.filtering || s.heat || !!coverMove || !!s.robot?.on;
    return s;
  }

  // The scene: in the banner (`night` given: drawn from the deck's top edge, dark at night), else beside the big value.
  _sceneHtml(m, night) {
    const s = this._scene(m);
    const banner = night !== undefined;
    const dark = (banner ? night : this._hass.themes?.darkMode) ? " dark" : "";
    const svg = sceneSvg({ ...s, uid: this._uid, ...(banner ? { viewBox: "0 6 120 90" } : {}) });
    return `<div class="scene clickable ${m.water}${dark}${s.running ? " running" : ""}" role="button" tabindex="0" aria-label="${esc(m.name)}" data-entity="${esc(m.metrics.water_temperature?.entity || m.roles.pump || "")}">${svg}</div>`;
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
    lines.push(this._robotLine(m));
    const coverHero = valid(cover) ? coverInfo(cover, this._config.invert_cover) : null;
    if (coverHero && (coverHero.closed || coverHero.moving)) {
      lines.push(`<div class="line">${svgIcon(ICONS.cover)}<span>${esc(`${this._t("cover")} · ${this._t(coverHero.key)}`)}</span></div>`);
    }
    const big = w
      ? `<div class="big clickable" role="button" tabindex="0" data-entity="${esc(w.entity)}" aria-label="${esc(`${this._t("water_temperature")} ${this._value(w).v} ${w.unit}`)}"><span class="val">${esc(this._value(w).v)}<small>${esc(w.unit)}</small></span><span class="lbl">${esc(this._t("water"))}</span></div>`
      : "";
    return `<div class="hero">${this._illustrated() ? "" : this._sceneHtml(m)}<div class="info">${big}${lines.join("")}</div></div>`;
  }

  // Control buttons of the equipment that can be switched: pump, light, heat pump, cover, electrolyser.
  // The robot while it cleans, with the time left of its cycle (hero of the full card, line of the mini card).
  _robotLine(m) {
    if (!m.robot?.on || this._config.show_robot === false) return "";
    const left = m.robot.left != null ? ` · ${this._t("time_left", { time: fmtHours(m.robot.left, this._locale()) })}` : "";
    return `<div class="line clickable" role="button" tabindex="0" data-entity="${esc(m.robot.id)}">${svgIcon(ICONS.robot)}<span>${esc(`${this._t("robot")} · ${this._t("robot_cleaning")}${left}`)}</span></div>`;
  }

  _controls(m, round = false) {
    if (this._config.show_controls === false) return "";
    const list = [];
    const btn = (action, entity, icon, label, on) => this._btn(action, entity, icon, label, on, round);
    const r = m.roles;
    if (m.pump && domainOf(r.pump) !== "binary_sensor") list.push(btn("pump", r.pump, ICONS.pump, this._t("pump"), pumpOn(m.pump)));
    const light = this._s(r.light);
    if (light && ["light", "switch", "input_boolean"].includes(domainOf(r.light))) list.push(btn("toggle", r.light, lightIcon(light), this._t("light"), isOn(light)));
    const robot = m.robot && this._config.show_robot !== false ? btn("robot", r.robot, ICONS.robot, this._t("robot"), m.robot.on) : "";
    if (round) return list.join("") + robot;
    if (m.hp) list.push(btn("heat_pump", r.heat_pump, ICONS.heat_pump, this._t("heat_pump"), valid(m.hp) && m.hp.state !== "off"));
    const cover = this._s(r.cover);
    if (cover) {
      const closed = coverInfo(cover, this._config.invert_cover).closed;
      list.push(btn("cover", r.cover, closed ? ICONS.cover : ICONS.cover_open, this._t(closed ? "open_cover" : "close_cover"), !closed));
    }
    if (m.electro && ["switch", "input_boolean"].includes(domainOf(r.electrolyser)))
      list.push(btn("toggle", r.electrolyser, ICONS.electrolyser, this._t("electrolyser"), m.electro.state === "on"));
    return list.join("") + robot;
  }

  _btn(action, entity, icon, label, on, round) {
    const off = !valid(this._s(entity));
    return `<button class="btn${round ? " round" : ""}${on ? " on" : ""}" data-action="${action}" data-entity="${esc(entity)}" title="${esc(label)}" aria-label="${esc(label)}" aria-pressed="${on ? "true" : "false"}"${off ? " disabled" : ""}>${svgIcon(icon)}${round ? "" : `<span>${esc(label)}</span>`}</button>`;
  }

  // ----- Sauna -------------------------------------------------------------

  _saunaScene(m, night) {
    const banner = night !== undefined;
    const dark = (banner ? night : this._hass.themes?.darkMode) ? " dark" : "";
    const svg = saunaSvg({ on: m.on, heating: m.heating, level: m.level, uid: this._uid });
    return `<div class="scene sauna-scene clickable${dark}${m.heating ? " running" : ""}" role="button" tabindex="0" aria-label="${esc(m.name)}" data-entity="${esc(m.roles.heater || m.roles.temperature || "")}">${svg}</div>`;
  }

  _temp(v, unit) {
    return `${fmtNum(v, 0, this._locale())} ${unit}`;
  }

  // Under the title: the time to temperature (or the target) while it heats, the session's time left once ready.
  _saunaSub(m) {
    if (!m.online) return this._t("unavailable");
    if (m.heating) {
      if (m.readyIn !== null) return this._t("ready_in", { time: fmtHours(m.readyIn, this._locale()) });
      return m.target !== null ? this._t("heating_to", { temp: this._temp(m.target, m.unit) }) : this._t("heating");
    }
    if (m.sessionLeft !== null) return this._t("session_left", { time: fmtHours(m.sessionLeft, this._locale()) });
    return m.target !== null ? `${this._t("target")} ${this._temp(m.target, m.unit)}` : this._t("sauna");
  }

  _saunaLines(m) {
    const r = m.roles;
    const lines = [];
    const line = (cls, icon, entity, html) => {
      const click = entity ? ` clickable" role="button" tabindex="0" data-entity="${esc(entity)}` : "";
      return `<div class="line${cls ? ` ${cls}` : ""}${click}">${svgIcon(icon)}<span>${html}</span></div>`;
    };
    if (m.humidity !== null) lines.push(line("", ICONS.humidity, r.humidity, `${esc(this._t("humidity"))} <b>${esc(fmtNum(m.humidity, 0, this._locale()))} %</b>`));
    if (m.target !== null) lines.push(line("", ICONS.thermometer, r.heater, `${esc(this._t("target"))} <b>${esc(this._temp(m.target, m.unit))}</b>`));
    if (m.heating && m.readyIn !== null) lines.push(line("warn", ICONS.timer, r.ready_time, esc(this._t("ready_in", { time: fmtHours(m.readyIn, this._locale()) }))));
    if (m.sessionLeft !== null) lines.push(line("", ICONS.timer, r.session, esc(this._t("session_left", { time: fmtHours(m.sessionLeft, this._locale()) }))));
    if (m.doorOpen) lines.push(line("crit tip-line", ICONS.door, r.door, esc(this._t("door_open"))));
    return lines;
  }

  _saunaControls(m, round = false) {
    if (this._config.show_controls === false || !m.roles.heater) return "";
    const r = m.roles;
    const list = [];
    if (m.climate && m.target !== null) {
      list.push(this._btn("temp_down", r.heater, ICONS.minus, this._t("lower_target"), false, true));
      list.push(this._btn("temp_up", r.heater, ICONS.plus, this._t("raise_target"), false, true));
    }
    list.push(this._btn(m.climate ? "heat_pump" : "toggle", r.heater, ICONS.power, this._t("heater"), m.on, round));
    return list.join("");
  }

  _saunaCard(m) {
    const c = this._config;
    const big =
      m.temp !== null
        ? `<div class="big clickable" role="button" tabindex="0" data-entity="${esc(m.roles.temperature || m.roles.heater)}" aria-label="${esc(`${this._t("temperature")} ${this._temp(m.temp, m.unit)}`)}"><span class="val">${esc(fmtNum(m.temp, 0, this._locale()))}<small>${esc(m.unit)}</small></span><span class="lbl">${esc(this._t("sauna"))}</span></div>`
        : "";
    const bar = m.on && m.target !== null ? `<div class="sbar" role="progressbar" aria-valuenow="${Math.round(m.level * 100)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(this._t("temperature"))}"><i style="width:${(m.level * 100).toFixed(0)}%"></i></div>` : "";
    const parts = [`<div class="hero">${this._illustrated() ? "" : this._saunaScene(m)}<div class="info">${big}${bar}${this._saunaLines(m).join("")}</div></div>`];
    const controls = this._saunaControls(m);
    if (controls) parts.push(`<div class="controls">${controls}</div>`);
    if (m.tips.length && c.show_advice !== false) parts.push(this._advice(m));
    return `<style>${BASE_STYLE}${FULL_STYLE}${accentStyle(this._hass)}${saunaAccent(this._hass)}</style>
      <ha-card>
        ${this._header(m, this._saunaSub(m))}
        <div class="content">${parts.join("")}</div>
      </ha-card>`;
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
    // Instantaneous electrical consumption: the real-time power of the pool, which also confirms the pump is running.
    const sensorRow = (entity, icon, key) => {
      const s = this._s(entity);
      if (!s) return;
      const v = num(s);
      const unit = s.attributes?.unit_of_measurement || "";
      const text = !valid(s) ? this._t("unavailable") : v === null ? s.state : `${fmtNum(v, Number.isInteger(v) ? 0 : 1, loc)}${unit ? ` ${unit}` : ""}`;
      rows.push(
        `<div class="row clickable" role="button" tabindex="0" data-entity="${esc(entity)}"><span class="k">${svgIcon(icon)}${esc(this._t(key))}</span><span class="v">${esc(text)}</span></div>`,
      );
    };
    sensorRow(r.power, ICONS.flash, "power");
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
    // Cumulative energy consumed by the pool.
    sensorRow(r.energy, ICONS.counter, "energy");
    if (!rows.length) return "";
    return this._section("filtration", ICONS.pump, this._t("filtration"), `<div class="filtration">${rows.join("")}</div>`);
  }

  // The pool robot: its state and the time left of its cycle (a ring when the cycle's length is known), start, pause
  // and return buttons (those the vacuum supports; on / off for a plug), its cleaning mode, filter basket and battery.
  _robotSection(m) {
    const rb = m.robot;
    if (!rb || this._config.show_robot === false) return "";
    const loc = this._locale();
    const off = rb.state === "unavailable";
    const frac = rb.left != null && rb.total ? clamp(1 - rb.left / rb.total, 0, 1) : rb.on ? null : 0;
    const C = 2 * Math.PI * 26;
    const ring = `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="rt" cx="32" cy="32" r="26"/>${
      frac != null ? `<circle class="rv" cx="32" cy="32" r="26" stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/>` : `<circle class="rv spin" cx="32" cy="32" r="26" stroke-dasharray="${(C * 0.25).toFixed(1)} ${C.toFixed(1)}"/>`
    }<path d="${ICONS.robot}" transform="translate(20 20)"/></svg>`;
    const title = rb.on && rb.mode?.current ? humanize(rb.mode.current) : this._t(rb.label);
    const sub = [rb.on && rb.mode?.current ? this._t("robot_cleaning") : "", rb.left != null ? this._t("time_left", { time: fmtHours(rb.left, loc) }) : ""].filter(Boolean).join(" · ");
    const act = (cmd, icon, key, enabled = true) =>
      `<button class="btn" data-action="robot_cmd" data-cmd="${cmd}" data-entity="${esc(rb.id)}"${off || !enabled ? " disabled" : ""}>${svgIcon(icon)}<span>${esc(this._t(key))}</span></button>`;
    const F = rb.features;
    let buttons = "";
    if (rb.d === "vacuum") {
      const list = [];
      if (rb.state !== "cleaning") list.push(act("start", ICONS.play, "start"));
      if (rb.state === "cleaning" && F & 4) list.push(act("pause", ICONS.pause, "pause"));
      if (rb.state === "cleaning" && !(F & 4) && F & 8) list.push(act("stop", ICONS.pause, "stop"));
      if (F & 16 && !["docked", "returning"].includes(rb.state)) list.push(act("return_to_base", ICONS.home, "return_home"));
      buttons = list.join("");
    } else buttons = act("toggle", rb.on ? ICONS.pause : ICONS.play, rb.on ? "stop" : "start");
    const head = `<div class="robot-row${rb.on ? " on" : ""}${rb.state === "error" ? " crit" : ""}"><div class="clickable" role="button" tabindex="0" data-entity="${esc(rb.id)}" aria-label="${esc(this._t("robot"))}">${ring}</div><div class="robot-info"><div class="robot-title">${esc(title)}</div>${sub ? `<div class="robot-sub">${esc(sub)}</div>` : ""}<div class="robot-btns">${buttons}</div></div></div>`;
    let modes = "";
    if (rb.mode && rb.mode.options.length >= 2) {
      const moff = !valid(this._s(rb.mode.id));
      modes = `<div class="row"><span class="k">${svgIcon(ICONS.robot)}${esc(this._t("robot_mode"))}</span><div class="speeds">${rb.mode.options
        .map((o) => `<button class="btn${o === rb.mode.current ? " on" : ""}" data-action="robot_mode" data-entity="${esc(rb.mode.id)}" data-option="${esc(o)}" aria-pressed="${o === rb.mode.current ? "true" : "false"}"${moff ? " disabled" : ""}><span>${esc(humanize(o))}</span></button>`)
        .join("")}</div></div>`;
    }
    const chips = [];
    if (rb.filterFull != null) chips.push(`<span class="chip ${rb.filterFull ? "warn" : "ok"} clickable" role="button" tabindex="0" data-entity="${esc(rb.parts.filter)}"><span class="chip-text">${esc(this._t(rb.filterFull ? "filter_full" : "filter_ok"))}</span></span>`);
    if (rb.battery != null) chips.push(`<span class="chip idle clickable" role="button" tabindex="0" data-entity="${esc(rb.parts.battery || rb.id)}"><span class="chip-text">${esc(`${this._t("battery")} ${Math.round(rb.battery)} %`)}</span></span>`);
    const body = `<div class="robot-body">${head}${modes}${chips.length ? `<div class="robot-chips">${chips.join("")}</div>` : ""}</div>`;
    return this._section("robot", ICONS.robot, this._t("robot"), body);
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
      const ci = coverInfo(cover, this._config.invert_cover);
      const value = !valid(cover) ? this._t("unavailable") : `${this._t(ci.key)}${Number.isFinite(ci.pos) && ci.pos > 0 && ci.pos < 100 ? ` · ${Math.round(ci.pos)} %` : ""}`;
      tiles.push(tile(r.cover, ci.shut ? ICONS.cover : ICONS.cover_open, this._t("cover"), value, ci.shut ? "idle" : "active"));
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
    if (m.kind === "sauna") return this._saunaCard(m);
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
    parts.push(this._robotSection(m));
    if (c.show_equipment !== false) parts.push(this._equipment(m));
    return `<style>${BASE_STYLE}${FULL_STYLE}${accentStyle(this._hass)}</style>
      <ha-card>
        ${this._header(m, this._subtitle(m))}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  // ----- Actions -----------------------------------------------------------

  _onClick(ev) {
    // The press is over: what the click changes is drawn at once (and a pending update with it).
    this._pressing = false;
    if (ev.detail === 0) this._byPointer = false;
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
    if (action === "robot") {
      if (domainOf(entity) !== "vacuum") return this._call(domainOf(entity), s.state === "on" ? "turn_off" : "turn_on", { entity_id: entity });
      const F = Number(s.attributes?.supported_features) || 0;
      if (s.state !== "cleaning") return this._call("vacuum", "start", { entity_id: entity });
      return this._call("vacuum", F & 16 ? "return_to_base" : F & 8 ? "stop" : "pause", { entity_id: entity });
    }
    if (action === "robot_cmd") {
      const cmd = el.dataset.cmd;
      if (cmd === "toggle") return this._call(domainOf(entity), s.state === "on" ? "turn_off" : "turn_on", { entity_id: entity });
      return this._call("vacuum", cmd, { entity_id: entity });
    }
    if (action === "robot_mode") return this._call("select", "select_option", { entity_id: entity, option: el.dataset.option });
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
      const d = domainOf(entity);
      if (d === "switch" || d === "input_boolean") return this._call(d, s.state === "on" ? "turn_off" : "turn_on", { entity_id: entity });
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

export const METRIC_ICONS = {
  water_temperature: ICONS.water_temp,
  air_temperature: ICONS.air,
  ph: ICONS.ph,
  orp: ICONS.orp,
  chlorine: ICONS.chlorine,
  salt: ICONS.salt,
  tds: ICONS.tds,
};
export const lightIcon = (s) => (isOn(s) ? ICONS.light_on : ICONS.light);
// The sauna's accent: the heater's warm orange instead of the water's blue.
export const saunaAccent = (hass) => `:host { --pc-accent: ${hass?.themes?.darkMode ? "#ff922b" : "#e8590c"}; }`;
export const accentStyle = (hass) => `:host { --pc-accent: ${hass?.themes?.darkMode ? "#4fc3f7" : "#0277bd"}; }`;

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
export class PoolMiniCard extends PoolCard {
  // The sauna's mini card: its temperature and humidity, the door alert, and round buttons (target, heater).
  _saunaMini(m) {
    const loc = this._locale();
    const pills = [];
    if (m.temp !== null)
      pills.push(
        `<span class="pill clickable ${m.cls}" role="button" tabindex="0" data-entity="${esc(m.roles.temperature || m.roles.heater)}" title="${esc(this._t("temperature"))}"><span class="dot"></span><span class="v">${esc(this._temp(m.temp, m.unit))}</span></span>`,
      );
    if (m.humidity !== null)
      pills.push(
        `<span class="pill clickable" role="button" tabindex="0" data-entity="${esc(m.roles.humidity)}" title="${esc(this._t("humidity"))}">${svgIcon(ICONS.humidity)}<span class="v">${esc(fmtNum(m.humidity, 0, loc))} %</span></span>`,
      );
    const banner = this._illustrated();
    const lines = [];
    if (!banner) lines.push(`<div class="line ${m.heating ? "warn" : m.ready ? "active" : "idle"}">${svgIcon(ICONS.timer)}<span>${esc(this._saunaSub(m))}</span></div>`);
    if (m.doorOpen) lines.push(`<div class="line tip-line crit">${svgIcon(ICONS.door)}<span>${esc(this._t("door_open"))}</span></div>`);
    const controls = this._saunaControls(m, true);
    return `<style>${BASE_STYLE}${MINI_STYLE}${accentStyle(this._hass)}${saunaAccent(this._hass)}</style>
      <ha-card>
        ${this._header(m, banner ? this._saunaSub(m) : "")}
        <div class="content">
          ${banner ? "" : this._saunaScene(m)}
          <div class="info">
            ${pills.length ? `<div class="pills">${pills.join("")}</div>` : ""}
            ${lines.join("")}
          </div>
          ${controls ? `<div class="controls">${controls}</div>` : ""}
        </div>
      </ha-card>`;
  }

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
    (this._onUnzoomWatch ??= watchOutside(this, (ev) => this._onUnzoom(ev))).on();
    // Back on the page after leaving it: rendered again in its default state.
    this._update?.();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._onUnzoomWatch?.off();
    // Left (another dashboard view, a conditional card hidden): back to the default state, so that the card does
    // not come back unfolded or with its popup open.
    this._zoomed = false;
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
    if (m.kind === "sauna") return this._saunaMini(m);
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
    const banner = this._illustrated();
    // With the banner, the filtration state is its subtitle.
    if (m.pump && !banner) {
      const on = pumpOn(m.pump);
      lines.push(`<div class="line ${on ? "active" : "idle"}">${svgIcon(ICONS.pump)}<span>${esc(this._subtitle(m))}</span></div>`);
    }
    lines.push(this._robotLine(m));
    const tip = m.tips[0];
    if (tip) lines.push(`<div class="line tip-line ${tip.cls}">${svgIcon(tip.cls === "crit" ? ICONS.alert : ICONS.info)}<span>${esc(this._t(tip.key))}</span></div>`);
    const controls = this._controls(m, true);
    return `<style>${BASE_STYLE}${MINI_STYLE}${accentStyle(this._hass)}</style>
      <ha-card>
        ${this._header(m, banner && m.pump ? this._subtitle(m) : "")}
        <div class="content">
          ${banner ? "" : this._sceneHtml(m)}
          <div class="info">
            ${pills ? `<div class="pills">${pills}</div>` : ""}
            ${lines.join("")}
          </div>
          ${controls ? `<div class="controls">${controls}</div>` : ""}
        </div>
      </ha-card>`;
  }
}
