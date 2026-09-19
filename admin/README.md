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

## 部署方式

1. 到 script.google.com 建立 Apps Script 專案。
2. 把 `gas/Code.gs`、`gas/Index.html`、`gas/appsscript.json` 內容貼入。
3. 部署 → 新增部署作業 → 網頁應用程式。
4. 執行身分：**存取網頁應用程式的使用者**。
5. 存取權：**擁有 Google 帳號的使用者**。
6. 以 `teacher.hsieh@gmail.com` 登入測試。
7. 其他帳號應看到「未授權」。

> 重要：如果部署成「以我執行」，`Session.getActiveUser().getEmail()` 可能無法取得訪客 Gmail，白名單驗證會失效。
