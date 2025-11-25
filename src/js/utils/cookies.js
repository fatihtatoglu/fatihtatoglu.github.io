const ONE_YEAR = 60 * 60 * 24 * 365;
const SESSION_MAX_AGE = 60 * 60 * 2;
const SESSION_COOKIE = "tat-session";

function setCookie(name, value, { maxAge = ONE_YEAR } = {}) {
  if (typeof document === "undefined") return;
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (typeof location !== "undefined" && location.protocol === "https:") {
    cookie += "; Secure";
  }
  document.cookie = cookie;
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

function ensureSessionCookie() {
  if (readCookie(SESSION_COOKIE)) {
    return;
  }

  const sessionSeed =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  setCookie(SESSION_COOKIE, sessionSeed, { maxAge: SESSION_MAX_AGE });
}

const cookieApi = {
  init: ensureSessionCookie,
  read: readCookie,
  write: setCookie
};

export default cookieApi;