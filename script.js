/* =============================================================================
 * 大南老邦教學網 — 前端互動
 * -----------------------------------------------------------------------------
 * 本檔案負責把 data/site-data.js 的內容渲染到頁面上。
 * 一般修改內容不需要動這裡，改資料檔即可。
 *
 * 區塊：
 *   1. 共用工具            4. 首頁區塊
 *   2. 頁首 / 頁尾          5. 內頁區塊
 *   3. 導覽互動
 * ========================================================================== */

(function () {
  "use strict";

  /* --- 1. 共用工具 ----------------------------------------------------- */

  var DATA = window.SITE_DATA || {};
  var SITE = DATA.site || {};

  /* 內建網站基本資料的快照：後台「後台設定」（公開 API 的 settings）會覆寫 SITE 的欄位，
   * 這裡保留原值，用來替換 <title>／og 標籤裡的舊名稱（未設定時完全不受影響）。 */
  var STATIC_SITE = Object.assign({}, SITE);

  /* 內建導覽列的快照：後台「後台連結管理」的項目會與它合併（同名覆寫、新的附加在後），
   * 因此連線後新增連結不會讓原本的選單消失。 */
  var STATIC_NAV = (DATA.nav || []).slice();

  /* 後台連線模組（js/backend.js，需先載入 data/site-config.js）。
   * DANA_SITE_CONFIG 提供公開資料 API 網址與逾時；
   * DANA_BACKEND 負責「與後台連結」與「時間以後台時間為準」。
   * 未載入時（例如舊快取）網站仍會用 GitHub 靜態資料正常顯示。 */
  var BACKEND = window.DANA_BACKEND || null;

  // 目前頁面代號（由 <body data-page="..."> 決定）
  var PAGE = document.body.getAttribute("data-page") || "index";

  // 相對路徑前綴：內頁在 /pages/ 底下，需要往上一層
  var BASE =
    document.body.getAttribute("data-base") ||
    (/\/pages\//.test(window.location.pathname) ? ".." : ".");

  /** 首頁檔名 index.html 改用資料夾網址（首頁 ./、內頁 ../），避免網址出現 index.html */
  function pageHref(path) {
    var hash = "";
    var core = path;
    var i = core.indexOf("#");
    if (i >= 0) {
      hash = core.slice(i);
      core = core.slice(0, i);
    }
    if (core !== "index.html" && core !== "./index.html") return "";
    return (BASE === "." ? "./" : "../") + hash;
  }

  /** 把資料檔裡的相對路徑轉成目前頁面可用的路徑 */
  function link(path) {
    if (!path) return "#";
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(path)) return path;
    var home = pageHref(path);
    if (home) return home;
    if (BASE === ".") return path.replace(/^\.\//, "");
    return BASE + "/" + path.replace(/^\.\//, "");
  }

  /** 首頁時把 index.html#xxx 縮短成 #xxx */
  function navLink(path) {
    if (BASE === "." && path.indexOf("index.html#") === 0) {
      return path.slice("index.html".length);
    }
    return link(path);
  }

  /** 避免資料內容破壞 HTML 結構 */
  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function el(id) {
    return document.getElementById(id);
  }

  function render(id, html) {
    var host = el(id);
    if (host) host.innerHTML = html;
  }

  /* --- 2. 頁首 / 頁尾 --------------------------------------------------- */

  function renderHeader() {
    var host = el("site-header");
    if (!host) return;

    var navIcons = {
      "首頁": "🏠",
      "國語": "📖",
      "數學": "🧮",
      "環境教育": "🌿",
      "AI 科技": "🤖",
      "AI科技": "🤖",
      "學習任務": "📋",
      "學生作品": "⭐",
      "教師專區": "👥",
      "關於大南": "ⓘ"
    };

    var items = (DATA.nav || [])
      .map(function (item) {
        var active = item.match === PAGE;
        var icon = item.icon || navIcons[item.label] || "•";
        return (
          '<li><a href="' +
          esc(navLink(item.href)) +
          '"' +
          (active ? ' class="is-active" aria-current="page"' : "") +
          ">" +
          '<span class="nav-icon" aria-hidden="true">' +
          esc(icon) +
          "</span>" +
          '<span class="nav-label">' +
          esc(item.label) +
          "</span></a></li>"
        );
      })
      .join("");

    var leafLogo =
      '<svg class="brand-leaf" viewBox="0 0 52 66" aria-hidden="true" focusable="false">' +
      '<path d="M29 2C15 9 6 24 7 39c1 12 8 21 18 25 7-9 11-20 10-32C34 21 32 11 29 2Z" fill="#73c33e"/>' +
      '<path d="M29 3c10 10 17 23 16 35-1 11-7 20-18 26 2-13 2-27 2-41V3Z" fill="#58ad2f"/>' +
      '<path d="M28 11c0 16-1 32-4 48" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".95"/>' +
      '<path d="M27 25 16 35M27 38l10-10M26 48l-8 7" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>' +
      "</svg>";

    host.innerHTML =
      '<header class="site-header">' +
      '<div class="header-inner">' +
      '<a class="brand" href="' +
      esc(link("index.html")) +
      '">' +
      '<span class="brand-mark">' +
      leafLogo +
      "</span>" +
      '<span class="brand-text">' +
      "<strong>" +
      esc(SITE.name || "") +
      "</strong>" +
      "<small>" +
      esc(SITE.tagline || "學習 × 探究 × 創造更好的自己") +
      "</small>" +
      "</span>" +
      "</a>" +
      '<nav class="site-nav" id="site-nav" aria-label="主選單"><ul>' +
      items +
      "</ul></nav>" +
      '<div class="header-actions">' +
      '<button class="header-search-toggle" type="button" aria-expanded="false" aria-controls="header-search-panel" aria-label="搜尋網站">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.4"></circle><path d="m16 16 4 4"></path></svg>' +
      "</button>" +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="開啟導覽選單">' +
      "<span></span><span></span><span></span>" +
      "</button>" +
      "</div>" +
      '<div class="header-search-panel" id="header-search-panel" hidden>' +
      '<form class="header-search-form" role="search">' +
      '<label class="sr-only" for="header-search-input">搜尋網站</label>' +
      '<input id="header-search-input" type="search" placeholder="搜尋國語、數學、AI…" autocomplete="off">' +
      '<button type="submit">搜尋</button>' +
      "</form>" +
      '<p class="header-search-status" aria-live="polite"></p>' +
      "</div>" +
      "</div>" +
      "</header>";
  }

  /** 頁尾年份：已與後台同步時用後台時間的年，否則用裝置時間（僅過渡狀態） */
  function footerYear() {
    if (BACKEND && BACKEND.synced()) return BACKEND.year();
    return new Date().getFullYear();
  }

  /** 頁尾「最後更新」：連上後台後改顯示後台產生的時間（代表這份資料是後台時間） */
  function footerUpdated() {
    if (BACKEND && BACKEND.synced() && BACKEND.generatedAt()) {
      return { text: BACKEND.generatedAt() + "（後台時間）", source: "backend" };
    }
    return { text: SITE.updated || "", source: "static" };
  }

  /** 頁尾的後台連結欄（依分組輸出 <div> 區塊；沒有後台連結時回傳空字串，頁尾維持原本三欄） */
  function footerLinkColumns() {
    var items = DATA.footerLinks || [];
    if (!items.length) return "";

    var groups = {};
    var order = [];

    items.forEach(function (item) {
      var group = item.group || "相關連結";
      if (!groups[group]) {
        groups[group] = [];
        order.push(group);
      }
      groups[group].push(item);
    });

    return order
      .map(function (group) {
        var list = groups[group]
          .map(function (item) {
            var external = /^https?:/.test(item.href || "");
            return (
              "<li><a href=\"" +
              esc(external ? item.href : link(item.href)) +
              '"' +
              (external ? ' target="_blank" rel="noopener"' : "") +
              ">" +
              esc(item.label) +
              "</a></li>"
            );
          })
          .join("");
        return "<div><h3>" + esc(group) + "</h3><ul>" + list + "</ul></div>";
      })
      .join("");
  }

  function renderFooter() {
    var host = el("site-footer");
    if (!host) return;

    var updated = footerUpdated();

    var subjects = (DATA.subjects || [])
      .map(function (s) {
        return (
          '<li><a href="' + esc(link(s.href)) + '">' + esc(s.title) + "</a></li>"
        );
      })
      .join("");

    var links = (DATA.quickLinks || [])
      .slice(0, 5)
      .map(function (q) {
        return (
          '<li><a href="' +
          esc(link(q.url)) +
          '" target="_blank" rel="noopener">' +
          esc(q.name) +
          "</a></li>"
        );
      })
      .join("");

    /* 後台「後台連結管理」建立的頁尾連結：依「分組」分欄，預設為「相關連結」 */
    var footerLinks = footerLinkColumns();

    host.innerHTML =
      '<footer class="site-footer">' +
      '<div class="container footer-grid' +
      (footerLinks ? " has-extra" : "") +
      '">' +
      '<div class="footer-about">' +
      '<p class="footer-brand"><span aria-hidden="true">🌳</span> ' +
      esc(SITE.name || "") +
      "</p>" +
      "<p>" +
      esc(SITE.school || "") +
      "・" +
      esc(SITE.grade || "") +
      "｜" +
      esc(SITE.description || "") +
      "</p>" +
      "<p style=\"margin-top:8px\">" +
      esc((DATA.footer && DATA.footer.note) || "") +
      "</p>" +
      "</div>" +
      "<div><h3>六大主題</h3><ul>" +
      subjects +
      "</ul></div>" +
      "<div><h3>快速連結</h3><ul>" +
      links +
      "</ul></div>" +
      footerLinks +
      "</div>" +
      '<div class="container footer-bottom">' +
      "<p>© " +
      footerYear() +
      " " +
      esc(SITE.school || "") +
      " ・ " +
      esc(SITE.name || "") +
      "</p>" +
      '<p>最後更新：<span id="footer-updated" data-source="' +
      esc(updated.source) +
      '">' +
      esc(updated.text) +
      "</span></p>" +
      "</div>" +
      "</footer>";
  }

  /* --- 3. 導覽互動 ----------------------------------------------------- */

  /* 搜尋面板目前的元素（renderHeader() 重新渲染後會更新，供 closeSearch() 使用） */
  var searchEls = { toggle: null, panel: null, input: null, status: null, form: null };

  function closeSearch() {
    if (!searchEls.panel || !searchEls.toggle) return;
    searchEls.panel.hidden = true;
    searchEls.toggle.setAttribute("aria-expanded", "false");
  }

  /* 文件層級的監聽只註冊一次（renderHeader() 重繪不會重複綁定） */
  function setupHeaderSearchGlobal() {
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSearch();
    });

    document.addEventListener("click", function (event) {
      if (!searchEls.panel || searchEls.panel.hidden) return;
      if (searchEls.panel.contains(event.target) || searchEls.toggle.contains(event.target)) return;
      closeSearch();
    });
  }

  function setupNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = el("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "開啟導覽選單" : "關閉導覽選單");
      nav.classList.toggle("is-open", !open);
    });

    // 點選單項目後自動收起
    nav.addEventListener("click", function (event) {
      if (event.target.tagName !== "A") return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "開啟導覽選單");
    });
  }

  function setupHeaderSearch() {
    searchEls.toggle = document.querySelector(".header-search-toggle");
    searchEls.panel = el("header-search-panel");
    searchEls.input = el("header-search-input");
    searchEls.status = document.querySelector(".header-search-status");
    searchEls.form = document.querySelector(".header-search-form");

    var toggle = searchEls.toggle;
    var panel = searchEls.panel;
    var input = searchEls.input;
    var status = searchEls.status;
    var form = searchEls.form;
    if (!toggle || !panel || !input || !form) return;

    toggle.addEventListener("click", function () {
      var willOpen = panel.hidden;
      panel.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) {
        window.setTimeout(function () {
          input.focus();
        }, 0);
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      if (!query) return;

      var navMatch = (DATA.nav || []).find(function (item) {
        return String(item.label || "").toLowerCase().indexOf(query.toLowerCase()) !== -1;
      });
      if (navMatch) {
        window.location.href = navLink(navMatch.href);
        return;
      }

      var subjectMatch = (DATA.subjects || []).find(function (item) {
        var haystack = [item.title, item.desc, item.extra].join(" ").toLowerCase();
        return haystack.indexOf(query.toLowerCase()) !== -1;
      });
      if (subjectMatch) {
        window.location.href = link(subjectMatch.href);
        return;
      }

      var found = typeof window.find === "function" ? window.find(query) : false;
      if (status) {
        status.textContent = found ? "已找到本頁相關文字。" : "本頁找不到「" + query + "」。";
      }
    });
  }

  /* --- 4. 首頁區塊 ----------------------------------------------------- */

  /* 面板標題圖示（依設計圖 layout.png：三個面板標題左側都有藍色線條圖示） */
  var PANEL_ICONS = {
    today:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/>' +
      '<path d="M3.5 10h17M8.5 3.5V7M15.5 3.5V7"/>' +
      '<path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01M16 17h.01"/>' +
      "</svg>",
    news:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M4 10.2a1.7 1.7 0 0 1 1.7-1.7H7l8.6-4.2a1 1 0 0 1 1.4.9v13.6a1 1 0 0 1-1.4.9L7 15.5H5.7A1.7 1.7 0 0 1 4 13.8z"/>' +
      '<path d="M7 15.5 8.4 20h2.4l-1.2-4.5"/>' +
      "</svg>",
    quick:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M9.6 14.4 14.4 9.6"/>' +
      '<path d="M11 7.2l1.3-1.3a4.2 4.2 0 0 1 5.9 5.9l-1.3 1.3"/>' +
      '<path d="M13 16.8l-1.3 1.3a4.2 4.2 0 0 1-5.9-5.9l1.3-1.3"/>' +
      "</svg>"
  };

  /** 面板標題列：藍色圖示＋標題＋右側補充內容 */
  function panelHead(icon, title, extra) {
    return (
      '<div class="panel-head">' +
      '<span class="panel-icon" aria-hidden="true">' +
      (PANEL_ICONS[icon] || "") +
      "</span>" +
      "<h3>" +
      esc(title) +
      "</h3>" +
      (extra || "") +
      "</div>"
    );
  }

  /** 依科目名稱找出對應主題色，供「今日學習」的科目徽章使用 */
  function courseSubjectStyle(name) {
    var key = String(name == null ? "" : name).replace(/\s+/g, "");
    var hit = (DATA.subjects || []).filter(function (s) {
      var t = String(s.title).replace(/\s+/g, "");
      return t === key || t.indexOf(key) === 0 || key.indexOf(t) === 0;
    })[0];
    if (!hit) return "";
    return (
      ' style="--course:' +
      esc(hit.color) +
      (hit.ink ? ";--course-ink:" + esc(hit.ink) : "") +
      (hit.tint ? ";--course-tint:" + esc(hit.tint) : "") +
      '"'
    );
  }

  function renderSubjects() {
    var html = (DATA.subjects || [])
      .map(function (s) {
        return (
          '<a class="subject-card" href="' +
          esc(link(s.href)) +
          '" style="--card:' +
          esc(s.color) +
          (s.tint ? ";--tint:" + esc(s.tint) : "") +
          (s.ink ? ";--ink-on-tint:" + esc(s.ink) : "") +
          '">' +
          '<span class="subject-icon" aria-hidden="true">' +
          esc(s.icon) +
          "</span>" +
          "<h3>" +
          esc(s.title) +
          "</h3>" +
          '<p class="subject-desc">' +
          esc(s.desc) +
          "</p>" +
          '<p class="subject-extra">' +
          esc(s.extra) +
          "</p>" +
          "</a>"
        );
      })
      .join("");
    render("subject-grid", html);
  }

  /** 面板日期：連上後台時用後台時間；連不到時改用裝置時間在後台時區（Asia/Taipei）的今天，
   *  避免看到 data/site-data.js 之類的開發假日期（例如 2025-08-30）、
   *  又能在離線時仍顯示「今天的正確日期」（後台時區固定 UTC+8，不受裝置時區影響）。 */
  function todayMetaLabel() {
    if (BACKEND && BACKEND.synced()) return BACKEND.dateLabel();
    var config = (typeof window !== "undefined" && window.DANA_SITE_CONFIG) || {};
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
    var courses = (today.courses || [])
      .map(function (c) {
        return (
          "<li" +
          courseSubjectStyle(c.subject) +
          ">" +
          '<span class="course-subject">' +
          esc(c.subject) +
          "</span>" +
          '<a class="course-title" href="' +
          esc(link(c.href)) +
          '">' +
          esc(c.title) +
          "</a>" +
          "</li>"
        );
      })
      .join("");

    var cta =
      today.cta && today.cta.label
        ? '<a class="panel-cta" href="' +
          esc(link(today.cta.href)) +
          '">' +
          esc(today.cta.label) +
          "</a>"
        : "";

    if (!el("today-panel")) return;

    var meta = todayMetaLabel();

    render(
      "today-panel",
      panelHead(
        "today",
        "今日學習",
        meta ? '<span class="panel-meta">' + esc(meta) + "</span>" : ""
      ) +
        '<div class="course-block">' +
        '<p class="course-block-title">本週課程</p>' +
        '<ul class="course-list">' +
        courses +
        "</ul>" +
        "</div>" +
        cta
    );
  }

  function renderNews() {
    var VISIBLE = 5;
    var news = DATA.news || [];

    var list = news
      .map(function (n, i) {
        return (
          "<li" +
          (i >= VISIBLE ? ' class="is-hidden"' : "") +
          ">" +
          '<span class="news-date">' +
          esc(n.date) +
          "</span>" +
          '<span class="news-body">' +
          '<a href="' +
          esc(link(n.href)) +
          '">' +
          esc(n.title) +
          "</a>" +
          "</span>" +
          "</li>"
        );
      })
      .join("");

    var more =
      news.length > VISIBLE
        ? '<button class="section-link" type="button" id="news-more">更多 <span aria-hidden="true">›</span></button>'
        : "";

    if (!el("news-panel")) return;

    render(
      "news-panel",
      panelHead("news", "最新消息", more) +
        '<ul class="news-list">' +
        list +
        "</ul>"
    );

    var btn = el("news-more");
    if (btn) {
      btn.addEventListener("click", function () {
        document
          .querySelectorAll("#news-panel .is-hidden")
          .forEach(function (li) {
            li.classList.remove("is-hidden");
          });
        btn.remove();
      });
    }
  }

  function renderQuickLinks() {
    var list = (DATA.quickLinks || [])
      .map(function (q) {
        var external = /^https?:/.test(q.url);
        return (
          "<li>" +
          '<a href="' +
          esc(link(q.url)) +
          '"' +
          (external ? ' target="_blank" rel="noopener"' : "") +
          ">" +
          '<span class="quick-icon" aria-hidden="true">' +
          esc(q.icon) +
          "</span>" +
          '<span class="quick-text">' +
          '<span class="quick-name">' +
          esc(q.name) +
          "</span>" +
          (q.note
            ? '<span class="quick-note">' + esc(q.note) + "</span>"
            : "") +
          "</span>" +
          "</a>" +
          "</li>"
        );
      })
      .join("");

    render(
      "quick-panel",
      panelHead("quick", "快速連結") +
        '<ul class="quick-list">' +
        list +
        "</ul>"
    );
  }

  /* --- 4b. 後台連線（資料與時間同步） ---------------------------------- */

  /**
   * 與後台連結：
   *   1. 先顯示 GitHub 靜態資料（data/site-data.js），打開頁面就有內容。
   *   2. 再讀後台公開資料 API，成功時以 Google Sheet 最新資料覆寫。
   *   3. 同時以後台回傳的 serverTime 校正前端時鐘，日期與時間都以後台為準。
   * 連不到後台時只印警告，畫面維持靜態備援資料。
   */
  function connectBackend() {
    if (!BACKEND) {
      if (window.console && window.console.warn) {
        window.console.warn("找不到 js/backend.js，無法與後台連結，將只顯示 GitHub 靜態資料。");
      }
      return;
    }

    /* 時間同步完成（或再次同步）後，用後台時間重繪日期與頁尾 */
    BACKEND.onSync(function () {
      renderToday();
      renderFooter();
      document.documentElement.setAttribute("data-live-time", "true");
    });

    BACKEND.load({
      onData: applyLiveData,
      onError: function (error) {
        if (window.console && window.console.warn) {
          window.console.warn(
            "無法與後台連結，使用 GitHub 靜態備援資料：" +
              (error && error.message ? error.message : error)
          );
        }
      }
    });
  }

  /** 後台資料覆寫靜態資料（保留只有靜態檔才有的欄位：課程 CTA、快速連結副標） */
  function applyLiveData(remote) {
    if (!remote || remote.ok !== true) return;

    var staticQuickLinks = DATA.quickLinks || [];

    /* 後台設定：網站基本資料與文案（會重繪頁首／頁尾與瀏覽器標題） */
    if (remote.settings && typeof remote.settings === "object") {
      applySiteSettings(remote.settings);
    }

    /* today 用合併，讓 data/site-data.js 的 cta 等欄位不被後台覆蓋掉 */
    if (remote.today) DATA.today = Object.assign({}, DATA.today || {}, remote.today);
    if (Array.isArray(remote.news) && remote.news.length) DATA.news = remote.news;
    if (Array.isArray(remote.quickLinks) && remote.quickLinks.length) {
      DATA.quickLinks = remote.quickLinks.map(function (item) {
        var base =
          staticQuickLinks.filter(function (q) {
            return String(q.name) === String(item.name);
          })[0] || {};
        return Object.assign({}, base, item);
      });
    }

    renderToday();
    renderNews();
    renderQuickLinks();

    /* 後台連結管理：導覽列與頁尾連結（會一併重繪 header／footer） */
    if (Array.isArray(remote.siteLinks)) {
      applySiteLinks(remote.siteLinks);
    } else {
      renderFooter();
    }

    document.documentElement.setAttribute("data-live-data", "true");
  }

  /**
   * 「後台連結管理」資料（公開 API 的 siteLinks）：
   *   area=nav    → 覆寫前台導覽列（label／href／icon，match 由 href 推導）
   *   area=footer → 前台頁尾的後台連結欄（依 group 分組）
   * 後台沒有資料時維持 data/site-data.js 的靜態選單。
   */
  function applySiteLinks(links) {
    var navItems = [];
    var footerItems = [];

    (links || []).forEach(function (item) {
      if (!item || !item.label) return;
      if (item.area === "footer") footerItems.push(item);
      else navItems.push(item);
    });

    if (navItems.length) {
      DATA.nav = mergeNavItems(navItems);
      /* 導覽列換成後台內容後，重新綁定選單與搜尋（文件層級監聽只在 init 綁一次） */
      renderHeader();
      setupNavToggle();
      setupHeaderSearch();
    }

    DATA.footerLinks = footerItems;
    renderFooter();
  }

  /** 後台導覽列項目與內建選單合併：名稱相同時覆寫，新名稱附加在後面 */
  function mergeNavItems(navItems) {
    var merged = STATIC_NAV.map(function (item) {
      return item;
    });

    navItems.forEach(function (item) {
      var index = -1;
      for (var i = 0; i < merged.length; i++) {
        if (String(merged[i].label) === String(item.label)) {
          index = i;
          break;
        }
      }

      var entry = {
        label: item.label,
        href: item.href || "index.html",
        icon: item.icon || "",
        match: matchFromHref(item.href)
      };

      if (index >= 0) merged[index] = Object.assign({}, merged[index], entry);
      else merged.push(entry);
    });

    return merged;
  }

  /** 由連結推導導覽列的 match 值（pages/math.html → math、index.html → index、index.html#teacher → teacher） */
  function matchFromHref(href) {
    var value = String(href || "").trim();
    var hashIndex = value.indexOf("#");
    if (hashIndex >= 0) return value.slice(hashIndex + 1) || "index";

    var base = value.replace(/^\.?\//, "").split("/").pop().replace(/\.html$/, "");
    return base === "index" || base === "" ? "index" : base;
  }

  /**
   * 「後台設定」資料（公開 API 的 settings）：網站名稱、學校、標語、頁尾說明與 Hero 文案。
   * 只覆寫有填寫的欄位，空白欄位一律沿用 data/site-data.js 的內建內容。
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
      SITE[map[key]] = value;
      changed = true;
    });

    /* 學習關鍵字：後台用「、」或逗號分隔，前景用陣列 */
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
        SITE.keywords = keywords;
        changed = true;
      }
    }

    if (!changed) return false;

    DATA.site = SITE; // 讓其他讀 DATA.site 的地方也拿到後台設定
    applySiteTitle();
    renderHeader();
    setupNavToggle();
    setupHeaderSearch();
    renderFooter();
    return true;
  }

  /** 瀏覽器標題與 og 標籤：把內建網站名稱／標語換成後台設定的內容（找不到就維持原樣） */
  function applySiteTitle() {
    var oldName = String(STATIC_SITE.name || "");
    var newName = String(SITE.name || "");
    var oldTagline = String(STATIC_SITE.tagline || "");
    var newTagline = String(SITE.tagline || "");

    if (oldName && newName && oldName !== newName) {
      if (document.title && document.title.indexOf(oldName) >= 0) {
        document.title = document.title.split(oldName).join(newName);
      }
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        var ogTitleText = String(ogTitle.getAttribute("content") || "");
        if (ogTitleText.indexOf(oldName) >= 0) {
          ogTitle.setAttribute("content", ogTitleText.split(oldName).join(newName));
        }
      }
    }

    if (oldTagline && newTagline && oldTagline !== newTagline) {
      var ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        var ogText = String(ogDescription.getAttribute("content") || "");
        if (ogText.indexOf(oldTagline) >= 0) {
          ogDescription.setAttribute("content", ogText.split(oldTagline).join(newTagline));
        }
      }
    }
  }

  /* --- 5. 內頁區塊 ----------------------------------------------------- */

  function pageData() {
    return (DATA.pages || {})[PAGE] || {};
  }

  function renderFeatures() {
    if (!el("feature-grid")) return;
    var html = (pageData().features || [])
      .map(function (f) {
        return (
          '<article class="feature-card">' +
          '<span class="feature-icon" aria-hidden="true">' +
          esc(f.icon) +
          "</span>" +
          "<h3>" +
          esc(f.title) +
          "</h3>" +
          "<p>" +
          esc(f.desc) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
    render("feature-grid", html);
  }

  function renderResources() {
    if (!el("resource-list")) return;
    var html = (pageData().resources || [])
      .map(function (r) {
        var external = /^https?:/.test(r.url);
        return (
          '<li class="resource-item">' +
          '<a href="' +
          esc(link(r.url)) +
          '"' +
          (external ? ' target="_blank" rel="noopener"' : "") +
          ">" +
          "<span>" +
          '<span class="resource-name">' +
          esc(r.name) +
          "</span>" +
          '<span class="resource-desc">' +
          esc(r.desc) +
          "</span>" +
          "</span>" +
          '<span class="resource-arrow" aria-hidden="true">→</span>' +
          "</a>" +
          "</li>"
        );
      })
      .join("");
    render("resource-list", html);
  }

  function renderTasks() {
    if (!el("task-list")) return;
    var html = (pageData().tasks || [])
      .map(function (t, i) {
        return (
          "<li>" +
          '<span class="task-num" aria-hidden="true">' +
          (i + 1) +
          "</span>" +
          "<span>" +
          esc(t) +
          "</span>" +
          "</li>"
        );
      })
      .join("");
    render("task-list", html);
  }

  function renderGallery() {
    if (!el("gallery-grid")) return;
    var gallery = pageData().gallery;
    if (!gallery || !gallery.length) {
      var section = el("gallery-grid").closest("section");
      if (section) section.style.display = "none";
      return;
    }
    var html = gallery
      .map(function (w) {
        return (
          '<article class="gallery-card">' +
          '<div class="gallery-thumb" aria-hidden="true">🖼️</div>' +
          '<div class="gallery-body">' +
          "<h3>" +
          esc(w.title) +
          "</h3>" +
          '<p class="gallery-author">' +
          esc(w.author) +
          "</p>" +
          '<p class="gallery-desc">' +
          esc(w.desc) +
          "</p>" +
          '<span class="tag">' +
          esc(w.tag) +
          "</span>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
    render("gallery-grid", html);
  }

  function renderOtherSubjects() {
    if (!el("other-subjects")) return;
    var html = (DATA.subjects || [])
      .filter(function (s) {
        return s.id !== PAGE;
      })
      .map(function (s) {
        return (
          '<a class="chip" href="' +
          esc(link(s.href)) +
          '">' +
          '<span aria-hidden="true">' +
          esc(s.icon) +
          "</span>" +
          esc(s.title) +
          "</a>"
        );
      })
      .join("");
    render("other-subjects", html);
  }

  /* --- 啟動 ------------------------------------------------------------- */

  function init() {
    renderHeader();
    renderFooter();
    setupNavToggle();
    setupHeaderSearch();
    setupHeaderSearchGlobal();

    renderSubjects();
    renderToday();
    renderNews();
    renderQuickLinks();

    renderFeatures();
    renderResources();
    renderTasks();
    renderGallery();
    renderOtherSubjects();

    /* 靜態內容先顯示，再與後台連線更新資料與時間 */
    connectBackend();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
