# 大南老邦教學網 — 正式專案規格

## 1. 專案定位

「大南老邦教學網」是一個公開瀏覽的國小高年級教學網站。

- Google Sites：負責最外層網站、主導覽列與發布入口。
- GitHub Pages：負責可維護的教材首頁、互動內容與主題頁。
- 外部服務：Google Classroom、Drive、Tinkercad、因材網等各自負責登入與權限。
- 本網站本身不保存學生帳號密碼，也不自行建立登入系統。

## 2. 正式網址

- Google Sites：`https://sites.google.com/view/dana-edu/`
- GitHub Pages：`https://panggihsieh.github.io/googlesite/`
- Google Sites 嵌入首頁：`https://panggihsieh.github.io/googlesite/google-sites-embed.html`
- GitHub Repo：`panggihsieh/googlesite`

## 3. 維護原則

1. Google Sites 的嵌入網址設定完成後，日常更新不需要重新嵌入。
2. 日常內容修改以 `data/` 為主，不直接改 HTML。
3. 版面修改集中在 `css/embed.css`。
4. 嵌入首頁互動集中在 `js/embed.js`。
5. `google-sites-embed.html` 只保留穩定的頁面骨架。
6. 不在 GitHub 公開儲存庫放學生個資、密碼、API Key 或私人檔案。
7. 需要登入的資源只提供外部連結，由該平台處理驗證。
8. 前台與後台的連線、後台資料覆寫、後台時間同步都集中在 `js/backend.js`；頁面上要顯示日期或時間時，請用 `DANA_BACKEND` 的函式，不要直接用裝置的 `new Date()`。
9. 後台管理畫面（`gas/Index.html`）依設計圖 `admin.png` 的內容與風格維護：登入頁、側邊選單、儀表板（歡迎卡＋統計卡＋快速操作）、管理頁表格。**新增模組時要沿用同一套樣式**（`:root` 色票、`.panel`、`.summary-card`、`.action-card`、`.btn`、`.table`）與相同語氣的中文文案。

## 4. 專案結構

```text
googlesite/
├─ index.html
├─ google-sites-embed.html
├─ style.css
├─ script.js
│
├─ css/
│  └─ embed.css
│
├─ js/
│  ├─ backend.js          # 後台連線 + 後台時間同步（前台共用）
│  └─ embed.js            # 嵌入首頁渲染
│
├─ data/
│  ├─ site-data.js        # 原完整版網站資料，保留相容性
│  ├─ site-config.js      # 網站名稱、Hero、關鍵字
│  ├─ subjects.js         # 六大主題卡片
│  ├─ courses.js          # 今日學習
│  ├─ news.js             # 最新消息
│  ├─ links.js            # 快速連結與登入提示
│  └─ embed-data.js       # 嵌入首頁資料組裝
│
├─ pages/
│  ├─ chinese.html
│  ├─ math.html
│  ├─ env.html
│  ├─ ai.html
│  ├─ tasks.html
│  └─ works.html
│
├─ gas/                  # Apps Script 後台（可用 clasp 從 repo 同步，見 admin/README.md）
│  ├─ Code.gs            # 白名單、Sheet CRUD、公開資料 API、後台時間
│  ├─ Index.html         # 後台管理畫面（依 admin.png 設計圖）
│  ├─ appsscript.json    # manifest（oauthScopes 與 webapp 的公開存取設定，不可刪）
│  ├─ .clasp.json        # clasp 專案設定（只有 Project ID）
│  └─ .claspignore
│
├─ admin/
│  └─ README.md          # 後台部署與維護說明
│
├─ assets/
│  ├─ images/
│  │  ├─ home-hero-banner.jpg     # 首頁 Hero 橫幅（layout.png Hero 全寬 1672×280）
│  │  └─ embed-hero-banner.jpg    # 嵌入版 Hero 背景（layout.png 照片區 1032×280）
│  └─ icons/
│
├─ PROJECT.md
├─ CHANGELOG.md
└─ README.md
```

## 5. 日常修改對照表

