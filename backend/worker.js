const SHEET_TAB = "records";
const RATE_WINDOW_MS = 10_000;
const SHEET_COLUMNS = "R";

export default {
  async fetch(req, env) {
    try {
      const url = new URL(req.url);
      const pathname = url.pathname.replace(/^\/+|\/+$/g, "");

      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders(req) });
      }

      if (!pathname) {
        return jsonResponse({ error: "Missing post id" }, 400, req);
      }

      const segments = pathname.split("/");
      const postId = segments[0];
      const action = segments[1];

      if (req.method === "GET" && segments.length === 1) {
        return handleGetCounts(postId, env, req);
      }

      if (req.method === "GET" && action === "comment" && segments.length === 2) {
        return handleGetComments(postId, env, req);
      }

      if (req.method === "POST" && isAction(action) && segments.length === 2) {
        return handlePost(req, env, postId, action, "");
      }

      if (req.method === "POST" && action === "comment" && segments.length === 4) {
        const commentId = segments[2];
        const commentAction = toCommentAction(segments[3]);
        if (!commentAction) {
          return jsonResponse({ error: "Not found" }, 404, req);
        }
        return handlePost(req, env, postId, commentAction, commentId);
      }

      return jsonResponse({ error: "Not found" }, 404, req);
    } catch (error) {
      return jsonResponse({ error: "Unhandled error", detail: String(error) }, 500, req);
    }
  }
};

function isAction(action) {
  return action === "like" || action === "dislike" || action === "comment";
}

function toCommentAction(action) {
  if (action === "like") {
    return "comment-like";
  }
  if (action === "dislike") {
    return "comment-dislike";
  }
  return "";
}

async function handlePost(req, env, postId, action, relatedId) {
  const fingerprint = await getFingerprint(req);
  const rateKey = relatedId
    ? `rate:${action}:${postId}:${relatedId}:${fingerprint}`
    : `rate:${action}:${fingerprint}`;

  if (env.RATE) {
    const last = await env.RATE.get(rateKey);
    if (last && Date.now() - Number(last) < RATE_WINDOW_MS) {
      return jsonResponse({ error: "Too fast" }, 429, req);
    }
    await env.RATE.put(rateKey, Date.now().toString(), {
      expirationTtl: Math.max(60, Math.ceil(RATE_WINDOW_MS / 1000))
    });
  }

  let body = {};
  const contentType = req.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400, req);
    }
  }

  if (action === "comment") {
    const verified = await verifyTurnstile(body, req, env);
    if (!verified) {
      return jsonResponse({ error: "Captcha failed" }, 403, req);
    }
  }

  const commentPayload = action === "comment" ? normalizeComment(body, req) : null;
  if (commentPayload === null && action === "comment") {
    return jsonResponse({ error: "Missing comment message" }, 400, req);
  }

  const now = new Date().toISOString();
  const status = resolveStatus(action);
  const commentType = action === "comment" ? "comment" : "";
  const identity = normalizeIdentity(body);
  const client = getClientContext(req);

  try {
    const token = await getAccessToken(env);
    const rows = await buildRows({
      env,
      token,
      postId,
      action,
      relatedId,
      commentPayload,
      commentType,
      status,
      identity,
      client,
      now
    });
    if (!rows.length) {
      return jsonResponse({ ok: true, skipped: true }, 200, req);
    }
    await appendRow(env, token, rows);
  } catch (error) {
    return jsonResponse({ error: "Sheet write failed", detail: String(error) }, 502, req);
  }

  return jsonResponse({ ok: true }, 200, req);
}

async function handleGetCounts(postId, env, req) {
  const token = await getAccessToken(env);
  const rows = await readRows(env, token);

  const result = {
    like: 0,
    dislike: 0,
    comment: 0
  };

  for (const row of rows) {
    const [recordId, rowPostId, type, value, commentType, repliedId, status] = row;
    if (rowPostId !== postId) {
      continue;
    }

    if (type === "like") {
      result.like += toNumber(value, 1);
      continue;
    }

    if (type === "dislike") {
      result.dislike += toNumber(value, 1);
      continue;
    }

    if (type === "comment" || type === "author") {
      if (isPublished(status)) {
        result.comment += 1;
      }
    }
  }

  return jsonResponse(result, 200, req);
}

