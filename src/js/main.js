import "./theme-switcher.js";
import "./language-switcher.js";

const MENU_ACTIVE_KEY = "tat-menu-active";

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

function persist(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage might be disabled */
  }
}

function readPref(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setActiveMenuLink(id, shouldPersist = true) {
  if (!id) return;
  let matched = false;
  menuLinks.forEach((link) => {
    const isMatch = link.dataset.menuLink === id;
    link.classList.toggle("is-active", isMatch);
    if (isMatch) matched = true;
  });
  if (matched && shouldPersist) {
    persist(MENU_ACTIVE_KEY, id);
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
    const id = link.dataset.menuLink;
    setActiveMenuLink(id);
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

const savedMenu = readPref(MENU_ACTIVE_KEY);
if (savedMenu) {
  setActiveMenuLink(savedMenu, false);
} else if (menuLinks.length) {
  setActiveMenuLink(menuLinks[0].dataset.menuLink, false);
}

setMenuState(false, true);
