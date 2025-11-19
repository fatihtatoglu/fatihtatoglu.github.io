const root = document.documentElement;

const SUPPORTED_LANGUAGES = (root?.dataset?.supportedLanguages ?? "tr,en")
  .split(",")
  .map((code) => code.trim())
  .filter(Boolean);

const DEFAULT_LANGUAGE =
  (root?.dataset?.defaultLanguage && SUPPORTED_LANGUAGES.includes(root.dataset.defaultLanguage)
    ? root.dataset.defaultLanguage
    : SUPPORTED_LANGUAGES[0]) ?? "tr";

const EMBEDDED_DICTIONARIES = readEmbeddedDictionaries();
const translationCache = new Map();
primeTranslationCache();
export const LANGUAGE_CHANGE_EVENT = "tat-language-change";

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };

export function normalizeLanguage(value) {
  if (value && SUPPORTED_LANGUAGES.includes(value)) {
    return value;
  }
  return DEFAULT_LANGUAGE;
}

export function getDictionarySync(lang) {
  if (!lang) return ensureDictionary(DEFAULT_LANGUAGE);
  return ensureDictionary(lang);
}

export async function loadDictionary(lang) {
  return ensureDictionary(lang);
}

export function getDictionaryValue(dict, path) {
  if (!dict || !path) return undefined;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), dict);
}

export function getLocalizedString(lang, path, fallback) {
  const normalized = normalizeLanguage(lang);
  const primaryDict = getDictionarySync(normalized);
  const value = getDictionaryValue(primaryDict, path);
  if (value !== undefined) {
    return value;
  }
  if (normalized !== DEFAULT_LANGUAGE) {
    const defaultDict = getDictionarySync(DEFAULT_LANGUAGE);
    const defaultValue = getDictionaryValue(defaultDict, path);
    if (defaultValue !== undefined) {
      return defaultValue;
    }
  }
  return fallback;
}

export function getRootLanguage() {
  return normalizeLanguage(root?.lang ?? DEFAULT_LANGUAGE);
}

export function setRootLanguage(lang) {
  if (root) {
    root.lang = normalizeLanguage(lang);
  }
}

export function getRootElement() {
  return root;
}

function readEmbeddedDictionaries() {
  if (typeof document === "undefined") return {};
  const script = document.querySelector("[data-i18n-dictionaries]");
  if (!script) return {};
  const raw = script.textContent ?? "";
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("[i18n] Failed to parse embedded dictionaries:", error);
    return {};
  }
}

function primeTranslationCache() {
  Object.entries(EMBEDDED_DICTIONARIES).forEach(([lang, dict]) => {
    translationCache.set(lang, dict);
  });
  if (!translationCache.has(DEFAULT_LANGUAGE)) {
    translationCache.set(DEFAULT_LANGUAGE, {});
  }
}

function ensureDictionary(lang) {
  const normalized = normalizeLanguage(lang);
  if (!translationCache.has(normalized)) {
    const fallback = EMBEDDED_DICTIONARIES[normalized];
    if (fallback) {
      translationCache.set(normalized, fallback);
    } else {
      translationCache.set(normalized, translationCache.get(DEFAULT_LANGUAGE) ?? {});
    }
  }
  return translationCache.get(normalized);
}
