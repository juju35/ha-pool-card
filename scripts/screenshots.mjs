// Renders the cards with mock data and saves the README screenshots (PNG) and animations (GIF, needs ffmpeg).
// Usage: npm run build && npm run screenshots
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { devices, entities, NOW, pumpHistory, states } from "./mock-states.mjs";
import { unchanged } from "./pixels.mjs";
import { gifs, shots } from "./screenshot-list.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
mkdirSync(`${root}screenshots`, { recursive: true });

// Every capture is rendered to a temporary file and copied over screenshots/<file> only when its decoded pixels
// differ (scripts/pixels.mjs): a run that draws the same pictures changes no file, so the workflow commits nothing.
const work = mkdtempSync(join(tmpdir(), "pc-shots-"));
const keep = (fresh, name) => {
  const target = `${root}screenshots/${name}`;
  if (unchanged(fresh, target)) return console.log(`screenshots/${name} (unchanged)`);
  copyFileSync(fresh, target);
  console.log(`screenshots/${name}`);
};
const cardJs = readFileSync(`${root}dist/pool-card.js`, "utf8");

// Uncaught page errors make the script exit non-zero: a card that throws cannot silently produce blank screenshots.
const pageErrors = [];

const THEMES = {
  light: {
    "--primary-background-color": "#e8eaed",
    "--secondary-background-color": "#ececec",
    "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121",
    "--secondary-text-color": "#727272",
    "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111",
    "--secondary-background-color": "#282828",
    "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1",
    "--secondary-text-color": "#9b9b9b",
    "--divider-color": "rgba(225,225,225,.12)",
  },
};

// Minimal stand-in for Home Assistant's <ha-card>.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});`;

const pageHtml = (theme, width) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { ${Object.entries(THEMES[theme])
    .map(([k, v]) => `${k}:${v};`)
    .join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: ${width}px; }
</style></head><body><div id="root"></div></body></html>`;

// The page runs in the machine's time zone, frozen at the screenshots' day and time (the filtration time of the day).
const timezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;

async function openCard(browser, { file, type, config, theme, width, overrides }) {
  const context = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2000 }, timezoneId });
  const page = await context.newPage();
  page.on("pageerror", (err) => {
    console.error(`pageerror (${file}): ${err.message}`);
    pageErrors.push(`${file}: ${err.message}`);
  });
  await page.clock.setFixedTime(NOW);
  await page.setContent(pageHtml(theme, width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs });
  await page.evaluate(
    ({ type, config, states, entities, devices, overrides, history, theme }) => {
      const st = { ...states };
      for (const [id, o] of Object.entries(overrides || {})) st[id] = { ...st[id], ...o };
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      el.hass = {
        states: st,
        entities,
        devices,
        language: "en",
        locale: { language: "en" },
        config: { unit_system: { temperature: "°C" } },
        themes: { darkMode: theme === "dark" },
        callService: () => {},
        callWS: async () => history,
      };
      document.getElementById("root").appendChild(el);
    },
    { type, config, states, entities, devices, overrides, history: pumpHistory(), theme },
  );
  await page.waitForTimeout(200);
  return { page, context };
}

const card = (page) => page.locator("#root > *").first();

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const s of shots) {
  const { page, context } = await openCard(browser, s);
  for (const sel of s.clicks || []) {
    // A mouse click (detail 1), not .click(): a keyboard-like click would move the focus and show its ring.
    await page.evaluate(
      (sel) =>
        document
          .querySelector("#root")
          .firstElementChild.shadowRoot.querySelector(sel)
          .dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 })),
      sel,
    );
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(600);
  const box = await page.locator("#root").boundingBox();
  await page.screenshot({
    path: join(work, `${s.file}.png`),
    clip: { x: 0, y: 0, width: s.width + 32, height: Math.ceil(box.height) + 32 },
    animations: "disabled",
  });
  keep(join(work, `${s.file}.png`), `${s.file}.png`);
  await context.close();
}

// Records one animated state as a looping GIF: every animation of the card is paused and stepped frame by frame, so
// the GIF is identical whatever the machine's speed. `scene` clips it to the header and the scene.
async function makeGif(browser, gif, { fps = 20, seconds = 3 } = {}) {
  const { page, context } = await openCard(browser, gif);
  await page.waitForTimeout(300);
  let height = Math.ceil((await page.locator("#root").boundingBox()).height) + 32;
  if (gif.scene) {
    height = await card(page).evaluate((el) => {
      const hero = el.shadowRoot.querySelector(".hero");
      return Math.ceil(hero.getBoundingClientRect().bottom) + 12;
    });
  }
  const clip = { x: 0, y: 0, width: gif.width + 32, height };
  const dir = mkdtempSync(join(tmpdir(), "pc-frames-"));
  const frames = Math.round(fps * seconds);
  for (let i = 0; i < frames; i++) {
    const n = await page.evaluate((t) => {
      const root = document.querySelector("#root").firstElementChild.shadowRoot;
      const all = [...document.getAnimations(), ...root.getAnimations()];
      for (const a of all) {
        a.pause();
        a.currentTime = t;
      }
      return all.length;
    }, (i * 1000) / fps);
    // An animated state with no animation to step would record frames at the machine's speed again.
    if (!n) throw new Error(`${gif.file}: no animation found to step`);
    await page.screenshot({ path: join(dir, `f${String(i).padStart(3, "0")}.png`), clip });
  }
  await context.close();
  const out = join(work, `${gif.file}.gif`);
  // Halve the retina capture and build a per-clip palette; Bayer dithering is an ordered pattern, so the same frames
  // give the same GIF.
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-framerate",
    String(fps),
    "-i",
    join(dir, "f%03d.png"),
    "-vf",
    `scale=${clip.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
    "-loop",
    "0",
    out,
  ]);
  rmSync(dir, { recursive: true });
  keep(out, `${gif.file}.gif`);
}

for (const g of gifs) await makeGif(browser, g);
await browser.close();
rmSync(work, { recursive: true });

if (pageErrors.length) {
  console.error(`\n${pageErrors.length} page error(s) while rendering:`);
  for (const e of pageErrors) console.error(`  ${e}`);
  process.exitCode = 1;
}
