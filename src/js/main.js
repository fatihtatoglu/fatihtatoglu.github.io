import "./theme-switcher.js";
import "./language-switcher.js";
import { submitContactForm } from "./services/contact.js";
import { readCookie, setCookie } from "./utils/cookies.js";

const siteHeader = document.querySelector(".site-header");
const headerSentinel = document.querySelector("[data-header-sentinel]");
const menuButton = document.querySelector("[data-menu-button]");
const menuPanel = document.querySelector("[data-menu-panel]");
const menuOverlay = document.querySelector("[data-menu-overlay]");
const menuLinks = document.querySelectorAll("[data-menu-link]");
const yearEl = document.querySelector("[data-year]");
const contactForm = document.querySelector("[data-contact-form]");
const contactSubmitButton = contactForm?.querySelector("[data-contact-submit]");
const contactMessageInput = contactForm?.querySelector('[data-contact-input="message"]');
const contactMessageCounter = contactForm?.querySelector("[data-contact-counter]");
const contactModal = document.querySelector("[data-contact-modal]");
const contactModalOverlay = document.querySelector("[data-contact-modal-overlay]");
const contactModalCloseButtons = document.querySelectorAll("[data-contact-modal-close]");
const contactModalTitle = document.querySelector("[data-contact-modal-title]");
const contactModalMessage = document.querySelector("[data-contact-modal-message]");
const contactModalIcon = document.querySelector("[data-contact-modal-icon]");
const SESSION_COOKIE = "tat-session";
const SESSION_MAX_AGE = 60 * 60 * 2;
const CONTACT_FIELDS = ["fullname", "email", "subject", "message", "privacy"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_MESSAGE_LIMIT =
  Number(contactMessageInput?.dataset.contactMax ?? contactMessageInput?.getAttribute("maxlength")) || 1000;
const CONTACT_VALIDATION_MESSAGES = {
  fullname: contactForm?.dataset.contactValidFullname ?? "Lütfen adınızı yazın.",
  email: contactForm?.dataset.contactValidEmail ?? "Lütfen e-posta adresinizi yazın.",
  emailInvalid: contactForm?.dataset.contactValidEmailInvalid ?? "Geçerli bir e-posta girin.",
  subject: contactForm?.dataset.contactValidSubject ?? "Lütfen bir konu seçin.",
  message: contactForm?.dataset.contactValidMessage ?? "Mesajınızı en az 20 karakter olacak şekilde yazın.",
  privacy: contactForm?.dataset.contactValidPrivacy ?? "Devam etmek için onay vermelisiniz.",
};
const CONTACT_MODAL_MESSAGES = {
  success: {
    title: contactModal?.dataset.contactModalSuccessTitle ?? "Mesajınız ulaştı!",
    description: contactModal?.dataset.contactModalSuccessMessage ?? "Teşekkür ederim. En kısa sürede dönüş yapacağım.",
  },
  error: {
    title: contactModal?.dataset.contactModalErrorTitle ?? "Bir sorun oluştu",
    description: contactModal?.dataset.contactModalErrorMessage ?? "Mesajınız şu anda gönderilemedi. Lütfen tekrar deneyin.",
  },
};
const CONTACT_SERVICE_MESSAGES = {
  success: contactForm?.dataset.contactServiceSuccess ?? "Mesajınız başarıyla kaydedildi.",
  error: contactForm?.dataset.contactServiceError ?? "Beklenmeyen bir hata oluştu.",
};
const contactTouchedFields = new Set();
let contactFormPending = false;
const contactSubmitDefaultLabel = contactSubmitButton?.textContent.trim() ?? "Gönder";
const contactSubmitLoadingLabel = contactSubmitButton?.dataset.contactSubmitLoading ?? "Gönderiliyor...";

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

function getContactFieldValue(name) {
  if (!contactForm) return "";
  const field = contactForm.querySelector(`[data-contact-input="${name}"]`);
  if (!field) return "";
  if (field instanceof HTMLInputElement && field.type === "checkbox") {
    return field.checked ? "true" : "";
  }
  return field.value ?? "";
}

function collectContactFormValues() {
  return {
    fullname: getContactFieldValue("fullname").trim(),
    email: getContactFieldValue("email").trim(),
    subject: getContactFieldValue("subject").trim(),
    message: getContactFieldValue("message").trim(),
    privacy: contactForm
      ? Boolean(contactForm.querySelector('[data-contact-input="privacy"]')?.checked)
      : false,
  };
}

function validateContactForm(values) {
  const errors = {};
  if (!values.fullname) {
    errors.fullname = CONTACT_VALIDATION_MESSAGES.fullname;
  }
  if (!values.email) {
    errors.email = CONTACT_VALIDATION_MESSAGES.email;
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = CONTACT_VALIDATION_MESSAGES.emailInvalid;
  }
  if (!values.subject) {
    errors.subject = CONTACT_VALIDATION_MESSAGES.subject;
  }
  if (!values.message || values.message.length < 20) {
    errors.message = CONTACT_VALIDATION_MESSAGES.message;
  }
  if (!values.privacy) {
    errors.privacy = CONTACT_VALIDATION_MESSAGES.privacy;
  }
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

function renderContactErrors(errors, { revealAll = false } = {}) {
  if (!contactForm) return;
  CONTACT_FIELDS.forEach((fieldName) => {
    const errorMessage = errors[fieldName];
    const shouldShow = revealAll || contactTouchedFields.has(fieldName);
    const errorEl = contactForm.querySelector(
      `[data-contact-error="${fieldName}"]`,
    );
    const fieldInput = contactForm.querySelector(
      `[data-contact-input="${fieldName}"]`,
    );
    if (errorEl) {
      errorEl.textContent = shouldShow && errorMessage ? errorMessage : "";
    }
    if (fieldInput) {
      fieldInput.setAttribute("aria-invalid", errorMessage ? "true" : "false");
    }
  });
}

function refreshContactFormState({ revealAll = false } = {}) {
  if (!contactForm) return { values: null, errors: {}, isValid: false };
  const values = collectContactFormValues();
  const evaluation = validateContactForm(values);
  renderContactErrors(evaluation.errors, { revealAll });
  updateContactMessageCounter();
  if (!contactFormPending && contactSubmitButton) {
    contactSubmitButton.disabled = !evaluation.isValid;
  }
  return { values, ...evaluation };
}

function updateContactMessageCounter() {
  if (!contactMessageInput || !contactMessageCounter) return;
  const currentLength = contactMessageInput.value.length;
  contactMessageCounter.textContent = `${currentLength} / ${CONTACT_MESSAGE_LIMIT}`;
}

function setContactFormPending(pending) {
  if (!contactSubmitButton) return;
  contactFormPending = pending;
  if (pending) {
    contactSubmitButton.disabled = true;
    contactSubmitButton.textContent = contactSubmitLoadingLabel;
  } else {
    contactSubmitButton.textContent = contactSubmitDefaultLabel;
  }
}

function showContactModal(state, messageConfig) {
  if (!contactModal || !contactModalOverlay || !contactModalTitle || !contactModalMessage) return;
  contactModal.dataset.state = state;
  contactModal.hidden = false;
  contactModalOverlay.hidden = false;
  contactModalTitle.textContent = messageConfig.title;
  contactModalMessage.textContent = messageConfig.description;
  if (contactModalIcon) {
    contactModalIcon.textContent = state === "success" ? "✓" : "!";
  }
  const closeButton = contactModal.querySelector("[data-contact-modal-close]");
  closeButton?.focus();
}

function closeContactModal() {
  if (!contactModal || !contactModalOverlay) return;
  contactModal.hidden = true;
  contactModalOverlay.hidden = true;
  contactModal.dataset.state = "";
}

function handleContactFieldInteraction(event) {
  if (!contactForm) return;
  const target = event.target?.closest("[data-contact-input]");
  if (!target) return;
  const name = target.getAttribute("data-contact-input");
  if (name) {
    contactTouchedFields.add(name);
  }
  refreshContactFormState({ revealAll: false });
}

function handleContactFormReset() {
  if (!contactForm) return;
  contactTouchedFields.clear();
  setTimeout(() => {
    if (contactSubmitButton) {
      contactSubmitButton.textContent = contactSubmitDefaultLabel;
      contactSubmitButton.disabled = true;
    }
    refreshContactFormState({ revealAll: false });
  }, 0);
}

async function handleContactFormSubmit(event) {
  if (!contactForm) return;
  event.preventDefault();
  CONTACT_FIELDS.forEach((field) => contactTouchedFields.add(field));
  const evaluation = refreshContactFormState({ revealAll: true });
  if (!evaluation.isValid || !evaluation.values) return;
  try {
    setContactFormPending(true);
    const response = await submitContactForm(evaluation.values, CONTACT_SERVICE_MESSAGES);
    if (response.status !== 200) {
      throw new Error("Mock API error");
    }
    contactForm.reset();
    contactTouchedFields.clear();
    refreshContactFormState({ revealAll: false });
    showContactModal("success", CONTACT_MODAL_MESSAGES.success);
  } catch (error) {
    console.error("İletişim formu gönderimi başarısız:", error);
    showContactModal("error", CONTACT_MODAL_MESSAGES.error);
  } finally {
    setContactFormPending(false);
    refreshContactFormState({ revealAll: false });
  }
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

contactForm?.addEventListener("input", handleContactFieldInteraction);
contactForm?.addEventListener("change", handleContactFieldInteraction);
contactForm?.addEventListener("reset", handleContactFormReset);
contactForm?.addEventListener("submit", handleContactFormSubmit);
contactModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeContactModal);
});
contactModalOverlay?.addEventListener("click", closeContactModal);
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (contactModal && contactModal.hidden) return;
  closeContactModal();
});

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
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

if (contactForm) {
  refreshContactFormState({ revealAll: false });
}

setMenuState(false, true);

document.querySelectorAll("button[data-href]").forEach((b) => {
  b.addEventListener("click", (e) => {
    const href = e.currentTarget.getAttribute("data-href");
    window.location.href = href;
  });
});
