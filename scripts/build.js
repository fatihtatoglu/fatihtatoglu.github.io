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
const COMPONENTS_DIR = join(SRC_DIR, "components");
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
const FALLBACK_ROLES = { tr: "-", en: "-", };
const FALLBACK_QUOTES = { tr: "-", en: "-", };
const FALLBACK_TITLES = { tr: "-", en: "-", };
const FALLBACK_DESCRIPTIONS = { tr: "-", en: "-", };
const FALLBACK_OWNER = "-";
const FALLBACK_TAGLINES = { tr: "-", en: "-", };
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
const I18N_INLINE_JSON = serializeForInlineScript(LANGUAGE_DICTIONARIES);

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

const MENU_ITEMS = buildMenuItemsFromContent();
const PAGES = buildCategoryTagCollections();

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

const FOOTER_POLICIES = buildFooterPoliciesFromContent();

const FOOTER_SOCIAL_ICONS = {
  rss: `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 32 32"><g class="nc-icon-wrapper" fill="currentColor"><circle cx="6.566" cy="25.434" r="3.566"></circle><path d="M20.234,29h-5.051c0-6.728-5.454-12.183-12.183-12.183h0v-5.051c9.518,0,17.234,7.716,17.234,17.234Z"></path><path d="M23.8,29c0-11.488-9.312-20.8-20.8-20.8V3c14.359,0,26,11.641,26,26h-5.2Z"></path></g></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 32 32"><g class="nc-icon-wrapper" fill="currentColor"><path d="M16,2.345c7.735,0,14,6.265,14,14-.002,6.015-3.839,11.359-9.537,13.282-.7,.14-.963-.298-.963-.665,0-.473,.018-1.978,.018-3.85,0-1.312-.437-2.152-.945-2.59,3.115-.35,6.388-1.54,6.388-6.912,0-1.54-.543-2.783-1.435-3.762,.14-.35,.63-1.785-.14-3.71,0,0-1.173-.385-3.85,1.435-1.12-.315-2.31-.472-3.5-.472s-2.38,.157-3.5,.472c-2.677-1.802-3.85-1.435-3.85-1.435-.77,1.925-.28,3.36-.14,3.71-.892,.98-1.435,2.24-1.435,3.762,0,5.355,3.255,6.563,6.37,6.913-.403,.35-.77,.963-.893,1.872-.805,.368-2.818,.963-4.077-1.155-.263-.42-1.05-1.452-2.152-1.435-1.173,.018-.472,.665,.017,.927,.595,.332,1.277,1.575,1.435,1.978,.28,.787,1.19,2.293,4.707,1.645,0,1.173,.018,2.275,.018,2.607,0,.368-.263,.787-.963,.665-5.719-1.904-9.576-7.255-9.573-13.283,0-7.735,6.265-14,14-14Z"></path></g></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 32 32"><g class="nc-icon-wrapper" fill="currentColor"><path d="M26.111,3H5.889c-1.595,0-2.889,1.293-2.889,2.889V26.111c0,1.595,1.293,2.889,2.889,2.889H26.111c1.595,0,2.889-1.293,2.889-2.889V5.889c0-1.595-1.293-2.889-2.889-2.889ZM10.861,25.389h-3.877V12.87h3.877v12.519Zm-1.957-14.158c-1.267,0-2.293-1.034-2.293-2.31s1.026-2.31,2.293-2.31,2.292,1.034,2.292,2.31-1.026,2.31-2.292,2.31Zm16.485,14.158h-3.858v-6.571c0-1.802-.685-2.809-2.111-2.809-1.551,0-2.362,1.048-2.362,2.809v6.571h-3.718V12.87h3.718v1.686s1.118-2.069,3.775-2.069,4.556,1.621,4.556,4.975v7.926Z" fill-rule="evenodd"></path></g></svg>`,
};

const FOOTER_SOCIAL = [
  { key: "rss", tone: "rss", url: "/feed.xml", external: false },
  { key: "github", tone: "github", url: "https://github.com/fatihtatoglu", external: true },
  { key: "linkedin", tone: "linkedin", url: "https://www.linkedin.com/in/fatihtatoglu/", external: true },
];

const PARTIALS = loadPartials();
const COMPONENT_PARTIALS = loadComponentPartials();
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

