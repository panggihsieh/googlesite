# CHANGELOG — 大南老邦教學網

## 2026-09-20 — 後台設定新增欄位「網站描述」（頁尾說明）

> 需求：後台新增「網站描述」輸入欄位，控制頁尾第二段（學校與年級下方）的說明文字；原本是 `data/site-data.js` 的靜態字串，後台無法編輯。

- `gas/Code.gs` 的 `SETTINGS_FIELDS` 新增：
  - `site_description`：label=`網站描述`、group=`頁尾說明`（新分組）、type=`textarea`、placeholder 帶入內建文字、hint 說明「出現在頁尾、學校與年級下方的說明段落；留空時沿用資料檔的內建文字」。
- `script.js` 的 `applySiteSettings()` 在 `SITE[*]` 覆寫完之後新增一段分支：trim 後非空就把 `settings.site_description` 寫入 `DATA.footer.note`；空值或省略鍵時保留 `data/site-data.js` 的內建 `footer.note`。後面的 `renderFooter()` 讀 `DATA.footer.note`，會一併重新輸出。
- 後台「後台設定」頁會自動多一個新分組「頁尾說明」與一個 textarea 欄位（由 `SETTINGS_FIELDS` 自動驅動，不需改 `gas/Index.html`）。
- 文件：CHANGELOG（本筆）、`PUBLIC-ACCESS-CHECKLIST.md` §6 補一筆。

## 2026-09-20 — 後台設定（輸入欄位）：網站基本資料改由後台管理並同步前台

> 需求（選項 4）：後台以「設定輸入欄位」管理網站基本資料（原本只存在 `data/site-config.js`／`data/site-data.js`，後台改不到）

- 新增 Google Sheet 工作表 `settings`（`key`／`value`／`updated_at`，key‑value 兩欄式）：
  - `gas/Code.gs` 新增 `CONFIG.SHEETS.SETTINGS`、`SHEET_HEADERS.settings`、`SETTINGS_FIELDS`（欄位定義的唯一來源）與 `getSettings()`／`saveSettings()`；`getBootstrapData()` 帶回 `settings` 與 `settingsFields`，公開 API 新增 `settings` 欄位（只輸出有填寫的欄位）。
  - 存檔只接受 `SETTINGS_FIELDS` 的 key、值會 trim 並限制 600 字；既有列就地更新、缺少的 key 自動補列，Sheet 上手動新增的其他 key 不會被清掉。
  - 儲存後清除公開資料快取；`PUBLIC_SCHEMA_VERSION` 2 → 3（回應多了 `settings`，順便讓舊快取立即失效）。
- 後台畫面（`gas/Index.html`）：
  - 側邊選單新增 `⚙️ 後台設定`；儀表板新增第 5 張統計卡（已設定欄位數）與第 5 張快速操作卡（`⚙️ 編輯後台設定`）。
  - 設定頁是**輸入欄位表單**（不是 CRUD 表格）：欄位依 `group` 分組（網站基本資料／首頁橫幅（Hero）），單行 `input`、多行 `textarea`，附 placeholder 與說明，右上角「儲存設定」／「還原變更」。
  - 欄位定義來自 `getBootstrapData()` 的 `settingsFields`，之後要新增或調整設定欄位，只要改 `gas/Code.gs` 的 `SETTINGS_FIELDS`，後台表單會自動跟著長出來。
  - CSS 補上 `.field textarea`、`.settings-group`、`.teal`（第 5 張統計卡色）。
- 前台（`script.js`、`js/embed.js`）：
  - 新增 `applySiteSettings(settings)`：只覆寫有填寫的欄位（`site_name`→`site.name`、`school`、`school_en`、`grade`、`tagline`、`description`、`hero_title`、`hero_lead`、`keywords`（以「、」或逗號分隔→陣列）），空白欄位一律沿用靜態檔。
  - `script.js` 套用後重繪頁首／頁尾，並用 `applySiteTitle()` 把 `<title>`／`og:title`／`og:description` 裡的舊名稱與標語換成後台設定（找不到就維持原樣）；`js/embed.js` 套用後重繪 Hero（`#hero-title`／`#hero-lead`／`#hero-keywords`）。
  - 首頁橫幅是設計圖（文字已畫在圖上），所以 Hero 文案的後台設定套用在 Google Sites 嵌入版；後台設定頁有提示文字說明。
