const CONFIG = Object.freeze({
  SPREADSHEET_ID: '1wBbHFPPMcg2KptX-DBKmCdBBs7RKJukhUpJGDl1iWrU',
  ADMIN_EMAIL: 'teacher.hsieh@gmail.com',
  TIMEZONE: 'Asia/Taipei',
  PUBLIC_CACHE_SECONDS: 60,
  PUBLIC_SCHEMA_VERSION: 6,
  /* 今日學習：最多 5 組公開 Google 日曆（後台存 embed 網址；抓課表時在 GAS 轉成 iCal） */
  MAX_CALENDAR_FEEDS: 5,
  DEFAULT_CALENDAR_EMBED_URL: 'https://calendar.google.com/calendar/embed?src=84f9b973e435bd5fba31848b07c46947612682c619a0d6a2847fce36d038130d%40group.calendar.google.com&ctz=Asia%2FTaipei',
  SHEETS: {
    TODAY: 'today_learning',
    NEWS: 'news',
    /* 最新影片：前台面板嵌入 YouTube（後台管理網址；顯示數量由 settings.videos_limit 控制） */
    VIDEOS: 'videos',
    LINKS: 'quick_links',
    /* 課表日曆：最多 5 筆 embed／iCal 網址；勾選「啟用」才會抓當天行程 */
    CALENDARS: 'calendar_feeds',
    /* 主題頁：勾選「可編輯」後前台出現 ✏️，點了開後台編輯頁 */
    SUBJECTS: 'subject_pages',
    /* 後台連結管理：管理前台導覽列（area=nav）與頁尾（area=footer）的連結 */
    SITE_LINKS: 'site_links',
    /* 後台設定：網站基本資料（key/value） */
    SETTINGS: 'settings'
  },
  /* 缺少工作表時自動建立，並用這份標題列；避免後台整頁讀取失敗 */
  SHEET_HEADERS: {
    today_learning: ['id', 'date', 'period', 'subject', 'title', 'href', 'visible', 'sort_order', 'updated_at'],
    news: ['id', 'date', 'tag', 'title', 'href', 'visible', 'sort_order', 'updated_at'],
    videos: ['id', 'date', 'title', 'url', 'visible', 'sort_order', 'updated_at'],
    calendar_feeds: ['id', 'label', 'url', 'visible', 'sort_order', 'updated_at'],
    subject_pages: ['id', 'label', 'href', 'visible', 'hero_sub', 'hero_intro', 'sort_order', 'updated_at'],
    quick_links: ['id', 'name', 'icon', 'url', 'requires_login', 'visible', 'sort_order', 'updated_at'],
    site_links: ['id', 'area', 'group', 'label', 'icon', 'href', 'visible', 'sort_order', 'updated_at'],
    settings: ['key', 'value', 'updated_at']
  }
});

/* 六大主題頁（固定清單；後台只開關「可編輯」與編輯副標／簡介，不新增／刪除） */
const SUBJECT_PAGE_DEFS = Object.freeze([
  { id: 'chinese', label: '國語', href: 'pages/chinese.html', sort_order: 1 },
  { id: 'math', label: '數學', href: 'pages/math.html', sort_order: 2 },
  { id: 'env', label: '環境教育', href: 'pages/env.html', sort_order: 3 },
  { id: 'ai', label: 'AI 科技', href: 'pages/ai.html', sort_order: 4 },
  { id: 'tasks', label: '學習任務', href: 'pages/tasks.html', sort_order: 5 },
  { id: 'works', label: '學生作品', href: 'pages/works.html', sort_order: 6 }
]);

/* 後台設定（工作表 settings，key → value）：
 * 前台可直接套用的網站基本資料，欄位順序＝後台表單順序，也是公開 API 的輸出順序。
 *   group  後台表單的分組標題
 *   type   text（單行）／textarea（多行）／list（以「、」分隔的清單）
 * 這裡是唯一的欄位定義來源：後台表單由 getSettings() 的 fields 產生，
 * 存檔只接受這裡列出的 key，其他列會留在 Sheet 但不會輸出到前台。
 */