async function handleGetComments(postId, env, req) {
  const token = await getAccessToken(env);
  const rows = await readRows(env, token);

  const comments = [];
  const reactions = new Map();

  for (const row of rows) {
    const [
      recordId,
      rowPostId,
      type,
      value,
      commentType,
      repliedId,
      status,
      createdOn,
      updatedOn,
      ip,
      country,
      region,
      city,
      userAgent,
      tatSession,
      tatUser,
      name,
      lang
    ] = row;

    if (rowPostId !== postId) {
      continue;
    }

    if (type === "comment-like" || type === "comment-dislike") {
      if (!isPublished(status)) {
        continue;
      }
      if (!repliedId) {
        continue;
      }
      const existing = reactions.get(repliedId) || { like: 0, dislike: 0 };
      const delta = toNumber(value, 1);
      if (type === "comment-like") {
        existing.like += delta;
      } else {
        existing.dislike += delta;
      }
      reactions.set(repliedId, existing);
      continue;
    }

    if (rowPostId !== postId || (type !== "comment" && type !== "author")) {
      continue;
    }

    if (!isPublished(status)) {
      continue;
    }

    comments.push({
      id: recordId || "",
      name: name || "Anonymous",
      message: value || "",
      lang: lang || "",
      commentType: commentType || (type === "author" ? "author" : "comment"),
      like: 0,
      dislike: 0
    });
  }

  for (const comment of comments) {
    const counts = reactions.get(comment.id);
    if (counts) {
      comment.like = counts.like;
      comment.dislike = counts.dislike;
    }
  }

  return jsonResponse({ comments }, 200, req);
}

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

async function verifyTurnstile(body, req, env) {
  const secret = String(env.TURNSTILE_SECRET || "").trim();
  if (!secret) {
    return true;
  }

  const origin = req.headers.get("Origin") || "";
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    return true;
  }

  const token = String(body?.turnstileToken || body?.["cf-turnstile-response"] || "").trim();
  if (!token) {
    return false;
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  const ip = req.headers.get("CF-Connecting-IP");
  if (ip) {
    form.set("remoteip", ip);
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });

  if (!res.ok) {
    return false;
  }

  const payload = await res.json();
  return Boolean(payload?.success);
}

async function getFingerprint(req) {
  const ip = req.headers.get("CF-Connecting-IP") || "0.0.0.0";
  const ua = req.headers.get("User-Agent") || "";
  return hash(`${ip}${ua}`);
}

