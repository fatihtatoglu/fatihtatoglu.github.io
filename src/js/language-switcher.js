import { readCookie, setCookie } from "./utils/cookies.js";
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  normalizeLanguage,
  loadDictionary,
  getDictionaryValue,
  getLocalizedString,
  LANGUAGE_CHANGE_EVENT,
  setRootLanguage,
} from "./utils/i18n-client.js";

const LANGUAGE_COOKIE = "tat-lang";
const root = document.documentElement;

const LANGUAGE_METADATA = {
  tr: {
    languageTag: "tr",
    ogLocale: "tr_TR",
    altLanguage: "en",
  },
  en: {
    languageTag: "en",
    ogLocale: "en_US",
    altLanguage: "tr",
  },
};

function getBaseUrl() {
  const fromDataset = root?.dataset?.baseUrl;
  if (fromDataset) {
    return fromDataset.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return "https://tatoglu.net";
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
    if (!code) return;
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
  setCookie(LANGUAGE_COOKIE, value);
}

function readStoredLang() {
  return readCookie(LANGUAGE_COOKIE);
}

function applyTranslations(dict) {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = getDictionaryValue(dict, node.dataset.i18n);
    if (typeof value === "string") {
      node.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const value = getDictionaryValue(dict, node.dataset.i18nAria);
    if (typeof value === "string") {
      node.setAttribute("aria-label", value);
    }
  });

  const search = document.getElementById("site-search");
  const placeholder = getDictionaryValue(dict, "menu.searchPlaceholder");
  if (search && typeof placeholder === "string") {
    search.placeholder = placeholder;
  }

  document.querySelectorAll("[data-i18n-attrs]").forEach((node) => {
    const attrMap = node.getAttribute("data-i18n-attrs");
    if (!attrMap) return;
    attrMap.split(";").forEach((pair) => {
      const [attr, path] = pair.split(":").map((part) => part?.trim());
      if (!attr || !path) return;
      const value = getDictionaryValue(dict, path);
      if (typeof value === "string") {
        node.setAttribute(attr, value);
      }
    });
  });
}

async function syncLanguage(lang) {
  const normalized = normalizeLanguage(lang);
  const dict = await loadDictionary(normalized);
  setRootLanguage(normalized);
  persistLang(normalized);
  applyTranslations(dict);
  updateLanguageMeta(normalized);
  document.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { lang: normalized, dict } }));
  return normalized;
}

function buildLangUrl(lang) {
  return getLanguageUrl(lang);
}

