import "./theme-switcher.js";
import "./language-switcher.js";
import cookieApi from "./utils/cookies.js";
import menuApi from "./menu.js";
import shareApi from "./share.js";
import analyticsApi from "./analytics.js";
import postOpsApi from "./post-operations.js";

const yearEl = document.querySelector("[data-year]");
const PAGE_OPEN_EVENT = "open_page";

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const cookieInit = cookieApi.init();
menuApi.init();
shareApi.init();
postOpsApi.init();

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

document.querySelectorAll("p img").forEach(image => {
  image.addEventListener("click", function (e) {
    if (e.target && e.target.classList) {
      e.target.classList.toggle("zoom");
    }
  });
});
