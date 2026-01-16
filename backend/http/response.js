function jsonResponse(payload, status, req) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(req)
    }
  });
}

function corsHeaders(req) {
  const origin = req?.headers?.get("Origin") || "";
  const allowed = resolveAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, tat-lang, tat-theme",
    "Access-Control-Allow-Credentials": "true"
  };
}

function resolveAllowedOrigin(origin) {
  const allowed = new Set([
    "http://localhost:3000",
    "https://tatoglu.net",
    "https://www.tatoglu.net"
  ]);

  if (allowed.has(origin)) {
    return origin;
  }

  return "https://tatoglu.net";
}

export { corsHeaders, jsonResponse };
