#!/usr/bin/env node

import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { parseHTML } from "linkedom";
import matter from "gray-matter";
import Mustache from "mustache";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const SRC_DIR = join(ROOT_DIR, "src");
const DIST_DIR = join(ROOT_DIR, "dist");
const CONTENT_DIR = join(SRC_DIR, "content");
const LAYOUTS_DIR = join(SRC_DIR, "layouts");
const TEMPLATES_DIR = join(SRC_DIR, "templates");
const ASSETS_DIR = join(SRC_DIR, "assets");
const SITE_CONFIG_PATH = join(SRC_DIR, "site.json");
const I18N_CONFIG_PATH = join(SRC_DIR, "i18n.json");
const MERMAID_RENDER_CACHE = new Map();
let mermaidReadyPromise = null;

const SITE_CONFIG = loadSiteConfig();

const versionToken = crypto.randomBytes(6).toString("hex");
const BASE_URL = SITE_CONFIG.url ?? "https://tatoglu.net";
const GTM_ID = SITE_CONFIG.analytics?.gtmId ?? "GTM-XXXXXXX";
const GA_ID = SITE_CONFIG.analytics?.gaId ?? "G-XXXXXXXXXX";
const CLARITY_ID = SITE_CONFIG.analytics?.clarityId ?? "CLARITY-ID";
const FALLBACK_ROLES = {
  tr: "Mühendis & Yazar",
  en: "Engineer & Writer",
};
const FALLBACK_QUOTES = {
  tr: "“Hayat devam ediyor, bir ucundan tutmak lazım.”",
  en: "“Life goes on—you just have to grab one end of it.”",
};
const FALLBACK_TITLES = {
  tr: "Fatih Tatoğlu",
  en: "Fatih Tatoğlu",
};
const FALLBACK_DESCRIPTIONS = {
  tr: "Fatih Tatoğlu'nun kişisel blogu. Disiplinli, sade ve retro bir teknik atmosferde üretkenlik notları.",
  en: "Fatih Tatoğlu's personal blog—disciplined, minimal, retro technical atmosphere.",
};
const FALLBACK_OWNER = "Fatih Tatoğlu";
const FALLBACK_TAGLINES = {
  tr: "Her satır merakla başlar, disiplinle tamamlanır.",
  en: "Every line begins with curiosity and ends with discipline.",
};
const LANGUAGE_SETTINGS = SITE_CONFIG.languages ?? {};
const SUPPORTED_LANGUAGES =
  Array.isArray(LANGUAGE_SETTINGS.supported) && LANGUAGE_SETTINGS.supported.length
    ? LANGUAGE_SETTINGS.supported
    : ["tr", "en"];
const DEFAULT_LANGUAGE = LANGUAGE_SETTINGS.default && SUPPORTED_LANGUAGES.includes(LANGUAGE_SETTINGS.default)
  ? LANGUAGE_SETTINGS.default
  : SUPPORTED_LANGUAGES[0] ?? "tr";
const I18N_SOURCE = loadI18nConfig();
const LANGUAGE_DICTIONARIES = buildLanguageDictionaries(I18N_SOURCE, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE);

const LANGUAGE_BUILD_CONFIG = {
  tr: {
    langAttr: "tr",
    metaLanguage: "tr",
    canonical: `${BASE_URL}/`,
    ogLocale: "tr_TR",
    altLocale: "en_US",
  },
  en: {
    langAttr: "en",
    metaLanguage: "en",
    canonical: `${BASE_URL}/en/`,
    ogLocale: "en_US",
    altLocale: "tr_TR",
  },
};

const MENU_ITEMS = {
  tr: [
    { key: "technical", label: "Teknik Notlar", url: "#teknik-notlar" },
    { key: "life", label: "Hayat & Öğrenme", url: "#hayat-ogrenme" },
    { key: "about", label: "Hakkımda", url: "#hakkimda" },
    { key: "contact", label: "İletişim", url: "#iletisim" },
  ],
  en: [
    { key: "technical", label: "Technical Notes", url: "#technical-notes" },
    { key: "life", label: "Life & Learning", url: "#life-learning" },
    { key: "about", label: "About", url: "#about" },
    { key: "contact", label: "Contact", url: "#contact" },
  ],
};

