const root = document.documentElement;

const SUPPORTED_LANGUAGES = (root?.dataset?.supportedLanguages ?? "tr,en")
  .split(",")
  .map((code) => code.trim())
  .filter(Boolean);

const DEFAULT_LANGUAGE =
  (root?.dataset?.defaultLanguage && SUPPORTED_LANGUAGES.includes(root.dataset.defaultLanguage)
    ? root.dataset.defaultLanguage
    : SUPPORTED_LANGUAGES[0]) ?? "tr";

const translationCache = new Map();
export const LANGUAGE_CHANGE_EVENT = "tat-language-change";

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };

export function normalizeLanguage(value) {
  if (value && SUPPORTED_LANGUAGES.includes(value)) {
    return value;
  }
  return DEFAULT_LANGUAGE;
}

export function getDictionarySync(lang) {
  if (!lang) return translationCache.get(DEFAULT_LANGUAGE);
  return translationCache.get(normalizeLanguage(lang));
}

export async function loadDictionary(lang) {
  const normalized = normalizeLanguage(lang);
  if (translationCache.has(normalized)) {
    return translationCache.get(normalized);
  }
  const response = await fetch(`/lang/${normalized}.json`);
  if (!response.ok) {
    throw new Error(`Çeviri dosyası yüklenemedi: ${normalized}`);
  }
  const data = await response.json();
  translationCache.set(normalized, data);
  return data;
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
