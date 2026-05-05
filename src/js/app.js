import "./theme-switcher.js";
import "./language-switcher.js";
import cookieApi from "./utils/cookies.js";
import menuApi from "./menu.js";
import shareApi from "./share.js";
import analyticsApi from "./analytics.js";
import telemetryApi from "./telemetry.js";
import postOpsApi from "./post-operations.js";
import postCommentsApi from "./post-comments.js";
import contactApi from "./contact.js";

const yearEl = document.querySelector("[data-year]");
const PAGE_OPEN_EVENT = "open_page";

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const cookieInit = cookieApi.init();
menuApi.init();
shareApi.init();
postOpsApi.init();
postCommentsApi.init();
telemetryApi.init();
contactApi.init();

const sessionId = cookieApi.getSessionId?.() || "";
const userId = cookieApi.getUserId?.() || "";
if (sessionId || userId) {
  analyticsApi.track("tat_session_start", {
    tat_session: sessionId,
    tat_user: userId
  });
}

if (cookieInit?.userCreated && (sessionId || userId)) {
  analyticsApi.track("tat_user_welcome", {
    tat_session: sessionId,
    tat_user: userId
  });
}

if (typeof window !== "undefined") {
  const postId = document.querySelector("[data-post-id]")?.dataset?.postId || "";
  const pageTitle = document.title || "";
  const pagePath = window.location.pathname;
  const pageType = document.body?.dataset?.activeMenu || "";
  analyticsApi.track("tat_page_open", {
    tat_session: sessionId,
    tat_user: userId,
    post_id: postId,
    page_type: pageType,
    page_title: pageTitle,
    path: pagePath
  });
}

// Image zoom
document.querySelectorAll("p img").forEach(image => {
  image.addEventListener("click", function (e) {
    if (e.target && e.target.classList) {
      e.target.classList.toggle("zoom");
      const isZoomed = e.target.classList.contains("zoom");
      telemetryApi.trackCustom("image_zoom_toggle", {
        src: e.target.getAttribute("src") || "",
        alt: e.target.getAttribute("alt") || "",
        zoomed: isZoomed
      }, isZoomed ? "on" : "off");
    }
  });
});

// Back link - progressive enhancement
document.querySelectorAll("[data-back-link]").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  });
});

// Close image zoom on Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const zoomed = document.querySelector("img.zoom");
    if (zoomed) {
      zoomed.classList.remove("zoom");
    }
  }
});
