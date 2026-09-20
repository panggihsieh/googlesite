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

## 目前的實際部署（2026-09-20 更新）

- 目前只使用**一個** Web App 部署（**`version 4`**，2026-09-20 由 `clasp deploy -i` 更新到 repo HEAD `1c283dd`；公開 API `schemaVersion: 3`）：

  `https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec`

  - 執行身分：**我**、存取權：**任何人**
  - 不帶參數 → **後台管理畫面**（首頁與嵌入版的 ⚙️ 都連這裡）
  - 加上 `?api=public` → **公開資料 API**（`data/site-config.js` 的 `publicApiUrl`）
- 後台時間：後台畫面載入時會呼叫 `getServerTime()` 取得 GAS 時間（`Asia/Taipei`），並顯示在標題列；
  新增／編輯表單的日期預設值以這個時間為準，不使用老師電腦的時間。
  公開 API 的回應也會帶上同一個時間欄位（`serverTime`），前台據此校正時鐘（見 `js/backend.js`）。
- 舊的獨立後台部署 `AKfycbxdJ4…` 已失效（匿名 `404`），請勿再使用。
- 注意：目前是「以我執行」，`Session.getActiveUser().getEmail()` 有可能拿不到訪客帳號，導致後台顯示「尚未取得登入帳號」。若遇到這種情況，請改回下面第一個部署的設定（執行身分＝**存取網頁應用程式的使用者**、存取權＝**擁有 Google 帳號的使用者**），並把 `index.html`、`google-sites-embed.html` 的 ⚙️ 改成該部署網址。

## 從這個 repo 同步回 Apps Script（clasp）

> 以後只要更新 `gas/` 下的三個檔案、`git push` 之後，在本機跑一次 `clasp push -f` + `clasp deploy -i`，線上後台就會同步成新版本，不用再手動到 Apps Script 編輯器貼程式碼。

**Apps Script Project ID**：`1tggx6LV9vdC3H7fHqJGE5b5Pgbakm14LoMD_2kyTAwvvoIma0d8LO3aB`（已寫進 `gas/.clasp.json`）

**Web App 既有部署 ID**：`AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo`（`clasp deploy -i` 用這個 ID 更新現有部署）

**一次性設定**（PowerShell）

```powershell
npm install -g @google/clasp   # 沒裝過才需要
clasp logout                   # 如果之前登入過別的帳號，先清掉
clasp login                    # 瀏覽器會打開、用 teacher.hsieh@gmail.com 登入
cd gas
clasp status                   # 確認連到正確的 Apps Script 專案（會顯示 Project ID 與 rootDir）
```

**之後每次這個 repo 的 HEAD 更新後，把程式碼推到 Apps Script 並更新部署**

```powershell
cd gas
clasp deployments                                              # 先確認要更新的部署 ID 與目前版本（可選）
clasp push -f                                                  # 把 Code.gs / Index.html / appsscript.json 推到編輯器
clasp deploy -i AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo -d "2026-09-20 同步 HEAD 1c283dd"
```

說明：

- `clasp push -f` 只覆蓋檔名相同的檔案，不會刪掉 Apps Script 裡其他不相關的檔案。
- `clasp deploy -i <deploymentId>` 會自動產生一份 immutable 版本，並把那個 **Web App 部署**指向新版本 — 等同「部署 → 管理部署作業 → 編輯（鉛筆）→ 版本：新版本 → 部署」的 CLI 版。
- `-d` 後面是版本說明文字，方便以後在 Apps Script 部署紀錄裡追溯。
- `clasp push` 一定要加 `-f`：clasp 3.x 只要偵測到 `appsscript.json` 有變動就會問「是否覆寫遠端 manifest」，**非互動環境**（腳本、自動化）問不到答案時會直接印 `Skipping push.` 就結束。手動在終端機執行時可以不加，被問到再按 `y`；本機 manifest 已與遠端一致，`-f` 覆寫是安全的。
- clasp 3.2.0 **沒有 `clasp diff`**（那是舊版指令）。要看遠端差異常用：`clasp deployments`（部署與版本清單）、Apps Script 編輯器直接看，或 `clasp pull` 到另一個資料夾比對。

**注意事項**

- `gas/.clasp.json` 已經 commit 到 repo，內容只有 Project ID（非機密）。
- `gas/appsscript.json` 是 manifest，內容與遠端一致：`runtimeVersion: V8`、`timeZone: Asia/Taipei`、`exceptionLogging: STACKDRIVER`、`oauthScopes`（`spreadsheets`、`userinfo.email`）與 `webapp`（`executeAs: USER_DEPLOYING`、`access: ANYONE_ANONYMOUS`）。
  **`webapp` 與 `oauthScopes` 一定要留在 manifest 裡**：少了它們，`clasp push -f` 會把遠端的公開存取設定蓋掉，公開資料 API 就可能變成需要登入。要調整範圍／執行身分時，改這裡再 `clasp push -f`、`clasp deploy -i`。
