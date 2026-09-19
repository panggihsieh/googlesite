# CHANGELOG — 大南老邦教學網

## 2026-09-19 — 首頁版面依設計圖全面對齊（配色、卡片、面板、快速連結方框）

- 設計依據：`layout.png`（1672×941）。比對方式：把設計圖與 headless Chrome 截圖都跑同一組量測程式（色彩連通元件方框、掃描線顏色變化點、逐區塊 OCR），逐項比對座標後修正。修正後主要區塊與設計圖的誤差都在 4px 以內。
- 配色（`style.css`）：`body[data-page="index"]` 改為藍色系主題（沿用頁首 `#0d3975`／`#147cf4`），並定義設計圖量到的專用色 `--index-blue: #147cf4`（按鈕）、`--index-box: #e7f4fc`（快速連結方框）、`--index-block: #f5fafd`（課程區塊）、`--index-block-head: #dff2fd`（課程表頭）。儀表板區底色為 `#f6f8fb`。
- 版位（`style.css`）：
  - 內容寬度改為「視窗寬度 − 26px×2」（`--gutter: 26px`、`--maxw: 1700px`），對齊設計圖卡片外緣 x=26..1644。
  - 頁首總高 88px → 92px（含下框線 93px），Hero 起點與設計圖一致（y=93）。
  - 主題卡片區上下留白 17px／3px、儀表板區 14px／26px；面板內距 19px、圓角 20px、欄距 26px、欄寬比 1.164 : 1.071 : 1（設計圖 560／515／481px）。
- 主題卡片（`style.css`＋`data/site-data.js`）：改為設計圖的樣式——整張主題淺色底、內容置中（圖示 58px、主題 27px、說明與補充 19px），卡片 256×205px、間距 16px。`subjects` 新增 `tint`（卡片底色）與 `ink`（卡片文字色）兩個欄位，六張卡片的實際色票取自設計圖。
- 今日學習面板（`script.js`＋`style.css`）：新增面板標題的藍色線條圖示（`PANEL_ICONS`，日曆／擴音器／連結，行內 SVG）、淺藍課程區塊（表頭「本週課程」42px＋四列各 42px）、科目徽章（底色為主題淺色、文字為主題深色，例如國語＝淺紅底深紅字），以及面板底部的藍色滿版按鈕「開始今天的學習」（`today.cta`，521×40px，預設連到第一節課）。
- 最新消息面板：標題列下方加分隔線，列高 53px，日期欄固定 160px（對齊設計圖標題一律從 x=802 開始），並移除列內的「分類標籤」（設計圖沒有這個元素）。可視則數由 3 則改為 5 則（設計圖顯示 5 則）；「更多 ›」改為只有超過 5 則時才出現（目前資料剛好 5 則，因此不顯示），顏色改為藍色。
- 快速連結面板：由單欄清單改為設計圖的 **2 欄方框**（每格約 217×78px、淺藍底、間距 13/11px、圖示 46px）。`quickLinks` 依設計圖順序調整（Classroom／雲端硬碟／表單／GeoGebra／Scratch／Tinkercad／因材網／教育雲），並新增 `note` 副標欄位（GeoGebra＝數學工具、Scratch＝程式設計、Tinkercad＝3D 設計）。
- 清理：`style.css` 移除首頁不再使用的 `.course-period`、`.course-body`、`.news-body .tag` 與主題卡片頂部色條 `.subject-card::before`（Google Sites 嵌入版走 `css/embed.css`，不受影響）。
- 驗證：
  - 1672×1300 截圖量測：卡片 x=26..1644／y=392..597、課程區塊 y=681..894、藍色按鈕 y=905..944、快速連結方框 x=1181..1396／1410..1625、消息列分隔線 735／789／843／898，與設計圖對應值誤差 ≤ 4px。
  - `--dump-dom` 確認首頁已渲染 6 張主題卡片、1 個課程區塊、1 個 `panel-cta`、3 個 `quick-note`、5 筆消息、8 個快速連結方框。
  - 由臨時診斷頁（document.scrollWidth vs innerWidth）確認 520／700／1000／1200／1672px 都沒有橫向溢出；`pages/chinese.html` 與 `google-sites-embed.html` 回歸正常。
