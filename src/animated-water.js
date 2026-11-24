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
export const FIRE = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z";
export const wavePath = (y, amp) => `M0 ${y} ${`q5 ${-amp} 10 0 t10 0 `.repeat(14)}V0 H0 Z`;
export const FLOW = [
  [42, -0.2],
  [52, -1.1],
  [62, -2.0],
  [47, -2.6],
  [57, -0.7],
  [67, -1.6],
];
export const BUBBLES = [
  [34, 2.4, -0.1],
  [46, 1.8, -0.9],
  [56, 2.8, -0.4],
  [66, 1.8, -1.3],
  [76, 2.4, -0.6],
  [86, 1.8, -1.1],
  [52, 2.2, -0.2],
  [72, 2.2, -1.4],
];

// `uid` keeps the gradient and clip ids unique per card, so several cards on one page do not share them; `viewBox`
// crops the picture (the banner draws it from the deck's top edge).
export const sceneSvg = ({ filtering, spa, heat, heatPump, light, lightColor, cover, coverMove, hasCover, robot, uid = "", viewBox = "0 0 120 96" }) => {
  const basin = spa ? { x: 22, y: 20, w: 76, h: 66, r: 30 } : { x: 12, y: 24, w: 96, h: 60, r: 10 };
  const rect = (b, extra = "") => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.r}"${extra}/>`;
  const slats = Array.from({ length: Math.ceil(basin.h / 6) }, (_, i) => `<rect x="${basin.x}" y="${basin.y + i * 6}" width="${basin.w}" height="5.5"/>`).join("");
  const glowStop = lightColor ? ` style="stop-color:${lightColor}"` : "";
  return `<svg viewBox="${viewBox}" aria-hidden="true">
    <defs>
      <linearGradient id="pc-water${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="w1"/><stop offset="1" class="w2"/></linearGradient>
      <radialGradient id="pc-glow${uid}" cx="50%" cy="50%" r="55%"><stop offset="0" class="g1"${glowStop}/><stop offset="1" class="g2"${glowStop}/></radialGradient>
      <clipPath id="pc-basin${uid}">${rect(basin)}</clipPath>
    </defs>
    <rect class="deck" x="2" y="10" width="116" height="84" rx="16"/>
    <g clip-path="url(#pc-basin${uid})">
      ${rect(basin, ` fill="url(#pc-water${uid})"`)}
      <path class="caustic" d="M10 46 q12 -5 24 0 t24 0 t24 0 t24 0 M18 66 q10 -4 20 0 t20 0 t20 0 t20 0"/>
      ${light ? `<ellipse class="glow" cx="${basin.x + basin.w / 2}" cy="${basin.y + basin.h / 2}" rx="${basin.w * 0.55}" ry="${basin.h * 0.6}" fill="url(#pc-glow${uid})"/>` : ""}
      ${heat ? `${rect(basin, ' class="warm"')}` : ""}
      ${
        robot && !spa
          ? `<g class="robot${robot.on ? " on" : ""}">${robot.on ? `<path class="trail" d="M${basin.x + basin.w - 24} ${basin.y + basin.h - 6}H${basin.x + 10}"/>` : ""}<g class="rb" style="--rx:${-(basin.w - 46)}px"><path class="rhandle" d="M${basin.x + basin.w - 30} ${basin.y + basin.h - 20}q6 -7 12 0"/><rect class="rbody" x="${basin.x + basin.w - 35}" y="${basin.y + basin.h - 21}" width="22" height="14" rx="4"/><rect class="rbrush" x="${basin.x + basin.w - 34}" y="${basin.y + basin.h - 8}" width="20" height="3.2" rx="1.6"/></g></g></g>`
          : ""
      }
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

// The banner's lawn, seen from above: mowing stripes and blades of grass (a pattern tiled over the whole banner, in
// pixels), a few flowers. `uid` keeps the pattern's id unique per card.
export const LAWN_BLADES = Array.from({ length: 22 }, (_, i) => [((i * 7.3) % 24).toFixed(1), ((i * 11.7) % 24).toFixed(1), (i % 3) - 1, i % 2]);
export const lawnSvg = (uid, night) => {
  const [base, stripe, light, dark, flower] = night ? ["#1a3326", "#1d3a2b", "#25503a", "#153022", "#2a4a2e"] : ["#6fb84f", "#79c158", "#8fd36a", "#5aa63d", "#f5e46b"];
  const blades = LAWN_BLADES.map(([x, y, dx, odd]) => `<path d="M${x} ${y} l${dx * 0.6} -2.6" stroke="${odd ? light : dark}"/>`).join("");
  const flowers = [
    [6, 18],
    [14, 82],
    [27, 60],
    [43, 30],
    [52, 86],
  ]
    .map(([x, y]) => `<circle cx="${x}%" cy="${y}%" r="1"/>`)
    .join("");
  return `<svg class="lawn" aria-hidden="true"><defs><pattern id="pc-lawn${uid}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${base}"/><rect width="12" height="24" fill="${stripe}"/><g stroke-width=".7" stroke-linecap="round">${blades}</g></pattern></defs><rect width="100%" height="100%" fill="url(#pc-lawn${uid})"/><g fill="${flower}" opacity=".8">${flowers}</g></svg>`;
};

// The sauna, 150 × 80: a bench on the left, a thermometer, the heater with its stones and a bucket on the right. While
// the heater is on its firebox burns and a warm glow fills the cabin; while it heats, the stones glow and steam rises.
export const STEAM = [
  [96, 0],
  [106, 0.75],
  [116, 1.5],
  [124, 2.25],
];
export const STONES = [
  [87, 38, "#868e96"],
  [94, 37, "#6c757d"],
  [101, 38, "#adb5bd"],
  [108, 37, "#868e96"],
  [115, 38, "#6c757d"],
  [121, 37, "#adb5bd"],
  [91, 34, "#adb5bd"],
  [98, 33, "#868e96"],
  [105, 34, "#6c757d"],
  [112, 33, "#adb5bd"],
  [118, 34, "#868e96"],
];
export const saunaSvg = ({ on, heating, level = 0, uid = "" }) => `<svg viewBox="0 0 150 80" aria-hidden="true">
    <defs>
      <radialGradient id="pc-sglow${uid}" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="#ff922b" stop-opacity=".6"/><stop offset="1" stop-color="#ff922b" stop-opacity="0"/></radialGradient>
      <linearGradient id="pc-sheat${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5c636e"/><stop offset="1" stop-color="#212529"/></linearGradient>
      <linearGradient id="pc-sbench${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58b4b"/><stop offset="1" stop-color="#9c6630"/></linearGradient>
    </defs>
    ${on ? `<ellipse class="glow" cx="104" cy="52" rx="48" ry="40" fill="url(#pc-sglow${uid})"/>` : ""}
    <rect x="2" y="44" width="50" height="5" rx="2" fill="url(#pc-sbench${uid})"/><rect x="2" y="58" width="50" height="4.5" rx="2" fill="url(#pc-sbench${uid})" opacity=".85"/>
    <path d="M7 49v31M47 49v31" stroke="#7f5539" stroke-width="3.5"/>
    <rect class="thermo" x="60" y="10" width="10" height="26" rx="5"/><rect x="63.5" y="${(33 - 18 * level).toFixed(1)}" width="3" height="${(18 * level + 1).toFixed(1)}" rx="1.5" fill="#e03131"/><circle cx="65" cy="33" r="3.6" fill="#e03131"/>
    ${heating ? `<g class="steam">${STEAM.map(([x, d]) => `<path d="M${x} 30c-3-5 3-8 0-13s3-7 0-11" style="animation-delay:${d}s"/>`).join("")}</g>` : ""}
    <rect x="82" y="40" width="44" height="40" rx="5" fill="url(#pc-sheat${uid})"/><rect x="82" y="40" width="44" height="5" rx="2" fill="#868e96"/>
    ${STONES.map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.5" fill="${c}"/>`).join("")}
    ${heating ? `<g class="embers">${STONES.slice(0, 6).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.4" fill="#ff922b"/>`).join("")}</g>` : ""}
    <rect x="92" y="56" width="24" height="14" rx="3" fill="#1a1410"/>
    ${on ? `<g class="flame"><path d="M97 70c0-5 3-6 3-9 2 2 3 4 3 6 1-1 1-3 1-4 2 2 3 4 3 7z" fill="#ff922b"/><path d="M104 70c0-4 2-5 2-7 2 2 3 4 2 7z" fill="#ffd43b"/></g>` : ""}
    <path d="M130 64h14l-2.5 16h-9z" fill="#a47148"/><path d="M131 69h12M131.5 75h11" stroke="#7f5539" stroke-width=".8"/><path d="M137 64v-9h7" stroke="#5d4037" stroke-width="1.6" fill="none"/>
  </svg>`;

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};
