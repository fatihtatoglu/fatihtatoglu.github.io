function normalizeComment(body, req) {
  const message = String(body?.message || "").trim();
  if (!message) {
    return null;
  }

  const name = String(body?.name || "").trim();
  const lang = String(body?.lang || req.headers.get("Accept-Language") || "")
    .split(",")[0]
    .trim();

  return {
    name: name || "Anonymous",
    message,
    lang
  };
}

function normalizeLang(req, body) {
  const headerLang = req.headers.get("tat-lang") || "";
  const fallback = req.headers.get("Accept-Language") || "";
  return String(body?.lang || headerLang || fallback).split(",")[0].trim();
}

function normalizeTheme(req, body) {
  return String(body?.theme || req.headers.get("tat-theme") || "").trim();
}

function normalizeEventType(body, forcedType) {
  if (forcedType) {
    return forcedType;
  }
  return String(body?.type || body?.eventType || "event").trim() || "event";
}

function normalizeEventName(body, eventType) {
  const name = String(
    body?.name || body?.eventName || body?.event || body?.metric?.name || body?.webVitals?.name || ""
  ).trim();
  if (name) {
    return name;
  }
  if (eventType === "view") {
    return "pageview";
  }
  return "";
}

function normalizeEventValue(body) {
  const value = body?.value ?? body?.metric?.value ?? body?.webVitals?.value ?? "";
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function normalizeEventData(body) {
  const raw = body?.data ?? body?.meta ?? body?.webVitals ?? body?.metric ?? null;
  if (raw === null || raw === undefined || raw === "") {
    return "";
  }
  if (typeof raw === "string") {
    return raw;
  }
  try {
    return JSON.stringify(raw);
  } catch {
    return String(raw);
  }
}

async function hash(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isPublished(status) {
  return String(status || "").toLowerCase() === "published";
}

export {
  hash,
  isPublished,
  normalizeComment,
  normalizeEventData,
  normalizeEventName,
  normalizeEventType,
  normalizeEventValue,
  normalizeLang,
  normalizeTheme,
  toNumber
};
