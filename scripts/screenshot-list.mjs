// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture, "-light" for a dark one)
// that shows exactly the same state: only the theme differs (checked by test/screenshots.test.mjs).
import { coverClosing, coverOpening, filtering, heatingState, lightOn, poolConfig, problems, spaConfig, spaJets } from "./mock-states.mjs";

const pair = (base, other = "dark") => [
  { ...base, theme: other === "dark" ? "light" : "dark" },
  { ...base, file: `${base.file}-${other}`, theme: other === "dark" ? "dark" : "light" },
];

export const shots = [
  ...pair({ file: "card", type: "pool-card", width: 460, config: poolConfig }),
  ...pair({ file: "mini-card", type: "pool-mini-card", width: 380, config: poolConfig }),
  ...pair({ file: "mini-card-zoom", type: "pool-mini-card", width: 460, config: poolConfig, clicks: [".zoom"] }),
  ...pair({ file: "card-spa", type: "pool-card", width: 460, config: { ...spaConfig, collapsed: [] } }, "light"),
  ...pair({ file: "mini-card-spa", type: "pool-mini-card", width: 380, config: spaConfig }, "light"),
  ...pair({ file: "card-problems", type: "pool-card", width: 460, config: { ...poolConfig, collapsed: ["filtration"] }, overrides: problems }),
  ...pair({ file: "card-equipment", type: "pool-card", width: 460, config: { ...poolConfig, collapsed: ["advice", "filtration"] } }, "light"),
  // Stopping the pump while the heat pump heats asks first (popup at the top of the card).
  ...pair({ file: "card-confirm", type: "pool-card", width: 460, config: poolConfig, clicks: ['[data-action="pump"]'] }),
  // Narrow cards: the full card at 6 of 12 columns of a phone's Sections view and the mini card at 170 px.
  ...pair({ file: "card-narrow", type: "pool-card", width: 238, config: poolConfig }),
  ...pair({ file: "mini-card-narrow", type: "pool-mini-card", width: 170, config: poolConfig }),
];

// One looping GIF per distinct animation of the scene (each plays different keyframes):
//   filtering     — pump on: the water ripples and the jets push a current across the pool
//   heating       — the heat pump heats: its fan spins, its flame flickers and the water glows warm
//   light         — the underwater light glows and pulses in its color
//   cover-closing — the roller cover unrolls over the pool
//   cover-opening — the roller cover rolls back
//   spa-jets      — the spa's pump on: bubbles rise everywhere
export const gifs = [
  ...pair({ file: "filtering", type: "pool-card", width: 460, config: poolConfig, overrides: filtering, scene: true }),
  ...pair({ file: "heating", type: "pool-card", width: 460, config: poolConfig, overrides: heatingState, scene: true }),
  ...pair({ file: "light", type: "pool-card", width: 460, config: poolConfig, overrides: lightOn, scene: true }, "light"),
  ...pair({ file: "cover-closing", type: "pool-card", width: 460, config: poolConfig, overrides: coverClosing, scene: true }),
  ...pair({ file: "cover-opening", type: "pool-card", width: 460, config: poolConfig, overrides: coverOpening, scene: true }, "light"),
  ...pair({ file: "spa-jets", type: "pool-card", width: 460, config: spaConfig, overrides: spaJets, scene: true }, "light"),
];
