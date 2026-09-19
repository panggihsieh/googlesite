/* =============================================================================
 * 大南老邦教學網 — 後台連線與時間同步（前台共用模組）
 * -----------------------------------------------------------------------------
 * 這個檔案同時負責兩件事：
 *
 *   1. 與後台連結
 *      用 JSONP 讀取 GAS 公開資料 API（`DANA_SITE_CONFIG.publicApiUrl` + `?api=public`），
 *      把首頁／嵌入版的「今日學習、最新消息、快速連結」更新成後台（Google Sheet）最新內容；
 *      後台「後台設定」的網站基本資料與 Hero 文案也會一併套用（見 applySiteSettings）。
 *      GAS 回傳的是 JavaScript，因此不會遇到 GitHub Pages → Apps Script 的跨網域 CORS 問題。
 *
 *   2. 時間與後台同步
 *      以後台回傳的 `serverTime.timestamp`（Asia/Taipei）計算前端時鐘偏移，
 *      前台顯示的日期／時間一律改用 `DANA_BACKEND` 的函式取得；
 *      即使學生電腦時間設錯，看到的仍是後台時間。
 *
 * 用法（`script.js`、`js/embed.js` 都一樣）：
 *
 *   DANA_BACKEND.onSync(function () { ... });   // 時間同步完成後重繪
 *   DANA_BACKEND.load({ onData: fn, onError: fn });
 *
 * 連不到後台時不會拋錯，呼叫端會收到 onError，並可繼續使用 GitHub 靜態備援資料。
 * ========================================================================== */