const SETTINGS_FIELDS = Object.freeze([
  { key: 'site_name', label: '網站名稱', group: '網站基本資料', placeholder: '大南老邦教學網', hint: '頁首品牌、頁尾與瀏覽器標題' },
  { key: 'school', label: '學校名稱', group: '網站基本資料', placeholder: '大南國小', hint: '頁尾版權列' },
  { key: 'school_en', label: '英文校名', group: '網站基本資料', placeholder: 'Da-Nan Elementary School', hint: '後台登入頁與嵌入版使用' },
  { key: 'grade', label: '年級定位', group: '網站基本資料', placeholder: '高年級數位學習', hint: '頁尾說明' },
  { key: 'tagline', label: '網站標語', group: '網站基本資料', placeholder: '學習 × 探究 × 創造更好的自己', hint: '頁首品牌下方的小字' },
  { key: 'description', label: '網站簡介', group: '網站基本資料', type: 'textarea', placeholder: '大南國小高年級數位學習 × AI × 探究實作', hint: '頁尾說明' },
  { key: 'site_description', label: '網站描述', group: '頁尾說明', type: 'textarea', placeholder: '本網站以 HTML / CSS / JavaScript 靜態建置，部署於 GitHub Pages。內容由後台（Google Sheet + Apps Script）同步；教材檔放 Google Drive。瀏覽不需要登入。', hint: '出現在頁尾、學校與年級下方的說明段落；留空時沿用資料檔的內建文字' },
  { key: 'hero_title', label: '首頁橫幅標題', group: '首頁橫幅（Hero）', placeholder: '學習 × 探究 ×', hint: '網站 Hero／品牌相關文案' },
  { key: 'hero_lead', label: '首頁橫幅副標', group: '首頁橫幅（Hero）', type: 'textarea', placeholder: '大南國小高年級數位學習 × AI × 探究實作', hint: 'Hero 副標' },
  { key: 'keywords', label: '學習關鍵字', group: '首頁橫幅（Hero）', type: 'list', placeholder: '閱讀世界、探索自然、擁抱科技、創造未來', hint: '用「、」或逗號分隔' },
  { key: 'videos_limit', label: '最新影片顯示數量', group: '最新影片', placeholder: '3', hint: '前台「最新影片」面板要嵌入幾支（填 1～6；留空＝3）' }
]);

