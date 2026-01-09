import cookieApi from "./utils/cookies.js";
import analyticsApi from "./analytics.js";
import { getLocalizedString, getRootLanguage } from "./utils/i18n-client.js";

const doc = typeof document !== "undefined" ? document : null;
const ICON_SPRITE = "/assets/svg/icons.svg";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let turnstileScriptPromise = null;

const commentsState = {
  initialized: false,
  apiBase: "",
  postId: "",
  section: null,
  list: null,
  empty: null,
  count: null,
  form: null,
  status: null,
  submit: null,
  loading: false,
  loaded: false,
  loadingList: false,
};

function resolveApiBase() {
  if (!doc?.documentElement?.dataset) {
    return "";
  }

  const raw = doc.documentElement.dataset.postOpsApi || "";
  return raw.trim().replace(/\/+$/g, "");
}

function resolveFeatureFlag(key) {
  if (!doc?.documentElement?.dataset) {
    return true;
  }

  const raw = doc.documentElement.dataset[key];
  if (raw == null) {
    return true;
  }

  const normalized = String(raw).toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "off";
}

function resolveTurnstileKey() {
  if (!doc?.documentElement?.dataset) {
    return "";
  }

  const baseUrl = String(doc.documentElement.dataset.baseUrl || "").trim();
  if (baseUrl) {
    try {
      const hostname = new URL(baseUrl).hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "";
      }
    } catch {
      // Ignore invalid base URL and continue with turnstile key.
    }
  }

  const raw = doc.documentElement.dataset.turnstileSiteKey || "";
  return raw.trim();
}

function resolveAuthorName() {
  if (!doc?.documentElement?.dataset) {
    return "";
  }

  const raw = doc.documentElement.dataset.authorName || "";
  return raw.trim();
}

function t(key, fallback) {
  return getLocalizedString(getRootLanguage(), key, fallback);
}

function createIcon(symbolId) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `${ICON_SPRITE}#${symbolId}`);
  svg.appendChild(use);
  return svg;
}

function setStatus(message, tone = "info") {
  if (!commentsState.status) {
    return;
  }

  commentsState.status.textContent = message;
  commentsState.status.dataset.tone = tone;
}

function clearStatus() {
  if (!commentsState.status) {
    return;
  }

  commentsState.status.textContent = "";
  delete commentsState.status.dataset.tone;
}

function updateCount(count) {
  if (!commentsState.count) {
    return;
  }

  const normalized = Number.isFinite(count) ? count : 0;
  commentsState.count.textContent = String(normalized);
}

function toggleEmpty(show) {
  if (!commentsState.empty) {
    return;
  }

  commentsState.empty.hidden = !show;
}

