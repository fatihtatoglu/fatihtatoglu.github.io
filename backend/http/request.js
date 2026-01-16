import { hash } from "../lib/utils.js";
import { jsonResponse } from "./response.js";

async function readJsonBody(req) {
  let body = {};
  const contentType = req.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    try {
      body = await req.json();
    } catch {
      return { body: {}, error: jsonResponse({ error: "Invalid JSON" }, 400, req) };
    }
  }
  return { body, error: null };
}

function getQueryParams(req) {
  try {
    const url = new URL(req.url);
    return url.searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function getQueryParam(req, key) {
  return getQueryParams(req).get(key) || "";
}

function getPathname(req) {
  try {
    const url = new URL(req.url);
    return url.pathname.replace(/^\/+|\/+$/g, "");
  } catch {
    return "";
  }
}

function normalizeUtm(body, parsedUrl) {
  const searchParams = parsedUrl?.searchParams;
  return {
    source: resolveUtmValue(body, searchParams, "source"),
    medium: resolveUtmValue(body, searchParams, "medium"),
    campaign: resolveUtmValue(body, searchParams, "campaign"),
    content: resolveUtmValue(body, searchParams, "content"),
    term: resolveUtmValue(body, searchParams, "term")
  };
}

function resolveUtmValue(body, searchParams, key) {
  const direct = String(body?.[`utm_${key}`] || "").trim();
  if (direct) {
    return direct;
  }
  const camel = String(body?.[`utm${key.charAt(0).toUpperCase()}${key.slice(1)}`] || "").trim();
  if (camel) {
    return camel;
  }
  const nested = String(body?.utm?.[key] || "").trim();
  if (nested) {
    return nested;
  }
  if (searchParams) {
    return String(searchParams.get(`utm_${key}`) || "").trim();
  }
  return "";
}

function safeParseUrl(value) {
  if (!value) {
    return null;
  }
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getClientContext(req) {
  const ip = req.headers.get("CF-Connecting-IP") || "";
  const userAgent = req.headers.get("User-Agent") || "";
  const cf = req.cf || {};

  return {
    ip,
    userAgent,
    country: cf.country || "",
    region: cf.region || "",
    city: cf.city || ""
  };
}

async function getFingerprint(req) {
  const ip = req.headers.get("CF-Connecting-IP") || "0.0.0.0";
  const ua = req.headers.get("User-Agent") || "";
  return hash(`${ip}${ua}`);
}

export {
  getClientContext,
  getFingerprint,
  getPathname,
  getQueryParam,
  getQueryParams,
  normalizeUtm,
  readJsonBody,
  safeParseUrl
};