async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode({ alg: "RS256", typ: "JWT" });
  const payload = base64UrlEncode({
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  });

  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBuffer(env.GOOGLE_PRIVATE_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data)
  );

  const jwt = `${data}.${base64UrlEncode(sig)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  const payloadJson = await res.json();
  return payloadJson.access_token;
}

async function appendRow(env, token, rows) {
  const range = `${SHEET_TAB}!A1`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: rows })
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`appendRow failed (${res.status}): ${text}`);
  }
}

async function readRows(env, token) {
  const range = `${SHEET_TAB}!A2:${SHEET_COLUMNS}`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const payload = await res.json();
  return payload.values || [];
}

function pemToBuffer(pem) {
  const normalized = pem.replace(/\\n/g, "\n").replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "");
  return Uint8Array.from(atob(normalized.replace(/\n/g, "")), c => c.charCodeAt(0));
}

function base64UrlEncode(data) {
  const bytes =
    data instanceof ArrayBuffer
      ? new Uint8Array(data)
      : data instanceof Uint8Array
      ? data
      : new TextEncoder().encode(JSON.stringify(data));

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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

function normalizeIdentity(body) {
  return {
    tatSession: String(body?.tatSession || "").trim(),
    tatUser: String(body?.tatUser || "").trim()
  };
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

async function buildRows({
  env,
  token,
  postId,
  action,
  relatedId,
  commentPayload,
  commentType,
  status,
  identity,
  client,
  now
}) {
  if (action === "like" || action === "dislike") {
    const userId = identity.tatUser;
    if (!userId) {
      return [createRow(postId, action, "1", commentType, relatedId, status, now, identity, client, commentPayload)];
    }

    const rows = await readRows(env, token);
    const state = getUserReactionState(rows, postId, userId);
    const actions = [];

    if (action === "like") {
      if (state.like > 0) {
        actions.push({ type: "like", value: "-1" });
      } else if (state.dislike > 0) {
        actions.push({ type: "dislike", value: "-1" });
        actions.push({ type: "like", value: "1" });
      } else {
        actions.push({ type: "like", value: "1" });
      }
    }

    if (action === "dislike") {
      if (state.dislike > 0) {
        actions.push({ type: "dislike", value: "-1" });
      } else if (state.like > 0) {
        actions.push({ type: "like", value: "-1" });
        actions.push({ type: "dislike", value: "1" });
      } else {
        actions.push({ type: "dislike", value: "1" });
      }
    }

    return actions.map((entry) =>
      createRow(
        postId,
        entry.type,
        entry.value,
        "",
        "",
        resolveStatus(entry.type),
        now,
        identity,
        client,
        null
      )
    );
  }

  if (action === "comment-like" || action === "comment-dislike") {
    const userId = identity.tatUser;
    if (!userId || !relatedId) {
      return [createRow(postId, action, "1", commentType, relatedId, status, now, identity, client, commentPayload)];
    }

    const rows = await readRows(env, token);
    const state = getCommentReactionState(rows, postId, relatedId, userId);
    const actions = [];

    if (action === "comment-like") {
      if (state.like > 0) {
        actions.push({ type: "comment-like", value: "-1" });
      } else if (state.dislike > 0) {
        actions.push({ type: "comment-dislike", value: "-1" });
        actions.push({ type: "comment-like", value: "1" });
      } else {
        actions.push({ type: "comment-like", value: "1" });
      }
    }

    if (action === "comment-dislike") {
      if (state.dislike > 0) {
        actions.push({ type: "comment-dislike", value: "-1" });
      } else if (state.like > 0) {
        actions.push({ type: "comment-like", value: "-1" });
        actions.push({ type: "comment-dislike", value: "1" });
      } else {
        actions.push({ type: "comment-dislike", value: "1" });
      }
    }

    return actions.map((entry) =>
      createRow(
        postId,
        entry.type,
        entry.value,
        "",
        relatedId,
        resolveStatus(entry.type),
        now,
        identity,
        client,
        null
      )
    );
  }

  return [
    createRow(
      postId,
      action,
      commentPayload ? commentPayload.message : "1",
      commentType,
      relatedId,
      status,
      now,
      identity,
      client,
      commentPayload
    )
  ];
}

function getUserReactionState(rows, postId, userId) {
  let like = 0;
  let dislike = 0;

  for (const row of rows) {
    const [, rowPostId, type, value, , , status, , , , , , , , , tatUser] = row;
    if (rowPostId !== postId) {
      continue;
    }
    if (!isPublished(status)) {
      continue;
    }
    if (tatUser !== userId) {
      continue;
    }
    if (type === "like") {
      like += toNumber(value, 1);
    }
    if (type === "dislike") {
      dislike += toNumber(value, 1);
    }
  }

  return { like, dislike };
}

function getCommentReactionState(rows, postId, commentId, userId) {
  let like = 0;
  let dislike = 0;

  for (const row of rows) {
    const [, rowPostId, type, value, , relatedId, status, , , , , , , , , tatUser] = row;
    if (rowPostId !== postId) {
      continue;
    }
    if (!isPublished(status)) {
      continue;
    }
    if (tatUser !== userId) {
      continue;
    }
    if (relatedId !== commentId) {
      continue;
    }
    if (type === "comment-like") {
      like += toNumber(value, 1);
    }
    if (type === "comment-dislike") {
      dislike += toNumber(value, 1);
    }
  }

  return { like, dislike };
}

function createRow(postId, action, value, commentType, relatedId, status, now, identity, client, commentPayload) {
  return [
    generateId(postId, action),
    postId,
    action,
    value,
    commentType || "",
    relatedId || "",
    status,
    now,
    now,
    client.ip,
    client.country,
    client.region,
    client.city,
    client.userAgent,
    identity.tatSession,
    identity.tatUser,
    commentPayload ? commentPayload.name : "",
    commentPayload ? commentPayload.lang : ""
  ];
}

function resolveStatus(action) {
  if (action === "comment") {
    return "need-review";
  }
  return "published";
}

function generateId(postId, action) {
  const actionCode = toActionCode(action);
  const suffix = nanoid(4);
  return `${postId}-${actionCode}-${suffix}`;
}

function toActionCode(action) {
  if (action === "like") {
    return "l";
  }
  if (action === "dislike") {
    return "d";
  }
  if (action === "comment") {
    return "c";
  }
  if (action === "comment-like") {
    return "l";
  }
  if (action === "comment-dislike") {
    return "d";
  }
  return "a";
}

function nanoid(size) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  let id = "";
  for (const byte of bytes) {
    id += alphabet[byte % alphabet.length];
  }
  return id;
}

function jsonResponse(payload, status, req) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(req)
    }
  });
}

function corsHeaders(req) {
  const origin = req?.headers?.get("Origin") || "";
  const allowed = resolveAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function resolveAllowedOrigin(origin) {
  const allowed = new Set([
    "http://localhost:3000",
    "https://tatoglu.net",
    "https://www.tatoglu.net"
  ]);

  if (allowed.has(origin)) {
    return origin;
  }

  return "https://tatoglu.net";
}