- 文件：`PROJECT.md`（結構、對照表、§11）、`README.md`（對照表）、`admin/README.md`（功能、工作表、後台畫面、公開 API 範例）、`PUBLIC-ACCESS-CHECKLIST.md`（公開 API 欄位）、`data/site-config.js`／`data/site-data.js`（註解說明後台設定可覆寫）。
- 驗證：
  - `node --check`：`script.js`、`js/embed.js`、`js/backend.js`、`data/site-data.js`、`data/site-config.js`、`gas/Code.gs`、`gas/Index.html` 內嵌腳本全部通過。
  - 後台（假 `google.script.run`，`settings` 4 項有值）：統計卡 5 張（`2／1／1／1／4`）、快速操作卡 5 張、側邊選單 7 項；「後台設定」頁兩個分組、9 個欄位（label／name 對應正確、`description` 與 `hero_lead` 為 textarea）、4 個欄位帶入既有值、其餘顯示 placeholder；改 `tagline` 送出後表單重新渲染為新值（儲存往返成功）。
  - 前台（本機 headless Chrome 注入 `settings`）：`<title>`＝`大南老邦學習網 ｜ 大南國小高年級數位學習`、`og:title`／`og:description` 同步更新；頁首品牌＝`大南老邦學習網`＋新標語、頁尾＝`大南國民小學・高年級科技學習｜後台設定測試簡介`、頁尾版權列同步；`data-live-data`／`data-live-time` 皆為 `true`。
  - 嵌入版：`#hero-title`＝`後台設定的橫幅標題`、`#hero-lead`＝`後台設定的橫幅副標`、`#hero-keywords`＝三顆標籤（由 `閱讀世界、探索自然、擁抱科技` 切出）、`<title>` 同步更新。

## 2026-09-20 — 新增後台模組「後台連結管理」（導覽列／頁尾連結）

> 需求：在側邊選單新增一個資料模組「後台連結管理」，管理頁尾／導覽列的連結（原本只存在 `data/site-data.js`，後台改不到）

- 新增 Google Sheet 工作表 `site_links`（欄位 `id, area, group, label, icon, href, visible, sort_order, updated_at`）：
  - `gas/Code.gs` 的 `SHEETS.SITE_LINKS`、`SHEET_HEADERS`、`getEntityDef_`、`normalizeRecord_`、`getBootstrapData`、公開 API 同步支援；公開 API 新增 `siteLinks` 欄位（只回傳 `visible=true`），儲存／刪除／切換顯示都會清除公開資料快取。
  - `area=nav` → 前台導覽列；`area=footer` → 前台頁尾連結（用 `group` 可分多欄）。
  - `getSheet_()` 改為**缺少工作表時自動建立**（依 `CONFIG.SHEET_HEADERS` 寫入標題列），避免少一個分頁就讓後台整頁讀不到資料，也讓新模組免手動建分頁。
- 後台畫面（`gas/Index.html`，沿用 `admin.png` 的版面與樣式）：
  - 側邊選單新增 `🔖 後台連結管理`；儀表板新增第 4 張統計卡（導覽列／頁尾連結筆數）與第 4 張快速操作卡（`＋ 新增後台連結`）。
  - 管理頁表格欄位：`位置（導覽列／頁尾）｜分組｜名稱｜圖示｜連結｜排序｜顯示｜操作`；表單可設定位置、分組、名稱、圖示、排序、顯示與連結。
  - 統計卡與快速操作卡改用 `repeat(auto-fit, minmax(...))`，3 個或 4 個模組都維持同一種卡片外觀；< 960px 時表單改單欄。
