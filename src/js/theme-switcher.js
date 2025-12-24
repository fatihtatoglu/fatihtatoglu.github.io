import cookieApi from "./utils/cookies.js";

const THEME_COOKIE = "tat-theme";
const THEME_CHANGE_EVENT = "tat-theme-change";
const THEME_STATES = ["light", "dark", "system"];
const ICON_PATHS = {
  light: "/assets/svg/sun.svg",
  dark: "/assets/svg/moon.svg",
  system: "/assets/svg/computer.svg",
};

const root = document.documentElement;
const THEME_COLORS = {
  light: "#5a8df0",
  dark: "#0e1116",
};
const prefersDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function persistTheme(value) {
  cookieApi.write(THEME_COOKIE, value);
}

function readStoredTheme() {
  return cookieApi.read(THEME_COOKIE);
}

function resolveTheme(pref) {
  if (pref !== "system") {
    return pref;
  }

  return prefersDark?.matches ? "dark" : "light";
}

function updateThemeMeta(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    return;
  }

  const color = THEME_COLORS[theme] ?? THEME_COLORS.light;
  meta.setAttribute("content", color);
}

function applyRootTheme(pref) {
  const resolved = resolveTheme(pref);
  root.dataset.theme = resolved;
  root.classList.toggle("dark", resolved === "dark");
  updateThemeMeta(resolved);
}

let themePreference = readStoredTheme();
if (!THEME_STATES.includes(themePreference)) {
  themePreference = "system";
}

applyRootTheme(themePreference);

function setThemePreference(pref) {
  themePreference = THEME_STATES.includes(pref) ? pref : "system";
  persistTheme(themePreference);
  applyRootTheme(themePreference);
  document.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: themePreference }));
}

function nextThemeValue(current) {
  const index = THEME_STATES.indexOf(current);
  if (index === -1) {
    return THEME_STATES[0];
  }

  return THEME_STATES[(index + 1) % THEME_STATES.length];
}

prefersDark?.addEventListener("change", () => {
  if (themePreference === "system") {
    applyRootTheme(themePreference);
  }
});

const SWITCHER_TEMPLATE = /* html */ `
  <button type="button" class="btn btn--md btn--tone-neutral btn--icon theme-button" data-theme-toggle data-theme-state="light" aria-label="">
    <!-- Light -->
    <span data-icon-slot="light"></span>
    <!-- Dark -->
    <span data-icon-slot="dark"></span>
    <!-- System -->
    <span data-icon-slot="system"></span>
  </button>
`;

const iconMarkupCache = {};
const iconRequests = {};

function toTitleCase(value) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function loadIconMarkup(iconName) {
  if (!iconName) {
    return Promise.resolve("");
  }

  if (iconMarkupCache[iconName]) {
    return Promise.resolve(iconMarkupCache[iconName]);
  }

  if (iconRequests[iconName]) {
    return iconRequests[iconName];
  }

  const path = ICON_PATHS[iconName];
  if (!path) {
    return Promise.resolve("");
  }

  const request = fetch(path)
    .then((response) => (response.ok ? response.text() : ""))
    .then((markup) => {
      iconMarkupCache[iconName] = markup;
      iconRequests[iconName] = null;
      return markup;
    })
    .catch(() => {
      iconRequests[iconName] = null;
      return "";
    });

  iconRequests[iconName] = request;
  return request;
}

class ThemeSwitcher extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleThemeBroadcast = this.handleThemeBroadcast.bind(this);
  }

  connectedCallback() {
    if (!this.isConnected) {
      return;
    }

    if (!this.rendered) {
      this.render();
      this.injectIcons();
      this.rendered = true;
    }

    this.button = this.querySelector("[data-theme-toggle]");
    this.updateButton(themePreference);
    this.button?.addEventListener("click", this.handleClick);
    document.addEventListener(THEME_CHANGE_EVENT, this.handleThemeBroadcast);
  }

  disconnectedCallback() {
    this.button?.removeEventListener("click", this.handleClick);
    document.removeEventListener(THEME_CHANGE_EVENT, this.handleThemeBroadcast);
  }

  render() {
    this.innerHTML = SWITCHER_TEMPLATE;
  }

  injectIcons() {
    const slots = this.querySelectorAll("[data-icon-slot]");
    slots.forEach((slot) => {
      const iconName = slot.dataset.iconSlot;
      loadIconMarkup(iconName).then((markup) => {
        if (!markup) return;
        const template = document.createElement("template");
        template.innerHTML = markup.trim();
        const svg = template.content.firstElementChild;
        if (svg) {
          svg.dataset.icon = iconName;
          svg.classList.add("theme-icon");
          svg.setAttribute("aria-hidden", svg.getAttribute("aria-hidden") ?? "true");
          slot.replaceWith(svg);
        }
      });
    });
  }

  handleClick() {
    const next = nextThemeValue(themePreference);
    setThemePreference(next);
  }

  handleThemeBroadcast(event) {
    const pref = event?.detail ?? themePreference;
    this.updateButton(pref);
  }

  updateButton(pref) {
    if (!this.button) {
      return;
    }

    const state = pref ?? themePreference;
    this.button.setAttribute("data-theme-state", state);
    const stateLabel = toTitleCase(state);
    this.button.setAttribute("aria-label", `Theme: ${stateLabel}`);
  }
}

customElements.define("theme-switcher", ThemeSwitcher);