function updateLanguageMeta(lang) {
  const meta = LANGUAGE_METADATA[lang] ?? LANGUAGE_METADATA[DEFAULT_LANGUAGE];
  const currentUrl = buildLangUrl(lang);
  const metaLanguage = document.querySelector('meta[name="language"]');
  if (metaLanguage) {
    metaLanguage.setAttribute("content", meta.languageTag);
  }
  const canonical = document.querySelector('link[rel="canonical"][data-canonical]');
  if (canonical) {
    canonical.setAttribute("href", currentUrl);
  }
  const ogUrl = document.querySelector("meta[data-og-url]");
  if (ogUrl) {
    ogUrl.setAttribute("content", currentUrl);
  }
  const twitterUrl = document.querySelector("meta[data-twitter-url]");
  if (twitterUrl) {
    twitterUrl.setAttribute("content", currentUrl);
  }
  const ogLocale = document.querySelector("meta[data-og-locale]");
  if (ogLocale) {
    ogLocale.setAttribute("content", meta.ogLocale);
  }
  const alternateLang = meta.altLanguage ?? DEFAULT_LANGUAGE;
  const alternateLocaleContent = (LANGUAGE_METADATA[alternateLang] ?? LANGUAGE_METADATA[DEFAULT_LANGUAGE]).ogLocale;
  const ogLocaleAlt = document.querySelector("meta[data-og-locale-alt]");
  if (ogLocaleAlt) {
    ogLocaleAlt.setAttribute("content", alternateLocaleContent);
  }
  document.querySelectorAll('link[rel="alternate"][data-lang]').forEach((link) => {
    const code = link.getAttribute("data-lang");
    if (!code) return;
    const href = buildLangUrl(code);
    link.setAttribute("href", href);
    if (code === lang) {
      link.setAttribute("data-current", "true");
    } else {
      link.removeAttribute("data-current");
    }
  });
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
  <button
    type="button"
    class="btn btn--icon btn--md btn--thin btn--tone-neutral language-button"
    data-lang-toggle
    data-active-lang="tr"
    aria-label=""
  >
    <!-- Turkish Language -->
    <svg data-flag="tr" class="lang-flag" xmlns="http://www.w3.org/2000/svg" viewBox="0 -30000 90000 60000" aria-hidden="true">
      <path fill="#e30a17" d="m0-30000h90000v60000H0z"></path>
      <path
        fill="#fff"
        d="m41750 0 13568-4408-8386 11541V-7133l8386 11541zm925 8021a15000 15000 0 1 1 0-16042 12000 12000 0 1 0 0 16042z"
      ></path>
    </svg>

    <!-- English Language -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1235 650" data-flag="en" class="lang-flag" aria-hidden="true">
      <defs>
        <g id="cone">
          <polygon id="triangle" points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"></polygon>
          <polygon
            id="use10"
            points="0,0 0,1 .5,1"
            transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"
          ></polygon>
        </g>
        <g id="star" transform="translate(1235,1050) scale(300.3)" fill="white">
          <g id="use13">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"></polygon>
            <polygon
              points="0,0 0,1 .5,1"
              transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"
            ></polygon>
          </g>
          <g
            id="use15"
            transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)"
          >
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"></polygon>
            <polygon
              points="0,0 0,1 .5,1"
              transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"
            ></polygon>
          </g>
          <g
            id="use17"
            transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)"
          >
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"></polygon>
            <polygon
              points="0,0 0,1 .5,1"
              transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"
            ></polygon>
          </g>
          <g
            id="use19"
            transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)"
          >
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"></polygon>
            <polygon
              points="0,0 0,1 .5,1"
              transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"
            ></polygon>
          </g>
        </g>
      </defs>
      <path fill="#012169" d="M0 0h1235v650H0z"></path>
      <path stroke="#fff" stroke-width="120" d="M0 0l1235 650m0-650L0 650"></path>
      <path stroke="#c8102e" stroke-width="80" d="M0 0l1235 650m0-650L0 650"></path>
      <path fill="#fff" d="M517 0v650h200V0zm-517 225v200h1235V225z"></path>
      <path fill="#c8102e" d="M553 0v650h128V0zm-553 255v140h1235V255z"></path>
    </svg>
  </button>
`;

class LanguageSwitcher extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.requestId = 0;
    const initialLang = root?.lang ?? DEFAULT_LANGUAGE;
    this.currentLang = normalizeLanguage(readStoredLang() ?? initialLang);
  }

  connectedCallback() {
    if (!this.isConnected) return;
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
    this.button = this.querySelector("[data-lang-toggle]");
    this.updateButton(this.currentLang);
    this.button?.addEventListener("click", this.handleClick);
    this.applyLanguage(this.currentLang);
  }

  disconnectedCallback() {
    this.button?.removeEventListener("click", this.handleClick);
  }

  render() {
    this.innerHTML = SWITCHER_TEMPLATE;
  }

  async applyLanguage(lang) {
    const next = normalizeLanguage(lang);
    const requestId = ++this.requestId;
    this.updateButton(next);
    this.button?.setAttribute("aria-busy", "true");
    try {
      const applied = await syncLanguage(next);
      if (this.requestId === requestId) {
        this.currentLang = applied;
        this.updateButton(applied);
      }
    } catch (error) {
      console.error("Dil değişimi başarısız:", error);
    } finally {
      if (this.requestId === requestId) {
        this.button?.removeAttribute("aria-busy");
      }
    }
  }

  handleClick(event) {
    event?.preventDefault?.();
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(this.currentLang);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    const next = SUPPORTED_LANGUAGES[nextIndex] ?? DEFAULT_LANGUAGE;
    persistLang(next);
    const targetPath = getLanguageUrl(next);
    if (typeof window !== "undefined" && window.location) {
      this.button?.setAttribute("aria-busy", "true");
      window.location.href = targetPath;
      return;
    }
    this.applyLanguage(next);
  }

  updateButton(lang) {
    if (!this.button) return;
    const activeLang = lang ?? this.currentLang ?? DEFAULT_LANGUAGE;
    const locale = activeLang;
    this.button.setAttribute("data-active-lang", activeLang);
    const labelPrefix = getLanguageLabel(locale);
    const languageName = getLanguageName(locale, activeLang);
    this.button.setAttribute("aria-label", `${labelPrefix}: ${languageName}`);
  }
}

customElements.define("language-switcher", LanguageSwitcher);