- 仍與設計圖不同（已評估、暫不調整）：導覽列字級與間距（本站約比設計圖窄 9%，且上一版已依另一張頁首參考圖調過）、主題卡片的 emoji 圖示比設計圖的插圖小、面板左右邊界比設計圖內縮約 3px（本站讓面板與主題卡片對齊同一容器）。

## 2026-09-19 — 首頁版面依設計圖調整（移除設計圖上沒有的區塊）

- 設計依據：`layout.png`（1672×941，與先前裁切 Hero 橫幅的是同一張設計圖）。比對方式：把設計圖與本機首頁截圖都做「水平區段 → 區段內欄位」切分，再逐格以 Windows OCR 與像素掃描量測，逐項修正差異。
- `index.html`：移除「六大主題入口」區塊標題與副標（設計圖的 Hero 底下直接是六張主題卡片，沒有區塊標題；設計圖 Hero 底部 y=375 → 卡片頂端 y=387）。
- `index.html`：移除「教師專區／關於大南」整個區塊（設計圖首頁只看到頁首、Hero、六大主題卡片、今日學習／最新消息／快速連結）。
- `script.js`：移除 `renderTeacher()`、`renderAbout()` 與 `init()` 中的呼叫；`renderSubjects()` 移除卡片底部的「前往 →」列（設計圖卡片內容只有圖示、主題、說明與補充關鍵字，卡片高約 230px）。
- `data/site-data.js`：移除已不再使用的 `teacher`、`about` 兩組資料。
- `style.css`：移除連帶失效的 `.subject-more`、`.split`、`.info-block`、`.link-grid`、`.fact`／`.fact-label`／`.fact-value` 樣式，以及響應式段落中對它們的引用。
- 版面量測對齊（設計圖內容寬約 1620px、卡片一列 6 張、每張約 255px、間距約 16px；卡片與面板都緊接 Hero）：
  - 首頁容器寬度改為 1560px（`body[data-page="index"] { --maxw: 1560px }`），與 Google Sites 嵌入版同寬。
  - `.subject-grid` 在 `min-width: 1400px` 改為一列 6 張；1400px 以下維持 3 欄、680px 以下維持單欄。
  - 新增 `.section-subjects`／`.section-dashboard`：首頁卡片區與面板區的上下留白縮為 18～22px（設計圖 Hero→卡片約 12px、卡片→面板約 14px）。
- 驗證：headless Chrome 1672×941 截圖比對後，頁面結構（頁首 → Hero → 一列 6 張主題卡片 → 今日學習／最新消息／快速連結）與設計圖一致；`--dump-dom` 確認 6 張主題卡片、8 筆快速連結，且頁面已無 `section-head`、`teacher-content`、`id="about"` 節點。
- 仍與設計圖不同、留待確認的項目：首頁配色仍為綠色系（設計圖為藍色系，嵌入版已是藍色系）、首頁快速連結是單欄清單（設計圖是面板內 2×4 的方框）、Dashboard 三欄寬度比例、以及設計圖「今日學習」面板底部的「開始今天的學習」按鈕（連結目標未定，先不加）。
- 導覽列「教師專區」「關於大南」保留（設計圖頁首有這兩個項目），但首頁已無對應區塊；目前點擊只會回到頁首，若要改成獨立頁面或改連其他位置，再另外處理。

## 2026-09-19 — 後台入口網址修正（改用現行 GAS 部署）

- 首頁與嵌入版 ⚙️ 原本指向的 `AKfycbxdJ4…` 部署已失效（匿名請求回 `404`），改用現行部署 `AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo`：`index.html`、`google-sites-embed.html` 兩處同步更新。
- 該部署同時提供兩種用途：不帶參數＝**後台管理畫面**（`<title>大南老邦教學網｜後台管理</title>`、`login-card`），加上 `?api=public`＝**公開資料 API**；與 `data/site-config.js` 的 `publicApiUrl` 是同一個部署。
- `data/site-config.js` 補充註解：說明兩種用途，以及換部署時要同步更新的三個位置。
- `PUBLIC-ACCESS-CHECKLIST.md` 依實測改寫：後台入口匿名為 `200` 但只會看到登入畫面、取不到任何資料（白名單檢查在 `gas/Code.gs` 伺服器端），不再是「匿名 404」。
- 位置沿用上次實作：首頁 Hero 橫幅右上角 ⚙️（44px／手機 40px、`@media print` 隱藏）。

