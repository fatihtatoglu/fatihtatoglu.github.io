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
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { minify as minifyHtml } from "html-minifier-terser";

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
const IDENTITY_CONFIG = SITE_CONFIG.identity ?? {};

const versionToken = crypto.randomBytes(6).toString("hex");
const BASE_URL = IDENTITY_CONFIG.url ?? "https://tatoglu.net";
const SEO_CONFIG = SITE_CONFIG.seo ?? {};
const SEO_INCLUDE_COLLECTIONS = parseBoolean(SEO_CONFIG.includeCollections);
const SEO_INCLUDE_PAGING = parseBoolean(SEO_CONFIG.includePaging);
const DEFAULT_IMAGE =
  typeof SEO_CONFIG.defaultImage === "string" && SEO_CONFIG.defaultImage.trim().length > 0
    ? SEO_CONFIG.defaultImage.trim()
    : "~/assets/images/fatih_tatoglu_cover.webp";
const GTM_ID = SITE_CONFIG.analytics?.gtmId ?? "GTM-XXXXXXX";
const GA_ID = SITE_CONFIG.analytics?.gaId ?? "G-XXXXXXXXXX";
const CLARITY_ID = SITE_CONFIG.analytics?.clarityId ?? "CLARITY-ID";
const ANALYTICS_ENABLED = SITE_CONFIG.analytics?.enabled !== false;
const FALLBACK_ROLES = { tr: "-", en: "-", };
const FALLBACK_QUOTES = { tr: "-", en: "-", };
const FALLBACK_TITLES = { tr: "-", en: "-", };
const FALLBACK_DESCRIPTIONS = { tr: "-", en: "-", };
const FALLBACK_OWNER = "-";
const FALLBACK_TAGLINES = { tr: "-", en: "-", };
const PAGINATION_SETTINGS = SITE_CONFIG.content?.pagination ?? {};
const BUILD_SETTINGS = SITE_CONFIG.build ?? {};
const MINIFY_OUTPUT = BUILD_SETTINGS.minify === true;
const MARKDOWN_SETTINGS = SITE_CONFIG.markdown ?? {};
const MARKDOWN_HIGHLIGHT_ENABLED = MARKDOWN_SETTINGS.highlight !== false;
const COLLECTION_CONFIG = SITE_CONFIG.content?.collections ?? {};
const LANGUAGE_SETTINGS = SITE_CONFIG.content?.languages ?? {};
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
if (MARKDOWN_HIGHLIGHT_ENABLED) {
  marked.use(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    }),
  );
}
const markdownRenderer = new marked.Renderer();
markdownRenderer.code = (token, infostring) => {
  const isTokenObject = token && typeof token === "object";
  const languageSource = isTokenObject
    ? token.lang
    : typeof infostring === "string"
      ? infostring
      : "";
  const language = (languageSource || "").trim().split(/\s+/)[0]?.toLowerCase() || "text";
  const langClass = language ? ` class="language-${language}"` : "";
  const value = isTokenObject ? token.text ?? "" : token ?? "";
  const alreadyEscaped = Boolean(isTokenObject && token.escaped);
  const content = alreadyEscaped ? value : escapeHtml(value);
  return `<pre class="code-block" data-code-language="${language}"><code${langClass}>${content}</code></pre>`;
};
marked.use({ renderer: markdownRenderer });

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
  const minifyFlag = MINIFY_OUTPUT ? "--minify" : "";
  const command = [
    "npx",
    "@tailwindcss/cli",
    "-c",
    "tailwind.config.js",
    "-i",
    "./src/css/style.css",
    "-o",
    "./dist/output.css",
  ];
  if (minifyFlag) {
    command.push(minifyFlag);
  }
  run(command.join(" "));
}

