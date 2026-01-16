import cookieApi from "./utils/cookies.js";

const root = typeof document !== "undefined" ? document.documentElement : null;
const doc = typeof document !== "undefined" ? document : null;
const telemetryState = {
  apiBase: "",
  basePayload: null,
  enabled: false
};

function resolveApiBase() {
  if (!root?.dataset) {
    return "";
  }
  const raw = root.dataset.postOpsApi || "";
  return raw.trim().replace(/\/+$/g, "");
}

function resolveEnabledFlag() {
  if (!root?.dataset) {
    return false;
  }
  const raw = root.dataset.analyticsEnabled;
  if (raw == null) {
    return false;
  }
  const normalized = String(raw).toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "off";
}

function buildBasePayload() {
  const lang = root?.getAttribute("lang") || "";
  const theme = root?.dataset?.theme || "";
  return {
    url: typeof window !== "undefined" ? window.location.href : "",
    referrer: doc?.referrer || "",
    tatSession: cookieApi.getSessionId?.() || "",
    tatUser: cookieApi.getUserId?.() || "",
    lang,
    theme
  };
}

function sendEvent(
  apiBase,
  payload,
  { endpoint = "event", useBeacon = false, skipHeaders = false } = {}
) {
  if (!apiBase) {
    return false;
  }
  const url = `${apiBase}/${endpoint}`;
  const body = JSON.stringify(payload);
  const headers = {
    "Content-Type": "application/json"
  };
  if (!skipHeaders) {
    headers["tat-lang"] = payload.lang || "";
    headers["tat-theme"] = payload.theme || "";
  }

  if (useBeacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    return navigator.sendBeacon(url, blob);
  }

  if (typeof fetch !== "function") {
    return false;
  }

  fetch(url, {
    method: "POST",
    headers,
    body,
    keepalive: useBeacon
  }).catch(() => {});

  return true;
}

function getContentInfo() {
  if (!doc) {
    return {};
  }

  const pageType = doc.body?.dataset?.activeMenu || "";
  const postEl = doc.querySelector("article.post");
  if (!postEl) {
    return { pageType };
  }

  const postId =
    postEl.dataset?.postId || String(postEl.id || "").replace(/^post-/, "");
  const title = doc.querySelector("h1")?.textContent?.trim() || "";
  const category =
    doc.querySelector(".post-tags .btn--tone-brand span")?.textContent?.trim() || "";
  const tags = Array.from(doc.querySelectorAll(".post-tags .btn--tone-sage span"))
    .map((el) => el.textContent?.trim())
    .filter(Boolean);
  const series =
    doc.querySelector(".post-series__item.is-current span")?.textContent?.trim() || "";

  return {
    pageType,
    postId,
    title,
    category,
    tags,
    series
  };
}

function getDeviceInfo() {
  if (typeof window === "undefined") {
    return {};
  }

  const nav = navigator || {};
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  return {
    viewport: {
      width: window.innerWidth || 0,
      height: window.innerHeight || 0
    },
    screen: {
      width: window.screen?.width || 0,
      height: window.screen?.height || 0,
      colorDepth: window.screen?.colorDepth || 0
    },
    dpr: window.devicePixelRatio || 1,
    language: nav.language || "",
    platform: nav.platform || "",
    timezone,
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: nav.deviceMemory || 0,
    connection: connection
      ? {
          effectiveType: connection.effectiveType || "",
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: Boolean(connection.saveData)
        }
      : {}
  };
}

function readMetricMeta(dataset) {
  const meta = {};
  for (const [key, value] of Object.entries(dataset || {})) {
    if (!key.startsWith("metricMeta")) {
      continue;
    }
    const normalizedKey = key.slice("metricMeta".length);
    if (!normalizedKey) {
      continue;
    }
    const metaKey = normalizedKey.charAt(0).toLowerCase() + normalizedKey.slice(1);
    meta[metaKey] = value;
  }
  return meta;
}

