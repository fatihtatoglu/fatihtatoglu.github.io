import "./theme-switcher.js";
import "./language-switcher.js";
import cookieApi from "./utils/cookies.js";
import menuApi from "./menu.js";
import shareApi from "./share.js";
import analyticsApi from "./analytics.js";

const yearEl = document.querySelector("[data-year]");
const PAGE_OPEN_EVENT = "open_page";

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

cookieApi.init();
menuApi.init();
shareApi.init();

document.querySelectorAll("p img").forEach(image => {
  image.addEventListener("click", function (e) {
    if (e.target && e.target.classList) {
      e.target.classList.toggle("zoom");
    }
  });
});