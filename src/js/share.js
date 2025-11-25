const doc = typeof document !== "undefined" ? document : null;

const shareState = {
  initialized: false,
  metadata: null,
  buttons: [],
};

function getShareMetadata() {
  if (!doc) {
    return { url: "", title: "", description: "", lang: "tr" };
  }

  const canonicalLink = doc.querySelector('link[rel="canonical"]');
  const metaTitle = doc.querySelector('meta[property="og:title"]');
  const metaDescription = doc.querySelector('meta[property="og:description"]');
  const htmlLang = doc.documentElement?.getAttribute("lang")?.trim().toLowerCase();
  const langCandidate = htmlLang && htmlLang.length ? htmlLang.split("-")[0] : "";
  const normalizedLang = langCandidate === "en" ? "en" : "tr";
  const url = canonicalLink?.href?.trim() || window.location.href;
  const title = metaTitle?.getAttribute("content")?.trim() || doc.title || url;
  const description = metaDescription?.getAttribute("content")?.trim()
    || doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim()
    || "";

  return { url, title, description, lang: normalizedLang };
}

function appendTrackingParams(rawUrl, params = {}) {
  try {
    const trackedUrl = new URL(rawUrl, typeof window !== "undefined" ? window.location.origin : undefined);

    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== "") {
        trackedUrl.searchParams.set(key, value);
      }
    });

    return trackedUrl.toString();
  } catch (error) {
    console.warn("Unable to apply tracking params", error);
    return rawUrl;
  }
}

function buildShareUrl(target, meta) {
  const sourceMap = {
    x: "twitter",
    twitter: "twitter",
    facebook: "facebook",
    linkedin: "linkedin",
    whatsapp: "whatsapp",
  };

  const shareSource = sourceMap[target] ?? target;
  const trackedUrl = appendTrackingParams(meta.url, {
    utm_source: shareSource,
    utm_medium: "social",
    utm_lang: meta.lang,
  });

  const encodedUrl = encodeURIComponent(trackedUrl);
  const encodedTitle = encodeURIComponent(meta.title);
  switch (target) {
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "whatsapp": {
      const whatsappText = encodeURIComponent(`${meta.title} ${trackedUrl}`.trim());
      return `https://wa.me/?text=${whatsappText}`;
    }
    default:
      if (typeof navigator !== "undefined" && navigator.share) {
        navigator.share({ title: meta.title, text: meta.description, url: meta.url }).catch(() => { });
      }

      return null;
  }
}

function openSharePopup(url) {
  if (!url || typeof window === "undefined") {
    return;
  }

  const width = 640;
  const height = 480;
  const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0;
  const dualScreenTop = window.screenTop ?? window.screenY ?? 0;
  const screenWidth = window.innerWidth ?? doc?.documentElement?.clientWidth ?? window.screen.width;
  const screenHeight = window.innerHeight ?? doc?.documentElement?.clientHeight ?? window.screen.height;
  const left = dualScreenLeft + Math.max(0, (screenWidth - width) / 2);
  const top = dualScreenTop + Math.max(0, (screenHeight - height) / 2);

  window.open(
    url,
    "share-dialog",
    `scrollbars=yes,width=${width},height=${height},top=${Math.round(top)},left=${Math.round(left)}`,
  );
}

async function copyShareLink(text) {
  if (!text || !doc) {
    return false;
  }

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("Clipboard API failed, falling back to execCommand", error);
    }
  }

  const textarea = doc.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  doc.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let success = false;

  try {
    success = document.execCommand ? document.execCommand("copy") : false;
  } catch (error) {
    console.error("execCommand copy failed", error);
  } finally {
    doc.body.removeChild(textarea);
  }

  return success;
}

function setCopyFeedback(button, state) {
  if (!button) {
    return;
  }

  button.dataset.shareState = state;

  setTimeout(() => {
    if (button.dataset.shareState === state) {
      delete button.dataset.shareState;
    }
  }, 2000);
}

function normalizeMetadata(meta) {
  if (meta && typeof meta === "object") {
    const fallback = getShareMetadata();

    return {
      url: meta.url ?? fallback.url,
      title: meta.title ?? fallback.title,
      description: meta.description ?? fallback.description,
      lang: meta.lang ?? fallback.lang,
    };
  }

  return getShareMetadata();
}

function initShare(options = {}) {
  if (!doc || shareState.initialized) {
    return shareApi;
  }

  const metadata = normalizeMetadata(options.metadata);
  const buttons = Array.from(doc.querySelectorAll("[data-share]"));
  shareState.metadata = metadata;
  shareState.buttons = buttons;
  shareState.initialized = true;

  if (!buttons.length) {
    return shareApi;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const target = button.dataset.share;
      if (!target) return;
      const meta = shareState.metadata ?? metadata;
      if (target === "copy") {
        const trackedCopyUrl = appendTrackingParams(meta.url, {
          utm_source: "copy",
          utm_medium: "web_site",
          utm_lang: meta.lang,
        });
        const copied = await copyShareLink(trackedCopyUrl);
        setCopyFeedback(button, copied ? "copied" : "error");
        return;
      }

      const shareUrl = buildShareUrl(target, meta);
      if (shareUrl) {
        openSharePopup(shareUrl);
      }
    });
  });

  return shareApi;
}

const shareApi = {
  init: initShare,
  appendTrackingParams,
  buildShareUrl,
  copyLink: copyShareLink,
};

export default shareApi;