| 想修改的內容 | 修改檔案 |
| --- | --- |
| 網站名稱、Hero 標題、關鍵字 | `data/site-config.js`（預設值；後台「⚙️ 後台設定」可覆寫） |
| 後台公開資料 API 網址、逾時、後台時區 | `data/site-config.js` |
| 前台與後台的連線方式、後台時間同步邏輯 | `js/backend.js` |
| 後台資料覆寫靜態資料、頁面上的後台時間顯示 | `script.js` |
| 六大主題卡片 | `data/subjects.js` |
| 今日學習／課表 | `data/courses.js` |
| 最新消息 | `data/news.js` |
| 快速連結 | `data/links.js` |
| Google Sites 嵌入版外觀 | `css/embed.css` |
| 嵌入首頁渲染邏輯 | `js/embed.js` |
| 後台管理畫面（登入頁／選單／儀表板／管理頁） | `gas/Index.html`（依設計圖 `admin.png`；新增模組要沿用同一套樣式） |
| 後台資料欄位、白名單、公開 API、後台時間 | `gas/Code.gs` |
| 前台導覽列／頁尾連結（後台連結管理） | 後台 `gas/Index.html` + Google Sheet `site_links`；前台由 `script.js` 的 `applySiteLinks()` 套用 |
| 後台設定欄位（要新增／調整可設定的網站資料） | `gas/Code.gs` 的 `SETTINGS_FIELDS`（後台表單自動依它產生；前台套用見 `applySiteSettings()`） |
| 後台管理入口網址（首頁 ⚙️、嵌入版 ⚙️） | `index.html`、`google-sites-embed.html`（兩處要一起改；與 `data/site-config.js` 的 `publicApiUrl` 是同一個部署，只差 `?api=public`） |
| 首頁橫幅圖／嵌入版 Hero 圖 | `assets/images/home-hero-banner.jpg`、`assets/images/embed-hero-banner.jpg` |
| 首頁版面（區塊組成、容器寬度、卡片欄數） | `index.html`、`style.css`（設計依據：`layout.png`） |
| 首頁配色（藍色系主色、面板淡藍底） | `style.css` 的 `body[data-page="index"]` 變數區 |
| 首頁主題卡片底色／文字色（`tint`／`ink`） | `data/site-data.js` 的 `subjects` |
| 「開始今天的學習」按鈕文字與連結 | `data/site-data.js` 的 `today.cta` |
| 首頁快速連結的副標（例如 GeoGebra／數學工具） | `data/site-data.js` 的 `quickLinks[].note` |
| 國語／數學等完整主題頁內容 | 暫時仍由 `data/site-data.js` 管理 |

## 6. 響應式規則

- 桌機 Google Sites iframe 寬度 >= 900px：六張主題卡強制同一排。
- 首頁（GitHub Pages）：>= 1400px 六大主題卡一列 6 張；1400px 以下 3 欄、680px 以下單欄。
- 首頁內容寬度＝視窗寬度 − 26px×2（`--gutter: 26px`、`--maxw: 1700px`），與設計圖 `layout.png` 的內容邊界相同。
- 首頁儀表板：桌機三欄（1.164 : 1.071 : 1，間距 26px）、1000px 以下兩欄（快速連結整列）、680px 以下單欄。
- 首頁快速連結：面板內 2 欄方框（680px 以下單欄）。
- 700–899px：三欄。
- < 700px：兩欄。
- 禁止使用會導致 iframe 橫向溢出的固定大寬度。
- 不以 `100vw` 作主要容器寬度。

## 7. Google Sites 規則

Google Sites 保留自己的頂端導覽列；`google-sites-embed.html` 不再建立第二組導覽列。

Google Sites 只需嵌入：

```text
https://panggihsieh.github.io/googlesite/google-sites-embed.html
```

GitHub push 後，Google Sites 會自動載入新版。

## 8. 公開與登入資源

網站首頁與一般教材可以公開。

快速連結中的 `requiresLogin: true` 只表示外部平台通常需要登入，例如：

- Google Classroom
- Google Drive 私人／校內檔案
- Tinkercad 編輯功能
- 因材網

是否真的要求登入，以外部平台與分享權限設定為準。

## 9. 版本管理

- 正式分支：`main`
- 每次重要修改更新 `CHANGELOG.md`
- 重要版面修改建議以一個 Git commit 對應一項目的。
- 若日後改用 Codex / Zed，先閱讀 `PROJECT.md` 與 `CHANGELOG.md` 再修改。

## 10. 未來擴充