function doGet(e) {
  const params = (e && e.parameter) || {};

  if (params.api === 'public') {
    return publicApiResponse_(params);
  }

  const template = HtmlService.createTemplateFromFile('Index');
  template.initialUser = JSON.stringify(getCurrentUser_());
  /* 前台 ✏️ 深連結：?edit=chinese → 後台直接開該主題編輯頁 */
  template.initialEdit = JSON.stringify(String(params.edit || '').trim());
  return template
    .evaluate()
    .setTitle('大南老邦教學網｜後台管理')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function publicApiResponse_(params) {
  try {
    const payload = getPublicData_();

    /* 後台時間（Asia/Taipei）：每次請求都重新產生，不受 60 秒資料快取影響。
     * 前台用 serverTime.timestamp 校正時鐘，所有顯示的日期都以後台時間為準。 */
    const serverTime = getServerTime_();
    payload.serverTime = serverTime;
    payload.generatedAt = serverTime.iso.replace('T', ' '); // 向後相容舊版欄位

    const json = JSON.stringify(payload);
    const callback = String((params && params.callback) || '').trim();

    if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
      return ContentService
        .createTextOutput(callback + '(' + json + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    const serverTime = getServerTime_();
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error && error.message ? error.message : error),
        serverTime: serverTime,
        generatedAt: serverTime.iso.replace('T', ' ')
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** 後台時間：供前台（時間同步）與後台管理畫面（新增資料的日期預設值）使用 */
function getServerTime() {
  return getServerTime_();
}

function getServerTime_() {
  const now = new Date();
  const iso = Utilities.formatDate(now, CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
  const date = iso.slice(0, 10);
  const parts = date.split('-').map(Number);

  return {
    timezone: CONFIG.TIMEZONE,
    timestamp: now.getTime(),
    iso: iso,
    date: date,
    dateLabel: formatDateLabel_(date),
    timeLabel: Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss'),
    weekday: ['日', '一', '二', '三', '四', '五', '六'][new Date(parts[0], parts[1] - 1, parts[2]).getDay()]
  };
}

function getPublicData_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'public-home-v' + CONFIG.PUBLIC_SCHEMA_VERSION;
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const todayIso = getServerTime_().date;

  const todayRows = readTable_(CONFIG.SHEETS.TODAY)
    .filter(row => toBool_(row.visible))
    .map(row => ({
      id: String(row.id || ''),
      date: String(row.date || ''),
      period: String(row.period || ''),
      subject: String(row.subject || ''),
      title: String(row.title || ''),
      href: String(row.href || ''),
      sort_order: Number(row.sort_order || 0)
    }));

  /* 已啟用的課表日曆（最多 5）：當天有行程則優先於 Sheet */
  const calendarCourses = loadTodayCoursesFromCalendars_(todayIso);
  const todayPayload = calendarCourses.length
    ? {
        date: todayIso,
        dateLabel: formatDateLabel_(todayIso),
        courses: calendarCourses,
        source: 'calendar'
      }
    : {
        date: todayRows.length ? String(todayRows[0].date || todayIso) : todayIso,
        dateLabel: formatDateLabel_(todayRows.length ? String(todayRows[0].date || todayIso) : todayIso),
        courses: todayRows,
        source: 'sheet'
      };

  const news = readTable_(CONFIG.SHEETS.NEWS)
    .filter(row => toBool_(row.visible))
    .map(row => ({
      id: String(row.id || ''),
      date: String(row.date || ''),
      tag: String(row.tag || ''),
      title: String(row.title || ''),
      href: String(row.href || ''),
      sort_order: Number(row.sort_order || 0)
    }));

  /* 最新影片：可見列依日期新→舊、同日再依 sort_order；前台只顯示前 3 支 */
  const videos = sortVideosRecent_(
    readTable_(CONFIG.SHEETS.VIDEOS)
      .filter(row => toBool_(row.visible) && extractYoutubeId_(row.url))
      .map(row => ({
        id: String(row.id || ''),
        date: String(row.date || ''),
        title: String(row.title || ''),
        url: String(row.url || ''),
        youtubeId: extractYoutubeId_(row.url),
        sort_order: Number(row.sort_order || 0)
      }))
  );

  const links = readTable_(CONFIG.SHEETS.LINKS)
    .filter(row => toBool_(row.visible))
    .map(row => ({
      id: String(row.id || ''),
      name: String(row.name || ''),
      icon: String(row.icon || ''),
      url: String(row.url || ''),
      requiresLogin: toBool_(row.requires_login),
      sort_order: Number(row.sort_order || 0)
    }));

  /* 後台連結管理：area=nav（導覽列）／area=footer（頁尾連結） */
  const siteLinks = readTable_(CONFIG.SHEETS.SITE_LINKS)
    .filter(row => toBool_(row.visible))
    .map(row => ({
      id: String(row.id || ''),
      area: String(row.area || 'nav') === 'footer' ? 'footer' : 'nav',
      group: String(row.group || ''),
      label: String(row.label || ''),
      icon: String(row.icon || ''),
      href: String(row.href || ''),
      sort_order: Number(row.sort_order || 0)
    }));

  /* 後台設定：只輸出有填寫的欄位；前台沒收到的欄位會沿用 GitHub 靜態資料 */
  const settingsRows = readSettings_();
  const settings = {};
  SETTINGS_FIELDS.forEach(field => {
    const value = String(settingsRows[field.key] || '').trim();
    if (value) settings[field.key] = value;
  });

  /* 主題頁：可編輯清單＋副標／簡介覆寫（有填才輸出） */
  const subjectRows = ensureSubjectPages_();
  const editablePages = subjectRows
    .filter(row => toBool_(row.visible))
    .map(row => String(row.id || ''));
  const pageMeta = {};
  subjectRows.forEach(row => {
    const id = String(row.id || '');
    if (!id) return;
    const heroSub = String(row.hero_sub || '').trim();
    const heroIntro = String(row.hero_intro || '').trim();
    if (!heroSub && !heroIntro) return;
    pageMeta[id] = {};
    if (heroSub) pageMeta[id].heroSub = heroSub;
    if (heroIntro) pageMeta[id].heroIntro = heroIntro;
  });

  /* 這裡只快取資料（不含時間）；後台時間由 publicApiResponse_ 每次即時加上。 */
  const payload = {
    ok: true,
    schemaVersion: CONFIG.PUBLIC_SCHEMA_VERSION,
    today: todayPayload,
    news: news,
    videos: videos,
    quickLinks: links,
    siteLinks: siteLinks,
    settings: settings,
    editablePages: editablePages,
    pageMeta: pageMeta
  };

  cache.put(cacheKey, JSON.stringify(payload), CONFIG.PUBLIC_CACHE_SECONDS);
  return payload;
}

function clearPublicCache_() {
  CacheService.getScriptCache().remove('public-home-v' + CONFIG.PUBLIC_SCHEMA_VERSION);
}

function formatDateLabel_(isoDate) {
  const match = String(isoDate || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return String(isoDate || '');

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(year, month - 1, day);
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];

  return year + ' 年 ' + month + ' 月 ' + day + ' 日（' + weekday + '）';
}

function getBootstrapData() {
  assertAdmin_();
  return {
    user: getCurrentUser_(),
    today: readTable_(CONFIG.SHEETS.TODAY),
    news: readTable_(CONFIG.SHEETS.NEWS),
    videos: readTable_(CONFIG.SHEETS.VIDEOS),
    calendars: ensureCalendarFeeds_(),
    subjects: ensureSubjectPages_(),
    links: readTable_(CONFIG.SHEETS.LINKS),
    siteLinks: readTable_(CONFIG.SHEETS.SITE_LINKS),
    settings: readSettings_(),
    settingsFields: SETTINGS_FIELDS,
    updatedAt: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss')
  };
}

/* ---------- 後台設定（工作表 settings） ---------- */

/** 後台設定表單用：欄位定義（唯一來源）＋目前已填寫的值 */
function getSettings() {
  assertAdmin_();
  return {
    ok: true,
    fields: SETTINGS_FIELDS,
    settings: readSettings_()
  };
}

/** 儲存後台設定：只接受 SETTINGS_FIELDS 的 key，寫入 settings 工作表後清除公開資料快取 */
function saveSettings(payload) {
  assertAdmin_();
  const settings = normalizeSettings_(payload);
  const sheet = getSheet_(CONFIG.SHEETS.SETTINGS);
  const values = sheet.getDataRange().getValues();
  const headers = (values.length ? values[0] : CONFIG.SHEET_HEADERS.settings).map(String);
  const keyIndex = headers.indexOf('key');
  const valueIndex = headers.indexOf('value');
  const updatedIndex = headers.indexOf('updated_at');

  if (keyIndex < 0 || valueIndex < 0) {
    throw new Error('settings 工作表缺少 key／value 欄位，請確認第一列標題。');
  }

  const now = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  const rowOfKey = {};
  for (let r = 1; r < values.length; r++) {
    const key = String(values[r][keyIndex] || '').trim();
    if (key) rowOfKey[key] = r;
  }

  SETTINGS_FIELDS.forEach(field => {
    const rowIndex = rowOfKey[field.key];

    if (rowIndex === undefined) {
      const row = new Array(headers.length).fill('');
      row[keyIndex] = field.key;
      row[valueIndex] = settings[field.key];
      if (updatedIndex >= 0) row[updatedIndex] = now;
      sheet.appendRow(row);
      return;
    }

    sheet.getRange(rowIndex + 1, valueIndex + 1).setValue(settings[field.key]);
    if (updatedIndex >= 0) sheet.getRange(rowIndex + 1, updatedIndex + 1).setValue(now);
  });

  clearPublicCache_();

  return {
    ok: true,
    fields: SETTINGS_FIELDS,
    settings: readSettings_(),
    updatedAt: now
  };
}

/** 讀 settings 工作表 → { key: value }（只認得 SETTINGS_FIELDS 的 key） */
function readSettings_() {
  const settings = {};
  readTable_(CONFIG.SHEETS.SETTINGS).forEach(row => {
    const key = String(row.key || '').trim();
    if (!key || !isSettingsKey_(key)) return;
    settings[key] = row.value === undefined || row.value === null ? '' : String(row.value);
  });
  return settings;
}

/** 表單送出的值：去頭尾空白、限制長度，避免誤貼整篇文字 */
function normalizeSettings_(payload) {
  const source = payload || {};
  const settings = {};
  SETTINGS_FIELDS.forEach(field => {
    const raw = source[field.key];
    settings[field.key] = String(raw === undefined || raw === null ? '' : raw).trim().slice(0, 600);
  });
  return settings;
}

function isSettingsKey_(key) {
  return SETTINGS_FIELDS.some(field => field.key === key);
}

function saveRow(entity, payload) {
  assertAdmin_();
  const def = getEntityDef_(entity);
  const sheet = getSheet_(def.sheet);
  const record = normalizeRecord_(entity, payload || {});
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(String);
  const idIndex = headers.indexOf('id');
  const targetIndex = data.findIndex((row, index) => index > 0 && String(row[idIndex]) === String(record.id));
  record.updated_at = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

  /* 課表日曆最多 5 筆（含內建預設） */
  if (entity === 'calendars' && targetIndex < 1) {
    const existing = readTable_(CONFIG.SHEETS.CALENDARS);
    if (existing.length >= CONFIG.MAX_CALENDAR_FEEDS) {
      throw new Error('課表日曆最多 ' + CONFIG.MAX_CALENDAR_FEEDS + ' 組，請先停用或刪除其中一筆再新增。');
    }
  }

  /* 主題頁只允許更新既有六大主題，不可新增 */
  if (entity === 'subjects') {
    const allowed = SUBJECT_PAGE_DEFS.some(def => def.id === record.id);
    if (!allowed) throw new Error('不支援的主題頁：' + record.id);
    if (targetIndex < 1) throw new Error('主題頁清單為固定六項，請重新整理後再試。');
  }

  const rowValues = headers.map(h => record[h] !== undefined ? record[h] : '');

  if (targetIndex >= 1) {
    sheet.getRange(targetIndex + 1, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  clearPublicCache_();

  return {
    ok: true,
    row: record,
    rows: readTable_(def.sheet)
  };
}

function deleteRow(entity, id) {
  assertAdmin_();
  if (!id) throw new Error('缺少 id');
  if (entity === 'subjects') {
    throw new Error('主題頁為固定清單，不可刪除；請改用「可編輯」開關。');
  }

  const def = getEntityDef_(entity);
  const sheet = getSheet_(def.sheet);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const idIndex = headers.indexOf('id');

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idIndex]) === String(id)) {
      sheet.deleteRow(r + 1);
      clearPublicCache_();
      return { ok: true, rows: readTable_(def.sheet) };
    }
  }
  throw new Error('找不到指定資料');
}

function toggleVisible(entity, id, visible) {
  assertAdmin_();
  const def = getEntityDef_(entity);
  const sheet = getSheet_(def.sheet);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const idIndex = headers.indexOf('id');
  const visibleIndex = headers.indexOf('visible');
  const updatedIndex = headers.indexOf('updated_at');

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idIndex]) === String(id)) {
      sheet.getRange(r + 1, visibleIndex + 1).setValue(Boolean(visible));
      if (updatedIndex >= 0) {
        sheet.getRange(r + 1, updatedIndex + 1)
          .setValue(Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss'));
      }
      clearPublicCache_();
      return { ok: true, rows: readTable_(def.sheet) };
    }
  }
  throw new Error('找不到指定資料');
}

