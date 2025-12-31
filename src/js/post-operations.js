import cookieApi from "./utils/cookies.js";
import analyticsApi from "./analytics.js";

const doc = typeof document !== "undefined" ? document : null;

const postOpsState = {
  initialized: false,
  apiBase: "",
  buttons: [],
  counts: {
    like: 0,
    dislike: 0,
  },
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

function getPostId(button) {
  const id = button?.dataset?.postId || "";
  return id.trim();
}

function getAction(button) {
  const action = button?.dataset?.action || "";
  return action.trim();
}

function getBadge(button) {
  return button?.querySelector("[data-count]") ?? null;
}

async function sendPostAction(apiBase, postId, action, identity) {
  const url = `${apiBase}/${encodeURIComponent(postId)}/${encodeURIComponent(action)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(identity)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`post-ops failed (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}

async function fetchCounts(apiBase, postId) {
  const url = `${apiBase}/${encodeURIComponent(postId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`post-ops counts failed (${res.status}): ${text}`);
  }
  return res.json();
}

function applyCount(button, count) {
  const badge = getBadge(button);
  if (!badge) {
    return;
  }

  const normalized = Number.isFinite(count) ? count : 0;
  badge.textContent = String(normalized);
  if (normalized > 0) {
    button.dataset.hasCount = "true";
  } else {
    delete button.dataset.hasCount;
  }
}

function applyCounts(buttons, counts) {
  buttons.forEach((button) => {
    const action = getAction(button);
    if (action === "like") {
      applyCount(button, counts.like ?? 0);
    }
    if (action === "dislike") {
      applyCount(button, counts.dislike ?? 0);
    }
  });
}

function setButtonState(button, state) {
  if (!button) {
    return;
  }

  button.dataset.postOpsState = state;
  if (state === "loading") {
    button.disabled = true;
  } else {
    button.disabled = false;
  }
}

function bindButton(button, apiBase, identity) {
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    const postId = getPostId(button);
    const action = getAction(button);
    if (!postId || !action) {
      return;
    }

    setButtonState(button, "loading");

    try {
      await sendPostAction(apiBase, postId, action, identity);
      if (action === "like" || action === "dislike") {
        analyticsApi.track(`tat_post_${action}`, {
          tat_session: identity.tatSession,
          tat_user: identity.tatUser,
          post_id: postId
        });
      }
      const payload = await fetchCounts(apiBase, postId);
      postOpsState.counts.like = Number(payload?.like) || 0;
      postOpsState.counts.dislike = Number(payload?.dislike) || 0;
      applyCounts(postOpsState.buttons, postOpsState.counts);
      setButtonState(button, "done");
      setTimeout(() => setButtonState(button, "idle"), 1200);
    } catch (error) {
      console.warn("post-ops request failed", error);
      setButtonState(button, "error");
      setTimeout(() => setButtonState(button, "idle"), 2000);
    }
  });
}

function initPostOperations() {
  if (!doc || postOpsState.initialized) {
    return postOpsApi;
  }

  const apiBase = resolveApiBase();
  if (!apiBase) {
    return postOpsApi;
  }

  const likeEnabled = resolveFeatureFlag("postOpsLike");
  const dislikeEnabled = resolveFeatureFlag("postOpsDislike");
  if (!likeEnabled && !dislikeEnabled) {
    postOpsState.initialized = true;
    return postOpsApi;
  }

  const identity = {
    tatSession: cookieApi.getSessionId?.() || "",
    tatUser: cookieApi.getUserId?.() || ""
  };
  const buttons = Array.from(doc.querySelectorAll("[data-action='like'], [data-action='dislike']"))
    .filter((button) => {
      const action = getAction(button);
      if (action === "like") {
        return likeEnabled;
      }
      if (action === "dislike") {
        return dislikeEnabled;
      }
      return false;
    });
  if (!buttons.length) {
    postOpsState.initialized = true;
    return postOpsApi;
  }

  const postId = getPostId(buttons[0]);
  postOpsState.apiBase = apiBase;
  postOpsState.buttons = buttons;
  buttons.forEach((button) => bindButton(button, apiBase, identity));
  postOpsState.initialized = true;

  if (postId) {
    fetchCounts(apiBase, postId)
      .then((payload) => {
        postOpsState.counts.like = Number(payload?.like) || 0;
        postOpsState.counts.dislike = Number(payload?.dislike) || 0;
        applyCounts(buttons, postOpsState.counts);
      })
      .catch((error) => {
        console.warn("post-ops counts failed", error);
      });
  }

  return postOpsApi;
}

const postOpsApi = {
  init: initPostOperations,
};

export default postOpsApi;
