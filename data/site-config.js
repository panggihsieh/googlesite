/* 大南老邦教學網：網站基本資料
 * 日後修改網站名稱、標語、Hero 文案，主要改這個檔案；
 * 也可以在後台「⚙️ 後台設定」用輸入欄位修改（會覆寫這裡的
 * name／school／schoolEn／grade／tagline／description／heroTitle／heroLead／keywords，
 * 見 script.js 與 js/embed.js 的 applySiteSettings）；連不到後台時就使用這裡的內容。
 */
window.DANA_SITE_CONFIG = {
  name: "大南老邦教學網",
  school: "大南國小",
  schoolEn: "Da-Nan Elementary School",
  grade: "高年級數位學習",
  heroTitle: "學習 × 探究 ×",
  heroLead: "大南國小高年級數位學習 × AI × 探究實作",
  keywords: ["閱讀世界", "探索自然", "擁抱科技", "創造未來"],

  /* GAS Web App 部署（同一個部署同時提供兩種用途）：
   *   - 後台管理畫面：這個 /exec 網址（index.html 與 google-sites-embed.html 的 ⚙️ 使用）
   *   - 公開資料 API：同一個 /exec 再加上 ?api=public
   * 每次「新增部署作業」會產生新網址；換部署時要同步更新這裡與上述兩個 ⚙️ 連結。
   *
   * 前台（index.html、pages/*.html、google-sites-embed.html）都透過 js/backend.js 讀這個網址：
   *   1. 後台資料（今日學習／最新消息／快速連結）會覆寫 GitHub 上的靜態備援資料。
   *   2. 回傳的 serverTime 會用來校正前端時鐘，頁面上的日期一律以「後台時間」為準。
   */
  publicApiUrl: "https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec",
  apiTimeoutMs: 8000,

  /* 後台時區（與 gas/Code.gs 的 CONFIG.TIMEZONE 相同）：
   * Asia/Taipei 固定 UTC+8、沒有日光節約時間，所以前端可用固定偏移換算，
   * 不受使用者電腦的時區／時間設定影響。 */
  timezone: "Asia/Taipei",
  timezoneOffsetMinutes: 480,

  updated: "2026-09-19"
};
