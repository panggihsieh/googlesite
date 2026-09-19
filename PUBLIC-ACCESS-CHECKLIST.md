# 大南老邦教學網 — 公開存取檢查清單

本文件記錄「哪些內容應該公開、公開的開關在哪裡、如何用匿名請求驗證」。

最後檢查日期：`2026-09-20`
對應版本：分支 `main`、commit `cabdb74`（Align homepage shell with new visual navigation）＋工作區變更（後台連結與後台時間同步）

## 1. 原則

1. 網站首頁與一般教材：對所有人公開，不需要登入。
2. 後台管理頁（GAS）與 Google Sheet 資料庫：只允許白名單帳號。GAS 部署因為同時要提供公開資料 API，存取權必須是「任何人」，所以匿名可以「開啟」後台頁面，但只看得到登入畫面，取不到任何資料（白名單在伺服器端檢查）。
3. 公開資料 API 只輸出後台標記為可見的內容（`visible=true`）。
4. 公開儲存庫不放學生個資、密碼、API Key 或私人連結。

## 2. 公開層級總表

| 層級 | 網址 | 應公開 | 匿名實測結果 |
| --- | --- | --- | --- |
| GitHub 儲存庫 | `https://github.com/panggihsieh/googlesite` | 是 | `visibility: public` |
| GitHub Pages 首頁 | `https://panggihsieh.github.io/googlesite/` | 是 | `200`；`pages.public: true`、`https_enforced: true` |
| 主題頁（6 頁） | `https://panggihsieh.github.io/googlesite/pages/*.html` | 是 | `200` |
| 靜態資料 | `https://panggihsieh.github.io/googlesite/data/site-data.js` | 是 | `200` |
| Google Sites 嵌入頁 | `https://panggihsieh.github.io/googlesite/google-sites-embed.html` | 是 | `200` |
| Google Sites 網站 | `https://sites.google.com/view/dana-edu/` | 是 | `200`，無「需要存取權」權限牆 |
| GAS 公開資料 API（同一部署 + `?api=public`） | `https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec?api=public` | 是 | `200`，`application/json` 且含實際資料 |
| GAS 後台入口（首頁／嵌入頁 ⚙️，同一部署不帶參數） | `https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec` | 頁面可開啟／資料否 | 匿名 `200`，但只有登入畫面（標題 `大南老邦教學網｜後台管理`、`login-card`），沒有任何課表／消息／連結資料 |
| Google Sheet 後台資料庫 | 不對外公開 | 否 | 僅後台經 GAS 讀寫 |
| `robots.txt` / `sitemap.xml` | — | 選用 | 目前都 `404`（未建立，但也沒有阻擋搜尋引擎） |

### 判定標準

- 「公開」＝**未登入、無 cookie** 的請求能得到 `200`，且內容不是登入頁或權限要求頁。
- 「不公開」＝匿名請求被拒（`404`、導向登入頁、或顯示需要存取權）。

## 3. 各層公開設定位置

### GitHub 儲存庫

- 位置：repo → `Settings` → `General` → `Danger Zone` → `Change repository visibility`
- 應為：`Public`（Pages 網址免登入可讀的前提）

### GitHub Pages

- 位置：repo → `Settings` → `Pages`
- 應為：Build and deployment 來源 = `GitHub Actions`（實際由 `.github/workflows/deploy.yml` 發佈 `main` 分支根目錄）
- 應為：`Enforce HTTPS` 已勾選
- 發佈時機：每次 push 到 `main` 觸發一次部署，不需要手動操作

### GAS 公開資料 API

