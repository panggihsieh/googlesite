/* 大南老邦教學網 — Google Sites 嵌入首頁渲染
 * 先顯示 GitHub 內建靜態資料，再透過 js/backend.js 與後台連結：
 *   1. 讀取 GAS 公開資料 API（JSONP，避免 GitHub Pages → Apps Script 的跨網域 CORS 問題）。
 *   2. 以後台回傳的 serverTime 校正前端時鐘，面板日期一律使用後台時間。
 */
(function () {
  "use strict";

  var DATA = window.DANA_EMBED_DATA || {};
  var site = DATA.site || {};

  /* 內建網站資料的快照：後台「後台設定」（公開 API 的 settings）會覆寫 site 欄位 */
  var STATIC_SITE = Object.assign({}, site);

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

  /** 面板日期：一律以「後台時間」為準（js/backend.js 與後台同步），
   *  連不到後台時才退回資料檔的日期，避免學生電腦時間設錯時看到錯的日期。 */
  function todayMetaLabel() {
    var backend = window.DANA_BACKEND;
    if (backend && backend.synced()) return backend.dateLabel();
    return (DATA.today && DATA.today.dateLabel) || "";
  }

  function renderToday() {
    var today = DATA.today || {};
    var meta = document.getElementById("today-meta");
    var host = document.getElementById("course-list");

    if (meta) meta.textContent = todayMetaLabel();
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

  /**
   * 後台設定（公開 API 的 settings）：網站名稱與 Hero 文案。
   * 只覆寫有填寫的欄位，空白欄位沿用 data/ 的內建內容。
   */
  function applySiteSettings(settings) {
    var map = {
      site_name: "name",
      school: "school",
      school_en: "schoolEn",
      grade: "grade",
      tagline: "tagline",
      description: "description",
      hero_title: "heroTitle",
      hero_lead: "heroLead"
    };

    var changed = false;

    Object.keys(map).forEach(function (key) {
      var value = String(settings[key] == null ? "" : settings[key]).trim();
      if (!value) return;
      site[map[key]] = value;
      changed = true;
    });

    var keywordText = String(settings.keywords == null ? "" : settings.keywords).trim();
    if (keywordText) {
      var keywords = keywordText
        .split(/[、,，;；]/)
        .map(function (item) {
          return item.trim();
        })
        .filter(function (item) {
          return item !== "";
        });
      if (keywords.length) {
        site.keywords = keywords;
        changed = true;
      }
    }

    if (!changed) return false;

    DATA.site = site;

    var oldName = String(STATIC_SITE.name || "");
    if (oldName && site.name && oldName !== site.name && document.title.indexOf(oldName) >= 0) {
      document.title = document.title.split(oldName).join(site.name);
    }

    renderHero();
    return true;
  }

  function applyRemoteData(remote) {
    if (!remote || remote.ok !== true) return false;

    if (remote.today) DATA.today = remote.today;
    if (Array.isArray(remote.news)) DATA.news = remote.news;
    if (Array.isArray(remote.quickLinks)) DATA.quickLinks = remote.quickLinks;
    if (remote.settings && typeof remote.settings === "object") applySiteSettings(remote.settings);

    renderDynamicSections();
    document.documentElement.setAttribute("data-live-data", "true");
    return true;
  }

  /**
   * 與後台連結：改用共用模組 js/backend.js（JSONP 讀取 GAS 公開資料 API，
   * 並以後台時間校正前端時鐘）。模組未載入時維持 GitHub 靜態備援資料。
   */
  function loadRemoteData() {
    var backend = window.DANA_BACKEND;
    if (!backend) {
      console.warn("找不到 js/backend.js，無法與後台連結，使用 GitHub 靜態備援資料。");
      return;
    }

    /* 時間同步完成後，面板日期改用後台時間重繪 */
    backend.onSync(function () {
      renderToday();
      document.documentElement.setAttribute("data-live-time", "true");
    });

    backend.load({
      onData: function (payload) {
        if (!applyRemoteData(payload)) {
          console.warn("GAS 公開資料 API 格式不正確，使用靜態備援資料。");
        }
      },
      onError: function (error) {
        console.warn(
          "無法連線 GAS 公開資料 API，使用靜態備援資料：" +
            (error && error.message ? error.message : error)
        );
      }
    });
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