- 前台（`script.js`／`style.css`）：
  - `applyLiveData()` 收到 `siteLinks` 後呼叫 `applySiteLinks()`：
    - `area=nav`：與 `data/site-data.js` 的內建選單**合併**（同名覆寫、新的名稱附加在後）後重繪導覽列；後台沒有 nav 資料時完全維持內建選單。
    - `area=footer`：渲染成頁尾的後台連結欄（依 `group` 分組，預設「相關連結」），外部連結自動加 `target="_blank" rel="noopener"`。
  - 頁尾只有在有後台連結時才加上 `.footer-grid.has-extra`（4 欄）；沒有後台連結時維持原本 3 欄外觀（`style.css` 同步補上 1180px／680px 響應式規則）。
  - `renderHeader()` 會重新綁定選單與搜尋，因此把搜尋面板的文件層級監聽（Esc 關閉、點擊外部關閉）拆到 `setupHeaderSearchGlobal()`，只在 `init()` 綁定一次，避免重複綁定累積。
  - 導覽列圖示可用後台設定的 emoji（`siteLinks[].icon`），未設定時沿用內建對照表。
- 文件：`PROJECT.md`（結構加入 `gas/`、對照表、§11 補上本模組）、`README.md`（結構與對照表）、`admin/README.md`（功能、工作表、後台畫面說明）、`PUBLIC-ACCESS-CHECKLIST.md`（公開 API 欄位）。
- 驗證：
  - `node --check`：`script.js`、`data/site-data.js`、`gas/Code.gs`、`gas/Index.html` 內嵌腳本全部通過。
  - 前台（本機 headless Chrome，注入模擬 `siteLinks`）：`<html data-live-data="true" data-live-time="true">`；導覽列 10 項＝內建 9 項 ＋ 後台新增的 `英語`（`數學` 被後台同項覆寫、沒有重複）；頁尾出現 `footer-grid has-extra`，多出 `相關連結`（大南國小、因材網）與 `學習資源`（教育雲）兩欄。
  - 後台（假 `google.script.run`，`site_links` 3 筆）：統計卡 4 張（`4／5／8／3`）、快速操作卡 4 張、側邊選單 6 項；切到 `後台連結管理` 後表頭與三列資料正確（`導覽列／—／英語／🔤／pages/env.html`、`頁尾／相關連結／大南國小`、`頁尾／學習資源／教育雲`），`visible=false` 的那列開關未勾選（頁面 20 個開關中 18 個已勾選）；新增表單位置預設 `導覽列`、分組預設 `相關連結`、顯示預設 `是`。

## 2026-09-20 — 後台管理畫面依設計圖重建（admin.png）

> 需求：後台管理畫面遵守設計圖 `admin.png` 的內容與風格，若後續新增模組也要類似