- `clasp push` 只更新 Apps Script 編輯器（與 `@HEAD`）的內容；**既有的 versioned 部署（`AKfycbz2…`）在 `clasp deploy -i` 之前不會改變**，所以正式網站不受影響。
- `clasp deploy -i <id>` 只送出 `versionNumber`／`description`／`scriptId`／`manifestFileName`，web app 的「存取權＝任何人、執行身分＝我」是由 manifest 的 `webapp` 決定；更新完務必用下面的驗證腳本確認匿名仍可讀。

**驗證腳本**（部署完跑一次；以下指令都在 repo 根目錄執行，`gas\.clasp.json` 才找得到）

```powershell
curl "https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec?api=public" | Select-String schemaVersion
```

應該看到 `schemaVersion 3`（部署更新前是 1）。

2026-09-20 已更新到 **version 4**，匿名實測：`200 application/json`、`ok: true`、`schemaVersion 3`、含 `serverTime`（`2026 年 9 月 20 日（日） 08:13:42`）、`today 1`／`news 4`／`quickLinks 8` 筆、`settings 1` 項；不帶參數的後台入口匿名仍為 `200` 且只有登入畫面（沒有資料）。

要確認「更新部署時存取權有沒有被改掉」，可查 Apps Script REST API（用 clasp 已登入的 token，唯讀）：

```powershell
$dep = 'AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo'
$sid = (Get-Content gas\.clasp.json -Raw | ConvertFrom-Json).scriptId
$tok = (Get-Content "$env:USERPROFILE\.clasprc.json" -Raw | ConvertFrom-Json).tokens.default.access_token
(Invoke-RestMethod -Uri "https://script.googleapis.com/v1/projects/$sid/deployments/$dep" -Headers @{ Authorization = "Bearer $tok" }).entryPoints[0].webApp.entryPointConfig
```

應該看到 `access: ANYONE_ANONYMOUS`、`executeAs: USER_DEPLOYING`。

要確認「遠端編輯器內容＝本機 repo」，可比對兩個長度（相同即代表 push 成功、且是原樣上傳）：

```powershell
$sid = (Get-Content gas\.clasp.json -Raw | ConvertFrom-Json).scriptId
$tok = (Get-Content "$env:USERPROFILE\.clasprc.json" -Raw | ConvertFrom-Json).tokens.default.access_token
$files = (Invoke-RestMethod -Uri "https://script.googleapis.com/v1/projects/$sid/content" -Headers @{ Authorization = "Bearer $tok" }).files
$files | ForEach-Object { '{0} chars={1}' -f $_.name, ([string]$_.source).Length }
```

**常見踩坑**

| 症狀 | 原因 | 解法 |
| --- | --- | --- |
| `clasp push` 報 `Cannot find scriptId in .clasp.json` | `.clasp.json` 缺 scriptId、或被忽略 | 確認 `gas/.clasp.json` 內容、`git check-ignore -v gas/.clasp.json` 應輸出無結果 |
| `clasp deploy -i <id>` 報 `Permission denied` | 登入的不是這個專案的擁有者 | `clasp logout` 之後用 `teacher.hsieh@gmail.com` 重登 |
| 部署成功但前端沒改變 | Apps Script 60 秒資料快取、或沒有 deploy 到既有 ID | 等 60 秒再驗；確認 `clasp deploy -i <id>` 那個 `<id>` 是 `AKfycbz2…` |
| `clasp push` 上傳後編輯器看到亂碼 | `.claspignore` 沒排除文件類，且文件被當成 `*.html` | 確認 `gas/.claspignore` 內有 `**/*.md`，並把 .md 文件放 repo 其他位置 |
| `clasp push` 只印 `Skipping push.` 就結束（exit code 0） | clasp 3.x 偵測到 `appsscript.json` 有變動，但非互動環境無法回答「要不要覆寫遠端 manifest」 | 改用 `clasp push -f`；本機 manifest 已含遠端的 `webapp`／`oauthScopes`，覆寫是安全的 |
| 更新部署後公開 API 變成 `401`／需要登入 | `clasp push -f` 把遠端 manifest 的 `webapp`／`oauthScopes` 蓋掉了 | 還原 `gas/appsscript.json` 的 `webapp`（`ANYONE_ANONYMOUS`／`USER_DEPLOYING`）與 `oauthScopes` → `clasp push -f` → `clasp deploy -i AKfycbz2…`；或到 Apps Script「管理部署作業」把存取權改回「任何人」 |
| 已 `clasp deploy -i` 但公開 API 還是舊版 | 還沒生效：Apps Script 部署快取或 CDN | 等 30–60 秒再驗；用上面的驗證腳本確認 `schemaVersion 3` 與新欄位（`serverTime`／`siteLinks`／`settings`） |

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
