const CONFIG = Object.freeze({
  SPREADSHEET_ID: '1wBbHFPPMcg2KptX-DBKmCdBBs7RKJukhUpJGDl1iWrU',
  ADMIN_EMAIL: 'teacher.hsieh@gmail.com',
  TIMEZONE: 'Asia/Taipei',
  SHEETS: {
    TODAY: 'today_learning',
    NEWS: 'news',
    LINKS: 'quick_links'
  }
});

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  template.initialUser = JSON.stringify(getCurrentUser_());
  return template
    .evaluate()
    .setTitle('大南老邦教學網｜後台管理')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
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
    throw new Error('無法取得 Google 帳號。請確認 Web App 設定為「執行身分：存取網頁應用程式的使用者」。');
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
