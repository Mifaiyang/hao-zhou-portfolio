(() => {
  const ENDPOINT = "https://zhouhao-portfolio-d1drb10353ce76.service.tcloudbase.com/api/portfolio-visit";
  const CONSENT_KEY = "zhouhao_portfolio_analytics_consent";
  const VISITOR_KEY = "zhouhao_portfolio_visitor_id";
  const CONSENT_VERSION = "2026-08-12";
  const HEARTBEAT_MS = 15000;
  const state = {
    activeMs: 0,
    lastActiveAt: document.visibilityState === "visible" ? performance.now() : null,
    sessionId: randomId(),
    startedAt: Date.now(),
    started: false,
    timer: null,
  };

  function randomId() {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
  }

  function getConsent() {
    try {
      return JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    } catch (_error) {
      return null;
    }
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, version: CONSENT_VERSION, at: Date.now() }));
  }

  function getVisitorId() {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = randomId();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    return visitorId;
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    const category = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
    const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Other";
    const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Other";
    return {
      category,
      browser,
      os,
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
    state.activeMs += Math.max(0, Math.min(now - state.lastActiveAt, HEARTBEAT_MS * 1.5));
    state.lastActiveAt = now;
  }

  function payload(type) {
    updateActiveTime();
    return {
      type,
      sessionId: state.sessionId,
      visitorId: getVisitorId(),
      path: location.pathname,
      title: document.title,
      referrer: document.referrer,
      campaign: campaign(),
      device: detectDevice(),
      activeMs: Math.round(state.activeMs),
      elapsedMs: Date.now() - state.startedAt,
    };
  }

  function send(type, preferBeacon = false) {
    if (!state.started) return;
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
    if (state.started) return;
    state.started = true;
    state.lastActiveAt = document.visibilityState === "visible" ? performance.now() : null;
    send("pageview");
    state.timer = window.setInterval(() => {
      if (document.visibilityState === "visible") send("heartbeat");
    }, HEARTBEAT_MS);
  }

  function stopAndForget() {
    if (state.started) send("leave", true);
    state.started = false;
    if (state.timer) window.clearInterval(state.timer);
    state.timer = null;
    localStorage.removeItem(VISITOR_KEY);
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .analytics-consent,.analytics-privacy{font-family:inherit;color:#f4f1e8}
      .analytics-consent{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:10020;width:min(430px,calc(100vw - 40px));padding:18px 18px 16px;background:rgba(11,16,32,.96);border:1px solid rgba(255,255,255,.16);border-radius:18px;box-shadow:0 18px 52px rgba(0,0,0,.34);backdrop-filter:blur(18px)}
      .analytics-consent[hidden],.analytics-privacy[hidden]{display:none}
      .analytics-consent__label{margin:0 0 7px;color:#aab3c5;font-size:11px;letter-spacing:.14em;text-transform:uppercase}
      .analytics-consent h2{margin:0 0 8px;font-size:18px;line-height:1.25}
      .analytics-consent p,.analytics-privacy p{margin:0;color:#cbd1de;font-size:13px;line-height:1.65}
      .analytics-consent__actions{display:flex;justify-content:flex-end;gap:9px;margin-top:15px}
      .analytics-button{appearance:none;border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:9px 14px;background:transparent;color:#f4f1e8;font:inherit;font-size:12px;cursor:pointer}
      .analytics-button--primary{background:#f4f1e8;color:#11172d;border-color:#f4f1e8}
      .analytics-button:hover{border-color:rgba(255,255,255,.48)}
      .analytics-button:focus-visible,.analytics-privacy-link:focus-visible{outline:2px solid #f4f1e8;outline-offset:3px}
      .analytics-privacy-link{position:fixed;left:max(16px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:10010;border:0;background:rgba(11,16,32,.72);color:#aab3c5;border-radius:999px;padding:7px 10px;font:inherit;font-size:11px;cursor:pointer;backdrop-filter:blur(10px)}
      .analytics-privacy{position:fixed;inset:0;z-index:10030;display:grid;place-items:center;padding:24px;background:rgba(5,8,17,.78)}
      .analytics-privacy__panel{width:min(560px,100%);max-height:min(680px,calc(100vh - 48px));overflow:auto;padding:24px;background:#0b1020;border:1px solid rgba(255,255,255,.16);border-radius:20px}
      .analytics-privacy h2{margin:0 0 14px;font-size:22px}
      .analytics-privacy ul{margin:14px 0 18px;padding-left:20px;color:#cbd1de;font-size:13px;line-height:1.7}
      .analytics-privacy__actions{display:flex;justify-content:flex-end;gap:9px}
      @media(max-width:700px){.analytics-consent{right:12px;bottom:calc(76px + env(safe-area-inset-bottom));width:calc(100vw - 24px)}.analytics-privacy-link{bottom:calc(68px + env(safe-area-inset-bottom))}.analytics-privacy{padding:14px}.analytics-privacy__panel{padding:20px}.analytics-consent__actions,.analytics-privacy__actions{align-items:stretch;flex-direction:column-reverse}.analytics-button{width:100%}}
      @media(prefers-reduced-motion:reduce){.analytics-consent,.analytics-privacy{scroll-behavior:auto}}
    `;
    document.head.appendChild(style);
  }

  function buildUi() {
    injectStyles();
    const consent = document.createElement("aside");
    consent.className = "analytics-consent";
    consent.hidden = true;
    consent.setAttribute("aria-labelledby", "analytics-consent-title");
    consent.innerHTML = `<p class="analytics-consent__label">访问统计</p><h2 id="analytics-consent-title">是否允许匿名记录这次浏览？</h2><p>用于了解作品集的访问地区、页面与有效停留时间。IP 仅保存脱敏形式和不可逆标识，90 天后删除。</p><div class="analytics-consent__actions"><button class="analytics-button" type="button" data-analytics-deny>仅必要访问</button><button class="analytics-button analytics-button--primary" type="button" data-analytics-accept>同意匿名统计</button></div>`;

    const privacyLink = document.createElement("button");
    privacyLink.className = "analytics-privacy-link";
    privacyLink.type = "button";
    privacyLink.textContent = "访问统计与隐私";

    const privacy = document.createElement("div");
    privacy.className = "analytics-privacy";
    privacy.hidden = true;
    privacy.setAttribute("role", "dialog");
    privacy.setAttribute("aria-modal", "true");
    privacy.setAttribute("aria-labelledby", "analytics-privacy-title");
    privacy.innerHTML = `<section class="analytics-privacy__panel"><h2 id="analytics-privacy-title">访问统计与隐私</h2><p>同意后，本站会将以下匿名统计存储在腾讯云中国大陆环境中：</p><ul><li>访问时间、页面、来源域名和有效浏览时长</li><li>浏览器、设备类型、语言和视口尺寸</li><li>由 IP 推算的国家/地区、城市，以及脱敏 IP 与不可逆标识</li></ul><p>用途仅限改进个人作品集，保存 90 天，不用于广告或跨网站追踪。你可以随时撤回；撤回后本站停止后续统计并删除浏览器内的匿名访客标识。如需删除已经保存的记录，可邮件联系 1245124165@qq.com。</p><div class="analytics-privacy__actions"><button class="analytics-button" type="button" data-analytics-close>关闭</button><button class="analytics-button" type="button" data-analytics-withdraw>撤回并停止统计</button></div></section>`;

    document.body.append(consent, privacyLink, privacy);
    const consentState = getConsent();
    if (consentState?.value === "granted" && consentState.version === CONSENT_VERSION) start();
    else if (consentState?.value !== "denied" || consentState.version !== CONSENT_VERSION) consent.hidden = false;

    consent.querySelector("[data-analytics-accept]").addEventListener("click", () => {
      setConsent("granted");
      consent.hidden = true;
      start();
    });
    consent.querySelector("[data-analytics-deny]").addEventListener("click", () => {
      setConsent("denied");
      consent.hidden = true;
      stopAndForget();
    });
    privacyLink.addEventListener("click", () => {
      privacy.hidden = false;
      privacy.querySelector("[data-analytics-close]").focus();
    });
    privacy.querySelector("[data-analytics-close]").addEventListener("click", () => {
      privacy.hidden = true;
      privacyLink.focus();
    });
    privacy.querySelector("[data-analytics-withdraw]").addEventListener("click", () => {
      setConsent("denied");
      stopAndForget();
      privacy.hidden = true;
      privacyLink.focus();
    });
    privacy.addEventListener("click", (event) => {
      if (event.target === privacy) privacy.querySelector("[data-analytics-close]").click();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !privacy.hidden) privacy.querySelector("[data-analytics-close]").click();
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (!state.started) return;
    if (document.visibilityState === "hidden") {
      updateActiveTime();
      state.lastActiveAt = null;
      send("heartbeat", true);
    } else {
      state.lastActiveAt = performance.now();
    }
  });
  window.addEventListener("pagehide", () => send("leave", true));

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildUi);
  else buildUi();
})();
