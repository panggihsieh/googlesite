# 大南老邦教學網 — GAS 後台 v1

本資料夾是管理後台第一版原始碼。

## 功能

- Google 帳號登入
- 白名單只允許 `teacher.hsieh@gmail.com`
- 管理「今日學習」
- 管理「最新消息」
- 管理「快速連結」
- 管理「後台連結管理」（前台導覽列與頁尾連結）
- 管理「後台設定」（網站基本資料輸入欄位）
- 資料儲存在 Google Sheet
- GAS Web App 負責驗證與 CRUD

## Google Sheet

資料庫：

`大南老邦教學網_後台資料庫`

Spreadsheet ID：

`1wBbHFPPMcg2KptX-DBKmCdBBs7RKJukhUpJGDl1iWrU`

工作表：

- `today_learning`
- `news`
- `quick_links`
- `site_links`（後台連結管理：導覽列／頁尾連結）
- `settings`（後台設定：key／value，網站基本資料）

> 缺少任何一個工作表時，`gas/Code.gs` 會自動建立並寫入標題列（`CONFIG.SHEET_HEADERS`），
> 因此不必手動建分頁；若既有分頁的標題列有缺欄位，請自行補上欄位名稱。

`settings` 的 key 定義在 `gas/Code.gs` 的 `SETTINGS_FIELDS`（後台「後台設定」表單會依它自動產生）：

| key | 後台欄位 | 前台套用位置 |
| --- | --- | --- |
| `site_name` | 網站名稱 | 頁首品牌、頁尾、`<title>`／`og:title` |
| `school` | 學校名稱 | 頁尾版權列 |
| `school_en` | 英文校名 | 後台登入頁、嵌入版 |
| `grade` | 年級定位 | 頁尾說明 |
| `tagline` | 網站標語 | 頁首品牌小字、`og:description` |
| `description` | 網站簡介 | 頁尾說明 |
| `hero_title` | 首頁橫幅標題 | 嵌入版 Hero 標題 |
| `hero_lead` | 首頁橫幅副標 | 嵌入版 Hero 副標 |
| `keywords` | 學習關鍵字 | 嵌入版 Hero 標籤（用「、」分隔） |

> 空白欄位＝沿用 `data/site-config.js`／`data/site-data.js` 的內建內容；首頁橫幅是設計圖（文字已畫在圖上），
> 所以 Hero 文案套用在 Google Sites 嵌入版。

## 後台管理畫面（`gas/Index.html`）

- 版面依設計圖 `admin.png` 建立，共五種畫面：
  1. **登入頁**：`大南老邦教學網` / `Da-Nan Elementary School` / `🌿 後台管理系統` / `登入後即可管理今日學習、最新消息、快速連結與網站設定` / `管理者登入` / `Google 帳號` / `登入狀態` / `使用 Google 帳號登入／重新檢查` / `網站預覽` / `使用說明`。
  2. **側邊選單**：品牌 ＋ `首頁儀表板`、`今日學習`、`最新消息`、`快速連結`、`後台連結管理`、`後台設定`；下方「系統」區有 `使用說明`、`網站預覽（前台首頁）`、`Google Sites 網站`。
  3. **儀表板**：`歡迎回來！` 歡迎卡 ＋ 五張統計卡（各附 `前往管理 →`／`前往設定 →`）＋ `快速操作`（新增今日學習／最新消息／快速連結／後台連結、編輯後台設定）。
  4. **管理頁**：`今日學習管理`、`最新消息管理`、`快速連結管理`、`後台連結管理`（表格＋`顯示`開關＋`✏️ 編輯`／`🗑️ 刪除`＋`＋ 新增`）。
  5. **設定頁**：`⚙️ 後台設定`（依 `SETTINGS_FIELDS` 的 `group` 分組的輸入欄位 ＋ `儲存設定`／`還原變更`，不是 CRUD 表格）。
- 樣式集中在 `Index.html` 的 `:root` 變數（深藍側欄 `--navy`、主色 `--blue`、面板白底圓角 `--radius`／`--shadow`）。
  **新增模組時請沿用** `.panel`、`.panel-head`、`.summary-card`、`.action-card`、`.btn`、`.table`、`.form-grid` 等既有樣式與相同語氣的中文文案。
