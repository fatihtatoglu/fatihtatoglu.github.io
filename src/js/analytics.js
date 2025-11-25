const root = typeof document !== "undefined" ? document.documentElement : null;

function resolveAnalyticsFlag() {
  if (!root || !root.dataset) {
    return false;
  }

  const raw = root.dataset.analyticsEnabled;
  if (raw == null) {
    return false;
  }

  const normalized = String(raw).toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "off";
}

const ANALYTICS_ENABLED = resolveAnalyticsFlag();

function toPlainObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return {};
}

function sendToGtm(eventName, payload) {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  window.dataLayer.push({ event: eventName, ...payload });
}

function sendToGa(eventName, payload) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, payload);
}

function sendToClarity(eventName, payload) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.clarity !== "function") {
    return;
  }

  window.clarity("event", eventName, payload);
}

function trackAnalyticsEvent(eventName, payload = {}) {
  if (!ANALYTICS_ENABLED) {
    return false;
  }

  if (!eventName) {
    return false;
  }

  const data = toPlainObject(payload);
  sendToGtm(eventName, data);
  sendToGa(eventName, data);
  sendToClarity(eventName, data);

  return true;
}

const analyticsApi = {
  ANALYTICS_ENABLED,
  track: trackAnalyticsEvent,
};

export default analyticsApi;
