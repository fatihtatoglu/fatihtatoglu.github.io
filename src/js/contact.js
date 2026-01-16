import cookieApi from "./utils/cookies.js";
import { getLocalizedString, getRootLanguage } from "./utils/i18n-client.js";

const doc = typeof document !== "undefined" ? document : null;
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let turnstileScriptPromise = null;

const contactState = {
  initialized: false,
  apiBase: "",
  form: null,
  status: null,
  submit: null
};

function resolveApiBase() {
  if (!doc?.documentElement?.dataset) {
    return "";
  }

  const raw = doc.documentElement.dataset.postOpsApi || "";
  return raw.trim().replace(/\/+$/g, "");
}

function resolveLocale() {
  const lang = getRootLanguage();
  return lang.startsWith("tr") ? "tr" : "en";
}

function t(key, fallback = "") {
  const locale = resolveLocale();
  return getLocalizedString(locale, key, fallback);
}

function setStatus(message, tone = "info") {
  if (!contactState.status) {
    return;
  }
  contactState.status.textContent = message;
  contactState.status.dataset.tone = tone;
}

function clearStatus() {
  if (!contactState.status) {
    return;
  }
  contactState.status.textContent = "";
  delete contactState.status.dataset.tone;
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

function loadTurnstileScript() {
  if (!resolveTurnstileKey()) {
    return Promise.resolve(false);
  }

  if (typeof window !== "undefined" && window.turnstile) {
    return Promise.resolve(true);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  const existing = doc?.querySelector(`script[src^="${TURNSTILE_SCRIPT_SRC}"]`);
  if (existing) {
    turnstileScriptPromise = new Promise((resolve) => {
      if (typeof window !== "undefined" && window.turnstile) {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
    });
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve) => {
    if (!doc) {
      resolve(false);
      return;
    }
    const script = doc.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => resolve(false));
    doc.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

function renderTurnstileWidget() {
  if (typeof window === "undefined") {
    return;
  }
  if (!window.turnstile || typeof window.turnstile.render !== "function") {
    return;
  }
  const widget = doc?.querySelector(".cf-turnstile");
  if (!widget || widget.dataset.turnstileRendered === "true") {
    return;
  }
  window.turnstile.render(widget);
  widget.dataset.turnstileRendered = "true";
}

function getTurnstileToken(form) {
  const tokenInput = form?.querySelector("input[name='cf-turnstile-response']");
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

function isValidEmail(value) {
  if (!value) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendContact(apiBase, payload) {
  const res = await fetch(`${apiBase}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`contact failed (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}

function bindForm() {
  if (!contactState.form) {
    return;
  }

  contactState.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactState.form.reportValidity?.()) {
      setStatus(t("contact.form.status.missing", ""), "error");
      return;
    }

    const name = contactState.form.querySelector("input[name='name']")?.value.trim() || "";
    const email = contactState.form.querySelector("input[name='email']")?.value.trim() || "";
    const type = contactState.form.querySelector("select[name='type']")?.value.trim() || "";
    const message = contactState.form.querySelector("textarea[name='message']")?.value.trim() || "";

    if (!name || !email || !type || !message) {
      setStatus(t("contact.form.status.missing", ""), "error");
      return;
    }

    if (!isValidEmail(email)) {
      setStatus(t("contact.form.status.invalidEmail", ""), "error");
      return;
    }

    const turnstileKey = resolveTurnstileKey();
    const token = getTurnstileToken(contactState.form);
    if (turnstileKey && !token) {
      setStatus(t("contact.form.status.captchaMissing", ""), "error");
      return;
    }

    const payload = {
      name,
      email,
      type,
      message,
      lang: resolveLocale(),
      tatSession: cookieApi.getSessionId?.() || "",
      tatUser: cookieApi.getUserId?.() || ""
    };
    if (token) {
      payload.turnstileToken = token;
    }

    contactState.submit?.setAttribute("aria-busy", "true");
    contactState.submit?.setAttribute("disabled", "true");
    setStatus(t("contact.form.status.sending", ""), "info");

    try {
      await sendContact(contactState.apiBase, payload);
      contactState.form.reset();
      resetTurnstile();
      setStatus(t("contact.form.status.success", ""), "success");
    } catch (error) {
      console.warn("contact submit failed", error);
      setStatus(t("contact.form.status.error", ""), "error");
    } finally {
      contactState.submit?.removeAttribute("aria-busy");
      contactState.submit?.removeAttribute("disabled");
    }
  });
}

function initContact() {
  if (!doc || contactState.initialized) {
    return contactApi;
  }

  const form = doc.querySelector("[data-contact-form]");
  if (!form) {
    contactState.initialized = true;
    return contactApi;
  }

  const apiBase = resolveApiBase();
  if (!apiBase) {
    contactState.initialized = true;
    return contactApi;
  }

  contactState.form = form;
  contactState.status = form.querySelector("[data-contact-status]");
  contactState.submit = form.querySelector("[data-contact-submit]");
  contactState.apiBase = apiBase;

  bindForm();
  loadTurnstileScript().then((ok) => {
    if (ok) {
      renderTurnstileWidget();
    }
  });

  contactState.initialized = true;
  return contactApi;
}

const contactApi = {
  init: initContact
};

export default contactApi;
