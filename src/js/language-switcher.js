import cookieApi from "./utils/cookies.js";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, normalizeLanguage, getLocalizedString } from "./utils/i18n-client.js";

const LANGUAGE_COOKIE = "tat-lang";
const root = document.documentElement;
const ICON_SPRITE = "/assets/svg/icons.svg";
const FLAG_IDS = {
  tr: "icon-turkey-flag",
  en: "icon-english-flag",
};

function getBaseUrl() {
  const fromDataset = root?.dataset?.baseUrl;
  if (fromDataset) {
    return fromDataset.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

function getCanonicalHref() {
  const canonical = document.querySelector('link[rel="canonical"][data-canonical]');
  if (canonical && canonical.href) {
    return canonical.href;
  }

  return `${getBaseUrl()}/`;
}

function getAlternateEntries() {
  const entries = {};
  document.querySelectorAll('link[rel="alternate"][data-lang]').forEach((link) => {
    const code = link.getAttribute("data-lang");
    if (!code) {
      return;
    }

    entries[code] = link;
  });

  return entries;
}

function buildFallbackUrl(lang) {
  const base = getBaseUrl();
  const normalized = normalizeLanguage(lang);
  if (normalized === DEFAULT_LANGUAGE) {
    return `${base}/`;
  }

  return `${base}/${normalized}/`;
}

function getLanguageUrl(lang) {
  const normalized = normalizeLanguage(lang);
  const entries = getAlternateEntries();
  const link = entries[normalized];
  if (link?.href) {
    return link.href;
  }

  if (normalized === DEFAULT_LANGUAGE) {
    return getCanonicalHref();
  }

  return buildFallbackUrl(normalized);
}

function persistLang(value) {
  cookieApi.write(LANGUAGE_COOKIE, value);
}

function readStoredLang() {
  return cookieApi.read(LANGUAGE_COOKIE);
}

function getLanguageLabel(locale) {
  const fallback = locale === "tr" ? "Dil" : "Language";
  return getLocalizedString(locale, "switchers.language.ariaLabel", fallback) ?? fallback;
}

function getLanguageName(locale, langCode) {
  if (!langCode) {
    return "";
  }

  const fallback = langCode.toUpperCase();
  return getLocalizedString(locale, `languages.${langCode}.name`, fallback) ?? fallback;
}

const SWITCHER_TEMPLATE = /* html */ `
  <button type="button" class="btn btn--md btn--tone-neutral btn--icon language-button" data-lang-toggle data-active-lang="tr" aria-label=""
    data-metric
    data-metric-name="language_toggle"
    data-metric-source="switcher">
    <svg aria-hidden="true" data-flag="tr" class="lang-flag">
      <use href="${ICON_SPRITE}#${FLAG_IDS.tr}"></use>
    </svg>
    <svg aria-hidden="true" data-flag="en" class="lang-flag">
      <use href="${ICON_SPRITE}#${FLAG_IDS.en}"></use>
    </svg>
  </button>
`;


class LanguageSwitcher extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    const initialLang = root?.lang ?? DEFAULT_LANGUAGE;
    this.currentLang = normalizeLanguage(readStoredLang() ?? initialLang);
  }

  connectedCallback() {
    if (!this.isConnected) {
      return;
    }

    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
    this.button = this.querySelector("[data-lang-toggle]");
    this.updateButton(this.currentLang);
    this.button?.addEventListener("click", this.handleClick);
  }

  disconnectedCallback() {
    this.button?.removeEventListener("click", this.handleClick);
  }

  render() {
    this.innerHTML = SWITCHER_TEMPLATE;
  }

  handleClick(event) {
    event?.preventDefault?.();
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(this.currentLang);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    const next = SUPPORTED_LANGUAGES[nextIndex] ?? DEFAULT_LANGUAGE;
    if (this.button?.dataset) {
      this.button.dataset.metricValue = next;
    }
    persistLang(next);
    const targetPath = getLanguageUrl(next);
    if (typeof window !== "undefined" && window.location) {
      this.button?.setAttribute("aria-busy", "true");
      window.location.href = targetPath;
      return;
    }

    this.currentLang = next;
    this.updateButton(next);
  }

  updateButton(lang) {
    if (!this.button) {
      return;
    }

    const activeLang = lang ?? this.currentLang ?? DEFAULT_LANGUAGE;
    const locale = activeLang;
    this.button.setAttribute("data-active-lang", activeLang);
    if (this.button?.dataset) {
      this.button.dataset.metricMetaCurrent = activeLang;
    }
    const labelPrefix = getLanguageLabel(locale);
    const languageName = getLanguageName(locale, activeLang);
    this.button.setAttribute("aria-label", `${labelPrefix}: ${languageName}`);
  }
}

customElements.define("language-switcher", LanguageSwitcher);
