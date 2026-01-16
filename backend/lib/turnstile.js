async function verifyTurnstile(body, req, env) {
  const secret = String(env.TURNSTILE_SECRET || "").trim();
  if (!secret) {
    return true;
  }

  const origin = req.headers.get("Origin") || "";
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    return true;
  }

  const token = String(body?.turnstileToken || body?.["cf-turnstile-response"] || "").trim();
  if (!token) {
    return false;
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  const ip = req.headers.get("CF-Connecting-IP");
  if (ip) {
    form.set("remoteip", ip);
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });

  if (!res.ok) {
    return false;
  }

  const payload = await res.json();
  return Boolean(payload?.success);
}

export { verifyTurnstile };
