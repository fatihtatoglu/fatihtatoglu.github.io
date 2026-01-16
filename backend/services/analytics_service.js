import { appendRows, getAccessToken } from "../lib/google_api.js";
import { getClientContext, normalizeUtm, readJsonBody, safeParseUrl } from "../http/request.js";
import { normalizeIdentity } from "../lib/session.js";
import {
  normalizeEventData,
  normalizeEventName,
  normalizeEventType,
  normalizeEventValue,
  normalizeLang,
  normalizeTheme,
} from "../lib/utils.js";
import { jsonResponse } from "../http/response.js";

const VIEWS_SHEET_TAB = "views";

async function handleEvent(req, env, forcedType) {
  const parsed = await readJsonBody(req);
  if (parsed.error) {
    return parsed.error;
  }
  const body = parsed.body;

  const now = new Date().toISOString();
  const client = getClientContext(req);
  const identity = normalizeIdentity(body);
  const lang = normalizeLang(req, body);
  const theme = normalizeTheme(req, body);
  const url = String(body?.url || req.headers.get("Referer") || "").trim();
  const referrer = String(
    body?.referrer || req.headers.get("Referrer") || req.headers.get("Referer") || ""
  ).trim();
  const parsedUrl = safeParseUrl(url);
  const utm = normalizeUtm(body, parsedUrl);
  const eventType = normalizeEventType(body, forcedType);
  const eventName = normalizeEventName(body, eventType);
  const eventValue = normalizeEventValue(body);
  const eventData = normalizeEventData(body);

  try {
    const token = await getAccessToken(env);
    const rows = [
      createEventRow({
        id: crypto.randomUUID(),
        now,
        eventType,
        eventName,
        eventValue,
        eventData,
        url,
        referrer,
        utm,
        client,
        identity,
        lang,
        theme
      })
    ];
    await appendRows(env, token, rows, VIEWS_SHEET_TAB);
  } catch (error) {
    return jsonResponse({ error: "Sheet write failed", detail: String(error) }, 502, req);
  }

  return jsonResponse({ ok: true }, 200, req);
}

function createEventRow({
  id,
  now,
  eventType,
  eventName,
  eventValue,
  eventData,
  url,
  referrer,
  utm,
  client,
  identity,
  lang,
  theme
}) {
  return [
    id,
    now,
    eventType,
    eventName,
    eventValue,
    url,
    referrer,
    utm.source,
    utm.medium,
    utm.campaign,
    utm.content,
    utm.term,
    client.ip,
    client.country,
    client.region,
    client.city,
    client.userAgent,
    identity.tatSession,
    identity.tatUser,
    lang,
    theme,
    eventData
  ];
}

export { handleEvent };
