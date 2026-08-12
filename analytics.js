(() => {
  const ENDPOINT = "https://zhouhao-portfolio-d1drb10353ce76.service.tcloudbase.com/api/portfolio-visit";
  const SESSION_KEY = "zhouhao_portfolio_session";
  const HEARTBEAT_MS = 15000;
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  function randomId() {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
  }

  function readSession() {
    const now = Date.now();
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (saved?.id && now - Number(saved.lastSeenAt || 0) < SESSION_TIMEOUT_MS) return saved;
    } catch (_error) {
      // A fresh in-memory session is enough when storage is unavailable.
    }
    return { id: randomId(), startedAt: now, activeMs: 0, lastSeenAt: now, recipientTag: "" };
  }

  const session = readSession();
  const recipientFromUrl = new URLSearchParams(location.search).get("rid") || "";
  if (/^[a-zA-Z0-9_-]{3,64}$/.test(recipientFromUrl)) session.recipientTag = recipientFromUrl;

  const state = {
    lastActiveAt: document.visibilityState === "visible" ? performance.now() : null,
    maxScrollDepth: 0,
    timer: null,
  };

  function saveSession() {
    session.lastSeenAt = Date.now();
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (_error) {
      // Analytics stays best-effort when browser storage is blocked.
    }
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    return {
      category: /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop",
      browser: /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Other",
      os: /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Other",
      language: navigator.language || "",
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
  }

  function campaign() {
    const params = new URLSearchParams(location.search);
    return {
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      name: params.get("utm_campaign") || "",
    };
  }

  function updateActiveTime() {
    if (state.lastActiveAt === null) return;
    const now = performance.now();
    session.activeMs += Math.max(0, Math.min(now - state.lastActiveAt, HEARTBEAT_MS * 1.5));
    state.lastActiveAt = now;
    saveSession();
  }

  function updateScrollDepth() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const depth = Math.round(Math.min(1, Math.max(0, window.scrollY / scrollable)) * 100);
    state.maxScrollDepth = Math.max(state.maxScrollDepth, depth);
  }

  function payload(type) {
    updateActiveTime();
    updateScrollDepth();
    return {
      type,
      sessionId: session.id,
      path: location.pathname,
      title: document.title,
      referrer: document.referrer,
      recipientTag: session.recipientTag,
      campaign: campaign(),
      device: detectDevice(),
      activeMs: Math.round(session.activeMs),
      elapsedMs: Date.now() - session.startedAt,
      scrollDepth: state.maxScrollDepth,
      eventAt: Date.now(),
    };
  }

  function send(type, preferBeacon = false) {
    const body = JSON.stringify(payload(type));
    if (preferBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain;charset=UTF-8" }));
      return;
    }
    fetch(ENDPOINT, {
      method: "POST",
      body,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      keepalive: true,
      mode: "cors",
      credentials: "omit",
    }).catch(() => {});
  }

  function start() {
    saveSession();
    updateScrollDepth();
    send("pageview");
    state.timer = window.setInterval(() => {
      if (document.visibilityState === "visible") send("heartbeat");
    }, HEARTBEAT_MS);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      updateActiveTime();
      state.lastActiveAt = null;
      send("heartbeat", true);
    } else {
      state.lastActiveAt = performance.now();
    }
  });
  window.addEventListener("scroll", updateScrollDepth, { passive: true });
  window.addEventListener("pagehide", () => send("leave", true));

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
