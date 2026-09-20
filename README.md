# 大南老邦教學網

大南國小高年級數位學習網站。  
正式入口使用 Google Sites，互動首頁與教材內容部署於 GitHub Pages。

## 正式網址

- Google Sites：`https://sites.google.com/view/dana-edu/`
- GitHub Pages：`https://panggihsieh.github.io/googlesite/`
- Google Sites 嵌入首頁：`https://panggihsieh.github.io/googlesite/google-sites-embed.html`

## 目前架構

首頁與內頁會先顯示 GitHub 上的靜態資料，再由 `js/backend.js` 與後台（GAS 公開資料 API）連線：
資料以 Google Sheet 最新內容覆寫，日期與時間則以後台時間校正（連不到後台時維持靜態備援）。

```text
googlesite/
├─ index.html
├─ google-sites-embed.html
├─ style.css
├─ script.js
├─ css/
│  └─ embed.css
├─ js/
│  ├─ backend.js
│  └─ embed.js
├─ data/
│  ├─ site-data.js
│  ├─ site-config.js
│  ├─ subjects.js
│  ├─ courses.js
│  ├─ news.js
│  ├─ links.js
│  └─ embed-data.js
├─ pages/
├─ gas/
│  ├─ Code.gs
│  ├─ Index.html
│  ├─ appsscript.json
│  ├─ .clasp.json        # clasp 專案設定（同步到 Apps Script 用）
│  └─ .claspignore
├─ admin/
│  └─ README.md
├─ assets/
├─ PROJECT.md
└─ CHANGELOG.md
```

## 日後最常修改的檔案

| 要修改什麼 | 檔案 |
| --- | --- |
| 網站名稱、Hero 標題、關鍵字 | `data/site-config.js`（後台「⚙️ 後台設定」可覆寫） |
| 後台公開資料 API 網址、逾時、後台時區 | `data/site-config.js` |
| 前台與後台的連線、後台時間同步邏輯 | `js/backend.js` |
| 六大主題卡片 | `data/subjects.js` |
| 今日學習 | `data/courses.js` |
| 最新消息 | `data/news.js` |
| 快速連結與登入提示 | `data/links.js` |
| Google Sites 嵌入版外觀 | `css/embed.css` |
| 嵌入版程式 | `js/embed.js` |
| 後台管理畫面（登入頁／選單／儀表板／管理頁） | `gas/Index.html`（依設計圖 `admin.png`，新增模組要沿用同一套樣式） |
| 後台程式推到 Apps Script、更新正式 Web App 部署 | `gas/` ＋ `clasp push -f`／`clasp deploy -i`（步驟見 `admin/README.md`） |
| 後台資料欄位、白名單、公開資料 API、後台時間 | `gas/Code.gs` |
| 後台設定可調整的網站資料欄位 | `gas/Code.gs` 的 `SETTINGS_FIELDS` |
| 完整主題頁內容 | 暫時仍由 `data/site-data.js` 管理 |

## Google Sites

Google Sites 只需要嵌入一次：

```text
https://panggihsieh.github.io/googlesite/google-sites-embed.html
```

之後只要更新 GitHub，Google Sites 會自動載入新版，不需要每次重新嵌入。

## 公開與登入

- 網站首頁與一般教材：公開。
- Google Classroom、Drive、Tinkercad、因材網等：是否需要登入，由外部服務自己的權限設定決定。
- 不要在公開 Repo 放學生個資、密碼、API Key 或私人連結。

## 專案文件

- 詳細規格：`PROJECT.md`
- 修改紀錄：`CHANGELOG.md`
- 公開存取檢查清單：`PUBLIC-ACCESS-CHECKLIST.md`

如果使用 ChatGPT、Codex 或 Zed 維護，建議先讀 `PROJECT.md` 與 `CHANGELOG.md` 再修改。