function initMetricTracking(apiBase, basePayload) {
  if (!doc) {
    return;
  }

  doc.addEventListener("click", (event) => {
    const target = event.target?.closest?.("[data-metric]");
    if (!target) {
      return;
    }

    const name = target.dataset?.metricName || "";
    if (!name) {
      return;
    }

    const source = target.dataset?.metricSource || "";
    const type = target.dataset?.metricType || "custom";
    const meta = readMetricMeta(target.dataset);
    const tag = target.tagName ? target.tagName.toLowerCase() : "";

    const data = {
      source,
      meta,
      tag,
      id: target.id || "",
      text: (target.textContent || "").trim().slice(0, 120),
      href: target.tagName === "A" ? target.getAttribute("href") || "" : "",
      target: target.tagName === "A" ? target.getAttribute("target") || "" : ""
    };
    const value =
      target.dataset?.metricValue || (name === "share_click" ? meta.channel || "" : "");

    sendEvent(apiBase, {
      ...basePayload,
      type,
      name,
      value,
      data
    });
  });
}

function initContentLinkTracking(apiBase, basePayload) {
  if (!doc || typeof window === "undefined") {
    return;
  }

  const linkEventState = { href: "", time: 0 };

  const shouldSendLinkEvent = (href) => {
    const now = Date.now();
    if (linkEventState.href === href && now - linkEventState.time < 500) {
      return false;
    }
    linkEventState.href = href;
    linkEventState.time = now;
    return true;
  };

  const handleLinkEvent = (event, trigger) => {
    const link = event.target?.closest?.("a[href]");
    if (!link) {
      return;
    }

    if (link.dataset?.metric != null) {
      return;
    }

    const container = link.closest(
      ".post-body, .page, .collection-content, .external-content, article"
    );
    if (!container) {
      return;
    }

    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    let linkUrl;
    try {
      linkUrl = new URL(href, window.location.href);
    } catch {
      return;
    }

    const isExternal = linkUrl.origin !== window.location.origin;
    if (!isExternal) {
      return;
    }

    if (!shouldSendLinkEvent(linkUrl.href)) {
      return;
    }

    const type = "custom";
    const name = "external_link_click";
    const value = "";

    const sent = sendEvent(
      apiBase,
      {
        ...basePayload,
        url: linkUrl.href,
        referrer: basePayload.url,
        type,
        name,
        value,
        data: {
          source: "content",
          href: linkUrl.href,
          url: linkUrl.href,
          host: linkUrl.host,
          path: linkUrl.pathname,
          target: link.getAttribute("target") || "",
          text: (link.textContent || "").trim().slice(0, 120),
          trigger
        }
      },
      { useBeacon: true, skipHeaders: true }
    );
    if (typeof console !== "undefined") {
      console.log("[telemetry] external link click", { href: linkUrl.href, sent, trigger });
    }
  };

  doc.querySelectorAll(
    ".post-body a[href], .page a[href], .collection-content a[href], .external-content a[href], article a[href]"
  ).forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }
    let linkUrl;
    try {
      linkUrl = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (linkUrl.origin !== window.location.origin && !link.getAttribute("target")) {
      link.setAttribute("target", "_blank");
      const rel = (link.getAttribute("rel") || "").split(" ").filter(Boolean);
      if (!rel.includes("noopener")) rel.push("noopener");
      if (!rel.includes("noreferrer")) rel.push("noreferrer");
      link.setAttribute("rel", rel.join(" "));
    }
  });

  doc.addEventListener("click", (event) => handleLinkEvent(event, "click"), { capture: true });
  doc.addEventListener("auxclick", (event) => handleLinkEvent(event, "auxclick"), {
    capture: true
  });
  doc.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      handleLinkEvent(event, "keydown");
    },
    { capture: true }
  );
}

