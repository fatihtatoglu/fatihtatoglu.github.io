import { appendRows, getAccessToken, readRows } from "../lib/google_api.js";
import { getClientContext, getFingerprint, readJsonBody } from "../http/request.js";
import { normalizeIdentity } from "../lib/session.js";
import { isPublished, normalizeComment, toNumber } from "../lib/utils.js";
import { jsonResponse } from "../http/response.js";
import { verifyTurnstile } from "../lib/turnstile.js";

const SHEET_TAB = "records";
const RATE_WINDOW_MS = 10_000;
const SHEET_COLUMNS = "R";

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

  const parsed = await readJsonBody(req);
  if (parsed.error) {
    return parsed.error;
  }
  const body = parsed.body;

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
    await appendRows(env, token, rows, SHEET_TAB);
  } catch (error) {
    return jsonResponse({ error: "Sheet write failed", detail: String(error) }, 502, req);
  }

  return jsonResponse({ ok: true }, 200, req);
}

async function handleGetCounts(postId, env, req) {
  const token = await getAccessToken(env);
  const rows = await readRows(env, token, `${SHEET_TAB}!A2:${SHEET_COLUMNS}`);

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
  const rows = await readRows(env, token, `${SHEET_TAB}!A2:${SHEET_COLUMNS}`);

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

    const rows = await readRows(env, token, `${SHEET_TAB}!A2:${SHEET_COLUMNS}`);
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

    const rows = await readRows(env, token, `${SHEET_TAB}!A2:${SHEET_COLUMNS}`);
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

export {
  handleGetComments,
  handleGetCounts,
  handlePost,
  isAction,
  toCommentAction
};
