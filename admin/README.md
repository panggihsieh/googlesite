# 大南老邦教學網 — GAS 後台 v1

本資料夾是管理後台第一版原始碼。

## 功能

- Google 帳號登入
- 白名單只允許 `teacher.hsieh@gmail.com`
- 管理「今日學習」
- 管理「最新消息」
- 管理「快速連結」
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
- `settings`

## 目前的實際部署（2026-09-19）

- 目前只使用**一個** Web App 部署：

  `https://script.google.com/macros/s/AKfycbz2iBSQqlYOeNbuOrDp72FdzFhBhJEk6QocNep7uwkZrN9amNymcU4ENbFkSWd2PjUo/exec`

  - 執行身分：**我**、存取權：**任何人**
  - 不帶參數 → **後台管理畫面**（首頁與嵌入版的 ⚙️ 都連這裡）
  - 加上 `?api=public` → **公開資料 API**（`data/site-config.js` 的 `publicApiUrl`）
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
  "today": { "courses": [] },
  "news": [],
  "quickLinks": []
}
```

取得公開部署的 `/exec` 網址後，填入：

`data/site-config.js`

的：

```js
publicApiUrl: "https://script.google.com/macros/s/.../exec"
```

之後後台儲存資料 → Google Sheet → 公開 API → GitHub Pages / Google Sites 會自動讀取最新內容。
