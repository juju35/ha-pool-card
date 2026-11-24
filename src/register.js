// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { PoolCard, PoolMiniCard } from "./cards.js";
import { PoolCardEditor, PoolMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
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
