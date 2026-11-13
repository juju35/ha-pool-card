// Evaluates src/pool-card.js (a classic script, bundled as is by scripts/build.mjs) in a sandbox with minimal DOM
// stand-ins and returns the names the tests need. No dependency, no browser.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/pool-card.js", import.meta.url), "utf8");

// Shadow root stand-in: keeps the HTML it is given and the listeners it gets.
const fakeRoot = () => ({
  innerHTML: "",
  listeners: {},
  addEventListener(type, fn) {
    this.listeners[type] = fn;
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
});

export const load = () => {
  const registry = new Map();
  class HTMLElement {
    attachShadow() {
      this.shadowRoot = fakeRoot();
      return this.shadowRoot;
    }
    dispatchEvent(ev) {
      (this.events ||= []).push(ev);
    }
    appendChild(child) {
      (this.children ||= []).push(child);
    }
    toggleAttribute(name, on) {
      (this.attrs ||= {})[name] = !!on;
    }
  }
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  const docListeners = {};
  const sandbox = {
    HTMLElement,
    CustomEvent,
    Intl,
    console: { info() {}, warn() {} },
    customElements: { get: (t) => registry.get(t), define: (t, c) => registry.set(t, c) },
    document: {
      createElement: (t) => (registry.has(t) ? new (registry.get(t))() : { tagName: t.toUpperCase(), addEventListener() {} }),
      addEventListener: (type, fn) => (docListeners[type] ||= new Set()).add(fn),
      removeEventListener: (type, fn) => docListeners[type]?.delete(fn),
    },
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval() {},
    addEventListener() {},
    removeEventListener() {},
    fireDocument: (type, ev) => {
      for (const fn of [...(docListeners[type] || [])]) fn(ev);
    },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return vm.runInContext(
    `${source}
    ({ STRINGS, roleOf, setupOf, tdsRange, autoDevice, rangeOf, levelOf, scaleOf, runHours, pumpOn, speedsOf, kindOf, fmtHours, toHours, esc, lang, sceneSvg,
       PoolCard: customElements.get("pool-card"), PoolMiniCard: customElements.get("pool-mini-card"),
       PoolCardEditor: customElements.get("pool-card-editor"), fireDocument, window })`,
    sandbox,
  );
};
