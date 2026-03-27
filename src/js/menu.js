const doc = typeof document !== "undefined" ? document : null;

const menuState = {
  button: null,
  panel: null,
  overlay: null,
  links: [],
  initialized: false,
};

function cacheDom() {
  if (!doc) {
    return;
  }

  menuState.button = doc.querySelector("[data-menu-button]");
  menuState.panel = doc.querySelector("[data-menu-panel]");
  menuState.overlay = doc.querySelector("[data-menu-overlay]");
  menuState.links = Array.from(doc.querySelectorAll("[data-menu-link]"));
}

function setActiveMenuLink(id) {
  if (!doc || !id) {
    return;
  }

  menuState.links.forEach((link) => {
    const isMatch = link.dataset.menuLink === id;
    link.classList.toggle("is-active", isMatch);
    if (isMatch) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (doc.body) {
    doc.body.dataset.activeMenu = id;
  }
}

function setMenuState(open, silent = false) {
  const { button, panel, overlay } = menuState;
  if (!button || !panel) {
    return;
  }

  button.setAttribute("aria-expanded", String(open));
  button.dataset.menuOpen = String(open);
  panel.hidden = !open;

  if (overlay) {
    overlay.hidden = !open;
  }

  // Prevent body scroll when mobile menu is open
  if (typeof document !== "undefined") {
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (open) {
    const focusable = panel.querySelector("input, a, button");
    (focusable ?? panel).focus();
  } else if (!silent) {
    button.focus();
  }
}

function toggleMenu() {
  const { button } = menuState;
  if (!button) {
    return;
  }

  const isOpen = button.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
}

function handleDocumentClick(event) {
  const { button, panel } = menuState;
  if (!button || !panel || panel.hidden) {
    return;
  }

  const target = event.target;

  if (panel.contains(target) || button.contains(target)) {
    return;
  }

  setMenuState(false, true);
}

function trapFocus(event) {
  const { panel } = menuState;
  if (!panel || panel.hidden) {
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = panel.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  if (!focusableElements.length) {
    return;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function bindMenuListeners() {
  const { button, panel, overlay, links } = menuState;
  button?.addEventListener("click", toggleMenu);

  panel?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
    trapFocus(event);
  });

  overlay?.addEventListener("click", () => setMenuState(false));

  links.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveMenuLink(link.dataset.menuLink);
      setMenuState(false, true);
    });
  });

  doc?.addEventListener("click", handleDocumentClick);
}

function initMenu(options = {}) {
  if (!doc || menuState.initialized) {
    return menuApi;
  }

  cacheDom();
  bindMenuListeners();

  const providedInitial = typeof options.initialSelection === "string"
    ? options.initialSelection.trim()
    : "";
  const defaultSelection = doc.body?.dataset.activeMenu?.trim();
  const fallbackSelection = menuState.links[0]?.dataset.menuLink ?? "";
  const initialSelection = providedInitial || defaultSelection || fallbackSelection;

  if (initialSelection) {
    setActiveMenuLink(initialSelection);
  } else if (doc.body) {
    delete doc.body.dataset.activeMenu;
  }

  setMenuState(false, true);
  menuState.initialized = true;

  return menuApi;
}

const menuApi = {
  init: initMenu,
  setActiveMenu: setActiveMenuLink,
  setMenuState,
};

export default menuApi;
