// Pure decision logic for the main-process STT upload proxy. The dictation
// overlay keeps webSecurity on, so a renderer fetch to a custom/self-hosted STT
// server is blocked by CORS whenever that server omits Access-Control-Allow-*
// headers (including on 401/4xx). The main process uploads instead; this module
// holds the Electron-free checks and shaping so they can be unit tested.

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

// Only the credential headers the renderer legitimately sets for an STT upload.
const ALLOWED_REQUEST_HEADERS = new Set(["authorization", "api-key"]);

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

function isAllowedSttTarget(rawUrl) {
  if (typeof rawUrl !== "string") return false;
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.username || url.password) return false;
  if (url.protocol === "https:") return true;
  return url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname);
}

function pickRequestHeaders(headers) {
  const picked = {};
  if (!headers || typeof headers !== "object") return picked;
  for (const [name, value] of Object.entries(headers)) {
    if (ALLOWED_REQUEST_HEADERS.has(name.toLowerCase()) && typeof value === "string") {
      picked[name] = value;
    }
  }
  return picked;
}

function pickFormFields(fields) {
  if (!Array.isArray(fields)) return [];
  return fields.filter(
    (entry) =>
      Array.isArray(entry) &&
      entry.length === 2 &&
      typeof entry[0] === "string" &&
      typeof entry[1] === "string"
  );
}

// Plain, structured-clone-safe shape the renderer rebuilds a Response from, so
// providerHttpErrors still sees the real status, body and headers.
function shapeProxyResponse({ status, statusText, headers, body }) {
  return {
    status,
    statusText: statusText || "",
    headers: headers || {},
    body: NULL_BODY_STATUSES.has(status) ? null : (body ?? ""),
  };
}

module.exports = {
  isAllowedSttTarget,
  pickRequestHeaders,
  pickFormFields,
  shapeProxyResponse,
};
