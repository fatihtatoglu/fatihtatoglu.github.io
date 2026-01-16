function normalizeIdentity(body) {
  return {
    tatSession: String(body?.tatSession || "").trim(),
    tatUser: String(body?.tatUser || "").trim()
  };
}

export { normalizeIdentity };
