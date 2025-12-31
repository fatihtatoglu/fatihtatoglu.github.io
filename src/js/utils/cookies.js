const ONE_YEAR = 60 * 60 * 24 * 365;
const TWENTY_YEARS = ONE_YEAR * 20;
const SESSION_MAX_AGE = 60 * 60 * 2;
const SESSION_COOKIE = "tat-session";
const USER_COOKIE = "tat-user";

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

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function ensureSessionCookie() {
  if (readCookie(SESSION_COOKIE)) {
    return false;
  }

  setCookie(SESSION_COOKIE, createId(), { maxAge: SESSION_MAX_AGE });
  return true;
}

function ensureUserCookie() {
  if (readCookie(USER_COOKIE)) {
    return false;
  }

  setCookie(USER_COOKIE, createId(), { maxAge: TWENTY_YEARS });
  return true;
}

function getSessionId() {
  return readCookie(SESSION_COOKIE);
}

function getUserId() {
  return readCookie(USER_COOKIE);
}

const cookieApi = {
  init: () => {
    const userCreated = ensureUserCookie();
    const sessionCreated = ensureSessionCookie();
    return { userCreated, sessionCreated };
  },
  read: readCookie,
  write: setCookie,
  getSessionId,
  getUserId
};

export default cookieApi;