function getCurrentUser() {
  return getCurrentUser_();
}

function getCurrentUser_() {
  const email = (Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  return {
    email: email,
    authorized: email === CONFIG.ADMIN_EMAIL.toLowerCase()
  };
}

function assertAdmin_() {
  const user = getCurrentUser_();
  if (!user.email) {
    throw new Error('無法取得 Google 帳號。請確認管理後台部署為「執行身分：存取網頁應用程式的使用者」。');
  }
  if (!user.authorized) {
    throw new Error('此帳號沒有後台權限：' + user.email);
  }
  return user;
}

function getEntityDef_(entity) {
  const map = {
    today: { sheet: CONFIG.SHEETS.TODAY },
    news: { sheet: CONFIG.SHEETS.NEWS },
    videos: { sheet: CONFIG.SHEETS.VIDEOS },
    calendars: { sheet: CONFIG.SHEETS.CALENDARS },
    subjects: { sheet: CONFIG.SHEETS.SUBJECTS },
    links: { sheet: CONFIG.SHEETS.LINKS },
    siteLinks: { sheet: CONFIG.SHEETS.SITE_LINKS }
  };
  if (!map[entity]) throw new Error('不支援的資料類型');
  return map[entity];
}

/** 從常見 YouTube 網址取出 11 碼影片 ID；無法辨識則回空字串 */
function extractYoutubeId_(url) {
  const match = String(url || '').trim().match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

/** 最新影片排序：日期新→舊（yyyy-MM-dd 字串可比），同日再依 sort_order 小→大 */
function sortVideosRecent_(rows) {
  return (rows || []).slice().sort((a, b) => {
    const dateA = String(a.date || '');
    const dateB = String(b.date || '');
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

/* ---------- 課表日曆（最多 5 組 embed／iCal） ---------- */

/** 主題頁清單：空表時寫入六大主題（預設不可編輯） */
function ensureSubjectPages_() {
  const rows = readTable_(CONFIG.SHEETS.SUBJECTS);
  const byId = {};
  rows.forEach(row => {
    byId[String(row.id || '')] = row;
  });

  const sheet = getSheet_(CONFIG.SHEETS.SUBJECTS);
  const now = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  let changed = false;

  SUBJECT_PAGE_DEFS.forEach(def => {
    if (byId[def.id]) return;
    sheet.appendRow([
      def.id,
      def.label,
      def.href,
      false,
      '',
      '',
      def.sort_order,
      now
    ]);
    changed = true;
  });

  return changed ? readTable_(CONFIG.SHEETS.SUBJECTS) : rows;
}

/** 讀取課表日曆；空表時寫入內建預設（embed 網址、已啟用） */
function ensureCalendarFeeds_() {
  const rows = readTable_(CONFIG.SHEETS.CALENDARS);
  if (rows.length) return rows;

  const sheet = getSheet_(CONFIG.SHEETS.CALENDARS);
  const now = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([
    'calendar-default',
    '大南課表',
    CONFIG.DEFAULT_CALENDAR_EMBED_URL,
    true,
    1,
    now
  ]);
  return readTable_(CONFIG.SHEETS.CALENDARS);
}

/**
 * embed?src=… → public iCal；已是 …/ical/…/basic.ics 則原樣。
 * 無法辨識回空字串。
 */
function toCalendarIcsUrl_(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';

  if (/\/calendar\/ical\/[^/]+\/public\/basic\.ics/i.test(raw)) return raw;

  const embedMatch = raw.match(/[?&]src=([^&]+)/i);
  if (embedMatch) {
    const src = decodeURIComponent(embedMatch[1].replace(/\+/g, ' '));
    if (!src) return '';
    return 'https://calendar.google.com/calendar/ical/' + encodeURIComponent(src) + '/public/basic.ics';
  }

  return '';
}

/** 合併所有已啟用日曆中「今天」的行程 → 前台 courses */
function loadTodayCoursesFromCalendars_(todayIso) {
  const feeds = ensureCalendarFeeds_()
    .filter(row => toBool_(row.visible))
    .slice(0, CONFIG.MAX_CALENDAR_FEEDS);

  const events = [];
  feeds.forEach(feed => {
    const icsUrl = toCalendarIcsUrl_(feed.url);
    if (!icsUrl) return;
    try {
      const response = UrlFetchApp.fetch(icsUrl, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: { 'User-Agent': 'DanaEduCalendar/1.0' }
      });
      if (response.getResponseCode() >= 400) return;
      parseIcsEvents_(response.getContentText())
        .filter(ev => ev.date === todayIso)
        .forEach(ev => events.push(ev));
    } catch (error) {
      /* 單一來源失敗不影響其他日曆／Sheet 備援 */
    }
  });

  events.sort((a, b) => String(a.startKey || '').localeCompare(String(b.startKey || '')));

  const periodNames = ['第一節', '第二節', '第三節', '第四節', '第五節', '第六節', '第七節', '第八節'];
  return events.map((ev, index) => {
    const parsed = parseCourseSummary_(ev.summary);
    return {
      id: 'cal-' + index + '-' + String(ev.uid || index).slice(0, 12),
      date: todayIso,
      period: ev.timeLabel || periodNames[index] || ('第' + (index + 1) + '節'),
      subject: parsed.subject,
      title: parsed.title,
      href: ev.href || subjectHref_(parsed.subject),
      sort_order: index + 1
    };
  });
}

/** 活動標題：「科目｜名稱」或「科目: 名稱」；無分隔時科目＝課程 */
function parseCourseSummary_(summary) {
  const text = String(summary || '').trim();
  const match = text.match(/^(.+?)\s*[｜|:：\/／]\s*(.+)$/);
  if (match) {
    return { subject: match[1].trim() || '課程', title: match[2].trim() || text };
  }
  return { subject: '課程', title: text || '未命名活動' };
}

function subjectHref_(subject) {
  const key = String(subject || '').replace(/\s+/g, '');
  const map = {
    '國語': 'pages/chinese.html',
    '國文': 'pages/chinese.html',
    '數學': 'pages/math.html',
    '環境': 'pages/env.html',
    '環境教育': 'pages/env.html',
    'AI': 'pages/ai.html',
    '科技': 'pages/ai.html',
    '任務': 'pages/tasks.html',
    '學習任務': 'pages/tasks.html',
    '作品': 'pages/works.html',
    '學生作品': 'pages/works.html'
  };
  return map[key] || 'index.html';
}

/** 簡易 ICS 解析（Google Calendar 公開 basic.ics） */
function parseIcsEvents_(icsText) {
  const unfolded = String(icsText || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]/g, '');

  const blocks = unfolded.split('BEGIN:VEVENT');
  const events = [];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0] || '';
    const fields = {};
    block.split('\n').forEach(line => {
      const cut = line.indexOf(':');
      if (cut < 1) return;
      const name = line.slice(0, cut).split(';')[0].toUpperCase();
      fields[name] = line.slice(cut + 1);
    });

    const startRaw = fields.DTSTART || '';
    const parsedStart = parseIcsDateTime_(startRaw);
    if (!parsedStart.date) continue;

    let href = String(fields.URL || '').trim();
    if (!href) {
      const desc = String(fields.DESCRIPTION || '');
      const link = desc.match(/https?:\/\/[^\s\\]+/);
      if (link) href = link[0].replace(/\\n.*/, '').replace(/\\,/g, ',');
    }

    events.push({
      uid: String(fields.UID || ''),
      summary: icsUnescape_(fields.SUMMARY || ''),
      date: parsedStart.date,
      timeLabel: parsedStart.timeLabel,
      startKey: parsedStart.startKey,
      href: href
    });
  }

  return events;
}

function icsUnescape_(value) {
  return String(value || '')
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

/** DTSTART → { date: yyyy-MM-dd, timeLabel, startKey }（Asia/Taipei） */
function parseIcsDateTime_(value) {
  const raw = String(value || '').trim();
  if (!raw) return { date: '', timeLabel: '', startKey: '' };

  /* 全日：20260926 */
  if (/^\d{8}$/.test(raw)) {
    const date = raw.slice(0, 4) + '-' + raw.slice(4, 6) + '-' + raw.slice(6, 8);
    return { date: date, timeLabel: '', startKey: date + 'T00:00:00' };
  }

  /* 本地或 UTC：20260926T080000 或 20260926T000000Z */
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!match) return { date: '', timeLabel: '', startKey: '' };

  if (match[7] === 'Z') {
    const dateObj = new Date(Date.UTC(
      Number(match[1]), Number(match[2]) - 1, Number(match[3]),
      Number(match[4]), Number(match[5]), Number(match[6])
    ));
    const date = Utilities.formatDate(dateObj, CONFIG.TIMEZONE, 'yyyy-MM-dd');
    const timeLabel = Utilities.formatDate(dateObj, CONFIG.TIMEZONE, 'HH:mm');
    const startKey = Utilities.formatDate(dateObj, CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
    return { date: date, timeLabel: timeLabel, startKey: startKey };
  }

  /* 無 Z：當成日曆本地時間（本站為 Asia/Taipei） */
  const date = match[1] + '-' + match[2] + '-' + match[3];
  const timeLabel = match[4] + ':' + match[5];
  return {
    date: date,
    timeLabel: timeLabel,
    startKey: date + 'T' + match[4] + ':' + match[5] + ':' + match[6]
  };
}

function getSheet_(name) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    /* 缺少工作表時自動建立（含標題列），避免因為少一個分頁就讓後台整頁讀不到資料 */
    const headers = CONFIG.SHEET_HEADERS[name];
    if (!headers) throw new Error('找不到工作表：' + name);
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function readTable_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  if (!values.length) return [];

  const headers = values.shift().map(String);
  return values
    .filter(row => row.some(v => v !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const value = row[i];
        obj[h] = value instanceof Date
          ? Utilities.formatDate(value, CONFIG.TIMEZONE, 'yyyy-MM-dd')
          : value;
      });
      return obj;
    })
    .sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));
}

