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

const versionToken = crypto.randomBytes(6).toString("hex");
const BASE_URL = "https://tat.fatihtatoglu.com";
const GTM_ID = "GTM-XXXXXXX";
const GA_ID = "G-XXXXXXXXXX";
const CLARITY_ID = "CLARITY-ID";

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

const I18N = {
  tr: {
    skipToContent: "İçeriğe geç",
    menuToggle: "Menüyü aç",
    menu: {
      primary: "Birincil menü",
      searchPlaceholder: "Başlık, konu, etiket...",
    },
  },
  en: {
    skipToContent: "Skip to content",
    menuToggle: "Open menu",
    menu: {
      primary: "Primary navigation",
      searchPlaceholder: "Title, topic, tag...",
    },
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

const FOOTER_SOCIAL_LABELS = {
  tr: { rss: "RSS", github: "GitHub", linkedin: "LinkedIn" },
  en: { rss: "RSS", github: "GitHub", linkedin: "LinkedIn" },
};

const FOOTER_TAGLINES = {
  tr: "Her satır merakla başlar, disiplinle tamamlanır.",
  en: "Every line begins with curiosity and ends with discipline.",
};

const SITE_QUOTES = {
  tr: "“Hayat devam ediyor, bir ucundan tutmak lazım.”",
  en: "“Life goes on—you just have to grab one end of it.”",
};

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

function copyLang() {
  const srcLangDir = join(SRC_DIR, "lang");
  if (existsSync(srcLangDir)) {
    cpSync(srcLangDir, join(DIST_DIR, "lang"), { recursive: true });
  }
}

function transformHtml(html) {
  return html
    .replace(/\/output\.css(\?v=[^"']+)?/g, `/output.css?v=${versionToken}`)
    .replace(/\/output\.js(\?v=[^"']+)?/g, `/output.js?v=${versionToken}`);
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
  return {
    title: "Fatih Tatoğlu",
    author: "Fatih Tatoğlu",
    owner: "Fatih Tatoğlu",
    role: "Engineer & Writer",
    quote: SITE_QUOTES[lang] ?? SITE_QUOTES.tr,
    home: lang === "en" ? "/en/" : "/",
    url: BASE_URL,
    themeColor: "#5a8df0",
    gtmId: GTM_ID,
    year: new Date().getFullYear(),
  };
}

function getMenuData(lang) {
  return { items: MENU_ITEMS[lang] ?? MENU_ITEMS.tr };
}

function getFooterData(lang) {
  const tags = FOOTER_TAGS[lang] ?? FOOTER_TAGS.tr;
  const policies = FOOTER_POLICIES[lang] ?? FOOTER_POLICIES.tr;
  const social = FOOTER_SOCIAL.map((item) => ({
    ...item,
    icon: FOOTER_SOCIAL_ICONS[item.key],
    label: FOOTER_SOCIAL_LABELS[lang]?.[item.key] ?? FOOTER_SOCIAL_LABELS.tr[item.key],
  }));
  return {
    tags,
    policies,
    social,
    tagline: FOOTER_TAGLINES[lang] ?? FOOTER_TAGLINES.tr,
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
  return Mustache.render(template, {
    content: { html: decorateHtml(contentHtml, templateName) },
    front,
    lang,
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
  if (lang === "en") {
    segments.push("en");
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
  return langFolder === "en" ? "en" : "tr";
}

function buildContentPages() {
  if (!existsSync(CONTENT_DIR)) return;
  const files = collectMarkdownFiles(CONTENT_DIR);
  files.forEach((filePath) => {
    const raw = readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const lang = data.lang ?? inferLangFromPath(filePath);
    const slug = data.slug ?? crypto.randomBytes(4).toString("hex");
    const layoutName = data.layout ?? "default";
    const templateName = data.template ?? "page";
    const markdownHtml = marked.parse(content ?? "");
    const contentHtml = renderContentTemplate(templateName, markdownHtml, data, lang);
    const pageMeta = buildPageMeta(data, lang, slug);
    const layoutTemplate = getLayout(layoutName);
    const view = {
      lang,
      theme: "light",
      site: buildSiteData(lang),
      menu: getMenuData(lang),
      footer: getFooterData(lang),
      i18n: I18N[lang] ?? I18N.tr,
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
  });
}

function registerLegacyPaths(lang, slug) {
  const cleaned = (slug ?? "").replace(/^\/+/, "");
  if (!cleaned) return;
  const legacyFile = cleaned.endsWith(".html") ? cleaned : `${cleaned}.html`;
  GENERATED_PAGES.add(toPosixPath(legacyFile));
  if (lang === "en") {
    GENERATED_PAGES.add(toPosixPath(join("en", legacyFile)));
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
      const trHtml = applyLanguageMetadata(transformed, "tr");
      writeHtmlFile("index.html", trHtml);
      const enHtml = applyLanguageMetadata(transformed, "en");
      writeHtmlFile(join("en", "index.html"), enHtml);
    } else {
      writeHtmlFile(relPath, transformed);
    }
  });
}

ensureDist();
buildCss();
buildJs();
copyLang();
buildContentPages();
copyHtmlRecursive();
