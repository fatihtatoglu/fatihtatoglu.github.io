import cookieApi from "./utils/cookies.js";

const THEME_COOKIE = "tat-theme";
const THEME_CHANGE_EVENT = "tat-theme-change";
const THEME_STATES = ["light", "dark", "system"];
const ICON_SPRITE = "/assets/svg/icons.svg";
const ICON_IDS = {
  light: "icon-sun",
  dark: "icon-moon",
  system: "icon-computer",
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
    <svg aria-hidden="true" data-icon="light" class="theme-icon">
      <use href="${ICON_SPRITE}#${ICON_IDS.light}"></use>
    </svg>
    <!-- Dark -->
    <svg aria-hidden="true" data-icon="dark" class="theme-icon">
      <use href="${ICON_SPRITE}#${ICON_IDS.dark}"></use>
    </svg>
    <!-- System -->
    <svg aria-hidden="true" data-icon="system" class="theme-icon">
      <use href="${ICON_SPRITE}#${ICON_IDS.system}"></use>
    </svg>
  </button>
`;

function toTitleCase(value) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
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
