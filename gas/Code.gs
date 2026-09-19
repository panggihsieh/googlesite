const CONFIG = Object.freeze({
  SPREADSHEET_ID: '1wBbHFPPMcg2KptX-DBKmCdBBs7RKJukhUpJGDl1iWrU',
  ADMIN_EMAIL: 'teacher.hsieh@gmail.com',
  TIMEZONE: 'Asia/Taipei',
  PUBLIC_CACHE_SECONDS: 60,
  PUBLIC_SCHEMA_VERSION: 3,
  SHEETS: {
    TODAY: 'today_learning',
    NEWS: 'news',
    LINKS: 'quick_links',
    /* 後台連結管理：管理前台導覽列（area=nav）與頁尾（area=footer）的連結 */
    SITE_LINKS: 'site_links',
    /* 後台設定：網站基本資料（key/value） */
    SETTINGS: 'settings'
  },
  /* 缺少工作表時自動建立，並用這份標題列；避免後台整頁讀取失敗 */
  SHEET_HEADERS: {
    today_learning: ['id', 'date', 'period', 'subject', 'title', 'href', 'visible', 'sort_order', 'updated_at'],
    news: ['id', 'date', 'tag', 'title', 'href', 'visible', 'sort_order', 'updated_at'],
    quick_links: ['id', 'name', 'icon', 'url', 'requires_login', 'visible', 'sort_order', 'updated_at'],
    site_links: ['id', 'area', 'group', 'label', 'icon', 'href', 'visible', 'sort_order', 'updated_at'],
    settings: ['key', 'value', 'updated_at']
  }
});

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
  { key: 'hero_title', label: '首頁橫幅標題', group: '首頁橫幅（Hero）', placeholder: '學習 × 探究 ×', hint: 'Google Sites 嵌入版的 Hero 標題' },
  { key: 'hero_lead', label: '首頁橫幅副標', group: '首頁橫幅（Hero）', type: 'textarea', placeholder: '大南國小高年級數位學習 × AI × 探究實作', hint: '嵌入版 Hero 副標' },
  { key: 'keywords', label: '學習關鍵字', group: '首頁橫幅（Hero）', type: 'list', placeholder: '閱讀世界、探索自然、擁抱科技、創造未來', hint: '用「、」或逗號分隔，嵌入版 Hero 會變成一顆顆標籤' }
]);

function doGet(e) {
  const params = (e && e.parameter) || {};

  if (params.api === 'public') {
    return publicApiResponse_(params);
  }

  const template = HtmlService.createTemplateFromFile('Index');
  template.initialUser = JSON.stringify(getCurrentUser_());
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

  const currentDate = todayRows.length ? todayRows[0].date : '';

  /* 後台設定：只輸出有填寫的欄位；前台沒收到的欄位會沿用 GitHub 靜態資料 */
  const settingsRows = readSettings_();
  const settings = {};
  SETTINGS_FIELDS.forEach(field => {
    const value = String(settingsRows[field.key] || '').trim();
    if (value) settings[field.key] = value;
  });

  /* 這裡只快取資料（不含時間）；後台時間由 publicApiResponse_ 每次即時加上。 */
  const payload = {
    ok: true,
    schemaVersion: CONFIG.PUBLIC_SCHEMA_VERSION,
    today: {
      date: currentDate,
      dateLabel: formatDateLabel_(currentDate),
      courses: todayRows
    },
    news: news,
    quickLinks: links,
    siteLinks: siteLinks,
    settings: settings
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
    links: { sheet: CONFIG.SHEETS.LINKS },
    siteLinks: { sheet: CONFIG.SHEETS.SITE_LINKS }
  };
  if (!map[entity]) throw new Error('不支援的資料類型');
  return map[entity];
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
