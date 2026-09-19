/* 大南老邦教學網：網站基本資料
 * 日後修改網站名稱、標語、Hero 文案，主要改這個檔案。
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
   */
  publicApiUrl: "https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec",
  apiTimeoutMs: 8000,

  updated: "2026-09-19"
};
