import cookieApi from "./utils/cookies.js";
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
  cookieApi.write(LANGUAGE_COOKIE, value);
}

function readStoredLang() {
  return cookieApi.read(LANGUAGE_COOKIE);
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
    class="btn btn--md btn--tone-neutral btn--icon language-button"
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
      <polygon id="triangle" points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
      <polygon id="use10" points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
    </g>
    <g id="star" transform="translate(1235,1050) scale(300.3)" fill="white">
      <g id="use13">
        <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
        <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
      </g>
      <g id="use15" transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
        <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
        <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
      </g>
      <g id="use17" transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
        <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
        <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
      </g>
      <g id="use19" transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
        <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
        <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
      </g>
      <g id="use21" transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
        <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
        <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
      </g>
    </g>
    <g id="even_star_row">
      <g id="star 1 even row" transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 1235, 1050)" fill="white">
        <g>
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
      </g>
      <g id="star 2 even row" transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 372105.4849243164, 1050)" fill="white">
        <g>
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
      </g>
      <g id="star 3 even row" transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 742975.9698486328, 1050)" fill="white">
        <g>
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
      </g>
      <g id="star 4 even row" transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 1113846.4547729492, 1050)" fill="white">
        <g>
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
      </g>
      <g id="star 5 even row" transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 1484716.9396972656, 1050)" fill="white">
        <g>
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
      </g>
    </g>
    <g id="odd_star_row">
      <g id="last 5 stars odd row" transform="matrix(1, 0, 0, 1, 617.5, -525)">
        <g transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 1235, 1050)" fill="white">
          <g>
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
        </g>
        <g transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 372105.4849243164, 1050)" fill="white">
          <g>
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
        </g>
        <g transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 742975.9698486328, 1050)" fill="white">
          <g>
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
        </g>
        <g transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 1113846.4547729492, 1050)" fill="white">
          <g>
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
        </g>
        <g transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, 1484716.9396972656, 1050)" fill="white">
          <g>
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
          <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
            <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
            <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
          </g>
        </g>
      </g>
      <g id="star 1 odd row" transform="matrix(300.29998779296875, 0, 0, 300.29998779296875, -184200.2424621582, -156607.4935913086)" fill="white">
        <g>
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, 0.9510565162951535, -0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(0.30901699437494745, -0.9510565162951535, 0.9510565162951535, 0.30901699437494745, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, 0.5877852522924732, -0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
        <g transform="matrix(-0.8090169943749473, -0.5877852522924732, 0.5877852522924732, -0.8090169943749473, 0, 0)">
          <polygon points="0,0 0,1 .5,1" transform="translate(0,-1) rotate(18)"/>
          <polygon points="0,0 0,1 .5,1" transform="matrix(-0.9510565162951535, 0.3090169943749474, 0.3090169943749474, 0.9510565162951535, 0, -1)"/>
        </g>
      </g>
    </g>
    <clipPath clipPathUnits="userSpaceOnUse" id="clipPath23203">
      <path style="opacity:1;fill:white;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:41.7857132;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M -0.0003,0 L -0.0003,9749.9998 L 18525,0.001 L -0.0003,0 z " id="path21313" clip-path="none"/>
    </clipPath>
    <clipPath id="clip-0">
      <path d="M -0.948 -0.947 L -0.948 30.253 L 51.052 30.253 L 51.052 -0.947 L -0.948 -0.947 Z" fill="#012169" style="stroke-width: 1.04;"/>
    </clipPath>
  </defs>
  <g id="svg2" transform="matrix(0.92857, 0, 0, 0.92857, -229.824875, -67.220802)" style="">
    <g transform="matrix(25.576469, 0, 0, 22.434494, 271.776154, 93.659645)">
      <path d="M -0.949 -0.948 L -0.949 30.254 L 51.052 30.254 L 51.052 -0.948 L -0.949 -0.948 Z" fill="#012169"/>
      <path d="M -0.948 -0.947 L 51.052 30.253 M 51.052 -0.947 L -0.948 30.253" stroke-width="6" style="clip-path: url(&quot;#clip-0&quot;); fill: rgb(255, 255, 255); stroke: rgb(255, 255, 255); stroke-width: 6.24;"/>
      <path d="M -0.949 -0.948 L 51.052 30.254 M 51.052 -0.948 L -0.949 30.254" clip-path="url(#clip-2)" stroke="#C8102E" stroke-width="4"/>
      <path d="M -0.948 9.453 L 19.852 9.453 L 19.852 -0.947 L 30.252 -0.947 L 30.252 9.453 L 51.052 9.453 L 51.052 19.853 L 30.252 19.853 L 30.252 30.253 L 19.852 30.253 L 19.852 19.853 L -0.948 19.853 L -0.948 9.453 Z" style="stroke-width: 0px; fill: rgb(255, 255, 255);" stroke="#FFF"/>
      <path d="M -0.948 11.533 L 21.932 11.533 L 21.932 -0.947 L 28.172 -0.947 L 28.172 11.533 L 51.052 11.533 L 51.052 17.773 L 28.172 17.773 L 28.172 30.253 L 21.932 30.253 L 21.932 17.773 L -0.948 17.773 L -0.948 11.533 Z" style="stroke-width: 0px; fill: rgb(200, 16, 46);" stroke="#FFF"/>
    </g>
    <g id="g14785" clip-path="url(#clipPath23203)" style="stroke: none;" transform="matrix(0.071795, 0, 0, 0.071794, 247.504196, 72.391869)">
      <rect style="fill: rgb(191, 10, 48); stroke: none; visibility: hidden;" id="rect14787" height="9750" width="18525" y="0" x="0"/>
      <g transform="matrix(14.999994, 0, 0, 15.000202, -0.001568, -0.001762)">
        <path d="M 0 0 L 1235 0 L 1235 650.002 L 0 650.002" fill="#b31942" style="stroke-width: 0.167;"/>
        <path d="M 0 75 L 1235 75 M 1235 175 L 0 175 M 0 275.001 L 1235 275.001 M 1235 375.001 L 0 375.001 M 0 475.001 L 1235 475.001 M 1235 575.001 L 0 575.001" stroke="#FFF" stroke-width="300" style="stroke-width: 50;"/>
        <path d="M 0 0 L 494.001 0 L 494.001 350.001 L 0 350.001" fill="#0a3161" style="stroke-width: 0.167;"/>
        <g fill="#FFF" transform="matrix(0.166667, 0, 0, 0.166667, 0, 0)">
          <g id="group-1">
            <g id="group-2">
              <g id="group-3">
                <g id="group-4">
                  <path id="path-1" d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
                </g>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1680)"/>
              </g>
              <g transform="matrix(1, 0, 0, 1, 247, 210)">
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
              </g>
            </g>
            <g transform="matrix(1, 0, 0, 1, 494, 0)">
              <g>
                <g>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
                </g>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1680)"/>
              </g>
              <g transform="matrix(1, 0, 0, 1, 247, 210)">
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
              </g>
            </g>
          </g>
          <g transform="matrix(1, 0, 0, 1, 988, 0)">
            <g>
              <g>
                <g>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
                </g>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1680)"/>
              </g>
              <g transform="matrix(1, 0, 0, 1, 247, 210)">
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
              </g>
            </g>
            <g transform="matrix(1, 0, 0, 1, 494, 0)">
              <g>
                <g>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                  <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
                </g>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1680)"/>
              </g>
              <g transform="matrix(1, 0, 0, 1, 247, 210)">
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
              </g>
            </g>
          </g>
          <g transform="matrix(1, 0, 0, 1, 1976, 0)">
            <g>
              <g>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
                <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
              </g>
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1680)"/>
            </g>
            <g transform="matrix(1, 0, 0, 1, 247, 210)">
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
            </g>
          </g>
          <g transform="matrix(1, 0, 0, 1, 2470, 0)">
            <g>
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 420)"/>
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 840)"/>
              <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1260)"/>
            </g>
            <path d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" transform="matrix(1, 0, 0, 1, 0, 1680)"/>
          </g>
        </g>
      </g>
    </g>
    <clipPath id="clip-2">
      <path d="M 25.053 14.653 L 51.052 14.653 L 51.052 30.254 L 25.053 14.653 Z M 25.053 14.653 L 25.053 30.254 L -0.949 30.254 L 25.053 14.653 Z M 25.053 14.653 L -0.949 14.653 L -0.949 -0.948 L 25.053 14.653 Z M 25.053 14.653 L 25.053 -0.948 L 51.052 -0.948 L 25.053 14.653 Z"/>
    </clipPath>
  </g>
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
