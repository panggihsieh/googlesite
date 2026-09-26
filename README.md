# 大南老邦教學網

大南國小高年級數位學習網站（對外分享：家長／研習老師）。  
**前台只用 GitHub Pages**；後台與資料為 **Google Apps Script＋Sheet＋Drive**。不使用 Google Sites。

## 正式網址

- 前台（GitHub Pages）：`https://panggihsieh.github.io/googlesite/`
- 後台（GAS Web App）：見 `data/site-config.js` 的 `adminUrl`／首頁 ⚙️
- GitHub Repo：`panggihsieh/googlesite`

## 架構

```text
瀏覽者 → GitHub Pages（HTML／CSS／JS）
              ↓ JSONP 公開 API
         Google Apps Script
              ↓
         Google Sheet（內容）＋ Drive（檔案，本站只存連結）
```

首頁與內頁先顯示 GitHub 靜態備援（`data/`），再由 `js/backend.js` 讀 GAS 公開資料覆寫；連不到後台時仍可瀏覽。

```text
googlesite/
├─ index.html          # 前台首頁
├─ style.css
├─ script.js
├─ js/
│  └─ backend.js       # 後台連線＋時間同步
├─ data/               # 靜態備援與設定
├─ pages/              # 六大主題頁
├─ gas/                # Apps Script 後台（clasp 同步）
├─ admin/README.md
├─ PROJECT.md
└─ CHANGELOG.md
```

> 舊的 `google-sites-embed.html`／`css/embed.css`／`js/embed.js` 為歷史嵌入版，**正式架構不再使用**；可之後刪除。

## 日後最常修改的檔案

| 要修改什麼 | 檔案 |
| --- | --- |
| 網站名稱、Hero、關鍵字 | `data/site-config.js`（後台「⚙️ 後台設定」可覆寫） |
| 公開 API／後台網址、時區、影片顯示數 | `data/site-config.js` |
| 前台與後台連線、時間同步 | `js/backend.js` |
| 六大主題卡片 | `data/subjects.js` |
| 今日學習靜態備援 | `data/courses.js`／`data/site-data.js` |
| 主題頁內容（靜態） | `data/site-data.js` 的 `pages` |
| 後台程式與部署 | `gas/` ＋ `clasp push -f`／`clasp deploy -i`（見 `admin/README.md`） |

## 公開與登入

- 網站首頁與一般教材：公開。
- Classroom、Drive、Tinkercad、因材網等：由外部服務自己的權限決定。
- 不要在公開 Repo 放學生個資、密碼、API Key 或私人檔案；教材檔放 **Drive**，本站只放連結。

## 專案文件

- 詳細規格：`PROJECT.md`
- 修改紀錄：`CHANGELOG.md`
- 公開存取檢查：`PUBLIC-ACCESS-CHECKLIST.md`
