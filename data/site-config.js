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

  /* 建立 GAS「公開資料 API」第二個 Web App 部署後，
   * 將 /exec 網址貼到這裡。未設定時使用 data/*.js 靜態備援資料。
   */
  publicApiUrl: "https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec",
  apiTimeoutMs: 8000,

  updated: "2026-09-19"
};