- 右上角顯示後台時間（呼叫 `getServerTime()`），新增／編輯表單的日期預設值也使用後台時間，不使用電腦時間。
- 前台網址設定在 `Index.html` 內的 `SITE_HOME`（GitHub Pages）與 `SITES_HOME`（Google Sites），換網址時改這兩行。

## 目前的實際部署（2026-09-19）

- 目前只使用**一個** Web App 部署：

  `https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec`

  - 執行身分：**我**、存取權：**任何人**
  - 不帶參數 → **後台管理畫面**（首頁與嵌入版的 ⚙️ 都連這裡）
  - 加上 `?api=public` → **公開資料 API**（`data/site-config.js` 的 `publicApiUrl`）
- 後台時間：後台畫面載入時會呼叫 `getServerTime()` 取得 GAS 時間（`Asia/Taipei`），並顯示在標題列；
  新增／編輯表單的日期預設值以這個時間為準，不使用老師電腦的時間。
  公開 API 的回應也會帶上同一個時間欄位（`serverTime`），前台據此校正時鐘（見 `js/backend.js`）。
- 舊的獨立後台部署 `AKfycbxdJ4…` 已失效（匿名 `404`），請勿再使用。
- 注意：目前是「以我執行」，`Session.getActiveUser().getEmail()` 有可能拿不到訪客帳號，導致後台顯示「尚未取得登入帳號」。若遇到這種情況，請改回下面第一個部署的設定（執行身分＝**存取網頁應用程式的使用者**、存取權＝**擁有 Google 帳號的使用者**），並把 `index.html`、`google-sites-embed.html` 的 ⚙️ 改成該部署網址。

以下兩段保留為部署設計參考。

## 第一個部署：後台管理

1. 到 script.google.com 建立 Apps Script 專案。
2. 把 `gas/Code.gs`、`gas/Index.html`、`gas/appsscript.json` 內容貼入。
3. 部署 → 新增部署作業 → 網頁應用程式。
4. 執行身分：**存取網頁應用程式的使用者**。
5. 存取權：**擁有 Google 帳號的使用者**。
6. 以 `teacher.hsieh@gmail.com` 登入測試。
7. 其他帳號應看到「未授權」。

> 重要：如果部署成「以我執行」，`Session.getActiveUser().getEmail()` 可能無法取得訪客 Gmail，白名單驗證會失效。


## 第二個部署：公開資料 API

同一個 Apps Script 專案需要建立第二個 Web App 部署，專門讓公開網站讀取資料。

設定：

- 執行身分：**我**
- 存取權：**任何人**
- 此部署只使用：
  - `?api=public`
  - `?api=public&callback=...`

測試網址：

```text
<PUBLIC_EXEC_URL>?api=public
```

正常時應回傳 JSON：

```json
{
  "ok": true,
  "schemaVersion": 3,
  "serverTime": {
    "timezone": "Asia/Taipei",
    "timestamp": 1789858743000,
    "iso": "2026-09-20T06:59:03",
    "date": "2026-09-20",
    "dateLabel": "2026 年 9 月 20 日（日）",
    "timeLabel": "06:59:03"
  },
  "generatedAt": "2026-09-20 06:59:03",
  "today": { "date": "2026-09-20", "dateLabel": "2026 年 9 月 20 日（日）", "courses": [] },
  "news": [],
  "quickLinks": [],
  "siteLinks": [],
  "settings": { "site_name": "大南老邦教學網", "keywords": "閱讀世界、探索自然" }
}
```

`serverTime` 每次請求都即時產生（不受 60 秒資料快取影響），前台用它校正時鐘；`generatedAt` 保留給舊前端相容。

取得公開部署的 `/exec` 網址後，填入：

`data/site-config.js`

的：

```js
publicApiUrl: "https://script.google.com/macros/s/.../exec"
```

之後後台儲存資料 → Google Sheet → 公開 API → GitHub Pages / Google Sites 會自動讀取最新內容。
