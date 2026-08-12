const crypto = require("crypto");
const cloudbase = require("@cloudbase/node-sdk");
const geoip = require("geoip-lite");

const ENV_ID = process.env.TCB_ENV || "zhouhao-portfolio-d1drb10353ce76";
const HASH_SALT = process.env.ANALYTICS_HASH_SALT;
const COLLECTION = "portfolio_visits";
const ALLOWED_ORIGINS = new Set([
  "https://zhouhao-portfolio-d1drb10353ce76-1457168889.tcloudbaseapp.com",
  "https://hao-zhou-portfolio-zhouhao-portfolio-d1drb10353ce76.webapps.tcloudbase.com",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);
const EVENT_TYPES = new Set(["pageview", "heartbeat", "leave"]);
const MAX_ACTIVE_MS = 6 * 60 * 60 * 1000;
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

const app = cloudbase.init({ env: ENV_ID });
const db = app.database();
const command = db.command;

function response(statusCode, data, origin = "") {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : ALLOWED_ORIGINS.values().next().value;
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": allowedOrigin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "600",
      vary: "Origin",
      "cache-control": "no-store",
    },
    body: JSON.stringify(data),
  };
}

function parseBody(event) {
  if (!event.body) return {};
  if (typeof event.body === "object") return event.body;
  if (typeof event.body !== "string" || event.body.length > 8192) return null;
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  try {
    return JSON.parse(rawBody);
  } catch (_error) {
    return null;
  }
}

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [String(key).toLowerCase(), String(value || "")]),
  );
}

function extractIp(event, headers) {
  const forwarded = headers["x-forwarded-for"]?.split(",")[0]?.trim();
  const candidate =
    event.requestContext?.sourceIp ||
    event.requestContext?.identity?.sourceIp ||
    headers["x-scf-remote-addr"] ||
    headers["x-real-ip"] ||
    forwarded ||
    "";
  return candidate.replace(/^::ffff:/, "").slice(0, 64);
}

function maskIp(ip) {
  if (!ip) return "unknown";
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return `${parts.slice(0, 3).join(":")}::`;
  }
  const parts = ip.split(".");
  if (parts.length !== 4) return "unknown";
  return `${parts[0]}.*.*.${parts[3]}`;
}

function hmac(value) {
  if (!HASH_SALT || !value) return "";
  return crypto.createHmac("sha256", HASH_SALT).update(String(value)).digest("hex");
}

function cleanText(value, maxLength, pattern = /[^\p{L}\p{N} ._:/?&=+-]/gu) {
  return String(value || "").replace(pattern, "").slice(0, maxLength);
}

function cleanPath(value) {
  const path = cleanText(value, 180);
  return path.startsWith("/") ? path.split(/[?#]/)[0] : "/";
}

function cleanReferrer(value) {
  if (!value) return "direct";
  try {
    return new URL(value).hostname.slice(0, 120) || "direct";
  } catch (_error) {
    return "direct";
  }
}

function coarseGeo(ip) {
  const result = ip ? geoip.lookup(ip) : null;
  if (!result) return { country: "未知", region: "未知", city: "未知" };
  return {
    country: cleanText(result.country, 32),
    region: cleanText(result.region, 64),
    city: cleanText(result.city, 64),
  };
}

function coarseDevice(body) {
  return {
    category: cleanText(body.device?.category, 20),
    browser: cleanText(body.device?.browser, 30),
    os: cleanText(body.device?.os, 30),
    language: cleanText(body.device?.language, 16),
    viewport: cleanText(body.device?.viewport, 20, /[^0-9x]/g),
  };
}

function validToken(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{16,96}$/.test(value);
}

async function removeExpiredSample() {
  if (Math.random() > 0.02) return;
  await db.collection(COLLECTION).where({ expiresAt: command.lt(new Date()) }).remove();
}

exports.main = async (event = {}) => {
  const headers = normalizeHeaders(event.headers);
  const origin = headers.origin || "";
  const method = String(event.httpMethod || event.requestContext?.httpMethod || "POST").toUpperCase();

  if (method === "OPTIONS") return response(204, {}, origin);
  if (method !== "POST") return response(405, { ok: false, error: "method_not_allowed" }, origin);
  if (!ALLOWED_ORIGINS.has(origin)) return response(403, { ok: false, error: "origin_not_allowed" }, origin);
  if (!HASH_SALT) return response(503, { ok: false, error: "service_not_ready" }, origin);

  const body = parseBody(event);
  if (!body || !EVENT_TYPES.has(body.type) || !validToken(body.sessionId) || !validToken(body.visitorId)) {
    return response(400, { ok: false, error: "invalid_payload" }, origin);
  }

  const userAgent = headers["user-agent"] || "";
  if (/bot|crawler|spider|headless|lighthouse/i.test(userAgent)) {
    return response(202, { ok: true, ignored: "automated_client" }, origin);
  }

  const now = new Date();
  const ip = extractIp(event, headers);
  const sessionKey = hmac(body.sessionId);
  const visitorHash = hmac(body.visitorId);
  const activeMs = Math.max(0, Math.min(Number(body.activeMs) || 0, MAX_ACTIVE_MS));
  const elapsedMs = Math.max(activeMs, Math.min(Number(body.elapsedMs) || 0, MAX_ACTIVE_MS));
  const path = cleanPath(body.path);
  const update = {
    type: body.type,
    path,
    pageTitle: cleanText(body.title, 120),
    activeMs,
    elapsedMs,
    lastSeenAt: now,
    endedAt: body.type === "leave" ? now : null,
  };

  const visits = db.collection(COLLECTION);
  const existing = await visits.where({ sessionKey }).limit(1).get();

  if (!existing.data.length) {
    const geo = coarseGeo(ip);
    await visits.add({
      sessionKey,
      visitorHash,
      startedAt: now,
      expiresAt: new Date(now.getTime() + RETENTION_MS),
      firstPath: path,
      referrerHost: cleanReferrer(body.referrer),
      campaign: {
        source: cleanText(body.campaign?.source, 48),
        medium: cleanText(body.campaign?.medium, 48),
        name: cleanText(body.campaign?.name, 64),
      },
      geo,
      ipMasked: maskIp(ip),
      ipHash: hmac(ip),
      device: coarseDevice(body),
      pageViews: 1,
      paths: [path],
      ...update,
    });
  } else {
    const current = existing.data[0];
    const previousPaths = Array.isArray(current.paths) ? current.paths : [];
    const isNewPath = !previousPaths.includes(path);
    await visits.doc(current._id).update({
      ...update,
      pageViews: isNewPath ? command.inc(1) : current.pageViews || 1,
      paths: isNewPath ? [...previousPaths, path].slice(-20) : previousPaths,
    });
  }

  await removeExpiredSample();
  return response(200, { ok: true }, origin);
};
