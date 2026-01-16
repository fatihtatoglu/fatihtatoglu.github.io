async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode({ alg: "RS256", typ: "JWT" });
  const payload = base64UrlEncode({
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  });

  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBuffer(env.GOOGLE_PRIVATE_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data)
  );

  const jwt = `${data}.${base64UrlEncode(sig)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  const payloadJson = await res.json();
  return payloadJson.access_token;
}

async function appendRows(env, token, rows, tabName) {
  const range = `${tabName}!A1`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: rows })
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`appendRows failed (${res.status}): ${text}`);
  }
}

async function readRows(env, token, range) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const payload = await res.json();
  return payload.values || [];
}

function pemToBuffer(pem) {
  const normalized = pem.replace(/\\n/g, "\n").replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "");
  return Uint8Array.from(atob(normalized.replace(/\n/g, "")), c => c.charCodeAt(0));
}

function base64UrlEncode(data) {
  const bytes =
    data instanceof ArrayBuffer
      ? new Uint8Array(data)
      : data instanceof Uint8Array
      ? data
      : new TextEncoder().encode(JSON.stringify(data));

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export { appendRows, getAccessToken, readRows };
