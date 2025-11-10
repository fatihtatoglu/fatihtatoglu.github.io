const ONE_YEAR = 60 * 60 * 24 * 365;

export function setCookie(name, value, { maxAge = ONE_YEAR } = {}) {
  if (typeof document === "undefined") return;
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (typeof location !== "undefined" && location.protocol === "https:") {
    cookie += "; Secure";
  }
  document.cookie = cookie;
}

export function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}