function normalizeRecord_(entity, p) {
  const id = String(p.id || makeId_(entity));
  if (entity === 'today') {
    return {
      id,
      date: String(p.date || ''),
      period: String(p.period || ''),
      subject: String(p.subject || ''),
      title: String(p.title || ''),
      href: String(p.href || ''),
      visible: toBool_(p.visible),
      sort_order: Number(p.sort_order || 0)
    };
  }
  if (entity === 'news') {
    return {
      id,
      date: String(p.date || ''),
      tag: String(p.tag || ''),
      title: String(p.title || ''),
      href: String(p.href || ''),
      visible: toBool_(p.visible),
      sort_order: Number(p.sort_order || 0)
    };
  }
  if (entity === 'videos') {
    const url = String(p.url || '').trim();
    if (!extractYoutubeId_(url)) {
      throw new Error('請貼上有效的 YouTube 網址（例如 https://www.youtube.com/watch?v=… 或 https://youtu.be/…）');
    }
    return {
      id,
      date: String(p.date || ''),
      title: String(p.title || ''),
      url: url,
      visible: toBool_(p.visible),
      sort_order: Number(p.sort_order || 0)
    };
  }
  if (entity === 'calendars') {
    const url = String(p.url || '').trim();
    if (!toCalendarIcsUrl_(url)) {
      throw new Error('請貼上 Google 日曆「嵌入」網址（…/calendar/embed?src=…）或公開 iCal（…/basic.ics）');
    }
    return {
      id,
      label: String(p.label || ''),
      url: url,
      visible: toBool_(p.visible),
      sort_order: Number(p.sort_order || 0)
    };
  }
  if (entity === 'subjects') {
    const def = SUBJECT_PAGE_DEFS.filter(item => item.id === id)[0];
    return {
      id,
      label: String(p.label || (def && def.label) || id),
      href: String(p.href || (def && def.href) || ''),
      visible: toBool_(p.visible),
      hero_sub: String(p.hero_sub || '').trim().slice(0, 200),
      hero_intro: String(p.hero_intro || '').trim().slice(0, 600),
      sort_order: Number(p.sort_order || (def && def.sort_order) || 0)
    };
  }
  if (entity === 'siteLinks') {
    return {
      id,
      area: String(p.area || 'nav') === 'footer' ? 'footer' : 'nav',
      group: String(p.group || ''),
      label: String(p.label || ''),
      icon: String(p.icon || ''),
      href: String(p.href || ''),
      visible: toBool_(p.visible),
      sort_order: Number(p.sort_order || 0)
    };
  }
  return {
    id,
    name: String(p.name || ''),
    icon: String(p.icon || ''),
    url: String(p.url || ''),
    requires_login: toBool_(p.requires_login),
    visible: toBool_(p.visible),
    sort_order: Number(p.sort_order || 0)
  };
}

function toBool_(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function makeId_(prefix) {
  return prefix + '-' + Utilities.getUuid().slice(0, 8);
}
