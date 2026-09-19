/* 大南老邦教學網 — Google Sites 嵌入首頁渲染
 * 先顯示 GitHub 內建靜態資料，再嘗試從 GAS 公開 API 取得最新資料。
 * GAS 採 JSONP，避免 GitHub Pages → Apps Script 的跨網域 CORS 問題。
 */
(function () {
  "use strict";

  var DATA = window.DANA_EMBED_DATA || {};
  var site = DATA.site || {};

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** 資料來源若寫 index.html，一律改用資料夾網址，避免網址列出現 index.html */
  function siteHref(path) {
    var value = String(path == null ? "" : path);
    var cut = value.indexOf("#");
    var hash = cut >= 0 ? value.slice(cut) : "";
    var core = cut >= 0 ? value.slice(0, cut) : value;
    if (core === "index.html" || core === "./index.html") return "./" + hash;
    return value;
  }

  function renderHero() {
    var title = document.getElementById("hero-title");
    var lead = document.getElementById("hero-lead");
    var keywords = document.getElementById("hero-keywords");

    if (title) title.textContent = site.heroTitle || site.name || "";
    if (lead) lead.textContent = site.heroLead || "";
    if (keywords) {
      keywords.innerHTML = (site.keywords || [])
        .map(function (item) {
          return "<span>" + esc(item) + "</span>";
        })
        .join("");
    }
  }

  function renderSubjects() {
    var host = document.getElementById("subject-grid");
    if (!host) return;

    host.innerHTML = (DATA.subjects || [])
      .map(function (s) {
        return (
          '<a class="subject-card" href="' + esc(siteHref(s.href)) + '" style="--card:' + esc(s.color) + '">' +
          '<span class="subject-icon" aria-hidden="true">' + esc(s.icon) + "</span>" +
          "<h2>" + esc(s.title) + "</h2>" +
          '<p class="subject-desc">' + esc(s.desc) + "</p>" +
          '<p class="subject-extra">' + esc(s.extra) + "</p>" +
          "</a>"
        );
      })
      .join("");
  }

  function renderToday() {
    var today = DATA.today || {};
    var meta = document.getElementById("today-meta");
    var host = document.getElementById("course-list");

    if (meta) meta.textContent = today.dateLabel || "";
    if (!host) return;

    host.innerHTML = (today.courses || [])
      .map(function (c) {
        return (
          "<li>" +
          '<span class="course-period">' + esc(c.period) + "</span>" +
          '<span class="course-body">' +
          '<span class="course-subject">' + esc(c.subject) + "</span>" +
          '<a class="course-title" href="' + esc(siteHref(c.href)) + '">' + esc(c.title) + "</a>" +
          "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function renderNews() {
    var host = document.getElementById("news-list");
    if (!host) return;

    host.innerHTML = (DATA.news || [])
      .slice(0, 5)
      .map(function (n) {
        return (
          "<li>" +
          '<span class="news-date">' + esc(n.date) + "</span>" +
          '<span class="news-body">' +
          '<a class="news-title" href="' + esc(siteHref(n.href)) + '">' + esc(n.title) + "</a>" +
          '<span class="tag">' + esc(n.tag) + "</span>" +
          "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function renderQuickLinks() {
    var host = document.getElementById("quick-list");
    if (!host) return;

    host.innerHTML = (DATA.quickLinks || [])
      .map(function (q) {
        var badge = q.requiresLogin
          ? '<span class="login-badge">需登入</span>'
          : '<span class="public-badge">公開資源</span>';

        return (
          "<li>" +
          '<a class="quick-link" href="' + esc(q.url) + '" target="_blank" rel="noopener">' +
          '<span class="quick-icon" aria-hidden="true">' + esc(q.icon) + "</span>" +
          '<span class="quick-copy">' +
          '<span class="quick-name">' + esc(q.name) + "</span>" +
          badge +
          "</span>" +
          "</a>" +
          "</li>"
        );
      })
      .join("");
  }

  function renderDynamicSections() {
    renderToday();
    renderNews();
    renderQuickLinks();
  }

  function applyRemoteData(remote) {
    if (!remote || remote.ok !== true) return false;

    if (remote.today) DATA.today = remote.today;
    if (Array.isArray(remote.news)) DATA.news = remote.news;
    if (Array.isArray(remote.quickLinks)) DATA.quickLinks = remote.quickLinks;

    renderDynamicSections();
    document.documentElement.setAttribute("data-live-data", "true");
    return true;
  }

  function loadRemoteData() {
    var apiUrl = String(site.publicApiUrl || "").trim();
    if (!apiUrl) return;

    var callbackName = "__danaApiCallback_" + Date.now();
    var script = document.createElement("script");
    var separator = apiUrl.indexOf("?") >= 0 ? "&" : "?";
    var timeoutMs = Number(site.apiTimeoutMs || 8000);
    var done = false;

    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      try { delete window[callbackName]; }
      catch (_) { window[callbackName] = undefined; }
    }

    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      cleanup();
      console.warn("GAS 公開資料 API 逾時，使用 GitHub 靜態備援資料。");
    }, timeoutMs);

    window[callbackName] = function (payload) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cleanup();
      if (!applyRemoteData(payload)) {
        console.warn("GAS 公開資料 API 格式不正確，使用靜態備援資料。");
      }
    };

    script.onerror = function () {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cleanup();
      console.warn("無法連線 GAS 公開資料 API，使用靜態備援資料。");
    };

    script.src = apiUrl + separator +
      "api=public&callback=" + encodeURIComponent(callbackName) +
      "&_=" + Date.now();

    document.head.appendChild(script);
  }

  function init() {
    renderHero();
    renderSubjects();
    renderDynamicSections();
    loadRemoteData();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