## 2026-09-19 — 首頁網址正規化為 /googlesite/

- 直接開啟 `https://panggihsieh.github.io/googlesite/index.html` 時，網址列改寫為 `https://panggihsieh.github.io/googlesite/`：以 `history.replaceState` 置換 `index.html`（保留 `?query` 與 `#hash`，不重新載入、不閃爍）。
- `index.html` 新增 `<link rel="canonical" href="https://panggihsieh.github.io/googlesite/">` 與 `og:url`，避免搜尋引擎把兩種網址視為重複內容。
- `script.js` 新增 `pageHref()`：資料檔中的 `index.html`（含 `index.html#teacher`、`index.html#about` 形式）一律輸出資料夾網址（首頁 `./`、內頁 `../`）。品牌標誌、導覽列「首頁」、最新消息連結都不再產生 `index.html`。
- `js/embed.js` 新增 `siteHref()`：GAS 公開資料或 `data/embed-data.js` 若給 `index.html`，嵌入版同樣輸出 `./`（例如最新消息「大南老邦教學網新版首頁上線」連到 `index.html`）。
- `pages/*.html`（六頁）麵包屑「首頁」連結由 `../index.html` 改為 `../`。
- GitHub Pages 沒有伺服器端轉址，因此採客戶端改寫；`/googlesite/` 本來就會由 Pages 自動對應 `index.html`，改寫後重新整理仍是 `200`。

## 2026-09-19 — 首頁加上後台管理入口

- `index.html` 的 Hero 橫幅右上角新增 ⚙️「後台管理」入口，連到與 Google Sites 嵌入版相同的 GAS 後台 Web App（`target="_blank"`、`rel="noopener"`）。
- `style.css` 新增 `.admin-entry`：44px 白色半透明圓形、`backdrop-filter: blur(8px)`、focus-visible 與 hover 回饋；`< 700px` 縮為 40px 並改貼右上 12px。
- `.hero-banner` 設為 `position: relative`，讓入口浮貼於橫幅右上角（不影響橫幅圖片版面）。
- `@media print` 一併隱藏 `.admin-entry`（與頁首／頁尾一致）。
- 後台網址沿用既有部署：匿名開啟回 `404`，未登入不可存取，符合白名單設計（見 `PUBLIC-ACCESS-CHECKLIST.md`）。
- 文件同步：`PROJECT.md` 修改對照表新增「後台管理入口網址」與兩張橫幅圖列；`PUBLIC-ACCESS-CHECKLIST.md` 後台入口欄位改為「首頁／嵌入頁 ⚙️」。

## 2026-09-19 — 嵌入版 Hero 圖片改用設計圖照片

- Google Sites 嵌入版 `css/embed.css` 的 Hero 背景由 `assets/images/hero-campus.svg` 改為 `assets/images/embed-hero-banner.jpg`。
- 圖片來源：`layout.png` 設計圖 Hero 區塊中的照片區域（x=640～1672、y=96～376），裁切為 `1032×280`、JPEG 品質 90、約 104KB。
- 設計圖 Hero 的文字（標題／副標／關鍵字）位於 x=18～622，故裁切起點取 x=640，避免把設計圖文字烘焙進背景圖。
- 背景定位改為 `right bottom / cover`：寬版視窗優先保留校舍與右側「大南國小」校牌；窄版（< 700px）顯示位置由 `68%` 調整為 `88%`，讓校牌落在畫面內。
- 嵌入版 Hero 的 HTML 文案（`#hero-title`／`#hero-lead`／`#hero-keywords`）維持不變，文字仍由 `data/site-config.js` 與 GAS 公開資料 API 供應。
- `assets/images/hero-campus.svg` 保留，但已不再被任何頁面引用。

