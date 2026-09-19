# 大南老邦教學網

大南國小高年級數位學習網站。  
正式入口使用 Google Sites，互動首頁與教材內容部署於 GitHub Pages。

## 正式網址

- Google Sites：`https://sites.google.com/view/dana-edu/`
- GitHub Pages：`https://panggihsieh.github.io/googlesite/`
- Google Sites 嵌入首頁：`https://panggihsieh.github.io/googlesite/google-sites-embed.html`

## 目前架構

```text
googlesite/
├─ index.html
├─ google-sites-embed.html
├─ style.css
├─ script.js
├─ css/
│  └─ embed.css
├─ js/
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
├─ assets/
├─ PROJECT.md
└─ CHANGELOG.md
```

## 日後最常修改的檔案

| 要修改什麼 | 檔案 |
| --- | --- |
| 網站名稱、Hero 標題、關鍵字 | `data/site-config.js` |
| 六大主題卡片 | `data/subjects.js` |
| 今日學習 | `data/courses.js` |
| 最新消息 | `data/news.js` |
| 快速連結與登入提示 | `data/links.js` |
| Google Sites 嵌入版外觀 | `css/embed.css` |
| 嵌入版程式 | `js/embed.js` |
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

如果使用 ChatGPT、Codex 或 Zed 維護，建議先讀 `PROJECT.md` 與 `CHANGELOG.md` 再修改。
