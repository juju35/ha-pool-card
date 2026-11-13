// Bundles src/pool-card.js into the single dashboard file dist/pool-card.js (the card has no picture to inline: its
// scene is drawn in SVG by the card itself).
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { splitDist } from "./i18n-split.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));

const out = readFileSync(`${root}src/pool-card.js`, "utf8").replace("__VERSION__", pkg.version);
mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(`${root}dist/pool-card.js`, out);
console.log(`Built dist/pool-card.js (${(out.length / 1024).toFixed(1)} KB)`);

// Translations: English stays in the bundle, each other language goes to dist/pool-card.i18n.<lang>.js,
// fetched when a card needs it (scripts/i18n-split.mjs).
if (process.argv[1] === fileURLToPath(import.meta.url)) splitDist(`${root}dist`, "pool-card.js", { version: pkg.version });