function serializeForInlineScript(value) {
  return JSON.stringify(value ?? {})
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
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

function loadComponentPartials() {
  const partials = {};
  if (!existsSync(COMPONENTS_DIR)) return partials;
  readdirSync(COMPONENTS_DIR).forEach((entry) => {
    if (!entry.endsWith(".mustache")) return;
    const key = `components/${entry.replace(/\.mustache$/, "")}`;
    partials[key] = readFileSync(join(COMPONENTS_DIR, entry), "utf8");
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

function getMenuData(lang, activeKey) {
  const baseItems = MENU_ITEMS[lang] ?? MENU_ITEMS[DEFAULT_LANGUAGE] ?? [];
  const normalizedActiveKey =
    typeof activeKey === "string" && activeKey.trim().length > 0 ? activeKey.trim() : null;
  const hasExplicitMatch = normalizedActiveKey
    ? baseItems.some((item) => item.key === normalizedActiveKey)
    : false;
  const resolvedActiveKey = hasExplicitMatch
    ? normalizedActiveKey
    : baseItems[0]?.key ?? "";
  const items = baseItems.map((item) => ({
    ...item,
    label: getLocalizedValue(lang, `menu.${item.key}`, item.label ?? item.key),
    isActive: item.key === resolvedActiveKey,
  }));
  return { items, activeKey: resolvedActiveKey };
}

function resolveActiveMenuKey(frontMatter) {
  if (!frontMatter) return null;
  if (typeof frontMatter.id === "string" && frontMatter.id.trim().length > 0) {
    return frontMatter.id.trim();
  }
  if (typeof frontMatter.slug === "string" && frontMatter.slug.trim().length > 0) {
    return frontMatter.slug.trim();
  }
  return null;
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

function renderContentTemplate(templateName, contentHtml, front, lang, dictionary) {
  const template = getTemplate(templateName);
  const normalizedTags = Array.isArray(front.tags)
    ? front.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
    : [];
  const resolvedDictionary = dictionary ?? getLanguageDictionary(lang);
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
    listing: buildCollectionListing(normalizedFront, lang),
    locale: {
      isTr: lang === "tr",
      isEn: lang === "en",
    },
    i18n: resolvedDictionary,
  });
}

function buildContentComponentContext(frontMatter, lang, dictionary) {
  const normalizedLang = lang ?? DEFAULT_LANGUAGE;
  return {
    front: frontMatter ?? {},
    lang: normalizedLang,
    i18n: dictionary ?? {},
    pages: PAGES[normalizedLang] ?? {},
    allPages: PAGES,
  };
}

function renderMarkdownComponents(markdown, context = {}) {
  if (!markdown || typeof markdown !== "string") {
    return { markdown: markdown ?? "", placeholders: [] };
  }
  const placeholders = [];
  const componentPattern = /{{>\s*components\/([A-Za-z0-9_\-./]+)\s*}}/g;
  let working = markdown;
  working = working.replace(componentPattern, (_, componentName) => {
    const partialKey = componentName.startsWith("components/")
      ? componentName
      : `components/${componentName}`;
    const template = COMPONENT_PARTIALS[partialKey];
    if (!template) return "";
    const tokenId = `COMPONENT_SLOT_${placeholders.length}_${componentName.replace(/[^A-Za-z0-9_-]/g, "_")}_${crypto.randomBytes(4).toString("hex")}`;
    const marker = `\n<!--${tokenId}-->\n`;
    const html = Mustache.render(template, context, {
      ...PARTIALS,
      ...COMPONENT_PARTIALS,
    });
    placeholders.push({ marker, html });
    return marker;
  });
  const renderedMarkdown = Mustache.render(working, context, {
    ...PARTIALS,
    ...COMPONENT_PARTIALS,
  });
  return { markdown: renderedMarkdown, placeholders };
}

function injectMarkdownComponents(html, placeholders) {
  if (!html || !placeholders || !placeholders.length) {
    return html;
  }
  let output = html;
  placeholders.forEach(({ marker, html: snippet }) => {
    output = output.split(marker).join(snippet);
  });
  return output;
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

function inferSlugFromPath(filePath) {
  const relative = toPosixPath(filePath.replace(`${toPosixPath(CONTENT_DIR)}/`, ""));
  const parts = relative.split("/");
  const lastPart = parts[parts.length - 1] ?? "";
  return lastPart.replace(/\.md$/i, "");
}

function buildContentUrl(canonical, lang, slug) {
  const normalizedLang = lang ?? DEFAULT_LANGUAGE;
  if (typeof canonical === "string" && canonical.trim().length > 0) {
    const relative = canonicalToRelativePath(canonical.trim());
    if (relative) {
      return `/${relative}`.replace(/\/+/g, "/");
    }
    return canonical.trim();
  }
  const fallback = canonicalToRelativePath(defaultCanonical(normalizedLang, slug));
  if (fallback) {
    return `/${fallback}`.replace(/\/+/g, "/");
  }
  const slugSegment = slug ? `/${slug}` : "/";
  if (normalizedLang !== DEFAULT_LANGUAGE) {
    return `/${normalizedLang}${slugSegment}`.replace(/\/+/g, "/");
  }
  return slugSegment.replace(/\/+/g, "/");
}

function buildFooterPoliciesFromContent() {
  const policiesByLang = {};
  if (!existsSync(CONTENT_DIR)) return policiesByLang;
  const files = collectMarkdownFiles(CONTENT_DIR);
  for (const filePath of files) {
    let data;
    try {
      ({ data } = matter(readFileSync(filePath, "utf8")));
    } catch {
      continue;
    }
    const category = typeof data?.category === "string" ? data.category.trim().toLowerCase() : "";
    if (category !== "policy") continue;
    const lang = data.lang ?? inferLangFromPath(filePath);
    const slug = data.slug ?? inferSlugFromPath(filePath);
    const key =
      (typeof data.id === "string" && data.id.trim().length > 0 ? data.id.trim() : slug || "policy").trim();
    const labelSource =
      (typeof data.menu === "string" && data.menu.trim().length > 0
        ? data.menu.trim()
        : typeof data.title === "string" && data.title.trim().length > 0
          ? data.title.trim()
          : key) ?? key;
    const policy = {
      lang,
      key,
      label: labelSource,
      url: buildContentUrl(data.canonical, lang, slug),
    };
    if (!Array.isArray(policiesByLang[lang])) {
      policiesByLang[lang] = [];
    }
    policiesByLang[lang].push(policy);
  }
  Object.keys(policiesByLang).forEach((lang) => {
    policiesByLang[lang].sort((a, b) => a.label.localeCompare(b.label, lang));
  });
  return policiesByLang;
}

function buildCategoryTagCollections() {
  const pagesByLang = {};
  if (!existsSync(CONTENT_DIR)) return pagesByLang;
  const files = collectMarkdownFiles(CONTENT_DIR);
  for (const filePath of files) {
    let data;
    try {
      ({ data } = matter(readFileSync(filePath, "utf8")));
    } catch {
      continue;
    }
    if (!data) continue;
    const isDraft = parseBoolean(data.draft);
    if (isDraft) continue;
    const status = typeof data.status === "string" ? data.status.trim().toLowerCase() : "";
    if (status && status !== "published") continue;
    const lang = data.lang ?? inferLangFromPath(filePath);
    const slug = data.slug ?? inferSlugFromPath(filePath);
    const summary = buildCollectionEntrySummary(data, lang, slug);
    const langStore = pagesByLang[lang] ?? (pagesByLang[lang] = {});
    const categoryKey = normalizeCollectionKey(data.category);
    if (categoryKey) {
      addCollectionEntry(langStore, categoryKey, summary, "category");
    }
    const tags = normalizeTagList(data.tags);
    tags.forEach((tag) => {
      const tagKey = normalizeCollectionKey(tag);
      if (tagKey) {
        addCollectionEntry(langStore, tagKey, summary, "tag");
      }
    });
  }
  return sortCollectionEntries(pagesByLang);
}

function buildCollectionEntrySummary(front, lang, slug) {
  const id =
    typeof front.id === "string" && front.id.trim().length > 0
      ? front.id.trim()
      : slug || crypto.randomBytes(4).toString("hex");
  return {
    id,
    title: front.title ?? slug ?? id,
    date: front.date ?? null,
    canonical: buildContentUrl(front.canonical, lang, slug),
    description: front.description ?? "",
    cover: front.cover ?? "",
    coverAlt: front.coverAlt ?? "",
    coverCaption: front.coverCaption ?? "",
    readingTime: normalizeReadingTime(front.readingTime),
    dateDisplay: formatDate(front.date, lang),
  };
}

function buildCollectionListing(front, lang) {
  const normalizedLang = lang ?? DEFAULT_LANGUAGE;
  const langCollections = PAGES[normalizedLang] ?? {};
  const key = resolveListingKey(front);
  const items = key && Array.isArray(langCollections[key]) ? langCollections[key] : [];
  return {
    key,
    lang: normalizedLang,
    items,
    hasItems: items.length > 0,
    emptyMessage: resolveListingEmpty(front, normalizedLang),
  };
}

function resolveListingKey(front) {
  if (!front) return "";
  const candidates = [
    typeof front.listKey === "string" ? front.listKey : null,
    typeof front.slug === "string" ? front.slug : null,
    typeof front.category === "string" ? front.category : null,
    typeof front.id === "string" ? front.id : null,
  ];
  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const normalized = normalizeCollectionKey(value);
    if (normalized) {
      return normalized;
    }
  }
  return "";
}

function resolveListingEmpty(front, lang) {
  if (!front) return "";
  const { listingEmpty } = front;
  if (typeof listingEmpty === "string" && listingEmpty.trim().length > 0) {
    return listingEmpty.trim();
  }
  if (listingEmpty && typeof listingEmpty === "object") {
    const localized = listingEmpty[lang];
    if (typeof localized === "string" && localized.trim().length > 0) {
      return localized.trim();
    }
    const fallback = listingEmpty[DEFAULT_LANGUAGE];
    if (typeof fallback === "string" && fallback.trim().length > 0) {
      return fallback.trim();
    }
  }
  return "";
}

function normalizeReadingTime(value) {
  const num = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.round(num);
}

function normalizeCollectionKey(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeTagList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter((tag) => tag.length > 0);
}

function addCollectionEntry(store, key, entry, type) {
  if (!store[key]) {
    store[key] = [];
  }
  store[key].push({
    ...entry,
    type,
  });
}

function sortCollectionEntries(collections) {
  const sorted = {};
  Object.keys(collections).forEach((lang) => {
    sorted[lang] = {};
    Object.keys(collections[lang]).forEach((key) => {
      sorted[lang][key] = collections[lang][key]
        .slice()
        .sort((a, b) => {
          const aDate = Date.parse(a.date ?? "") || 0;
          const bDate = Date.parse(b.date ?? "") || 0;
          if (aDate === bDate) {
            return (a.title ?? "").localeCompare(b.title ?? "", lang);
          }
          return bDate - aDate;
        });
    });
  });
  return sorted;
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return Boolean(value);
}

function parseOrder(value) {
  const num = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
}

function buildMenuItemsFromContent() {
  const itemsByLang = {};
  if (!existsSync(CONTENT_DIR)) return itemsByLang;
  const files = collectMarkdownFiles(CONTENT_DIR);
  for (const filePath of files) {
    let data;
    try {
      ({ data } = matter(readFileSync(filePath, "utf8")));
    } catch {
      continue;
    }
    if (!data) continue;
    const showValue = parseBoolean(data.show);
    if (!showValue) continue;
    const status = typeof data.status === "string" ? data.status.trim().toLowerCase() : "";
    if (status !== "published") continue;
    const lang = data.lang ?? inferLangFromPath(filePath);
    const slug = data.slug ?? inferSlugFromPath(filePath);
    const key =
      (typeof data.id === "string" && data.id.trim().length > 0 ? data.id.trim() : slug || "menu").trim();
    const label =
      (typeof data.menu === "string" && data.menu.trim().length > 0
        ? data.menu.trim()
        : typeof data.title === "string" && data.title.trim().length > 0
          ? data.title.trim()
          : key) ?? key;
    const url = buildContentUrl(data.canonical, lang, slug);
    if (!Array.isArray(itemsByLang[lang])) {
      itemsByLang[lang] = [];
    }
    itemsByLang[lang].push({
      key,
      label,
      url,
      order: parseOrder(data.order),
    });
  }
  Object.keys(itemsByLang).forEach((lang) => {
    itemsByLang[lang]
      .sort((a, b) => {
        if (a.order === b.order) {
          return a.label.localeCompare(b.label, lang);
        }
        return a.order - b.order;
      })
      .forEach((item) => {
        delete item.order;
      });
  });
  return itemsByLang;
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
    const dictionary = getLanguageDictionary(lang);
    const componentContext = buildContentComponentContext(data, lang, dictionary);
    const { markdown: markdownSource, placeholders } = renderMarkdownComponents(
      enrichedContent ?? "",
      componentContext,
    );
    const markdownHtml = marked.parse(markdownSource ?? "");
    const hydratedHtml = injectMarkdownComponents(markdownHtml ?? "", placeholders);
    const contentHtml = renderContentTemplate(templateName, hydratedHtml, data, lang, dictionary);
    const pageMeta = buildPageMeta(data, lang, slug);
    const layoutTemplate = getLayout(layoutName);
    const activeMenuKey = resolveActiveMenuKey(data);
    const view = {
      lang,
      theme: "light",
      site: buildSiteData(lang),
      menu: getMenuData(lang, activeMenuKey),
      footer: getFooterData(lang),
      pages: PAGES,
      i18n: dictionary,
      i18nInline: I18N_INLINE_JSON,
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
  await buildContentPages();
  copyHtmlRecursive();
  copyStaticAssets();
}

main().catch((error) => {
  console.error("Build failed:", error);
  process.exitCode = 1;
});