- 依 `admin.png`（1536×1024，含登入頁／側邊選單／儀表板／三個管理頁）重建 `gas/Index.html`，並在檔案頂端加上「新增模組請沿用同一套版面、色票與樣式」的註解。
- 登入畫面改為設計圖的內容：`大南老邦教學網`／`Da-Nan Elementary School`／`🌿 後台管理系統`／`登入後即可管理今日學習、最新消息、快速連結等內容`／`管理者登入`／`Google 帳號`（顯示目前帳號）／`登入狀態`（未授權顯示紅色標記）／`使用 Google 帳號登入／重新檢查`／`網站預覽`／`使用說明`（可展開）。
- 側邊選單：品牌 `🌿 大南老邦教學網／後台管理系統` ＋ `首頁儀表板／今日學習／最新消息／快速連結`；下方新增「系統」區：`使用說明`、`網站預覽（前台首頁）`、`Google Sites 網站`。
- 儀表板：`歡迎回來！` 歡迎卡（說明修改後會同步到前台）＋ 三張統計卡（今日學習／最新消息／快速連結，各附 `前往管理 →`）＋ `快速操作` 三張說明卡（新增今日學習／最新消息／快速連結）。
- 管理頁：標題改為 `今日學習管理／最新消息管理／快速連結管理`，並在標題旁補上用途說明；表格維持 `顯示` 開關與 `✏️ 編輯／🗑️ 刪除`、`＋ 新增`；沒有資料時顯示「目前沒有資料」提示列。
- 後台時間：右上角顯示 `後台時間：2026-09-20 07:20:00（Asia/Taipei）`、後台日期 `2026 年 9 月 20 日（日）` 與 `今天也一起努力！`；新增表單的日期預設值仍取自後台時間。
- 響應式：< 960px 時側邊選單改為上方區塊、統計卡與快速操作改單欄；列印時隱藏側邊選單與操作按鈕。
- 驗證：
  - `node --check`（抽出內嵌 `<script>` 後檢查）通過。
  - 以假的 `google.script.run`（假資料 4／5／8 筆，與設計圖數字一致）在本機 headless Chrome（`--dump-dom --virtual-time-budget=2500`）渲染五種狀態：
    - 儀表板：統計卡 `4／5／8`、`後台時間：2026-09-20 07:20:00（Asia/Taipei）`、日期 `2026 年 9 月 20 日（日）`、`快速操作` 3 張卡、側邊選單 5 項。
    - 今日學習管理：表頭 `節次｜領域｜課程名稱｜日期｜顯示｜操作`，4 列課程；`visible=false` 的那一列開關未勾選，其餘 16 個開關已勾選。
    - 新增最新消息：表單標題 `新增 最新消息`，日期預設值 `09/20`（後台時間）。
    - 使用說明：切換後顯示說明面板（登入白名單、三個模組、同步方式、後台時間）。
    - 非白名單帳號：顯示登入畫面，`Google 帳號：guest@gmail.com`、`登入狀態：未授權`、提示改用白名單帳號。

## 2026-09-20 — 全站與後台連結 ＋ 時間改用後台時間同步

> 需求：① 必須與後台連結（`AKfycbz2…/exec`）② 時間必須使用後台時間做同步 ③ 首頁原本沒有後台連線、日期是寫死的

- 新增 `js/backend.js`：前台共用的「後台連線 ＋ 後台時間同步」模組。
  - 以 JSONP 讀取 GAS 公開資料 API（`DANA_SITE_CONFIG.publicApiUrl` 加上 `?api=public&callback=…`），逾時沿用 `apiTimeoutMs`（8 秒），失敗只印警告不影響畫面。
  - 以後台回傳的 `serverTime.timestamp` 計算前端時鐘偏移（以請求送出／回應的中間點扣掉網路往返），提供 `todayIso()／dateLabel()／timeLabel()／year()／generatedAt()／onSync()／load()`。
  - 日期換算使用後台時區固定偏移（`timezoneOffsetMinutes: 480`；Asia/Taipei 沒有日光節約時間），**不依賴使用者電腦的時區或時間設定**。
  - 相容舊版 GAS：沒有 `serverTime` 時退回用 `generatedAt` 字串換算，因此 GAS 還沒重新部署也能生效。
- 首頁與內頁改為與後台連結：`index.html`、`pages/*.html`（6 頁）都載入 `data/site-config.js` 與 `js/backend.js`；`script.js` 新增 `connectBackend()`／`applyLiveData()`，先顯示 GitHub 靜態資料，連上後台後用 Google Sheet 最新資料覆寫「今日學習／最新消息／快速連結」，並在 `<html>` 標記 `data-live-data="true"`。
  - 覆寫時保留只有靜態檔才有的欄位：課程「開始今天的學習」CTA（`today.cta`）與快速連結副標（`quickLinks[].note`，以名稱比對後合併）。
  - 連不到後台（離線、API 逾時或被拒）時維持 GitHub 靜態備援資料，`data-live-*` 不會出現，畫面不中斷。
