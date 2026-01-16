import { appendRows, getAccessToken } from "../lib/google_api.js";
import { getClientContext, readJsonBody } from "../http/request.js";
import { normalizeIdentity } from "../lib/session.js";
import { normalizeLang } from "../lib/utils.js";
import { jsonResponse } from "../http/response.js";
import { verifyTurnstile } from "../lib/turnstile.js";

const CONTACT_SHEET_TAB = "contact_form";

async function handleContact(req, env) {
  const parsed = await readJsonBody(req);
  if (parsed.error) {
    return parsed.error;
  }
  const body = parsed.body;

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const type = String(body?.type || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || !email || !type || !message) {
    return jsonResponse({ error: "Missing fields" }, 400, req);
  }

  if (!isValidEmail(email)) {
    return jsonResponse({ error: "Invalid email" }, 400, req);
  }

  if (name.length > 120 || email.length > 200 || type.length > 40 || message.length > 5000) {
    return jsonResponse({ error: "Invalid length" }, 400, req);
  }

  const verified = await verifyTurnstile(body, req, env);
  if (!verified) {
    return jsonResponse({ error: "Captcha failed" }, 403, req);
  }

  const now = new Date().toISOString();
  const client = getClientContext(req);
  const identity = normalizeIdentity(body);
  const lang = normalizeLang(req, body);

  try {
    const token = await getAccessToken(env);
    const row = [
      crypto.randomUUID(),
      now,
      client.ip,
      client.country,
      client.region,
      client.city,
      client.userAgent,
      identity.tatSession,
      identity.tatUser,
      lang,
      name,
      email,
      type,
      message
    ];
    await appendRows(env, token, [row], CONTACT_SHEET_TAB);
  } catch (error) {
    return jsonResponse({ error: "Sheet write failed", detail: String(error) }, 502, req);
  }

  return jsonResponse({ ok: true }, 200, req);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export { handleContact };