window.DANA_BACKEND = (function () {
  "use strict";

  var CONFIG = window.DANA_SITE_CONFIG || {};

  /* 後台時區（GAS CONFIG.TIMEZONE）固定為 Asia/Taipei，UTC+8、沒有日光節約時間，
   * 因此用固定偏移換算，不需要依賴裝置的時區設定。 */
  var TZ_OFFSET_MINUTES = Number(CONFIG.timezoneOffsetMinutes || 480);
  var WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

  var state = {
    synced: false,
    offsetMs: 0,
    serverMs: 0,
    generatedAt: "",
    payload: null
  };

  var syncHandlers = [];
  var requestSeq = 0;

  function pad2(value) {
    return (value < 10 ? "0" : "") + value;
  }

  function warn(message) {
    if (window.console && window.console.warn) window.console.warn(message);
  }

  /** 把某一瞬間（UTC 毫秒）換算成後台時區的日期欄位 */
  function partsOf(ms) {
    var shifted = new Date(Number(ms) + TZ_OFFSET_MINUTES * 60000);
    return {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hour: shifted.getUTCHours(),
      minute: shifted.getUTCMinutes(),
      second: shifted.getUTCSeconds(),
      weekday: shifted.getUTCDay()
    };
  }

  /** 2026-09-20 */
  function isoDateOf(ms) {
    var p = partsOf(ms);
    return p.year + "-" + pad2(p.month) + "-" + pad2(p.day);
  }

  /** 06:54:12（後台時區） */
  function timeOf(ms) {
    var p = partsOf(ms);
    return pad2(p.hour) + ":" + pad2(p.minute) + ":" + pad2(p.second);
  }

  /** 與 GAS `formatDateLabel_()` 相同格式：2026 年 9 月 20 日（日） */
  function dateLabelOf(isoDate) {
    var match = String(isoDate == null ? "" : isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return String(isoDate == null ? "" : isoDate);
    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    var weekday = WEEKDAYS[partsOf(Date.UTC(year, month - 1, day)).weekday];
    return year + " 年 " + month + " 月 " + day + " 日（" + weekday + "）";
  }

  /** 後台的 `yyyy-MM-dd HH:mm:ss` 或 ISO 字串 → UTC 毫秒 */
  function parseBackendTime(value) {
    var match = String(value == null ? "" : value)
      .match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return NaN;
    return Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6] || 0)
    ) - TZ_OFFSET_MINUTES * 60000;
  }

  /** 以後台時間校正前端時鐘；clientMidMs 為請求送出／回應的中間點，可扣除網路往返誤差 */
  function applyTime(payload, clientMidMs) {
    if (!payload || payload.ok !== true) return false;

    var server = payload.serverTime || {};
    var serverMs = Number(server.timestamp);
    /* 舊版 GAS 沒有 serverTime，退回用 generatedAt／iso 字串換算 */
    if (!isFinite(serverMs)) serverMs = parseBackendTime(server.iso);
    if (!isFinite(serverMs)) serverMs = parseBackendTime(payload.generatedAt);
    if (!isFinite(serverMs)) return false;

    var clientMs = isFinite(clientMidMs) ? clientMidMs : Date.now();

    state.serverMs = serverMs;
    state.offsetMs = serverMs - clientMs;
    state.generatedAt = String(server.iso || payload.generatedAt || "").replace("T", " ");
    state.synced = true;
    return true;
  }

  function notifySync() {
    for (var i = 0; i < syncHandlers.length; i++) {
      try {
        syncHandlers[i]();
      } catch (error) {
        /* 單一監聽函式出錯不影響其他監聽者 */
      }
    }
  }

  /** 現在時間（已套用後台偏移）。要顯示日期請用 todayIso()／dateLabel()，不要用裝置時區的 getter。 */
  function nowMs() {
    return Date.now() + (state.synced ? state.offsetMs : 0);
  }

  /** 註冊「時間同步完成」的處理函式，回傳取消註冊的函式 */
  function onSync(handler) {
    if (typeof handler !== "function") return function () {};
    syncHandlers.push(handler);
    return function off() {
      var index = syncHandlers.indexOf(handler);
      if (index >= 0) syncHandlers.splice(index, 1);
    };
  }

  /**
   * 讀取後台公開資料。options：
   *   onData(payload)   收到後台資料（同時已完成時間同步）
   *   onError(error)    逾時或連線失敗（例如離線、部署被關閉）
   *   timeoutMs         逾時毫秒，預設 DANA_SITE_CONFIG.apiTimeoutMs（8000）
   */
  function load(options) {
    var opts = options || {};
    var url = String(CONFIG.publicApiUrl || "").trim();

    if (!url) {
      warn("尚未設定 DANA_SITE_CONFIG.publicApiUrl，無法與後台連線。");
      if (opts.onError) opts.onError(new Error("尚未設定後台公開資料 API 網址"));
      return false;
    }

    var callbackName = "__danaBackendCb" + (++requestSeq) + "_" + Date.now();
    var script = document.createElement("script");
    var separator = url.indexOf("?") >= 0 ? "&" : "?";
    var timeoutMs = Number(opts.timeoutMs || CONFIG.apiTimeoutMs || 8000);
    var sentAt = Date.now();
    var done = false;

    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }
    }

    var timer = window.setTimeout(function () {
      if (done) return;
      done = true;
      cleanup();
      warn("後台公開資料 API 逾時，使用 GitHub 靜態備援資料。");
      if (opts.onError) opts.onError(new Error("後台回應逾時"));
    }, timeoutMs);

    window[callbackName] = function (payload) {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      cleanup();

      var timeOk = applyTime(payload, (sentAt + Date.now()) / 2);
      state.payload = payload;
      if (timeOk) notifySync();

      if (opts.onData) opts.onData(payload);
    };

    script.onerror = function () {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      cleanup();
      warn("無法連線後台公開資料 API，使用 GitHub 靜態備援資料。");
      if (opts.onError) opts.onError(new Error("無法連線後台公開資料 API"));
    };

    script.src =
      url +
      separator +
      "api=public&callback=" +
      encodeURIComponent(callbackName) +
      "&_=" +
      Date.now();

    document.head.appendChild(script);
    return true;
  }

  return {
    /* 設定 */
    config: CONFIG,
    timezone: CONFIG.timezone || "Asia/Taipei",
    timezoneOffsetMinutes: TZ_OFFSET_MINUTES,

    /* 後台連線 */
    load: load,
    payload: function () {
      return state.payload;
    },

    /* 後台時間 */
    onSync: onSync,
    synced: function () {
      return state.synced;
    },
    offsetMs: function () {
      return state.synced ? state.offsetMs : 0;
    },
    serverMs: function () {
      return state.serverMs;
    },
    generatedAt: function () {
      return state.generatedAt;
    },
    nowMs: nowMs,
    todayIso: function () {
      return isoDateOf(nowMs());
    },
    dateLabel: function () {
      return dateLabelOf(isoDateOf(nowMs()));
    },
    timeLabel: function () {
      return timeOf(nowMs());
    },
    year: function () {
      return partsOf(nowMs()).year;
    },

    /* 工具（也可用來格式化後台回傳的日期） */
    dateLabelOf: dateLabelOf,
    isoDateOf: isoDateOf
  };
})();
