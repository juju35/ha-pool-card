// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const BASE_STYLE = `
  :host { --pc-accent: #0277bd; --pc-ok: var(--success-color, #43a047); --pc-warn: var(--warning-color, #ffa600);
          --pc-crit: var(--error-color, #db4437); --pc-idle: var(--disabled-text-color, #9e9e9e); --pc-cold: #2196f3;
          --pc-ok-z: color-mix(in srgb, var(--pc-ok) 55%, transparent); --pc-warn-z: color-mix(in srgb, var(--pc-warn) 45%, transparent);
          --pc-crit-z: color-mix(in srgb, var(--pc-crit) 32%, transparent); --pc-cold-z: color-mix(in srgb, var(--pc-cold) 30%, transparent);
          /* Text in a state or accent color is mixed with the text color so that it reads at 4.5:1 at least. */
          --pc-accent-text: color-mix(in srgb, var(--pc-accent) 55%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container-type: inline-size; container-name: pc-card; }
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
  /* Title row (both headers): the name, then the status pill right after it, only when the whole name and the whole
     label fit there (measured by the card, see _fitPill); else the pill takes a line of its own under the subtitle,
     and when even that does not fit, only its dot stays (its label in its title). */
  .title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .title-row > .name { flex: 0 1 auto; min-width: 4ch; }
  .title-row > .chip { flex: none; max-width: none; }
  .titles.below .title-row { display: contents; }
  .titles.below > .sub { order: 1; }
  .titles.below .title-row > .chip { order: 2; align-self: flex-start; max-width: 100%; margin-top: 2px; }
  .titles.dot-only .chip { padding: 0; width: 16px; height: 16px; justify-content: center; }
  .titles.dot-only .chip .chip-text { display: none; }
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
  .robot-row { display: flex; gap: 14px; align-items: center; padding: 12px; border-radius: 12px; background: var(--secondary-background-color, rgba(127,127,127,.08)); --c: var(--pc-accent); }
  .robot-row.crit { --c: var(--error-color, #db4437); }
  .robot-row .ring { width: 64px; height: 64px; display: block; flex: none; }
  .robot-row .ring .rt { fill: none; stroke: var(--divider-color, rgba(127,127,127,.25)); stroke-width: 6; }
  .robot-row .ring .rv { fill: none; stroke: var(--c); stroke-width: 6; stroke-linecap: round; }
  .robot-row .ring .rv.spin { transform-origin: 32px 32px; animation: pc-spin 2.4s linear infinite; }
  .robot-row .ring path { fill: var(--secondary-text-color); }
  .robot-row.on .ring path { fill: var(--c); }
  .robot-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .robot-title { font-size: 17px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .robot-sub { font-size: 13px; color: var(--secondary-text-color); }
  .robot-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .robot-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .robot-body { display: flex; flex-direction: column; gap: 10px; }
  .robot-row .btn { background: var(--card-background-color, #fff); }
  .btn.small .icon { width: 16px; height: 16px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -2px -4px -2px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--pc-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--pc-accent)); outline-offset: 1px; }
  /* Classic header: the detail button in the card's top right corner, out of the title row. */
  .header:has(.zoom) { position: relative; padding-right: 44px; }
  .header .title-row > .zoom { position: absolute; top: 12px; right: 12px; margin: 0; box-shadow: inset 0 0 0 1px var(--divider-color, rgba(127,127,127,.3)); }
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
  /* The pool robot on the floor of the basin: it crawls along it while it cleans, a dotted trail behind it. */
  .scene .robot .rbody { fill: #37474f; stroke: #263238; stroke-width: .6; }
  .scene .robot .rbrush { fill: #80deea; }
  .scene .robot .rhandle { fill: none; stroke: #263238; stroke-width: 1.6; stroke-linecap: round; }
  .scene .robot .trail { fill: none; stroke: #fff; stroke-opacity: .7; stroke-width: 1.2; stroke-dasharray: 2 3; }
  .scene .robot.on .rb { animation: pc-robot 9s ease-in-out infinite; }
  .scene .flame { fill: #ff7043; transform-box: fill-box; transform-origin: 50% 100%; animation: pc-flame 1s ease-in-out infinite; }
  @keyframes pc-wave { from { transform: translateX(0); } to { transform: translateX(-20px); } }
  @keyframes pc-flow { from { transform: translateX(0); opacity: 0; } 10% { opacity: 1; } 85% { opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
  @keyframes pc-bubble { from { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } to { transform: translateY(-64px); opacity: 0; } }
  @keyframes pc-glow { from { opacity: .45; } to { opacity: 1; } }
  @keyframes pc-unroll { 0%, 10% { transform: scaleY(0); } 85%, 100% { transform: scaleY(1); } }
  @keyframes pc-spin { to { transform: rotate(360deg); } }
  @keyframes pc-robot { 0%, 8% { transform: translateX(0); } 46%, 54% { transform: translateX(var(--rx)); } 92%, 100% { transform: translateX(0); } }
  @keyframes pc-flame { 0%, 100% { transform: scale(1, 1); } 30% { transform: scale(.9, 1.12); } 60% { transform: scale(1.06, .92); } }
  @keyframes pc-blink { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
  /* The status dot blinks while something runs (filtration, heating, cover moving), as on the other ha-* cards. */
  ha-card:has(.scene.running) .title-row .dot { animation: pc-blink 1.6s ease-in-out infinite; }
  /* Illustrated header (banner): the pool seen from above on its lawn, the title on the grass at its left, a strip of
     coping stones at the bottom. 90 px high on the full and the mini card. */
  .banner { position: relative; height: 90px; overflow: hidden; --pc-g: 10px; background: #7cc35c; --pc-bt: #0d2a45; --pc-bs: #183a5a; }
  .banner.night { background: #1a3326; --pc-bt: #fff; --pc-bs: rgba(255,255,255,.8); }
  .banner .lawn { position: absolute; inset: 0 0 10px; width: 100%; height: calc(100% - 10px); }
  .banner .scene { position: absolute; right: 12px; bottom: 12px; width: 101px; height: 76px; }
  .banner .scene svg { filter: drop-shadow(0 2px 3px rgba(0,0,0,.28)); }
  .htext { position: absolute; left: 12px; top: 0; bottom: 10px; right: 125px; display: flex; align-items: center; gap: 10px; min-width: 0; }
  .banner .name { color: var(--pc-bt); font-weight: 600; }
  .banner .sub { color: var(--pc-bs); font-size: 13px; }
  .banner .type-icon { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px rgba(13,42,69,.12); }
  .banner .type-icon .icon { fill: color-mix(in srgb, var(--pc-tint) 78%, #10283f); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .type-icon .icon { fill: color-mix(in srgb, var(--pc-tint) 70%, #fff); }
  .banner .type-icon.idle .icon { fill: #6b7680; }
  .banner.night .type-icon.idle .icon { fill: #a7b0b8; }
  .banner .chip { color: color-mix(in srgb, var(--c) 45%, #0d2a45); background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); }
  .banner.night .chip { color: color-mix(in srgb, var(--c) 35%, #ffffff); background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); }
  .banner .chip .dot { width: 7px; height: 7px; }
  @container pc-card (max-width: 200px) {
    .title-row > .chip { padding: 0; width: 16px; height: 16px; justify-content: center; }
    .title-row > .chip .chip-text { display: none; }
  }
  /* Detail button (mini card): a small frosted round button in the banner's top right corner; the pool steps aside. */
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; width: 24px; height: 24px; color: #33506b;
                  background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  .banner:has(> .zoom) .scene { right: 34px; }
  .banner:has(> .zoom) .htext { right: 147px; }
  /* Coping stones edging the pool, the water's edge as a thin blue line on top. */
  .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; }
  /* Sauna: a cabin of wooden planks over a bench strip; the heater glows, burns and steams on the right. */
  .banner.sauna { background: repeating-linear-gradient(180deg, #ecc08a 0 9px, #dda56a 9px 10px); --pc-bt: #3d2108; --pc-bs: #6b3d14; }
  .banner.sauna.night { background: repeating-linear-gradient(180deg, #4a3018 0 9px, #3c2612 9px 10px); --pc-bt: #fff; --pc-bs: rgba(255,255,255,.8); }
  .banner.sauna .htext { right: 160px; }
  .banner.sauna:has(> .zoom) .htext { right: 182px; }
  .banner .scene.sauna-scene { right: 6px; bottom: 10px; width: 150px; height: 80px; }
  .banner:has(> .zoom) .scene.sauna-scene { right: 28px; }
  .scene.sauna-scene svg { filter: none; }
  .sauna-scene .thermo { fill: #fff; stroke: #ced4da; stroke-width: .8; }
  .sauna-scene .steam path { fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; opacity: 0; animation: pc-steam 3s ease-out infinite; }
  .sauna-scene .embers { animation: pc-glow 1.5s ease-in-out infinite alternate; }
  @keyframes pc-steam { 0% { transform: translateY(6px); opacity: 0; } 30% { opacity: .6; } 100% { transform: translateY(-14px); opacity: 0; } }
  .g-bench { background: repeating-linear-gradient(90deg, #a8763f 0 30px, #8a5a2b 30px 32px); box-shadow: inset 0 2px 0 #c49058; }
  .night .g-bench { background: repeating-linear-gradient(90deg, #523a20 0 30px, #3d2a17 30px 32px); box-shadow: inset 0 2px 0 #6b4c2a; }
  .sbar { height: 6px; border-radius: 3px; margin: 6px 0 4px; background: var(--secondary-background-color, rgba(127,127,127,.15)); overflow: hidden; }
  .sbar i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #ffa94d, #f76707); }
  .g-coping { background: repeating-linear-gradient(90deg, #e6dcc8 0 30px, #cfc3ab 30px 32px); box-shadow: inset 0 2px 0 #4fb3e8, inset 0 3px 0 #f4ede0; }
  .night .g-coping { background: repeating-linear-gradient(90deg, #4a4438 0 30px, #3a352c 30px 32px); box-shadow: inset 0 2px 0 #1f5a8a; }
  /* Narrow card: no room for the pool beside the title, the lawn alone stays. */
  @container (max-width: 300px) {
    .banner .scene { display: none; }
    .htext { right: 12px; }
    .banner:has(.zoom) .htext { right: 40px; }
  }
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
  @container pc-card (max-width: 230px) {
    :not(.title-row) > .chip { padding: 4px; flex: none; }
    :not(.title-row) > .chip .chip-text { display: none; }
  }
`;

export const FULL_STYLE = `
  .content { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .controls { display: flex; flex-wrap: wrap; gap: 6px; }
  .controls .btn { flex: 1 1 auto; }
  .controls .btn.round { flex: none; }
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

export const MINI_STYLE = `
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