- 位置：script.google.com → 該專案 → `部署` → `管理部署作業`
- 應為：執行身分 = `我`、存取權 = `任何人`
- 網址設定檔：`data/site-config.js` 的 `publicApiUrl`（逾時 `apiTimeoutMs`）
- 只提供 `?api=public` 與 `?api=public&callback=...`（JSONP，避開跨網域 CORS）
- 與後台入口是**同一個部署**，只差 `?api=public`
- 回應除了資料外還包含後台時間：`serverTime`（`timestamp／iso／date／dateLabel／timeLabel`，Asia/Taipei）與相容用的 `generatedAt`；`serverTime` 每次請求即時產生，不受 60 秒資料快取影響
- 回應欄位：`today`（今日學習）、`news`（最新消息）、`quickLinks`（快速連結）、`siteLinks`（後台連結管理：導覽列與頁尾連結）、`settings`（後台設定：網站基本資料，只輸出有填寫的欄位），資料類欄位都只輸出 `visible=true` 的內容
- 前台（`js/backend.js`）用 `serverTime.timestamp` 校正時鐘，頁面上的日期一律以後台時間顯示

### GAS 後台管理

- 位置：script.google.com → 該專案 → `部署` → `管理部署作業`
- 網址：與公開資料 API 同一個部署（`AKfycbz2…`），不帶參數時回傳後台畫面
- 應為：執行身分 = `我`、存取權 = `任何人`（公開 API 需要；匿名只會看到登入畫面）
- 白名單：`teacher.hsieh@gmail.com`（其他已登入帳號會看到「此 Google 帳號沒有後台權限。」）
- 白名單與 Sheet 讀寫都在伺服器端（`gas/Code.gs`），前端拿不到資料
- 舊部署 `AKfycbxdJ4…` 已失效（匿名 `404`），不要再使用
- 完整部署步驟見 `admin/README.md`

### Google Sites

- 位置：Google Sites → 右上 `共用` → 一般存取權 = `知道連結的任何人都可以查看`
- 位置：Google Sites → `發布` → 確認網站已發布（嵌入網址只需設定一次）
- 嵌入網址：`https://panggihsieh.github.io/googlesite/google-sites-embed.html`

### 不公開清單（請勿改動）

- GAS 後台頁面本身可公開開啟（因為與公開 API 共用部署）；**白名單與 Sheet 讀寫一律在伺服器端檢查**，請勿為了「藏起來」把部署改成非公開，否則公開 API 會失效。
- Google Sheet `大南老邦教學網_後台資料庫`：維持不公開。
- 儲存庫內不得出現學生個資、密碼、API Key。

## 4. 匿名檢查指令（PowerShell）

以下指令皆使用「未登入」請求，可直接複製執行：

```powershell
# GitHub 儲存庫與 Pages 設定
gh api repos/panggihsieh/googlesite --jq '{visibility,private,has_pages}'
gh api repos/panggihsieh/googlesite/pages --jq '{html_url,status,public,https_enforced,build_type,source}'

# 網站頁面（應全部 200）
$urls = @(
  'https://panggihsieh.github.io/googlesite/',
  'https://panggihsieh.github.io/googlesite/google-sites-embed.html',
  'https://panggihsieh.github.io/googlesite/pages/chinese.html',
  'https://sites.google.com/view/dana-edu/'
)
foreach ($u in $urls) { $r = Invoke-WebRequest $u -SkipHttpErrorCheck -TimeoutSec 25; "$($r.StatusCode) | $u" }

# 公開資料 API（應回 200 application/json 且含資料）
$api = 'https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec?api=public'
$r = Invoke-WebRequest $api -SkipHttpErrorCheck -TimeoutSec 25
"$($r.StatusCode) $($r.Headers['Content-Type'])"
$r.Content.Substring(0, 200)

# 後台入口（與公開 API 同一部署：匿名只會看到登入畫面，不應出現任何資料）
$admin = 'https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec'
$r = Invoke-WebRequest $admin -SkipHttpErrorCheck -TimeoutSec 25 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
"後台匿名：$($r.StatusCode)（200 且標題為「大南老邦教學網｜後台管理」＝只看到登入畫面，符合預期）"
```

