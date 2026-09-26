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

  var videosLimit = parseVideosLimit(
    (window.DANA_SITE_CONFIG && window.DANA_SITE_CONFIG.videosLimit) || 3,
    3
  );

  function parseVideosLimit(value, fallback) {
    var n = parseInt(String(value == null ? "" : value).trim(), 10);
    if (!isFinite(n)) return fallback;
    if (n < 1) return 1;
    if (n > 6) return 6;
    return n;
  }

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

  /** 面板日期：連上後台時用後台時間；連不到時改用裝置時間在後台時區（Asia/Taipei）的今天，
   *  避免看到開發假日期，並維持後台時區不受裝置時區影響。 */
  function todayMetaLabel() {
    var backend = window.DANA_BACKEND;
    if (backend && backend.synced()) return backend.dateLabel();
    var config = window.DANA_SITE_CONFIG || {};
    var offsetMinutes = Number(config.timezoneOffsetMinutes) || 480;
    var shifted = new Date(Date.now() + offsetMinutes * 60000);
    var year = shifted.getUTCFullYear();
    var month = shifted.getUTCMonth() + 1;
    var day = shifted.getUTCDate();
    var weekday = ["日", "一", "二", "三", "四", "五", "六"][shifted.getUTCDay()];
    return year + " 年 " + month + " 月 " + day + " 日（" + weekday + "）";
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

  function youtubeId(url) {
    var match = String(url || "")
      .trim()
      .match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/
      );
    return match ? match[1] : "";
  }

  function videoDateLabel(date) {
    var text = String(date || "").trim();
    var match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return match[2] + "/" + match[3];
    return text;
  }

  function renderVideos() {
    var host = document.getElementById("video-list");
    if (!host) return;

    var videos = (DATA.videos || [])
      .map(function (v) {
        var id = v.youtubeId || youtubeId(v.url);
        return id ? Object.assign({}, v, { youtubeId: id }) : null;
      })
      .filter(Boolean)
      .slice()
      .sort(function (a, b) {
        var dateA = String(a.date || "");
        var dateB = String(b.date || "");
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return Number(a.sort_order || 0) - Number(b.sort_order || 0);
      })
      .slice(0, videosLimit);

    host.innerHTML = videos.length
      ? videos
          .map(function (v) {
            var embed =
              "https://www.youtube-nocookie.com/embed/" +
              encodeURIComponent(v.youtubeId) +
              "?rel=0";
            return (
              "<li>" +
              '<div class="video-meta">' +
              '<span class="video-date">' + esc(videoDateLabel(v.date)) + "</span>" +
              '<a class="video-title" href="' + esc(v.url || embed) + '" target="_blank" rel="noopener">' +
              esc(v.title || "YouTube 影片") +
              "</a>" +
              "</div>" +
              '<div class="video-frame">' +
              '<iframe src="' + esc(embed) + '" title="' + esc(v.title || "YouTube 影片") +
              '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
              "</div>" +
              "</li>"
            );
          })
          .join("")
      : '<li class="video-empty">目前尚無影片</li>';
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
    renderVideos();
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

    var limitText = String(settings.videos_limit == null ? "" : settings.videos_limit).trim();
    if (limitText) {
      videosLimit = parseVideosLimit(limitText, videosLimit);
      changed = true;
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
    if (Array.isArray(remote.videos) && remote.videos.length) DATA.videos = remote.videos;
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