- 時間一律以後台為準：
  - 首頁與嵌入版的「今日學習」面板日期改由 `DANA_BACKEND.dateLabel()` 產生（例：`2026 年 9 月 20 日（日）`），連不到後台才退回資料檔的 `dateLabel`。
  - 頁尾年份改用後台時間的年；連上後台後「最後更新」顯示後台資料時間並標記來源：`最後更新：2026-09-20 06:59:25（後台時間）`（`#footer-updated[data-source="backend"]`）。
- `js/embed.js`：JSONP 載入與時間同步改為呼叫共用模組（移除重複的載入程式），`#today-meta` 同樣以後台時間為準。
- `gas/Code.gs`：
  - `PUBLIC_SCHEMA_VERSION` 1 → 2。
  - 新增 `getServerTime_()` 與公開函式 `getServerTime()`，回傳 `{ timezone, timestamp, iso, date, dateLabel, timeLabel, weekday }`（Asia/Taipei）。
  - 公開 API 每次回應都即時加上 `serverTime`（並保留 `generatedAt` 給舊前端）；60 秒快取只快取資料、不再快取時間，避免前台拿過期時間當校正基準。
- `gas/Index.html`（後台管理）：
  - 標題列顯示「後台時間：2026-09-20 06:59:25（Asia/Taipei）」。
  - 新增資料的日期預設值改用後台時間（`todayIso()`／`todayMd()` 讀 `getServerTime()`），避免老師電腦時間設錯時寫入錯誤日期；取得失敗時才暫用電腦時間並在畫面註明。
- `data/site-config.js`：新增 `timezone: "Asia/Taipei"`、`timezoneOffsetMinutes: 480`，並補註解說明前台兩種用途（資料覆寫、時間校正）都走同一個部署。
- `data/site-data.js`：檔案定位改為「靜態備援資料」（原註解寫「MVP 第一版不使用後端」）；頁尾說明由「不須登入、沒有後端」改為「內容由後台（Google Sheet + Apps Script）同步，瀏覽不需要登入」。
- 驗證：
  - `node --check`：`script.js`、`js/backend.js`、`js/embed.js`、`data/*.js`、`gas/Code.gs`、`gas/Index.html` 內嵌腳本全部通過。
  - `js/backend.js` 邏輯測試（Node 臨時測試腳本，23 項全數 PASS）：JSONP URL 組裝、回呼與 script 清理、`onSync` 通知、`serverTime` 與舊版 `generatedAt` 兩種來源的日期／時間換算、時鐘偏移量、逾時錯誤回報。
  - `python -m http.server 8123` ＋ headless Chrome（`--dump-dom --virtual-time-budget=9000`）：
    - `index.html` → `<html lang="zh-Hant" data-live-time="true" data-live-data="true">`；面板日期 `2026 年 9 月 20 日（日）`（靜態檔為 `2025 年 8 月 30 日（六）`）；頁尾 `© 2026` 與 `最後更新：2026-09-20 06:59:25（後台時間）`；消息 4 筆（後台）＋ 3 個快速連結副標（合併保留）。
    - `google-sites-embed.html` → `#today-meta` = `2026 年 9 月 20 日（日）`。
    - `pages/chinese.html` → 頁尾 `（後台時間）`、4 張學習重點卡片正常。
    - 模擬離線（`--host-resolver-rules="MAP script.google.com 127.0.0.1"`）→ 無 `data-live-*`、面板日期與頁尾回到靜態備援（`2025 年 8 月 30 日（六）`、`data-source="static"`）、5 筆靜態消息，畫面不中斷。
  - 註：目前線上 GAS 仍是舊版（回應沒有 `serverTime`），上述驗證走的是 `generatedAt` 相容路徑；把新的 `gas/Code.gs` 貼回專案並重新部署後即改用 `serverTime.timestamp`。

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
