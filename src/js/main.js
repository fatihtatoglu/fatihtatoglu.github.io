import "./theme-switcher.js";
import "./language-switcher.js";
import { readCookie, setCookie } from "./utils/cookies.js";

const siteHeader = document.querySelector(".site-header");
const headerSentinel = document.querySelector("[data-header-sentinel]");
const menuButton = document.querySelector("[data-menu-button]");
const menuPanel = document.querySelector("[data-menu-panel]");
const menuOverlay = document.querySelector("[data-menu-overlay]");
const menuLinks = document.querySelectorAll("[data-menu-link]");
const yearEl = document.querySelector("[data-year]");
const contentToggle = document.querySelector("[data-content-toggle]");
const shortRegion = document.querySelector('[data-content-region="short"]');
const longRegion = document.querySelector('[data-content-region="long"]');
const SESSION_COOKIE = "tat-session";
const SESSION_MAX_AGE = 60 * 60 * 2;

function ensureSessionCookie() {
  if (readCookie(SESSION_COOKIE)) return;
  const sessionSeed =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  setCookie(SESSION_COOKIE, sessionSeed, { maxAge: SESSION_MAX_AGE });
}

ensureSessionCookie();

function setActiveMenuLink(id) {
  if (!id) return;
  menuLinks.forEach((link) => {
    const isMatch = link.dataset.menuLink === id;
    link.classList.toggle("is-active", isMatch);
  });
  if (document.body) {
    document.body.dataset.activeMenu = id;
  }
}

function setMenuState(open, silent = false) {
  if (!menuButton || !menuPanel) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.dataset.menuOpen = String(open);
  menuPanel.hidden = !open;
  if (menuOverlay) {
    menuOverlay.hidden = !open;
  }
  if (open) {
    const focusable = menuPanel.querySelector("input, a, button");
    (focusable ?? menuPanel).focus();
  } else if (!silent) {
    menuButton.focus();
  }
}

function toggleMenu() {
  if (!menuButton) return;
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
}

function setContentMode(mode) {
  if (!contentToggle || !shortRegion || !longRegion) return;
  const showLong = mode === "long";
  shortRegion.hidden = showLong;
  longRegion.hidden = !showLong;
  contentToggle.setAttribute("aria-expanded", String(showLong));
  contentToggle.dataset.contentMode = showLong ? "long" : "short";
  const label = showLong
    ? contentToggle.getAttribute("data-label-collapse")
    : contentToggle.getAttribute("data-label-expand");
  if (label) {
    contentToggle.textContent = label;
  }
}

function toggleContentMode() {
  const nextMode = contentToggle?.dataset.contentMode === "long" ? "short" : "long";
  setContentMode(nextMode);
}

menuButton?.addEventListener("click", toggleMenu);
menuPanel?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});
menuOverlay?.addEventListener("click", () => setMenuState(false));
menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveMenuLink(link.dataset.menuLink);
    setMenuState(false, true);
  });
});
document.addEventListener("click", (event) => {
  if (!menuButton || !menuPanel) return;
  if (menuPanel.hidden) return;
  if (menuPanel.contains(event.target) || menuButton.contains(event.target)) return;
  setMenuState(false, true);
});

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (contentToggle) {
  contentToggle.addEventListener("click", toggleContentMode);
  setContentMode("short");
}

if (siteHeader && headerSentinel && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const shouldPin = entry ? !entry.isIntersecting : false;
      siteHeader.classList.toggle("site-header--pinned", shouldPin);
    },
    { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
  );
  observer.observe(headerSentinel);
} else if (siteHeader) {
  const handleScrollFallback = () => {
    siteHeader.classList.toggle("site-header--pinned", window.scrollY > 10);
  };
  window.addEventListener("scroll", handleScrollFallback, { passive: true });
  handleScrollFallback();
}

const initialMenuSelection = document.body?.dataset.activeMenu;
if (initialMenuSelection) {
  setActiveMenuLink(initialMenuSelection);
} else if (menuLinks.length) {
  setActiveMenuLink(menuLinks[0].dataset.menuLink);
}

setMenuState(false, true);
