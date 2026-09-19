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

  // 目前頁面代號（由 <body data-page="..."> 決定）
  var PAGE = document.body.getAttribute("data-page") || "index";

  // 相對路徑前綴：內頁在 /pages/ 底下，需要往上一層
  var BASE =
    document.body.getAttribute("data-base") ||
    (/\/pages\//.test(window.location.pathname) ? ".." : ".");

  /** 把資料檔裡的相對路徑轉成目前頁面可用的路徑 */
  function link(path) {
    if (!path) return "#";
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(path)) return path;
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
        var icon = navIcons[item.label] || "•";
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

  function renderFooter() {
    var host = el("site-footer");
    if (!host) return;

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

    host.innerHTML =
      '<footer class="site-footer">' +
      '<div class="container footer-grid">' +
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
      "</div>" +
      '<div class="container footer-bottom">' +
      "<p>© " +
      new Date().getFullYear() +
      " " +
      esc(SITE.school || "") +
      " ・ " +
      esc(SITE.name || "") +
      "</p>" +
      "<p>最後更新：<span>" +
      esc(SITE.updated || "") +
      "</span></p>" +
      "</div>" +
      "</footer>";
  }

  /* --- 3. 導覽互動 ----------------------------------------------------- */

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
    var toggle = document.querySelector(".header-search-toggle");
    var panel = el("header-search-panel");
    var input = el("header-search-input");
    var status = document.querySelector(".header-search-status");
    var form = document.querySelector(".header-search-form");
    if (!toggle || !panel || !input || !form) return;

    function closeSearch() {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

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

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSearch();
    });

    document.addEventListener("click", function (event) {
      if (panel.hidden) return;
      if (panel.contains(event.target) || toggle.contains(event.target)) return;
      closeSearch();
    });
  }

  /* --- 4. 首頁區塊 ----------------------------------------------------- */

  function renderSubjects() {
    var html = (DATA.subjects || [])
      .map(function (s) {
        return (
          '<a class="subject-card" href="' +
          esc(link(s.href)) +
          '" style="--card:' +
          esc(s.color) +
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
          '<span class="subject-more">前往 <span aria-hidden="true">→</span></span>' +
          "</a>"
        );
      })
      .join("");
    render("subject-grid", html);
  }

  function renderToday() {
    var today = DATA.today || {};
    var courses = (today.courses || [])
      .map(function (c) {
        return (
          "<li>" +
          '<span class="course-period">' +
          esc(c.period) +
          "</span>" +
          '<span class="course-body">' +
          '<span class="course-subject">' +
          esc(c.subject) +
          "</span>" +
          '<a class="course-title" href="' +
          esc(link(c.href)) +
          '">' +
          esc(c.title) +
          "</a>" +
          "</span>" +
          "</li>"
        );
      })
      .join("");

    render(
      "today-panel",
      '<div class="panel-head">' +
        "<h3>今日學習</h3>" +
        '<span class="panel-meta">' +
        esc(today.dateLabel || "") +
        "</span>" +
        "</div>" +
        '<p class="course-subject" style="margin-bottom:10px">本週課程</p>' +
        '<ul class="course-list">' +
        courses +
        "</ul>"
    );
  }

  function renderNews() {
    var VISIBLE = 3;
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
          '<span class="tag">' +
          esc(n.tag) +
          "</span>" +
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
      '<div class="panel-head">' +
        "<h3>最新消息</h3>" +
        more +
        "</div>" +
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
          esc(q.name) +
          "</a>" +
          "</li>"
        );
      })
      .join("");

    render(
      "quick-panel",
      '<div class="panel-head"><h3>快速連結</h3></div>' +
        '<ul class="quick-list">' +
        list +
        "</ul>"
    );
  }

  function renderTeacher() {
    var t = DATA.teacher || {};
    var links = (t.links || [])
      .map(function (l) {
        return (
          '<a class="chip" href="' +
          esc(link(l.url)) +
          '" target="_blank" rel="noopener">' +
          '<span aria-hidden="true">' +
          esc(l.icon) +
          "</span>" +
          esc(l.name) +
          "</a>"
        );
      })
      .join("");

    render(
      "teacher-content",
      "<h2>教師專區</h2>" +
        "<p>" +
        esc(t.note) +
        "</p>" +
        '<div class="link-grid">' +
        links +
        "</div>"
    );
  }

  function renderAbout() {
    var a = DATA.about || {};
    var facts = (a.facts || [])
      .map(function (f) {
        return (
          '<div class="fact">' +
          '<span class="fact-label">' +
          esc(f.label) +
          "</span>" +
          '<span class="fact-value">' +
          esc(f.value) +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    render(
      "about",
      "<h2>關於大南</h2>" +
        "<p>" +
        esc(a.text) +
        "</p>" +
        '<div class="fact-row">' +
        facts +
        "</div>"
    );
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

    renderSubjects();
    renderToday();
    renderNews();
    renderQuickLinks();
    renderTeacher();
    renderAbout();

    renderFeatures();
    renderResources();
    renderTasks();
    renderGallery();
    renderOtherSubjects();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
