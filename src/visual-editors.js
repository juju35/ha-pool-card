// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { LANGUAGES } from "./core.js";
import { lang, t } from "./helpers.js";
import { DEFAULT_COLLAPSED, METRIC_ROLES, ROLES, SECTIONS } from "./entity-roles-discovery.js";
import { SAUNA_DOMAINS, SAUNA_ROLES } from "./sauna.js";

export const ENTITY_DOMAINS = {
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
  cover: ["cover", "switch", "input_boolean"],
  robot: ["vacuum", "switch", "input_boolean"],
  power: ["sensor"],
  energy: ["sensor"],
};

export class PoolEditorBase extends HTMLElement {
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
      { name: "kind", selector: { select: { mode: "dropdown", options: ["auto", "pool", "spa", "sauna"].map((v) => ({ value: v, label: tr(`kind_${v}`) })) } } },
      {
        type: "expandable",
        name: "",
        flatten: true,
        title: tr("entities"),
        icon: "mdi:format-list-bulleted",
        schema: ROLES.map((name) => ({ name, selector: { entity: { domain: ENTITY_DOMAINS[name] } } })),
      },
      {
        type: "expandable",
        name: "",
        flatten: true,
        title: tr("sauna"),
        icon: "mdi:fire",
        schema: [
          ...SAUNA_ROLES.map((name) => ({ name, selector: { entity: { domain: SAUNA_DOMAINS[name] } } })),
          { name: "target_temperature", selector: { number: { min: 40, max: 120, step: 1, mode: "box" } } },
        ],
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
      this._form.computeHelper = (s) => (s.name === "device" ? t(this._hass, this._config, "device_helper") : s.name === "zoom" ? t(this._hass, this._config, "zoom_helper") : s.name === "invert_cover" ? t(this._hass, this._config, "invert_cover_helper") : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = { ...Object.fromEntries(toggles), kind: "auto", illustration_theme: "auto", collapsed: DEFAULT_COLLAPSED };
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
    const data = { kind: "auto", illustration_theme: "auto", collapsed: DEFAULT_COLLAPSED, ...this._config };
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

export class PoolCardEditor extends PoolEditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_controls", true],
      ["show_advice", true],
      ["show_filtration", true],
      ["show_equipment", true],
      ["show_robot", true],
      ["invert_cover", false],
    ];
  }

  static extraFields(tr) {
    return [
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } } },
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

// The detailed view of the mini card draws the full card: its editor offers the full card's options (sections,
// folded sections, ranges, filtration target), and the zoom button.
export class PoolMiniCardEditor extends PoolCardEditor {
  static get toggles() {
    return [...PoolCardEditor.toggles, ["zoom", true]];
  }
}