## 2026-09-19 — 首頁橫幅改用設計圖圖片

- 首頁 Hero 橫幅由 `assets/images/home-hero-banner.svg` 改為 `assets/images/home-hero-banner.jpg`。
- 圖片來源：`layout.png` 設計圖的 Hero 區塊（滿版寬 1672px、y=96～375），裁切為 `1672×280`、JPEG 品質 92、約 175KB。
- `index.html` 的橫幅 `alt` 依實際畫面改為「大南老邦教學網。大南國小高年級數位學習 × AI × 探究實作。閱讀世界、探索自然、擁抱科技、創造未來。」。
- 以 headless Chrome 將本機首頁截圖比對設計圖，Hero 文字位置完全對應。
- `assets/images/home-hero-banner.svg` 保留，但已不再被任何頁面引用。

## 2026-09-19 — 公開存取檢查清單

- 新增 `PUBLIC-ACCESS-CHECKLIST.md`：公開層級總表、各層公開開關位置、匿名驗證指令與故障排除。
- 以匿名請求（未登入、無 cookie）實測：GitHub 儲存庫 `public`、GitHub Pages `200`、主題頁 `200`、Google Sites `200` 無權限牆、GAS 公開 API `200 application/json`、GAS 後台匿名 `404`（符合白名單設計）。
- `README.md` 專案文件區補上本清單連結。

## 2026-09-19 — GAS 動態資料 API

- GAS `Code.gs` 新增 `?api=public` 唯讀公開資料端點。
- 公開 API 只回傳 `visible=true` 的「今日學習／最新消息／快速連結」。
- API 支援 JSON 與 JSONP；GitHub Pages 使用 JSONP 避免跨網域 CORS 問題。
- 後台新增、修改、刪除、顯示切換時會立即清除公開資料快取。
- GitHub Pages 首頁改為「靜態資料先顯示 + GAS 最新資料覆寫」模式。
- 若 GAS API 暫時無法連線，網站會自動保留 GitHub 靜態備援資料。
- 新增 `DANA_SITE_CONFIG.publicApiUrl` 作為公開 Web App API 網址設定。

## 2026-09-19 — 首頁橫幅更新

- 將首頁導覽列下方 Hero 改為「學習 × 探究 ×」圖像橫幅。
- 保留「大南國小高年級數位學習 × AI × 探究實作」與四個學習關鍵字。
- 新增 SVG 橫幅資產與手機版響應式顯示。


所有重要修改集中記錄於此。

## 2026-09-19 — 正式專案化

### 新增
- 建立 `PROJECT.md` 正式專案規格。
- 建立 `CHANGELOG.md`。
- 新增 `css/embed.css`，將 Google Sites 嵌入版 CSS 從單一 HTML 拆出。
- 新增 `js/embed.js`，將嵌入首頁的渲染邏輯拆出。
- 新增資料分離架構：
  - `data/site-config.js`
  - `data/subjects.js`
  - `data/courses.js`
  - `data/news.js`
  - `data/links.js`
  - `data/embed-data.js`

### 變更
- `google-sites-embed.html` 改成穩定的版面骨架，不再把大量 CSS、內容與 JavaScript 混在同一檔。
- Google Sites 繼續負責外層主導覽。
- 桌機 iframe 寬度 >= 900px 時，六大主題固定一排六張。
- 快速連結增加「需登入／公開資源」提示。
- 首頁維持公開，不自行保存帳密。

### 保留
- `data/site-data.js` 暫時保留，供既有 `index.html` 與 `pages/*.html` 使用，避免破壞原完整版網站。

## 2026-09-19 — Google Sites Embed v2

- 隱藏嵌入頁重複 Header / Footer。
- Hero 改為校園橫幅風格。
- 六大主題改為大型卡片。
- Dashboard 改為今日學習／最新消息／快速連結。
- 隱藏視覺捲軸但保留滑鼠滾輪與觸控捲動。
- 新增 `assets/images/hero-campus.svg`。

## 2026-09-19 — 初始 Google Sites 最佳化

- 修正 iframe 橫向溢出。
- 改善 iPad 與手機響應式。
- 減少 Hero 上下留白。
