import { readCookie, setCookie } from "./utils/cookies.js";
import {
  DEFAULT_LANGUAGE,
  loadDictionary,
  getLocalizedString,
  LANGUAGE_CHANGE_EVENT,
  getRootLanguage,
} from "./utils/i18n-client.js";

const THEME_COOKIE = "tat-theme";
const THEME_CHANGE_EVENT = "tat-theme-change";
const THEME_STATES = ["light", "dark", "system"];

const root = document.documentElement;
const THEME_COLORS = {
  light: "#5a8df0",
  dark: "#0e1116",
};
const prefersDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function persistTheme(value) {
  setCookie(THEME_COOKIE, value);
}

function readStoredTheme() {
  return readCookie(THEME_COOKIE);
}

function resolveTheme(pref) {
  if (pref !== "system") return pref;
  return prefersDark?.matches ? "dark" : "light";
}

function updateThemeMeta(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
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
  <button
    type="button"
    class="btn btn--md btn--tone-neutral btn--icon theme-button"
    data-theme-toggle
    data-theme-state="light"
    aria-label=""
  >
    <!-- Light -->
    <svg viewBox="0 0 47.576 47.576" data-icon="light" class="theme-icon" fill="currentColor" aria-hidden="true">
      <path
        d="M24.235,12.13c-6.478,0-11.748,5.269-11.748,11.748s5.27,11.747,11.748,11.747s11.748-5.27,11.748-11.747
        S30.713,12.13,24.235,12.13z M24.235,33.275c-5.182,0-9.398-4.216-9.398-9.397c0-5.183,4.216-9.397,9.398-9.397
        c5.183,0,9.397,4.217,9.397,9.397C33.632,29.06,29.418,33.275,24.235,33.275z M23.06,6.485V1.589c0-0.649,0.526-1.174,1.175-1.174
        c0.648,0,1.175,0.525,1.175,1.174v4.896c0,0.648-0.528,1.175-1.175,1.175C23.586,7.66,23.06,7.133,23.06,6.485z
        M35.095,13.287c-0.459-0.458-0.459-1.202,0-1.661l4.209-4.209c0.459-0.458,1.203-0.458,1.662,0
        c0.459,0.459,0.459,1.203,0,1.661l-4.209,4.209c-0.229,0.229-0.528,0.344-0.83,0.344
        C35.627,13.631,35.326,13.516,35.095,13.287z M5.63,9.078c-0.458-0.458-0.458-1.202,0-1.661c0.459-0.458,1.203-0.458,1.661,0
        l4.21,4.209c0.458,0.459,0.458,1.204,0,1.661c-0.229,0.229-0.53,0.344-0.83,0.344c-0.301,0-0.602-0.115-0.831-0.344L5.63,9.078z
        M24.472,41.091v4.896c0,0.649-0.525,1.175-1.173,1.175c-0.649,0-1.175-0.527-1.175-1.175v-4.896
        c0-0.649,0.526-1.176,1.175-1.176C23.947,39.915,24.472,40.441,24.472,41.091z M12.437,34.288c0.459,0.458,0.459,1.202,0,1.661
        l-4.209,4.21c-0.229,0.23-0.53,0.346-0.831,0.346c-0.3,0-0.601-0.117-0.83-0.346c-0.459-0.458-0.459-1.203,0-1.662l4.209-4.209
        C11.235,33.829,11.978,33.829,12.437,34.288z M41.902,38.497c0.459,0.459,0.459,1.202,0,1.662
        c-0.229,0.23-0.527,0.346-0.83,0.346c-0.299,0-0.601-0.117-0.83-0.346l-4.209-4.21c-0.459-0.459-0.459-1.202,0-1.661
        s1.201-0.459,1.66,0L41.902,38.497z M6.461,25.054H1.175C0.526,25.054,0,24.526,0,23.878s0.526-1.176,1.175-1.176h5.286
        c0.649,0,1.175,0.527,1.175,1.176C7.635,24.526,7.11,25.052,6.461,25.054z M47.576,23.878c0,0.649-0.526,1.176-1.174,1.176h-6.267
        c-0.649,0-1.176-0.527-1.176-1.176s0.526-1.176,1.176-1.176h6.267C47.05,22.702,47.576,23.228,47.576,23.878z"
      ></path>
    </svg>

    <!-- Dark -->
    <svg viewBox="-8.13 -8.13 97.55 97.55" data-icon="dark" class="theme-icon" fill="currentColor" aria-hidden="true">
      <path
        d="M79.248,38.668c-1.246-0.464-2.669-0.088-3.518,0.95c-4.791,5.84-11.858,9.192-19.403,9.192
        c-13.833,0-25.083-11.255-25.083-25.083c0-6.963,2.808-13.441,7.908-18.242c0.977-0.918,1.26-2.357,0.705-3.579
        c-0.552-1.222-1.818-1.959-3.157-1.826C15.778,2.112,0,19.511,0,40.555c0,22.424,18.245,40.669,40.672,40.669
        c22.16,0,40.002-17.363,40.616-39.528C81.324,40.355,80.508,39.136,79.248,38.668z M40.671,74.953
        c-18.971,0-34.402-15.43-34.402-34.4c0-14.93,9.389-27.69,22.859-32.43c-2.714,4.689-4.156,10.022-4.156,15.605
        c0,17.292,14.065,31.355,31.357,31.355c6.317,0,12.373-1.882,17.479-5.322C69.82,64.399,56.557,74.953,40.671,74.953z"
      ></path>
    </svg>

    <!-- System -->
    <svg data-icon="system" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2"></rect>
      <path d="M8 21h8M12 17v4"></path>
    </svg>
  </button>
`;

function toTitleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getThemeLabel(locale) {
  const fallback = locale === "tr" ? "Tema" : "Theme";
  return getLocalizedString(locale, "switchers.theme.ariaLabel", fallback) ?? fallback;
}

function getThemeStateLabel(locale, state) {
  const fallback = toTitleCase(state);
  return getLocalizedString(locale, `themes.states.${state}.name`, fallback) ?? fallback;
}

function warmLanguageDictionary(locale) {
  if (!locale) return Promise.resolve();
  return loadDictionary(locale).catch(() => { });
}

class ThemeSwitcher extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleThemeBroadcast = this.handleThemeBroadcast.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.currentUiLanguage = getRootLanguage();
  }

  connectedCallback() {
    if (!this.isConnected) return;
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }

    this.button = this.querySelector("[data-theme-toggle]");
    this.updateButton(themePreference);
    this.button?.addEventListener("click", this.handleClick);
    document.addEventListener(THEME_CHANGE_EVENT, this.handleThemeBroadcast);
    document.addEventListener(LANGUAGE_CHANGE_EVENT, this.handleLanguageChange);
    warmLanguageDictionary(this.currentUiLanguage).then(() => {
      this.updateButton(themePreference);
    });
  }

  disconnectedCallback() {
    this.button?.removeEventListener("click", this.handleClick);
    document.removeEventListener(THEME_CHANGE_EVENT, this.handleThemeBroadcast);
    document.removeEventListener(LANGUAGE_CHANGE_EVENT, this.handleLanguageChange);
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

  handleLanguageChange(event) {
    const nextLang = event?.detail?.lang ?? DEFAULT_LANGUAGE;
    this.currentUiLanguage = nextLang;
    this.updateButton(themePreference);
    warmLanguageDictionary(nextLang).then(() => {
      this.updateButton(themePreference);
    });
  }

  updateButton(pref) {
    if (!this.button) return;
    const state = pref ?? themePreference;
    this.button.setAttribute("data-theme-state", state);
    const locale = this.currentUiLanguage ?? getRootLanguage() ?? DEFAULT_LANGUAGE;
    const labelPrefix = getThemeLabel(locale);
    const stateLabel = getThemeStateLabel(locale, state);
    this.button.setAttribute("aria-label", `${labelPrefix}: ${stateLabel}`);
  }
}

customElements.define("theme-switcher", ThemeSwitcher);