function initScrollTracking(apiBase, basePayload) {
  if (typeof window === "undefined" || !doc) {
    return;
  }

  const thresholds = [20, 40, 60, 80, 100];
  const fired = new Set();
  let ticking = false;
  let maxPercent = 0;

  const onScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      const scrollTop = window.scrollY || doc.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight || 0
      );
      const viewportHeight = window.innerHeight || 1;
      const total = Math.max(1, docHeight - viewportHeight);
      const percent = Math.min(100, Math.round((scrollTop / total) * 100));
      maxPercent = Math.max(maxPercent, percent);

      thresholds.forEach((threshold) => {
        if (percent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          sendEvent(apiBase, {
            ...basePayload,
            type: "scroll",
            name: "scroll_depth",
            value: String(threshold),
            data: { scroll_percent: threshold, max_scroll_percent: maxPercent }
          });
        }
      });
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => maxPercent;
}

function initVitalsTracking(apiBase, basePayload) {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
    return;
  }

  const report = (name, value, data) => {
    if (!name) {
      return;
    }
    const normalizedValue =
      typeof value === "number"
        ? name === "CLS"
          ? value.toFixed(3)
          : String(Math.round(value))
        : String(value || "");
    const normalizedName = String(name).toLowerCase();
    sendEvent(apiBase, {
      ...basePayload,
      type: "vital",
      name: normalizedName,
      value: normalizedValue,
      data
    });
  };

  const fcpObserver = new PerformanceObserver((list) => {
    const entry = list.getEntries().find((item) => item.name === "first-contentful-paint");
    if (entry) {
      report("FCP", entry.startTime, { entryType: entry.entryType });
      fcpObserver.disconnect();
    }
  });
  fcpObserver.observe({ type: "paint", buffered: true });

  let lcpEntry = null;
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    if (entries.length) {
      lcpEntry = entries[entries.length - 1];
    }
  });
  lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

  const finalize = () => {
    if (lcpEntry) {
      report("LCP", lcpEntry.startTime, { entryType: lcpEntry.entryType });
    }
    lcpObserver.disconnect();
  };

  window.addEventListener("pagehide", finalize, { once: true });
  doc.addEventListener(
    "visibilitychange",
    () => {
      if (doc.visibilityState === "hidden") {
        finalize();
      }
    },
    { once: true }
  );
}

function initTelemetry() {
  if (!resolveEnabledFlag()) {
    return telemetryApi;
  }

  const apiBase = resolveApiBase();
  if (!apiBase) {
    return telemetryApi;
  }

  const basePayload = buildBasePayload();
  telemetryState.apiBase = apiBase;
  telemetryState.basePayload = basePayload;
  telemetryState.enabled = true;
  const content = getContentInfo();
  const device = getDeviceInfo();

  sendEvent(
    apiBase,
    {
      ...basePayload,
      data: { device, content }
    },
    { endpoint: "view" }
  );

  const getMaxScroll = initScrollTracking(apiBase, basePayload) || (() => 0);
  initVitalsTracking(apiBase, basePayload);
  initMetricTracking(apiBase, basePayload);
  initContentLinkTracking(apiBase, basePayload);

  let leaveSent = false;
  const sendLeave = () => {
    if (leaveSent) {
      return;
    }
    leaveSent = true;
    if (typeof console !== "undefined") {
      console.log("[telemetry] leave event");
    }
    sendEvent(
      apiBase,
      {
        ...basePayload,
        type: "leave",
        name: "page_leave",
        value: "",
        data: { max_scroll_percent: getMaxScroll() }
      },
      { useBeacon: true, skipHeaders: true }
    );
  };

  if (doc) {
    doc.addEventListener("visibilitychange", () => {
      if (doc.visibilityState === "hidden") {
        sendLeave();
      }
    });
  }
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", sendLeave);
    window.addEventListener("beforeunload", sendLeave);
  }

  return telemetryApi;
}

const telemetryApi = {
  init: initTelemetry,
  trackCustom: (name, data = {}, value = "") => {
    if (!telemetryState.enabled || !telemetryState.apiBase || !telemetryState.basePayload) {
      return false;
    }
    if (!name) {
      return false;
    }
    sendEvent(telemetryState.apiBase, {
      ...telemetryState.basePayload,
      type: "custom",
      name,
      value: String(value || ""),
      data
    });
    return true;
  }
};

export default telemetryApi;