const FOOTER_TAGS = {
  tr: [
    { key: "frontend", label: "Frontend", url: "/etiket/frontend" },
    { key: "javascript", label: "JavaScript", url: "/etiket/javascript" },
    { key: "css", label: "CSS", url: "/etiket/css" },
    { key: "designSystems", label: "Design Systems", url: "/etiket/design-systems" },
    { key: "webPerformance", label: "Web Performansı", url: "/etiket/web-performansi" },
    { key: "accessibility", label: "Erişilebilirlik", url: "/etiket/erisilebilirlik" },
    { key: "learningNotes", label: "Öğrenme Notları", url: "/etiket/ogrenme-notlari" },
    { key: "productThinking", label: "Ürün Düşüncesi", url: "/etiket/urun-dusuncesi" },
    { key: "writing", label: "Yazarlık", url: "/etiket/yazarlik" },
    { key: "lifeLearning", label: "Yaşam & Öğrenme", url: "/etiket/yasam-ogrenme" },
  ],
  en: [
    { key: "frontend", label: "Frontend", url: "/en/tag/frontend" },
    { key: "javascript", label: "JavaScript", url: "/en/tag/javascript" },
    { key: "css", label: "CSS", url: "/en/tag/css" },
    { key: "designSystems", label: "Design Systems", url: "/en/tag/design-systems" },
    { key: "webPerformance", label: "Web Performance", url: "/en/tag/web-performance" },
    { key: "accessibility", label: "Accessibility", url: "/en/tag/accessibility" },
    { key: "learningNotes", label: "Learning Notes", url: "/en/tag/learning-notes" },
    { key: "productThinking", label: "Product Thinking", url: "/en/tag/product-thinking" },
    { key: "writing", label: "Writing", url: "/en/tag/writing" },
    { key: "lifeLearning", label: "Life & Learning", url: "/en/tag/life-learning" },
  ],
};

const FOOTER_POLICIES = {
  tr: [
    { key: "cookies", label: "Çerez Politikası", url: "/cerez-politikasi" },
    { key: "disclaimer", label: "Sorumluluk Reddi", url: "/sorumluluk-reddi" },
  ],
  en: [
    { key: "cookies", label: "Cookie Policy", url: "/en/cookie-policy" },
    { key: "disclaimer", label: "Disclaimer", url: "/en/disclaimer" },
  ],
};

