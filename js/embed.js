/* 大南老邦教學網 — Google Sites 嵌入首頁渲染 */
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
          '<a class="subject-card" href="' + esc(s.href) + '" style="--card:' + esc(s.color) + '">' +
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
          '<a class="course-title" href="' + esc(c.href) + '">' + esc(c.title) + "</a>" +
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
          '<a class="news-title" href="' + esc(n.href) + '">' + esc(n.title) + "</a>" +
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

  function init() {
    renderHero();
    renderSubjects();
    renderToday();
    renderNews();
    renderQuickLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
