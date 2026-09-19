const CONFIG = Object.freeze({
  SPREADSHEET_ID: '1wBbHFPPMcg2KptX-DBKmCdBBs7RKJukhUpJGDl1iWrU',
  ADMIN_EMAIL: 'teacher.hsieh@gmail.com',
  TIMEZONE: 'Asia/Taipei',
  PUBLIC_CACHE_SECONDS: 60,
  PUBLIC_SCHEMA_VERSION: 1,
  SHEETS: {
    TODAY: 'today_learning',
    NEWS: 'news',
    LINKS: 'quick_links'
  }
});

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
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error && error.message ? error.message : error),
        generatedAt: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss')
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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

  const currentDate = todayRows.length ? todayRows[0].date : '';
  const payload = {
    ok: true,
    schemaVersion: CONFIG.PUBLIC_SCHEMA_VERSION,
    generatedAt: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
    today: {
      date: currentDate,
      dateLabel: formatDateLabel_(currentDate),
      courses: todayRows
    },
    news: news,
    quickLinks: links
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
    updatedAt: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss')
  };
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
    links: { sheet: CONFIG.SHEETS.LINKS }
  };
  if (!map[entity]) throw new Error('不支援的資料類型');
  return map[entity];
}

function getSheet_(name) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('找不到工作表：' + name);
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