const FOOTER_SOCIAL_ICONS = {
  rss: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
  </svg>`,
  github: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.648.5.5 5.648.5 12.02c0 5.095 3.292 9.405 7.868 10.939.575.107.786-.246.786-.548 0-.271-.01-1.173-.016-2.128-3.2.696-3.878-1.543-3.878-1.543-.523-1.329-1.278-1.685-1.278-1.685-1.045-.715.079-.701.079-.701 1.156.082 1.765 1.189 1.765 1.189 1.028 1.763 2.698 1.253 3.356.958.104-.75.402-1.253.73-1.541-2.555-.291-5.242-1.278-5.242-5.688 0-1.256.45-2.282 1.188-3.086-.119-.292-.516-1.473.113-3.069 0 0 .967-.31 3.17 1.18a11.02 11.02 0 0 1 5.774 0c2.202-1.49 3.168-1.18 3.168-1.18.63 1.596.233 2.777.114 3.07.74.804 1.188 1.83 1.188 3.086 0 4.422-2.692 5.395-5.258 5.681.413.356.78 1.055.78 2.127 0 1.538-.014 2.778-.014 3.158 0 .304.21.66.79.547 4.574-1.536 7.864-5.846 7.864-10.94C23.5 5.648 18.352.5 12 .5Z" />
  </svg>`,
  linkedin: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.5 9.25h3.5v11H4.5zM6.25 3.75A2.25 2.25 0 1 1 4 6a2.25 2.25 0 0 1 2.25-2.25M9.75 9.25h3.36v1.52h.05c.47-.89 1.62-1.82 3.34-1.82 3.57 0 4.23 2.35 4.23 5.42v5.88h-3.5v-5.21c0-1.24-.02-2.84-1.73-2.84s-2 1.35-2 2.74v5.31h-3.75z" />
  </svg>`,
};

const FOOTER_SOCIAL = [
  { key: "rss", tone: "rss", url: "/feed.xml", external: false },
  { key: "github", tone: "github", url: "https://github.com/fatihtatoglu", external: true },
  { key: "linkedin", tone: "linkedin", url: "https://www.linkedin.com/in/fatihtatoglu/", external: true },
];

const PARTIALS = loadPartials();
const GENERATED_PAGES = new Set();
const layoutCache = new Map();
const templateCache = new Map();

marked.setOptions({ mangle: false, headerIds: false, gfm: true });

const ANALYTICS_SNIPPETS = [
  `<script>(function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" }); var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l !== "dataLayer" ? "&l=" + l : ""; j.async = true; j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl; f.parentNode.insertBefore(j, f); })(window, document, "script", "dataLayer", "${GTM_ID}");</script>`,
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>`,
  `<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag("js", new Date()); gtag("config", "${GA_ID}");</script>`,
  `<script>(function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){ (c[a].q=c[a].q||[]).push(arguments); }; t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i; y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y); })(window, document, "clarity", "script", "${CLARITY_ID}");</script>`,
];

function run(command) {
  execSync(command, { stdio: "inherit", cwd: ROOT_DIR });
}

function ensureDist() {
  rmSync(DIST_DIR, { recursive: true, force: true });
  mkdirSync(DIST_DIR, { recursive: true });
}

function buildCss() {
  run("npx @tailwindcss/cli -c tailwind.config.js -i ./src/css/style.css -o ./dist/output.css --minify");
}

function buildJs() {
  run("npx esbuild ./src/js/main.js --bundle --format=esm --target=es2018 --minify --sourcemap --outfile=./dist/output.js");
}

function setGlobalValue(key, value) {
  if (value === undefined) return;
  try {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  } catch {
    globalThis[key] = value;
  }
}

function copyWindowEnv(window) {
  setGlobalValue("window", window);
  const props = [
    "document",
    "navigator",
    "Element",
    "HTMLElement",
    "HTMLDivElement",
    "SVGElement",
    "SVGPathElement",
    "Node",
    "Text",
    "DOMParser",
    "getComputedStyle",
    "matchMedia",
    "performance",
  ];
  props.forEach((key) => {
    if (window[key]) {
      setGlobalValue(key, window[key]);
    }
  });
  const raf = typeof window.requestAnimationFrame === "function" ? window.requestAnimationFrame.bind(window) : (cb) => setTimeout(cb, 0);
  const caf =
    typeof window.cancelAnimationFrame === "function"
      ? window.cancelAnimationFrame.bind(window)
      : (handle) => clearTimeout(handle);
  setGlobalValue("requestAnimationFrame", raf);
  setGlobalValue("cancelAnimationFrame", caf);
}

function patchSvgGetBBox(window) {
  const proto = window.SVGElement?.prototype;
  if (!proto || typeof proto.getBBox === "function") return;
  proto.getBBox = function getBBox() {
    const tag = (this.tagName || "").toLowerCase();
    if (tag === "text" || tag === "tspan") {
      const fontSize = parseFloat(this.getAttribute("font-size") ?? "") || 16;
      const textContent = (this.textContent ?? "").replace(/\s+/g, " ").trim();
      const lines = textContent ? textContent.split(/\r?\n/) : [""];
      const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
      const charWidth = fontSize * 0.7;
      const width = Math.max(longestLine * charWidth + fontSize * 2, fontSize * 6);
      const height = Math.max((lines.length || 1) * fontSize * 1.5, fontSize * 2);
      return { x: 0, y: -height * 0.7, width, height };
    }
    const widthAttr = parseFloat(this.getAttribute("width") ?? "") || 0;
    const heightAttr = parseFloat(this.getAttribute("height") ?? "") || 0;
    if (widthAttr && heightAttr) {
      return { x: 0, y: 0, width: widthAttr, height: heightAttr };
    }
    return { x: 0, y: 0, width: 100, height: 40 };
  };
}

function patchTextMeasurement(window) {
  const proto = window.SVGElement?.prototype;
  if (!proto) return;
  if (typeof proto.getComputedTextLength !== "function") {
    proto.getComputedTextLength = function getComputedTextLength() {
      const box = this.getBBox();
      return box?.width ?? 0;
    };
  }
}

async function ensureMermaidReady() {
  if (!mermaidReadyPromise) {
    mermaidReadyPromise = (async () => {
      const { window } = parseHTML("<html><body><div id=\"__mermaid_root\"></div></body></html>");
      copyWindowEnv(window);
      patchSvgGetBBox(window);
      patchTextMeasurement(window);
      const { default: createDOMPurify } = await import("dompurify");
      const DOMPurify = createDOMPurify(window);
      window.DOMPurify = DOMPurify;
      setGlobalValue("DOMPurify", DOMPurify);
      const { default: mermaidModule } = await import("mermaid");
      mermaidModule.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "default",
        flowchart: {
          htmlLabels: false,
          useMaxWidth: true,
        },
      });
      return mermaidModule;
    })();
  }
  return mermaidReadyPromise;
}

async function renderMermaidDiagram(definition) {
  const trimmed = (definition ?? "").trim();
  if (!trimmed) return null;
  const mermaidModule = await ensureMermaidReady();
  const cacheKey = crypto.createHash("sha1").update(trimmed).digest("hex");
  if (MERMAID_RENDER_CACHE.has(cacheKey)) {
    return MERMAID_RENDER_CACHE.get(cacheKey);
  }
  try {
    const tempContainer = document.createElement("div");
    document.body.appendChild(tempContainer);
    const renderId = `mermaid-${cacheKey}-${MERMAID_RENDER_CACHE.size}`;
    const { svg } = await mermaidModule.render(renderId, trimmed, tempContainer);
    tempContainer.remove();
    const normalizedSvg = (svg ?? "")
      .replace(/style="max-width:[^"]*"/, 'style="max-width: 100%;"')
      .trim();
    if (normalizedSvg) {
      MERMAID_RENDER_CACHE.set(cacheKey, normalizedSvg);
    }
    return normalizedSvg || null;
  } catch (error) {
    console.warn("[mermaid] Failed to render diagram:", error?.message ?? error);
    return null;
  }
}

async function convertMermaidBlocks(markdown, sourcePath) {
  if (!markdown || typeof markdown !== "string") return markdown;
  if (!markdown.includes("```mermaid")) return markdown;
  const regex = /```mermaid\s*\r?\n([\s\S]*?)```/g;
  let cursor = 0;
  let result = "";
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    result += markdown.slice(cursor, match.index);
    const svg = await renderMermaidDiagram(match[1]);
    if (svg) {
      result += `\n\n<figure class="mermaid-diagram" data-diagram="mermaid">\n${svg}\n</figure>\n\n`;
    } else {
      const label = sourcePath ? ` in ${toPosixPath(sourcePath)}` : "";
      console.warn(`[mermaid] Leaving code fence as-is because rendering failed${label}.`);
      result += match[0];
    }
    cursor = match.index + match[0].length;
  }
  result += markdown.slice(cursor);
  return result;
}