function buildJs() {
  const args = [
    "npx",
    "esbuild",
    "./src/js/main.js",
    "--bundle",
    "--format=esm",
    "--target=es2018",
    "--sourcemap",
    "--outfile=./dist/output.js",
  ];
  if (MINIFY_OUTPUT) {
    args.push("--minify");
  }
  run(args.join(" "));
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

async function transformHtml(html) {
  let output = html
    .replace(/\/output\.css(\?v=[^"']+)?/g, `/output.css?v=${versionToken}`)
    .replace(/\/output\.js(\?v=[^"']+)?/g, `/output.js?v=${versionToken}`)
    .replace(/\b(src|href)="~\//g, '$1="/');

  if (!MINIFY_OUTPUT) {
    return output;
  }

  try {
    output = await minifyHtml(output, {
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeEmptyAttributes: false,
      sortAttributes: true,
      sortClassName: true,
      minifyCSS: true,
      minifyJS: true,
    });
  } catch (error) {
    console.warn("[build] Failed to minify HTML:", error?.message ?? error);
  }

  return output;
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
  const author = IDENTITY_CONFIG.author ?? fallbackOwner;
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
    url: IDENTITY_CONFIG.url ?? BASE_URL,
    themeColor: IDENTITY_CONFIG.themeColor ?? "#5a8df0",
    gtmId: GTM_ID,
    year: new Date().getFullYear(),
    languages: {
      supported: SUPPORTED_LANGUAGES,
      default: DEFAULT_LANGUAGE,
    },
    languagesCsv: SUPPORTED_LANGUAGES.join(","),
    defaultLanguage: DEFAULT_LANGUAGE,
    pagination: {
      pageSize: Number.isFinite(PAGINATION_SETTINGS.pageSize)
        ? PAGINATION_SETTINGS.pageSize
        : 5,
    },
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

function buildTagSlug(key, lang) {
  if (!key) return null;
  const tagsConfig = COLLECTION_CONFIG.tags;
  const slugPattern =
    tagsConfig && typeof tagsConfig.slugPattern === "object" ? tagsConfig.slugPattern : {};
  const langPattern = typeof slugPattern[lang] === "string" ? slugPattern[lang] : null;
  if (langPattern) {
    return langPattern.includes("{{key}}") ? langPattern.replace("{{key}}", key) : langPattern;
  }
  if (lang === "en") {
    return `tag/${key}`;
  }
  if (lang === "tr") {
    return `etiket/${key}`;
  }
  return key;
}

function buildTagUrlFromKey(key, lang) {
  const slug = buildTagSlug(key, lang);
  if (!slug) return null;
  return buildContentUrl(null, lang, slug);
}

function buildTagUrlFromLabel(label, lang) {
  const key = normalizeCollectionKey(label);
  if (!key) return null;
  return buildTagUrlFromKey(key, lang);
}

function buildFooterTags(lang, limit = 10) {
  const langCollections = PAGES[lang] ?? {};
  const results = [];
  Object.keys(langCollections).forEach((key) => {
    const items = langCollections[key] ?? [];
    if (!Array.isArray(items) || items.length === 0) return;
    const count = items.filter((entry) => entry.type === "tag").length;
    if (count === 0) return;

    const url = buildTagUrlFromKey(key, lang);
    if (!url) return;
    results.push({ key, count, url });
  });

  results.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.key.localeCompare(b.key, lang);
  });

  if (limit && Number.isFinite(limit) && limit > 0) {
    return results.slice(0, limit);
  }
  return results;
}

function getFooterData(lang) {
  const policiesSource = FOOTER_POLICIES[lang] ?? FOOTER_POLICIES[DEFAULT_LANGUAGE] ?? [];
  const tagsSource = buildFooterTags(lang, 10);
  const social = FOOTER_SOCIAL.map((item) => {
    let url = item.url;
    if (item.key === "rss") {
      url = lang === "en" ? "/en/feed.xml" : "/feed.xml";
    }
    return {
      ...item,
      url,
      icon: FOOTER_SOCIAL_ICONS[item.key],
      label: getLocalizedValue(lang, `footer.social.${item.key}`, item.key.toUpperCase()),
    };
  });
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
  const ogLocale = lang === "en" ? "en_US" : "tr_TR";
  const altLocale = lang === "en" ? "tr_TR" : "en_US";
  const coverSource =
    typeof front.cover === "string" && front.cover.trim().length > 0
      ? front.cover.trim()
      : DEFAULT_IMAGE;
  const ogImage = resolveUrl(coverSource);
  const altLang = lang === "en" ? "tr" : "en";
  let alternateUrl;
  if (typeof front.alternate === "string" && front.alternate.trim().length > 0) {
    alternateUrl = resolveUrl(front.alternate.trim());
  } else {
    const altLangConfig = LANGUAGE_BUILD_CONFIG[altLang];
    alternateUrl = altLangConfig?.canonical ?? resolveUrl(altLang === DEFAULT_LANGUAGE ? "/" : `/${altLang}/`);
  }
  const twitterImage = resolveUrl(coverSource);

  const typeValue = typeof front.type === "string" ? front.type.trim().toLowerCase() : "";
  const templateValue = typeof front.template === "string" ? front.template.trim().toLowerCase() : "";
  const isArticle =
    templateValue === "post" ||
    typeValue === "article" ||
    typeValue === "guide" ||
    typeValue === "post";

  let structuredData = null;
  if (isArticle) {
    structuredData = buildArticleStructuredData(front, lang, canonicalUrl, ogImage);
  } else if (templateValue === "home") {
    structuredData = buildHomeStructuredData(front, lang, canonicalUrl);
  } else if (templateValue === "page") {
    structuredData = buildWebPageStructuredData(front, lang, canonicalUrl);
  }

  const ogType = front.ogType ?? (isArticle ? "article" : "website");

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
      description: front.description ?? "",
      type: ogType,
      url: canonicalUrl,
      image: ogImage,
      locale: front.ogLocale ?? ogLocale,
      altLocale: front.ogAltLocale ?? altLocale,
    },
    twitter: {
      card: front.twitterCard ?? "summary_large_image",
      title: front.twitterTitle ?? front.title ?? "",
      description: front.description ?? "",
      image: twitterImage,
      url: canonicalUrl,
    },
    structuredData,
  };
}

function resolveArticleSection(front, lang) {
  const rawCategory = typeof front.category === "string" ? front.category.trim().toLowerCase() : "";
  if (!rawCategory) return "";
  if (lang === "tr") {
    if (rawCategory === "yasam-ogrenme") return "Yaşam & Öğrenme";
    if (rawCategory === "teknik-notlar") return "Teknik Notlar";
  }
  if (lang === "en") {
    if (rawCategory === "life-learning") return "Life & Learning";
    if (rawCategory === "technical-notes") return "Technical Notes";
  }
  return rawCategory;
}

function buildArticleStructuredData(front, lang, canonicalUrl, ogImageUrl) {
  const authorName = IDENTITY_CONFIG.author ?? FALLBACK_OWNER;
  const articleSection = resolveArticleSection(front, lang);
  const keywordsArray = Array.isArray(front.keywords) && front.keywords.length
    ? front.keywords
    : Array.isArray(front.tags) && front.tags.length
      ? front.tags
      : [];

  const structured = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: front.title ?? "",
    description: front.description ?? "",
    author: { "@type": "Person", name: authorName },
    inLanguage: lang,
    mainEntityOfPage: canonicalUrl,
  };

  if (front.date) {
    structured.datePublished = front.date;
  }
  if (front.updated) {
    structured.dateModified = front.updated;
  }
  if (ogImageUrl) {
    structured.image = [ogImageUrl];
  }
  if (articleSection) {
    structured.articleSection = articleSection;
  }
  if (keywordsArray.length) {
    structured.keywords = keywordsArray;
  }

  return serializeForInlineScript(structured);
}

function buildHomeStructuredData(front, lang, canonicalUrl) {
  const siteData = buildSiteData(lang);
  const authorName = IDENTITY_CONFIG.author ?? FALLBACK_OWNER;
  const structured = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteData.title ?? "",
    description: siteData.description ?? "",
    url: canonicalUrl,
    inLanguage: lang,
    publisher: {
      "@type": "Person",
      name: authorName,
    },
  };
  return serializeForInlineScript(structured);
}

function buildWebPageStructuredData(front, lang, canonicalUrl) {
  const authorName = IDENTITY_CONFIG.author ?? FALLBACK_OWNER;
  const keywordsArray = Array.isArray(front.keywords) && front.keywords.length
    ? front.keywords
    : Array.isArray(front.tags) && front.tags.length
      ? front.tags
      : [];

  const structured = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    headline: front.title ?? "",
    description: front.description ?? "",
    author: { "@type": "Person", name: authorName },
    inLanguage: lang,
    mainEntityOfPage: canonicalUrl,
  };

  if (keywordsArray.length) {
    structured.keywords = keywordsArray;
  }

  return serializeForInlineScript(structured);
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

function renderContentTemplate(templateName, contentHtml, front, lang, dictionary, listingOverride) {
  const template = getTemplate(templateName);
  const normalizedTags = Array.isArray(front.tags)
    ? front.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
    : [];
  const tagLinks = normalizedTags
    .map((tag) => {
      const url = buildTagUrlFromLabel(tag, lang);
      return url ? { label: tag, url } : null;
    })
    .filter(Boolean);
  const categorySlug =
    typeof front.category === "string" && front.category.trim().length > 0
      ? normalizeCollectionKey(front.category)
      : "";
  const categoryUrl = categorySlug ? buildContentUrl(null, lang, categorySlug) : null;
  const resolvedDictionary = dictionary ?? getLanguageDictionary(lang);
  const normalizedFront = {
    ...front,
    tags: normalizedTags,
    tagLinks,
    hasTags: normalizedTags.length > 0,
    categoryUrl,
    categoryLabel:
      typeof front.category === "string" && front.category.trim().length > 0
        ? front.category.trim()
        : "",
    dateDisplay: formatDate(front.date, lang),
    updatedDisplay: formatDate(front.updated, lang),
    cover: front.cover ?? DEFAULT_IMAGE,
    coverAlt: front.coverAlt ?? "",
  };
  const listing = listingOverride ?? buildCollectionListing(normalizedFront, lang);
  return Mustache.render(template, {
    content: { html: decorateHtml(contentHtml, templateName) },
    front: normalizedFront,
    lang,
    listing,
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

    // Home collection: featured posts across the site
    const isPostTemplate = typeof data.template === "string" && data.template.trim() === "post";
    const isFeatured = parseBoolean(data.featured);
    if (isPostTemplate && isFeatured) {
      addCollectionEntry(langStore, "home", summary, "home");
    }

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
    cover: front.cover ?? DEFAULT_IMAGE,
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

function formatRssDate(date) {
  if (!(date instanceof Date)) {
    // eslint-disable-next-line no-param-reassign
    date = new Date(date);
  }
  if (Number.isNaN(date.getTime())) {
    return new Date().toUTCString();
  }
  return date.toUTCString();
}

function escapeXml(value) {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatLastmod(date) {
  if (!(date instanceof Date)) {
    // eslint-disable-next-line no-param-reassign
    date = new Date(date);
  }
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split("T")[0];
}

function collectRssEntriesForLang(lang, limit = 50) {
  const entries = [];
  if (!existsSync(CONTENT_DIR)) return entries;
  const files = collectMarkdownFiles(CONTENT_DIR);
  for (const filePath of files) {
    let data;
    try {
      ({ data } = matter(readFileSync(filePath, "utf8")));
    } catch {
      continue;
    }
    if (!data) continue;
    const status = typeof data.status === "string" ? data.status.trim().toLowerCase() : "";
    if (status && status !== "published") continue;
    const isDraft = parseBoolean(data.draft);
    if (isDraft) continue;
    const entryLang = data.lang ?? inferLangFromPath(filePath);
    if (entryLang !== lang) continue;
    const template = typeof data.template === "string" ? data.template.trim() : "";
    if (template !== "post") continue;
    const slug = data.slug ?? inferSlugFromPath(filePath);
    const canonical = buildContentUrl(data.canonical, entryLang, slug);
    const absoluteLink = resolveUrl(canonical);
    const date = data.date ? new Date(data.date) : null;
    entries.push({
      title: data.title ?? slug ?? canonical,
      description: data.description ?? "",
      link: absoluteLink,
      guid: absoluteLink,
      date,
      category:
        typeof data.category === "string" && data.category.trim().length > 0
          ? data.category.trim()
          : "",
    });
  }
  entries.sort((a, b) => {
    const aTime = a.date ? Date.parse(a.date) || 0 : 0;
    const bTime = b.date ? Date.parse(b.date) || 0 : 0;
    return bTime - aTime;
  });
  if (limit && Number.isFinite(limit) && limit > 0) {
    return entries.slice(0, limit);
  }
  return entries;
}

function collectSitemapEntriesFromContent() {
  const urls = [];
  if (!existsSync(CONTENT_DIR)) return urls;
  const files = collectMarkdownFiles(CONTENT_DIR);
  for (const filePath of files) {
    let data;
    try {
      ({ data } = matter(readFileSync(filePath, "utf8")));
    } catch {
      continue;
    }
    if (!data) continue;
    const status = typeof data.status === "string" ? data.status.trim().toLowerCase() : "";
    if (status && status !== "published") continue;
    const isDraft = parseBoolean(data.draft);
    if (isDraft) continue;
    const lang = data.lang ?? inferLangFromPath(filePath);
    const slug = data.slug ?? inferSlugFromPath(filePath);
    const canonical = buildContentUrl(data.canonical, lang, slug);
    const absoluteLoc = resolveUrl(canonical);
    const updated = data.updated ?? data.date ?? null;
    const baseLastmod = updated ? formatLastmod(updated) : null;
    urls.push({
      loc: absoluteLoc,
      lastmod: baseLastmod,
    });

    // Optionally include paginated listing pages (e.g. /sayfa-2)
    const template = typeof data.template === "string" ? data.template.trim() : "";
    if (SEO_INCLUDE_PAGING && (template === "collection" || template === "home")) {
      const langCollections = PAGES[lang] ?? {};
      const key = resolveListingKey(data);
      const allItems = key && Array.isArray(langCollections[key]) ? langCollections[key] : [];
      const pageSizeSetting = Number.isFinite(PAGINATION_SETTINGS.pageSize)
        ? PAGINATION_SETTINGS.pageSize
        : 5;
      const pageSize = pageSizeSetting > 0 ? pageSizeSetting : 5;
      const totalPages = Math.max(1, pageSize > 0 ? Math.ceil(allItems.length / pageSize) : 1);

      if (totalPages > 1) {
        const segmentConfig =
          PAGINATION_SETTINGS.segment && typeof PAGINATION_SETTINGS.segment === "object"
            ? PAGINATION_SETTINGS.segment
            : {};
        const segment =
          typeof segmentConfig[lang] === "string" && segmentConfig[lang].trim().length > 0
            ? segmentConfig[lang].trim()
            : lang === "tr"
              ? "sayfa"
              : "page";

        const baseSlug = slug.replace(/\/+$/, "");

        // Derive lastmod for listing pages from the newest item in the collection
        let latestTimestamp = null;
        if (Array.isArray(allItems)) {
          allItems.forEach((item) => {
            if (!item || !item.date) return;
            const ts = Date.parse(item.date);
            if (!Number.isNaN(ts)) {
              if (latestTimestamp == null || ts > latestTimestamp) {
                latestTimestamp = ts;
              }
            }
          });
        }
        const listingLastmod =
          latestTimestamp != null ? formatLastmod(new Date(latestTimestamp)) : baseLastmod;

        for (let pageIndex = 2; pageIndex <= totalPages; pageIndex += 1) {
          const pageSlug = baseSlug
            ? `${baseSlug}/${segment}-${pageIndex}`
            : `${segment}-${pageIndex}`;

          let canonicalOverride;
          if (typeof data.canonical === "string" && data.canonical.trim().length > 0) {
            const trimmed = data.canonical.trim().replace(/\/+$/, "");
            canonicalOverride = `${trimmed}/${segment}-${pageIndex}/`;
          } else {
            canonicalOverride = undefined;
          }

          const pageCanonical = buildContentUrl(canonicalOverride, lang, pageSlug);
          const pageAbsoluteLoc = resolveUrl(pageCanonical);
          urls.push({
            loc: pageAbsoluteLoc,
            lastmod: listingLastmod,
          });
        }
      }
    }
  }
  urls.sort((a, b) => (a.loc || "").localeCompare(b.loc || ""));
  return urls;
}

function buildRssFeeds() {
  const email = typeof IDENTITY_CONFIG.email === "string" ? IDENTITY_CONFIG.email.trim() : "";
  const authorName = IDENTITY_CONFIG.author ?? FALLBACK_OWNER;
  const languages = SUPPORTED_LANGUAGES.length ? SUPPORTED_LANGUAGES : [DEFAULT_LANGUAGE];

  languages.forEach((lang) => {
    const rssEntries = collectRssEntriesForLang(lang, 50);
    if (!rssEntries.length) {
      return;
    }
    const dict = getLanguageDictionary(lang);
    const siteTitle = getLocalizedValue(lang, "site.title", IDENTITY_CONFIG.author ?? "Site");
    const siteDescription = getLocalizedValue(lang, "site.description", "");
    const langConfig = LANGUAGE_BUILD_CONFIG[lang] ?? LANGUAGE_BUILD_CONFIG[DEFAULT_LANGUAGE];
    const channelLink = langConfig?.canonical ?? BASE_URL;
    const languageCode = lang === "en" ? "en-US" : "tr-TR";
    const lastBuildDate = formatRssDate(new Date());

    const itemsXml = rssEntries
      .map((entry) => {
        const description = entry.description ? entry.description.trim() : "";
        const descriptionCdata = description ? `<![CDATA[ ${description} ]]>` : "";
        const authorField =
          email && authorName ? `${email} (${authorName})` : email || authorName || "";
        const categoryLine =
          entry.category && entry.category.length
            ? `    <category>${escapeXml(entry.category)}</category>`
            : "";
        return [
          "  <item>",
          `    <title>${escapeXml(entry.title)}</title>`,
          `    <link>${escapeXml(entry.link)}</link>`,
          `    <guid isPermaLink="true">${escapeXml(entry.guid)}</guid>`,
          entry.date ? `    <pubDate>${formatRssDate(entry.date)}</pubDate>` : "",
          descriptionCdata ? `    <description>${descriptionCdata}</description>` : "",
          authorField ? `    <author>${escapeXml(authorField)}</author>` : "",
          categoryLine,
          "  </item>",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n");

    const rssXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<?xml-stylesheet type="text/xsl" href="/assets/rss.xsl"?>',
      '<rss version="2.0">',
      "  <channel>",
      `    <title>${escapeXml(siteTitle)}</title>`,
      `    <link>${escapeXml(channelLink)}</link>`,
      `    <description>${escapeXml(siteDescription)}</description>`,
      `    <language>${escapeXml(languageCode)}</language>`,
      `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
      itemsXml,
      "  </channel>",
      "</rss>",
      "",
    ].join("\n");

    const relativePath =
      lang === DEFAULT_LANGUAGE ? "feed.xml" : join(lang, "feed.xml");
    writeHtmlFile(relativePath, rssXml);
  });
}

function buildSitemap() {
  const contentEntries = collectSitemapEntriesFromContent();
  const collectionEntries = SEO_INCLUDE_COLLECTIONS ? collectSitemapEntriesFromDynamicCollections() : [];

  const combined = [...contentEntries, ...collectionEntries];
  if (!combined.length) return;

  const entryByLoc = new Map();
  combined.forEach((entry) => {
    if (!entry || !entry.loc) return;
    const key = entry.loc;
    const existing = entryByLoc.get(key);
    if (!existing) {
      entryByLoc.set(key, entry);
      return;
    }
    const existingDate = existing.lastmod ? Date.parse(existing.lastmod) : null;
    const incomingDate = entry.lastmod ? Date.parse(entry.lastmod) : null;
    if (
      incomingDate != null
      && !Number.isNaN(incomingDate)
      && (existingDate == null || Number.isNaN(existingDate) || incomingDate > existingDate)
    ) {
      entryByLoc.set(key, entry);
    }
  });

  const entries = Array.from(entryByLoc.values()).sort((a, b) =>
    (a.loc || "").localeCompare(b.loc || ""),
  );

  const urlset = entries
    .map((entry) => {
      const parts = [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
      ];
      if (entry.lastmod) {
        parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }
      parts.push("  </url>");
      return parts.join("\n");
    })
    .join("\n");

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/assets/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlset,
    "</urlset>",
    "",
  ].join("\n");

  writeHtmlFile("sitemap.xml", sitemapXml);
}

function collectSitemapEntriesFromDynamicCollections() {
  const urls = [];
  if (!COLLECTION_CONFIG || typeof COLLECTION_CONFIG !== "object") return urls;

  const configKeys = Object.keys(COLLECTION_CONFIG);
  for (const configKey of configKeys) {
    const config = COLLECTION_CONFIG[configKey];
    if (!config || typeof config !== "object") {
      continue;
    }

    const slugPattern =
      config.slugPattern && typeof config.slugPattern === "object" ? config.slugPattern : {};

    const types =
      Array.isArray(config.types) && config.types.length > 0
        ? config.types
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0)
        : null;

    if (!types || types.length === 0) {
      continue;
    }

    const languages = Object.keys(PAGES);
    for (const lang of languages) {
      const langCollections = PAGES[lang] ?? {};
      const langSlugPattern = typeof slugPattern[lang] === "string" ? slugPattern[lang] : null;

      const collectionKeys = Object.keys(langCollections);
      for (const key of collectionKeys) {
        const items = langCollections[key] ?? [];
        if (!Array.isArray(items) || items.length === 0) {
          continue;
        }

        const hasMatchingType = items.some((entry) => types.includes(entry.type));
        if (!hasMatchingType) {
          continue;
        }

        const slug =
          langSlugPattern && langSlugPattern.includes("{{key}}")
            ? langSlugPattern.replace("{{key}}", key)
            : (langSlugPattern ?? key);

        const canonical = buildContentUrl(null, lang, slug);
        const absoluteLoc = resolveUrl(canonical);

        let latestTimestamp = null;
        items.forEach((item) => {
          if (!item || !item.date) return;
          const ts = Date.parse(item.date);
          if (!Number.isNaN(ts)) {
            if (latestTimestamp == null || ts > latestTimestamp) {
              latestTimestamp = ts;
            }
          }
        });
        const lastmod =
          latestTimestamp != null ? formatLastmod(new Date(latestTimestamp)) : null;

        urls.push({
          loc: absoluteLoc,
          lastmod,
        });
      }
    }
  }

  urls.sort((a, b) => (a.loc || "").localeCompare(b.loc || ""));
  return urls;
}

function buildRobotsTxt() {
  const base = (IDENTITY_CONFIG.url ?? BASE_URL).replace(/\/+$/, "");
  const robots = SITE_CONFIG.robots ?? {};
  const allowList = Array.isArray(robots.allow) && robots.allow.length
    ? robots.allow
    : ["/"];
  const disallowList = Array.isArray(robots.disallow) ? robots.disallow : [];

  const lines = ["User-agent: *"];

  allowList.forEach((path) => {
    if (typeof path === "string" && path.trim().length > 0) {
      lines.push(`Allow: ${path.trim()}`);
    }
  });

  disallowList.forEach((path) => {
    if (typeof path === "string" && path.trim().length > 0) {
      lines.push(`Disallow: ${path.trim()}`);
    }
  });

  lines.push("");
  lines.push(`Sitemap: ${base}/sitemap.xml`);
  lines.push("");

  writeHtmlFile("robots.txt", lines.join("\n"));
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

    // Static pagination for collection listings (e.g. category/tag pages, home)
    if (templateName === "collection" || templateName === "home") {
      await buildPaginatedCollectionPages({
        frontMatter: data,
        lang,
        baseSlug: slug,
        layoutName,
        templateName,
        contentHtml: hydratedHtml,
        dictionary,
      });
      continue;
    }

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
        analytics: ANALYTICS_ENABLED ? ANALYTICS_SNIPPETS : [],
        body: [],
      },
    };
    const rendered = Mustache.render(layoutTemplate, view, PARTIALS);
    const finalHtml = await transformHtml(rendered);
    const relativePath = buildOutputPath(data, lang, slug);
    writeHtmlFile(relativePath, finalHtml);
    GENERATED_PAGES.add(toPosixPath(relativePath));
    registerLegacyPaths(lang, slug);
  }

  await buildDynamicCollectionPages();
}

async function buildPaginatedCollectionPages(options) {
  const {
    frontMatter,
    lang,
    baseSlug,
    layoutName,
    templateName,
    contentHtml,
    dictionary,
  } = options;

  const langCollections = PAGES[lang] ?? {};
  const key = resolveListingKey(frontMatter);
  const allItems = key && Array.isArray(langCollections[key]) ? langCollections[key] : [];
  const pageSizeSetting = Number.isFinite(PAGINATION_SETTINGS.pageSize)
    ? PAGINATION_SETTINGS.pageSize
    : 5;
  const pageSize = pageSizeSetting > 0 ? pageSizeSetting : 5;
  const totalPages = Math.max(1, pageSize > 0 ? Math.ceil(allItems.length / pageSize) : 1);
  const emptyMessage = resolveListingEmpty(frontMatter, lang);

  for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
    const startIndex = (pageIndex - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = allItems.slice(startIndex, endIndex);
    const hasItems = items.length > 0;
    const hasPrev = pageIndex > 1;
    const hasNext = pageIndex < totalPages;

    const segmentConfig =
      PAGINATION_SETTINGS.segment && typeof PAGINATION_SETTINGS.segment === "object"
        ? PAGINATION_SETTINGS.segment
        : {};
    const segment =
      typeof segmentConfig[lang] === "string" && segmentConfig[lang].trim().length > 0
        ? segmentConfig[lang].trim()
        : lang === "tr"
          ? "sayfa"
          : "page";

    const base = baseSlug.replace(/\/+$/, "");

    const pageSlug =
      pageIndex === 1
        ? baseSlug
        : base
          ? `${base}/${segment}-${pageIndex}`
          : `${segment}-${pageIndex}`;

    const prevSlug =
      pageIndex > 2
        ? base
          ? `${base}/${segment}-${pageIndex - 1}`
          : `${segment}-${pageIndex - 1}`
        : baseSlug;

    const nextSlug = base ? `${base}/${segment}-${pageIndex + 1}` : `${segment}-${pageIndex + 1}`;

    const listing = {
      key,
      lang,
      items,
      hasItems,
      emptyMessage,
      page: pageIndex,
      totalPages,
      hasPrev,
      hasNext,
      hasPagination: totalPages > 1,
      prevUrl: hasPrev ? buildContentUrl(null, lang, prevSlug) : "",
      nextUrl: hasNext ? buildContentUrl(null, lang, nextSlug) : "",
    };

    let canonical = frontMatter.canonical;
    if (pageIndex > 1) {
      if (typeof frontMatter.canonical === "string" && frontMatter.canonical.trim().length > 0) {
        const trimmed = frontMatter.canonical.trim().replace(/\/+$/, "");
        canonical = `${trimmed}/${segment}-${pageIndex}/`;
      } else {
        canonical = undefined;
      }
    }

    const frontForPage = {
      ...frontMatter,
      slug: pageSlug,
      canonical,
    };

    const renderedContent = renderContentTemplate(
      templateName,
      contentHtml,
      frontForPage,
      lang,
      dictionary,
      listing,
    );
    const pageMeta = buildPageMeta(frontForPage, lang, pageSlug);
    const layoutTemplate = getLayout(layoutName);
    const activeMenuKey = resolveActiveMenuKey(frontForPage);
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
      content: renderedContent,
      scripts: {
        analytics: ANALYTICS_ENABLED ? ANALYTICS_SNIPPETS : [],
        body: [],
      },
    };
    const rendered = Mustache.render(layoutTemplate, view, PARTIALS);
    const finalHtml = await transformHtml(rendered);
    const relativePath = buildOutputPath(frontForPage, lang, pageSlug);
    writeHtmlFile(relativePath, finalHtml);
    GENERATED_PAGES.add(toPosixPath(relativePath));
    registerLegacyPaths(lang, pageSlug);
  }
}

async function buildDynamicCollectionPages() {
  if (!COLLECTION_CONFIG || typeof COLLECTION_CONFIG !== "object") return;

  const configKeys = Object.keys(COLLECTION_CONFIG);
  for (const configKey of configKeys) {
    const config = COLLECTION_CONFIG[configKey];
    if (!config || typeof config !== "object") {
      continue;
    }

    const templateName =
      typeof config.template === "string" && config.template.trim().length > 0
        ? config.template.trim()
        : "category";

    const slugPattern =
      config.slugPattern && typeof config.slugPattern === "object" ? config.slugPattern : {};
    const pairs =
      config.pairs && typeof config.pairs === "object" ? config.pairs : null;

    const types =
      Array.isArray(config.types) && config.types.length > 0
        ? config.types
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0)
        : null;

    if (!types || types.length === 0) {
      continue;
    }

    const languages = Object.keys(PAGES);
    for (const lang of languages) {
      const langCollections = PAGES[lang] ?? {};
      const dictionary = getLanguageDictionary(lang);
      const langSlugPattern = typeof slugPattern[lang] === "string" ? slugPattern[lang] : null;
      const titleSuffix = getLocalizedValue(
        lang,
        `seo.collections.${configKey}.titleSuffix`,
        "",
      );

      const collectionKeys = Object.keys(langCollections);
      for (const key of collectionKeys) {
        const items = langCollections[key] ?? [];
        if (!Array.isArray(items) || items.length === 0) {
          continue;
        }

        const hasMatchingType = items.some((entry) => types.includes(entry.type));
        if (!hasMatchingType) {
          continue;
        }

        const slug =
          langSlugPattern && langSlugPattern.includes("{{key}}")
            ? langSlugPattern.replace("{{key}}", key)
            : (langSlugPattern ?? key);

        let alternate;
        if (pairs) {
          const altLang = lang === "en" ? "tr" : "en";
          const pairEntry = pairs[key];
          const altKey =
            pairEntry && typeof pairEntry[altLang] === "string"
              ? pairEntry[altLang].trim()
              : "";
          if (altKey) {
            const altSlugPattern =
              typeof slugPattern[altLang] === "string" ? slugPattern[altLang] : null;
            const altSlug =
              altSlugPattern && altSlugPattern.includes("{{key}}")
                ? altSlugPattern.replace("{{key}}", altKey)
                : (altSlugPattern ?? altKey);
            alternate = buildContentUrl(null, altLang, altSlug);
          }
        }

        const baseTitle = key;
        const normalizedTitleSuffix =
          typeof titleSuffix === "string" && titleSuffix.trim().length > 0
            ? titleSuffix.trim()
            : "";
        const effectiveTitle = normalizedTitleSuffix
          ? `${baseTitle} | ${normalizedTitleSuffix}`
          : baseTitle;

        const front = {
          title: effectiveTitle,
          slug,
          template: templateName,
          listKey: key,
          ...(alternate ? { alternate } : {}),
        };

        const contentHtml = renderContentTemplate(templateName, "", front, lang, dictionary);
        const pageMeta = buildPageMeta(front, lang, slug);
        const layoutName = "default";
        const layoutTemplate = getLayout(layoutName);
        const activeMenuKey = resolveActiveMenuKey(front);
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
            analytics: ANALYTICS_ENABLED ? ANALYTICS_SNIPPETS : [],
            body: [],
          },
        };
        const rendered = Mustache.render(layoutTemplate, view, PARTIALS);
        const finalHtml = await transformHtml(rendered);
        const relativePath = buildOutputPath(front, lang, slug);
        writeHtmlFile(relativePath, finalHtml);
        GENERATED_PAGES.add(toPosixPath(relativePath));
        registerLegacyPaths(lang, slug);
      }
    }
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

async function copyHtmlRecursive(currentDir = SRC_DIR, relative = "") {
  const entries = readdirSync(currentDir);
  for (const entry of entries) {
    const fullPath = join(currentDir, entry);
    const relPath = relative ? join(relative, entry) : entry;
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      await copyHtmlRecursive(fullPath, relPath);
      continue;
    }
    if (!entry.endsWith(".html")) continue;
    if (GENERATED_PAGES.has(toPosixPath(relPath))) continue;
    const raw = readFileSync(fullPath, "utf8");
    const transformed = await transformHtml(raw);
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
      continue;
    }
    writeHtmlFile(relPath, transformed);
  }
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
  await copyHtmlRecursive();
  copyStaticAssets();
  buildRssFeeds();
  buildSitemap();
  buildRobotsTxt();
}

main().catch((error) => {
  console.error("Build failed:", error);
  process.exitCode = 1;
});