驗證結果要點：

- 步驟 1 應為 `public` / `true`。
- 步驟 2 應全部 `200`。
- 步驟 3 應為 `200` 且看到 `{"ok":true,...}`。
- 步驟 4 應為 `200` 且只有登入畫面（標題 `大南老邦教學網｜後台管理`）；若內容出現課表／消息／連結等實際資料，代表白名單檢查失效，須檢查 `gas/Code.gs` 與目前部署版本。

## 5. 故障排除

| 症狀 | 可能原因 | 檢查點 |
| --- | --- | --- |
| Pages 網址出現 `404` | 最近一次部署失敗，或 Pages 來源設定被改動 | `Settings > Pages`、Actions 的 `Deploy to GitHub Pages` 最新一次是否成功 |
| Pages 內容是舊版 | 部署還沒跑完或失敗 | Actions 部署紀錄；push 到 `main` 後等 1 分鐘重新整理 |
| 頁面停在登入畫面 | 儲存庫被改成 Private，或 Pages 被關閉 | 儲存庫可見性、`pages.public` |
| 首頁有畫面但課表／消息是舊資料 | GAS 公開 API 被拒或逾時，前端已回退靜態備援 | 執行上方步驟 3；必要時重新部署公開 API（存取權：任何人） |
| 頁面日期不是今天（例如停在舊年份） | 前台連不到後台，日期回退成靜態備援資料的日期 | 執行上方步驟 3；正常時頁尾會顯示「最後更新：…（後台時間）」，且 `<html>` 有 `data-live-time="true"` |
| 未登入就能看到後台「資料」 | 白名單檢查失效或部署版本過舊 | 匿名開後台網址應只有登入畫面；檢查 `gas/Code.gs` 白名單與目前部署版本 |
| Google Sites 要求存取權 | 共用設定被改成「限制」 | Google Sites → `共用` → 改為「知道連結的任何人都可以查看」 |

## 6. 檢查紀錄

| 日期 | 版本 | 檢查人 | 結果 |
| --- | --- | --- | --- |
| 2026-09-19 | `cabdb74` | AI 助理（匿名請求實測） | GitHub 儲存庫 public、GitHub Pages 200、主題頁 200、嵌入頁 200、Google Sites 200 無權限牆、GAS 公開 API 200 JSON、GAS 後台匿名 404（符合預期） |
| 2026-09-19 | 工作區（後台入口網址修正） | AI 助理（匿名請求實測） | 後台入口改為現行部署 `AKfycbz2…`：匿名 `200` 但只有登入畫面（無任何資料）；舊部署 `AKfycbxdJ4…` 匿名 `404`（已失效）；公開 API `200 application/json`（需瀏覽器 User-Agent，PowerShell 預設 UA 會被擋） |
| 2026-09-20 | 工作區（後台連結＋後台時間同步） | AI 助理（匿名請求＋headless Chrome 實測） | 公開 API `200` 且含資料；`js/backend.js` 以 `serverTime`（舊版則用 `generatedAt`）校正時鐘；首頁／內頁／嵌入頁 headless Chrome 實測 `<html data-live-data="true" data-live-time="true">`、頁尾顯示「（後台時間）」；模擬離線時回退靜態備援且畫面正常 |
| 2026-09-20 | `7a1fa82` | AI 助理 | 修正 `script.js`／`js/embed.js` 的 `todayMetaLabel()`：JSONP 逾時（無法連上後台）時不再退回 `data/site-data.js` 的開發假日期（例如 `2025 年 8 月 30 日（六）`），改為以 `DANA_SITE_CONFIG.timezoneOffsetMinutes`（Asia/Taipei，固定 480 分鐘）算出裝置時間的「今天」，字串格式與後台同步後的 `BACKEND.dateLabel()` 一致；無論後台是否連得上，「今日學習」面板日期一律顯示為當下 Asia/Taipei 的今天。 |