function writeLanguageBundles() {
  const langDir = join(DIST_DIR, "lang");
  mkdirSync(langDir, { recursive: true });
  SUPPORTED_LANGUAGES.forEach((lang) => {
    const dictionary = LANGUAGE_DICTIONARIES[lang];
    if (!dictionary) return;
    const targetPath = join(langDir, `${lang}.json`);
    writeFileSync(targetPath, JSON.stringify(dictionary, null, 2), "utf8");
  });
}

function transformHtml(html) {
  return html
    .replace(/\/output\.css(\?v=[^"']+)?/g, `/output.css?v=${versionToken}`)
    .replace(/\/output\.js(\?v=[^"']+)?/g, `/output.js?v=${versionToken}`);
}

function loadSiteConfig() {
  try {
    if (!existsSync(SITE_CONFIG_PATH)) {
      return {};
    }
    const raw = readFileSync(SITE_CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to read site config at ${SITE_CONFIG_PATH}:`, error);
    return {};
  }
}

function loadI18nConfig() {
  try {
    if (!existsSync(I18N_CONFIG_PATH)) {
      return {};
    }
    const raw = readFileSync(I18N_CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to read i18n config at ${I18N_CONFIG_PATH}:`, error);
    return {};
  }
}

function buildLanguageDictionaries(source, languages, defaultLang) {
  const dictionaries = {};
  const languageSet = new Set(languages);
  languages.forEach((lang) => {
    dictionaries[lang] = {};
  });

  function assignValue(target, pathSegments, value) {
    let cursor = target;
    pathSegments.forEach((segment, index) => {
      if (index === pathSegments.length - 1) {
        cursor[segment] = value;
        return;
      }
      if (!cursor[segment] || typeof cursor[segment] !== "object") {
        cursor[segment] = {};
      }
      cursor = cursor[segment];
    });
  }

  function isLanguageLeaf(node) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return false;
    const keys = Object.keys(node);
    if (!keys.length) return false;
    return keys.every((key) => languageSet.has(key));
  }

  function walk(node, path = []) {
    if (isLanguageLeaf(node)) {
      languages.forEach((lang) => {
        const localizedValue = node[lang] ?? node[defaultLang];
        if (localizedValue !== undefined) {
          assignValue(dictionaries[lang], path, localizedValue);
        }
      });
      return;
    }
    if (!node || typeof node !== "object") return;
    Object.entries(node).forEach(([key, child]) => walk(child, path.concat(key)));
  }

  walk(source);
  return dictionaries;
}

function getLanguageDictionary(lang) {
  return LANGUAGE_DICTIONARIES[lang] ?? LANGUAGE_DICTIONARIES[DEFAULT_LANGUAGE] ?? {};
}

function getLocalizedValue(lang, path, fallback) {
  const dict = getLanguageDictionary(lang);
  const value = path.split(".").reduce((acc, segment) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[segment];
  }, dict);
  if (value !== undefined) {
    return value;
  }
  if (lang !== DEFAULT_LANGUAGE) {
    const defaultDict = getLanguageDictionary(DEFAULT_LANGUAGE);
    const defaultValue = path.split(".").reduce((acc, segment) => {
      if (acc === undefined || acc === null) return undefined;
      return acc[segment];
    }, defaultDict);
    if (defaultValue !== undefined) {
      return defaultValue;
    }
  }
  return fallback;
}

function writeHtmlFile(relativePath, html) {
  const destPath = join(DIST_DIR, relativePath);
  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, html, "utf8");
}

function applyLanguageMetadata(html, langKey) {
  const config = LANGUAGE_BUILD_CONFIG[langKey];
  if (!config) return html;
  return html
    .replace(/(<html\b[^>]*\slang=")(.*?)"/, `$1${config.langAttr}"`)
    .replace(/(<meta name="language" content=")(.*?)"/, `$1${config.metaLanguage}"`)
    .replace(/(<link rel="canonical" href=")(.*?)" data-canonical/, `$1${config.canonical}" data-canonical`)
    .replace(/(<meta property="og:url" content=")(.*?)" data-og-url/, `$1${config.canonical}" data-og-url`)
    .replace(/(<meta name="twitter:url" content=")(.*?)" data-twitter-url/, `$1${config.canonical}" data-twitter-url`)
    .replace(/(<meta property="og:locale" content=")(.*?)" data-og-locale/, `$1${config.ogLocale}" data-og-locale`)
    .replace(/(<meta property="og:locale:alternate" content=")(.*?)" data-og-locale-alt/, `$1${config.altLocale}" data-og-locale-alt`);
}

function loadPartials() {
  const partials = {};
  if (!existsSync(LAYOUTS_DIR)) return partials;
  readdirSync(LAYOUTS_DIR).forEach((entry) => {
    if (!entry.startsWith("_") || !entry.endsWith(".mustache")) return;
    const key = `partials/${entry.replace(/\.mustache$/, "")}`;
    partials[key] = readFileSync(join(LAYOUTS_DIR, entry), "utf8");
  });
  return partials;
}

function getLayout(name) {
  if (layoutCache.has(name)) return layoutCache.get(name);
  const filePath = join(LAYOUTS_DIR, `${name}.mustache`);
  if (!existsSync(filePath)) {
    throw new Error(`Layout not found: ${name}`);
  }
  const template = readFileSync(filePath, "utf8");
  layoutCache.set(name, template);
  return template;
}

function getTemplate(name) {
  if (templateCache.has(name)) return templateCache.get(name);
  const filePath = join(TEMPLATES_DIR, `${name}.mustache`);
  if (!existsSync(filePath)) {
    throw new Error(`Template not found: ${name}`);
  }
  const template = readFileSync(filePath, "utf8");
  templateCache.set(name, template);
  return template;
}

function resolveUrl(value) {
  if (!value) return BASE_URL;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("~/")) {
    return `${BASE_URL}/${value.slice(2)}`.replace(/([^:]\/)\/+/g, "$1");
  }
  if (value.startsWith("/")) {
    return `${BASE_URL}${value}`.replace(/([^:]\/)\/+/g, "$1");
  }
  return `${BASE_URL}/${value}`.replace(/([^:]\/)\/+/g, "$1");
}

function buildSiteData(lang) {
  const fallbackOwner = FALLBACK_OWNER;
  const author = SITE_CONFIG.author ?? fallbackOwner;
  const owner = getLocalizedValue(lang, "site.owner", fallbackOwner);
  const title = getLocalizedValue(
    lang,
    "site.title",
    FALLBACK_TITLES[lang] ?? FALLBACK_TITLES[DEFAULT_LANGUAGE] ?? fallbackOwner,
  );
  const description = getLocalizedValue(
    lang,
    "site.description",
    FALLBACK_DESCRIPTIONS[lang] ?? FALLBACK_DESCRIPTIONS[DEFAULT_LANGUAGE] ?? "",
  );
  const role = getLocalizedValue(
    lang,
    "site.role",
    FALLBACK_ROLES[lang] ?? FALLBACK_ROLES[DEFAULT_LANGUAGE] ?? FALLBACK_ROLES.en,
  );
  const quote = getLocalizedValue(
    lang,
    "site.quote",
    FALLBACK_QUOTES[lang] ?? FALLBACK_QUOTES[DEFAULT_LANGUAGE] ?? FALLBACK_QUOTES.en,
  );
  return {
    title,
    description,
    author,
    owner,
    role,
    quote,
    home: lang === "en" ? "/en/" : "/",
    url: SITE_CONFIG.url ?? BASE_URL,
    themeColor: SITE_CONFIG.themeColor ?? "#5a8df0",
    gtmId: GTM_ID,
    year: new Date().getFullYear(),
    languages: {
      supported: SUPPORTED_LANGUAGES,
      default: DEFAULT_LANGUAGE,
    },
    languagesCsv: SUPPORTED_LANGUAGES.join(","),
    defaultLanguage: DEFAULT_LANGUAGE,
  };
}

function getMenuData(lang) {
  const baseItems = MENU_ITEMS[lang] ?? MENU_ITEMS[DEFAULT_LANGUAGE] ?? [];
  const items = baseItems.map((item) => ({
    ...item,
    label: getLocalizedValue(lang, `menu.${item.key}`, item.label ?? item.key),
  }));
  return { items };
}

function getFooterData(lang) {
  const tagsSource = FOOTER_TAGS[lang] ?? FOOTER_TAGS[DEFAULT_LANGUAGE] ?? [];
  const policiesSource = FOOTER_POLICIES[lang] ?? FOOTER_POLICIES[DEFAULT_LANGUAGE] ?? [];
  const social = FOOTER_SOCIAL.map((item) => ({
    ...item,
    icon: FOOTER_SOCIAL_ICONS[item.key],
    label: getLocalizedValue(lang, `footer.social.${item.key}`, item.key.toUpperCase()),
  }));
  const tags = tagsSource.map((tag) => ({
    ...tag,
    label: getLocalizedValue(lang, `footer.tags.${tag.key}`, tag.label ?? tag.key),
  }));
  const policies = policiesSource.map((policy) => ({
    ...policy,
    label: getLocalizedValue(lang, `footer.policies.${policy.key}`, policy.label ?? policy.key),
  }));
  const tagline = getLocalizedValue(
    lang,
    "footer.tagline",
    FALLBACK_TAGLINES[lang] ?? FALLBACK_TAGLINES[DEFAULT_LANGUAGE] ?? FALLBACK_TAGLINES.en,
  );
  return {
    tags,
    policies,
    social,
    tagline,
  };
}

function buildPageMeta(front, lang, slug) {
  const canonicalUrl = resolveUrl(front.canonical ?? defaultCanonical(lang, slug));
  const alternateUrl = resolveUrl(front.alternate ?? canonicalUrl);
  const ogLocale = lang === "en" ? "en_US" : "tr_TR";
  const altLocale = lang === "en" ? "tr_TR" : "en_US";
  const ogImage = resolveUrl(front.ogImage ?? "/og-image.jpg");
  return {
    title: front.title ?? "Untitled",
    description: front.description ?? "",
    robots: front.robots ?? "index,follow",
    canonical: canonicalUrl,
    alternates: {
      tr: lang === "tr" ? canonicalUrl : alternateUrl,
      en: lang === "en" ? canonicalUrl : alternateUrl,
      default: canonicalUrl,
    },
    og: {
      title: front.ogTitle ?? front.title ?? "",
      description: front.ogDescription ?? front.description ?? "",
      type: front.ogType ?? "article",
      url: canonicalUrl,
      image: ogImage,
      locale: front.ogLocale ?? ogLocale,
      altLocale: front.ogAltLocale ?? altLocale,
    },
    twitter: {
      card: front.twitterCard ?? "summary_large_image",
      title: front.twitterTitle ?? front.title ?? "",
      description: front.twitterDescription ?? front.description ?? "",
      image: resolveUrl(front.twitterImage ?? "/og-image.jpg"),
      url: canonicalUrl,
    },
  };
}

function formatDate(value, lang) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const locale = lang === "en" ? "en-US" : "tr-TR";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function defaultCanonical(lang, slug) {
  const cleanedSlug = (slug ?? "").replace(/^\/+/, "").replace(/\/+$/, "");
  const prefix = lang === "en" ? "en" : "";
  const segments = [BASE_URL];
  if (prefix) segments.push(prefix);
  if (cleanedSlug) segments.push(cleanedSlug);
  return segments.join("/") + "/";
}

function canonicalToRelativePath(value) {
  if (!value) return null;
  let path = value;
  if (path.startsWith("~/")) {
    path = path.slice(2);
  } else if (/^https?:\/\//i.test(path)) {
    path = path.replace(/^https?:\/\/[^/]+/i, "");
  }
  path = path.trim();
  if (!path) return null;
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

function renderContentTemplate(templateName, contentHtml, front, lang) {
  const template = getTemplate(templateName);
  const normalizedTags = Array.isArray(front.tags)
    ? front.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
    : [];
  const normalizedFront = {
    ...front,
    tags: normalizedTags,
    hasTags: normalizedTags.length > 0,
    dateDisplay: formatDate(front.date, lang),
    updatedDisplay: formatDate(front.updated, lang),
  };
  return Mustache.render(template, {
    content: { html: decorateHtml(contentHtml, templateName) },
    front: normalizedFront,
    lang,
    locale: {
      isTr: lang === "tr",
      isEn: lang === "en",
    },
  });
}

function decorateHtml(html, templateName) {
  return html;
}

function buildOutputPath(front, lang, slug) {
  const canonicalRelative = canonicalToRelativePath(front.canonical);
  if (canonicalRelative) {
    return join(canonicalRelative, "index.html");
  }
  const cleaned = (slug ?? "").replace(/^\/+/, "");
  const segments = [];
  if (lang && lang !== DEFAULT_LANGUAGE) {
    segments.push(lang);
  }
  if (cleaned) {
    segments.push(cleaned);
  }
  return join(...segments.filter(Boolean), "index.html");
}

function toPosixPath(value) {
  return value.split(sep).join("/");
}

function collectMarkdownFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  readdirSync(dir).forEach((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.endsWith(".md")) {
      files.push(fullPath);
    }
  });
  return files;
}

function inferLangFromPath(filePath) {
  const relative = toPosixPath(filePath.replace(`${toPosixPath(CONTENT_DIR)}/`, ""));
  const [langFolder] = relative.split("/");
  return SUPPORTED_LANGUAGES.includes(langFolder) ? langFolder : DEFAULT_LANGUAGE;
}

async function buildContentPages() {
  if (!existsSync(CONTENT_DIR)) return;
  const files = collectMarkdownFiles(CONTENT_DIR);
  for (const filePath of files) {
    const raw = readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const lang = data.lang ?? inferLangFromPath(filePath);
    const slug = data.slug ?? crypto.randomBytes(4).toString("hex");
    const layoutName = data.layout ?? "default";
    const templateName = data.template ?? "page";
    const enrichedContent = await convertMermaidBlocks(content ?? "", filePath);
    const markdownHtml = marked.parse(enrichedContent ?? "");
    const contentHtml = renderContentTemplate(templateName, markdownHtml, data, lang);
    const pageMeta = buildPageMeta(data, lang, slug);
    const layoutTemplate = getLayout(layoutName);
    const view = {
      lang,
      theme: "light",
      site: buildSiteData(lang),
      menu: getMenuData(lang),
      footer: getFooterData(lang),
      i18n: getLanguageDictionary(lang),
      page: pageMeta,
      content: contentHtml,
      scripts: {
        analytics: ANALYTICS_SNIPPETS,
        body: [],
      },
    };
    const rendered = Mustache.render(layoutTemplate, view, PARTIALS);
    const finalHtml = transformHtml(rendered);
    const relativePath = buildOutputPath(data, lang, slug);
    writeHtmlFile(relativePath, finalHtml);
    GENERATED_PAGES.add(toPosixPath(relativePath));
    registerLegacyPaths(lang, slug);
  }
}

function registerLegacyPaths(lang, slug) {
  const cleaned = (slug ?? "").replace(/^\/+/, "");
  if (!cleaned) return;
  const legacyFile = cleaned.endsWith(".html") ? cleaned : `${cleaned}.html`;
  GENERATED_PAGES.add(toPosixPath(legacyFile));
  if (lang && lang !== DEFAULT_LANGUAGE) {
    GENERATED_PAGES.add(toPosixPath(join(lang, legacyFile)));
  }
}

function copyHtmlRecursive(currentDir = SRC_DIR, relative = "") {
  readdirSync(currentDir).forEach((entry) => {
    const fullPath = join(currentDir, entry);
    const relPath = relative ? join(relative, entry) : entry;
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      copyHtmlRecursive(fullPath, relPath);
      return;
    }
    if (!entry.endsWith(".html")) return;
    if (GENERATED_PAGES.has(toPosixPath(relPath))) return;
    const raw = readFileSync(fullPath, "utf8");
    const transformed = transformHtml(raw);
    if (relPath === "index.html") {
      SUPPORTED_LANGUAGES.forEach((langCode) => {
        const localized = applyLanguageMetadata(transformed, langCode);
        const segments = [];
        if (langCode !== DEFAULT_LANGUAGE) {
          segments.push(langCode);
        }
        segments.push("index.html");
        writeHtmlFile(join(...segments), localized);
      });
      return;
    }
    writeHtmlFile(relPath, transformed);
  });
}

function copyStaticAssets() {
  if (!existsSync(ASSETS_DIR)) return;
  const targetDir = join(DIST_DIR, "assets");
  cpSync(ASSETS_DIR, targetDir, { recursive: true });
}

async function main() {
  ensureDist();
  buildCss();
  buildJs();
  writeLanguageBundles();
  await buildContentPages();
  copyHtmlRecursive();
  copyStaticAssets();
}

main().catch((error) => {
  console.error("Build failed:", error);
  process.exitCode = 1;
});