- 將完整主題頁也拆成獨立資料檔。
- 新增圖片／作品資料 JSON。
- 新增 Google Forms / Sheets 整合。
- 新增校園環境教育專區。
- 視需求增加 AI 輔助學習功能，但不把秘密金鑰直接放在前端。

## 11. 後台連結與時間同步

### 後台連結

- 前台（`index.html`、`pages/*.html`、`google-sites-embed.html`）都載入 `data/site-config.js` 與 `js/backend.js`。
- 載入順序：先顯示 GitHub 靜態資料（`data/site-data.js` 等），再由 `js/backend.js` 以 JSONP 讀取 GAS 公開資料 API 並覆寫。
- 後台網址只有一處設定：`data/site-config.js` 的 `publicApiUrl`。後台管理畫面（⚙️）與公開資料 API 是同一個部署，只差 `?api=public`。
- 連線成功時 `<html>` 會加上 `data-live-data="true"`；失敗（離線、逾時、部署權限被改）只印 console 警告，維持靜態備援內容。
- 覆寫規則：`today` 合併（保留 `today.cta`）、`news` 取代、`quickLinks` 依名稱合併（保留靜態檔的 `note` 副標）。
- 後台連結管理（Google Sheet `site_links`）：
  - `area=nav` → 前台導覽列，與 `data/site-data.js` 內建選單**合併**（名稱相同時覆寫、新名稱附加在後）；後台沒有資料時維持內建選單。
  - `area=footer` → 前台頁尾連結欄（依 `group` 分組，預設「相關連結」）；有資料時頁尾才變成 4 欄（`.footer-grid.has-extra`），沒有資料時維持 3 欄。
- 後台設定（Google Sheet `settings`，key/value）：`settings` 只覆寫**有填寫**的欄位，前台 `applySiteSettings()` 套用到頁首品牌、頁尾、`<title>`／og 標籤（`script.js`）與嵌入版 Hero（`js/embed.js`）；空白欄位＝沿用靜態檔。可用的 key 定義在 `gas/Code.gs` 的 `SETTINGS_FIELDS`，後台表單自動依它產生。
- 後台資料欄位與部署方式見 `admin/README.md`。

### 時間同步

- 後台時間來源：`gas/Code.gs` 的 `getServerTime_()`（`CONFIG.TIMEZONE = Asia/Taipei`）；公開 API 每次回應都會帶上 `serverTime`（`timestamp／iso／date／dateLabel／timeLabel`），且不受資料快取影響。
- 前台：`js/backend.js` 比較 `serverTime.timestamp` 與本地時間算出偏移，之後所有顯示時間都以 `DANA_BACKEND.nowMs()` 為基準；台北時間換算使用固定 UTC+8（`timezoneOffsetMinutes`），不看使用者電腦的時區設定。
- 前台使用後台時間的位置：「今日學習」面板日期、頁尾年份、「最後更新（後台時間）」。
- 後台管理（`gas/Index.html`）：新增／編輯表單的日期預設值呼叫 `getServerTime()`，標題列也會顯示後台時間。
- 舊版 GAS 沒有 `serverTime` 時，`js/backend.js` 會退回解析 `generatedAt`，功能不會中斷；連後台都連不上時才用裝置時間。

### 遠端部署同步（clasp）

- GAS 的程式以 repo 為唯一來源：`gas/Code.gs`、`gas/Index.html`、`gas/appsscript.json` 用 `clasp push -f` 推到 Apps Script，再以 `clasp deploy -i AKfycbz2…` 更新既有 Web App 部署（部署 ID 與網址不變，前端不用改）。
- `gas/appsscript.json` 的 `webapp`（`executeAs: USER_DEPLOYING`、`access: ANYONE_ANONYMOUS`）與 `oauthScopes` 必須保留，否則更新部署會讓公開資料 API 變成需要登入。
- GitHub Pages 由 `.github/workflows/deploy.yml` 發佈 `main` 分支，push 後自動部署，不需要手動操作。
- 步驟、驗證腳本與常見踩坑見 `admin/README.md`「從這個 repo 同步回 Apps Script（clasp）」；公開狀態的檢查方式與紀錄見 `PUBLIC-ACCESS-CHECKLIST.md`。
- 目前 GAS 部署：`AKfycbz2…` **version 4**（2026-09-20，公開 API `schemaVersion 3`）。