function loadTurnstileScript() {
  if (!doc) {
    return Promise.resolve(false);
  }

  if (!resolveTurnstileKey()) {
    return Promise.resolve(false);
  }

  if (typeof window !== "undefined" && window.turnstile) {
    return Promise.resolve(true);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  const existing = doc.querySelector(`script[src^="${TURNSTILE_SCRIPT_SRC}"]`);
  if (existing) {
    turnstileScriptPromise = new Promise((resolve) => {
      if (typeof window !== "undefined" && window.turnstile) {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
    });
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve) => {
    const script = doc.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(true), { once: true });
    script.addEventListener("error", () => resolve(false), { once: true });
    doc.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

function renderTurnstileWidget() {
  if (!doc || typeof window === "undefined") {
    return;
  }
  if (!window.turnstile || typeof window.turnstile.render !== "function") {
    return;
  }

  const widget = doc.querySelector(".cf-turnstile");
  if (!widget || widget.dataset.turnstileRendered === "true") {
    return;
  }

  window.turnstile.render(widget);
  widget.dataset.turnstileRendered = "true";
}

async function loadComments(apiBase, postId) {
  if (!commentsState.list || commentsState.loaded || commentsState.loadingList) {
    return;
  }

  commentsState.loadingList = true;
  try {
    const payload = await fetchComments(apiBase, postId);
    renderComments(payload.comments || []);
    commentsState.loaded = true;
  } catch (error) {
    console.warn("post comments failed", error);
    toggleEmpty(true);
  } finally {
    commentsState.loadingList = false;
  }
}

function openCommentsSection() {
  if (!commentsState.section) {
    return;
  }

  commentsState.section.hidden = false;
  loadTurnstileScript().then((ok) => {
    if (ok) {
      renderTurnstileWidget();
    }
  });
  if (commentsState.apiBase && commentsState.postId) {
    loadComments(commentsState.apiBase, commentsState.postId);
  }
}

async function fetchComments(apiBase, postId) {
  const url = `${apiBase}/${encodeURIComponent(postId)}/comment`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`post-comments failed (${res.status}): ${text}`);
  }
  return res.json();
}

function buildActionButton(action, count, isAuthor) {
  const button = document.createElement("button");
  button.type = "button";
  const tone = isAuthor ? "btn--tone-sage" : "btn--tone-brand";
  button.className = `btn btn--xs ${tone} btn--icon-left comment-card__action`;
  button.dataset.commentAction = action;
  button.setAttribute(
    "aria-label",
    action === "like"
      ? t("post.comments.actions.like.aria", "")
      : t("post.comments.actions.dislike.aria", "")
  );

  const icon = createIcon(action === "like" ? "icon-like" : "icon-dislike");
  const countEl = document.createElement("span");
  countEl.className = "comment-card__count";
  countEl.textContent = String(Number.isFinite(count) ? count : 0);

  button.appendChild(icon);
  button.appendChild(countEl);
  return button;
}

function buildCommentCard(comment) {
  const card = document.createElement("article");
  card.className = "comment-card";
  card.dataset.commentId = comment.id || "";
  if (comment.commentType === "author") {
    card.classList.add("author");
  }

  const header = document.createElement("header");
  header.className = "comment-card__header";

  const name = document.createElement("span");
  name.className = "comment-card__name";
  if (comment.commentType === "author") {
    name.textContent = resolveAuthorName() || t("post.comments.authorNameFallback", "");
  } else {
    name.textContent = comment.name || t("post.comments.anonymousName", "");
  }
  header.appendChild(name);

  if (comment.commentType === "author") {
    const badge = document.createElement("span");
    badge.className = "comment-card__badge";
    const badgeText = t("post.comments.authorBadge", "");
    if (badgeText) {
      badge.textContent = badgeText;
      header.appendChild(badge);
    }
  }

  const message = document.createElement("p");
  message.className = "comment-card__message";
  message.textContent = comment.message || "";

  const actions = document.createElement("div");
  actions.className = "comment-card__actions";

  const isAuthor = comment.commentType === "author";
  const likeButton = buildActionButton("like", comment.like, isAuthor);
  const dislikeButton = buildActionButton("dislike", comment.dislike, isAuthor);
  likeButton.dataset.commentId = comment.id || "";
  dislikeButton.dataset.commentId = comment.id || "";

  actions.appendChild(likeButton);
  actions.appendChild(dislikeButton);

  card.appendChild(header);
  card.appendChild(message);
  card.appendChild(actions);
  return card;
}

function renderComments(comments) {
  if (!commentsState.list) {
    return;
  }

  commentsState.list.innerHTML = "";
  if (!comments.length) {
    updateCount(0);
    toggleEmpty(true);
    return;
  }

  toggleEmpty(false);
  updateCount(comments.length);
  comments.forEach((comment) => {
    commentsState.list.appendChild(buildCommentCard(comment));
  });
}

function getTurnstileToken(form) {
  if (!form) {
    return "";
  }

  const tokenInput = form.querySelector("input[name='cf-turnstile-response']");
  return tokenInput?.value?.trim() || "";
}

function resetTurnstile() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.turnstile && typeof window.turnstile.reset === "function") {
    window.turnstile.reset();
  }
}

