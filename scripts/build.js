#!/usr/bin/env node

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const SRC_DIR = join(ROOT_DIR, "src");
const DIST_DIR = join(ROOT_DIR, "dist");

const versionToken = crypto.randomBytes(6).toString("hex");
const BASE_URL = "https://tat.fatihtatoglu.com";

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

function run(command) {
  execSync(command, { stdio: "inherit", cwd: ROOT_DIR });
}

function ensureDist() {
  rmSync(DIST_DIR, { recursive: true, force: true });
  mkdirSync(DIST_DIR, { recursive: true });
}

function buildCss() {
  run(
    "npx @tailwindcss/cli -c tailwind.config.js -i ./src/css/style.css -o ./dist/output.css --minify",
  );
}

function buildJs() {
  run(
    "npx esbuild ./src/js/main.js --bundle --format=esm --target=es2018 --minify --sourcemap --outfile=./dist/output.js",
  );
}

function copyLang() {
  const srcLangDir = join(SRC_DIR, "lang");
  if (existsSync(srcLangDir)) {
    cpSync(srcLangDir, join(DIST_DIR, "lang"), { recursive: true });
  }
}

function transformHtml(html) {
  return html
    .replace(/\/output\.css(\?v=[^\"']+)?/g, `/output.css?v=${versionToken}`)
    .replace(/\/output\.js(\?v=[^\"']+)?/g, `/output.js?v=${versionToken}`);
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
    .replace(/(<html\b[^>]*\slang=")([^"]+)(")/, `$1${config.langAttr}$3`)
    .replace(/(<meta name="language" content=")([^"]+)(")/, `$1${config.metaLanguage}$3`)
    .replace(/(<link rel="canonical" href=")([^"]+)(" data-canonical)/, `$1${config.canonical}$3`)
    .replace(/(<meta property="og:url" content=")([^"]+)(" data-og-url)/, `$1${config.canonical}$3`)
    .replace(/(<meta name="twitter:url" content=")([^"]+)(" data-twitter-url)/, `$1${config.canonical}$3`)
    .replace(/(<meta property="og:locale" content=")([^"]+)(" data-og-locale)/, `$1${config.ogLocale}$3`)
    .replace(/(<meta property="og:locale:alternate" content=")([^"]+)(" data-og-locale-alt)/, `$1${config.altLocale}$3`);
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
copyHtmlRecursive();