async function sendComment(apiBase, postId, payload) {
  const url = `${apiBase}/${encodeURIComponent(postId)}/comment`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`comment submit failed (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}

async function sendCommentReaction(apiBase, postId, commentId, action, identity) {
  const url = `${apiBase}/${encodeURIComponent(postId)}/comment/${encodeURIComponent(commentId)}/${encodeURIComponent(action)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(identity)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`comment reaction failed (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}

function bindForm(apiBase, postId) {
  if (!commentsState.form) {
    return;
  }
  if (!commentsState.submit) {
    commentsState.submit = commentsState.form.querySelector("[data-comment-submit]");
  }

  commentsState.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (commentsState.loading) {
      return;
    }

    if (typeof commentsState.form.reportValidity === "function" && !commentsState.form.reportValidity()) {
      setStatus(t("post.comments.status.validation", ""), "error");
      return;
    }

    const name = commentsState.form.querySelector("input[name='name']")?.value.trim() || "";
    const email = commentsState.form.querySelector("input[name='email']")?.value.trim() || "";
    const message = commentsState.form.querySelector("textarea[name='message']")?.value.trim() || "";

    if (!name || !email || !message) {
      setStatus(t("post.comments.status.validation", ""), "error");
      return;
    }

    const turnstileKey = resolveTurnstileKey();
    const token = getTurnstileToken(commentsState.form);
    if (turnstileKey && !token) {
      setStatus(t("post.comments.status.captchaMissing", ""), "error");
      return;
    }

    const identity = {
      tatSession: cookieApi.getSessionId?.() || "",
      tatUser: cookieApi.getUserId?.() || ""
    };

    commentsState.loading = true;
    if (commentsState.submit) {
      commentsState.submit.disabled = true;
    }
    clearStatus();
    setStatus(t("post.comments.status.sending", ""), "info");

    try {
      await sendComment(apiBase, postId, {
        name,
        email,
        message,
        lang: getRootLanguage(),
        turnstileToken: token,
        tatSession: identity.tatSession,
        tatUser: identity.tatUser
      });
      analyticsApi.track("tat_post_comment", {
        tat_session: identity.tatSession,
        tat_user: identity.tatUser,
        post_id: postId
      });
      commentsState.form.reset();
      resetTurnstile();
      setStatus(t("post.comments.status.success", ""), "success");
      const payload = await fetchComments(apiBase, postId);
      renderComments(payload.comments || []);
    } catch (error) {
      console.warn("comment submit failed", error);
    setStatus(t("post.comments.status.error", ""), "error");
    } finally {
      commentsState.loading = false;
      if (commentsState.submit) {
        commentsState.submit.disabled = false;
      }
    }
  });
}

function bindReactions(apiBase, postId) {
  if (!commentsState.list) {
    return;
  }

  commentsState.list.addEventListener("click", async (event) => {
    const button = event.target?.closest?.("[data-comment-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.commentAction || "";
    const commentId = button.dataset.commentId || "";
    if (!action || !commentId) {
      return;
    }

    const identity = {
      tatSession: cookieApi.getSessionId?.() || "",
      tatUser: cookieApi.getUserId?.() || ""
    };

    button.disabled = true;
    try {
      await sendCommentReaction(apiBase, postId, commentId, action, identity);
      const payload = await fetchComments(apiBase, postId);
      renderComments(payload.comments || []);
    } catch (error) {
      console.warn("comment reaction failed", error);
    } finally {
      button.disabled = false;
    }
  });
}

function bindScrollButton(section) {
  if (!doc || !section) {
    return;
  }

  const buttons = doc.querySelectorAll("[data-comment-scroll]");
  if (!buttons.length) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openCommentsSection();
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initPostComments() {
  if (!doc || commentsState.initialized) {
    return postCommentsApi;
  }

  const section = doc.querySelector("[data-comments]");
  if (!section) {
    commentsState.initialized = true;
    return postCommentsApi;
  }

  const apiBase = resolveApiBase();
  const commentEnabled = resolveFeatureFlag("postOpsComment");
  if (!apiBase || !commentEnabled) {
    section.hidden = true;
    commentsState.initialized = true;
    return postCommentsApi;
  }

  commentsState.section = section;
  commentsState.apiBase = apiBase;
  commentsState.postId = section.dataset.postId || "";
  commentsState.list = section.querySelector("[data-comment-list]");
  commentsState.empty = section.querySelector("[data-comment-empty]");
  commentsState.count = section.querySelector("[data-comment-count]");
  commentsState.form = section.querySelector("[data-comment-form]");
  commentsState.status = section.querySelector("[data-comment-status]");
  commentsState.submit = section.querySelector("[data-comment-submit]");

  if (!commentsState.postId) {
    section.hidden = true;
    commentsState.initialized = true;
    return postCommentsApi;
  }

  section.hidden = true;
  bindForm(apiBase, commentsState.postId);
  bindReactions(apiBase, commentsState.postId);
  bindScrollButton(section);
  commentsState.initialized = true;

  return postCommentsApi;
}

const postCommentsApi = {
  init: initPostComments,
};

export default postCommentsApi;
