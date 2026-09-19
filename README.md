# 大南老邦教學網 建置規劃書（MVP v1 / v2）

> 使用 Codex 或 Zed (DeepSeek) 建置。先完成最小可行方案第一版，再透過複製貼上逐步擴充第二版。

---

## 1. 專案目標

- 建立可嵌入 Google Sites 的教學網站。
- 提供「國語、數學、環境教育、AI 科技、學習任務、學生作品」六大入口。
- 採用低門檻、可維護、可複製的前端架構，讓老師可用 Codex 或 Zed (DeepSeek) 快速修改與擴充。

## 2. 開發策略

### 第一版（MVP）

- 技術：HTML + CSS + JavaScript。
- 不登入、不做後端。
- 版面需支援電腦與 iPad。
- 內容先用靜態資料（JS 陣列 / JSON）。
- 完成後部署到 GitHub Pages 或 Vercel。
- 以 iframe 方式嵌入 Google Sites。

### 第二版（擴充）

- 直接複製第一版頁面模板，新增更多課程頁。
- 加入 Google Forms / Sheets / Apps Script。
- 增加公告、學習任務、作品展示、互動學習。
- 視需求加入 AI 問答、題目產生或資料整理。

## 3. MVP 功能範圍

1. 首頁 Hero 區塊
2. 六大主題卡片入口
3. 今日學習
4. 最新消息
5. 基本導覽列與頁尾

## 4. 網站架構

```
danan.edu/
├── README.md
├── index.html              # 首頁
├── style.css               # 全站樣式
├── script.js               # 前端互動與渲染
├── data/
│   └── site-data.js        # 全站內容（唯一需要修改的檔案）
├── assets/
│   ├── images/             # 校園照片、作品照片
│   └── icons/              # 網站圖示
└── pages/
    ├── chinese.html        # 國語
    ├── math.html           # 數學
    ├── env.html            # 環境教育
    ├── ai.html             # AI 科技
    ├── tasks.html          # 學習任務
    └── works.html          # 學生作品
```

## 5. 技術選型

| 項目 | 選擇 |
| --- | --- |
| 編輯器 | Zed |
| AI 助手 | DeepSeek / Codex |
| 前端 | HTML5、CSS3、JavaScript |
| 版本控制 | Git + GitHub |
| 部署 | GitHub Pages 或 Vercel |
| 嵌入 | Google Sites（iframe） |

## 6. 建置流程

1. 建立專案資料夾與基本檔案。
2. 先完成首頁版型。
3. 製作六個入口頁面。
4. 用假資料完成 MVP。
5. 上傳 GitHub 並部署。
6. 嵌入 Google Sites 測試。
7. 第二版再加入表單互動與 AI 功能。

## 7. 提示詞範例

```
建立一個國小教學網站 MVP，
使用 HTML + CSS + JavaScript，
網站名稱為「大南老邦教學網」，
包含首頁、國語、數學、環境教育、AI 科技、學習任務、學生作品，
需支援 iPad，採響應式設計，
輸出 index.html、style.css、script.js
```

## 8. 第一版完成標準

- [x] 可在瀏覽器正常開啟。
- [x] 首頁導覽與版型正常。
- [x] 六個入口可點擊。
- [x] iPad 顯示正常。
- [x] 可成功嵌入 Google Sites。

## 9. 第二版擴充清單

- 課文頁模板。
- 生字 / 題庫 JSON。
- Google 表單作業。
- Scratch / GeoGebra / Tinkercad 連結。
- 校園植物與環境教育專區。
- 學生作品展示。
- 公告管理。

## 10. 建議下一步

先完成首頁，再做「國語」與「環境教育」兩個示範頁，確認風格後，再批次複製到其他頁面。

---

# 使用說明

## 修改內容

**只要改 `data/site-data.js` 一個檔案，不用動 HTML。**

| 想改什麼 | 改哪裡 |
| --- | --- |
| 網站名稱、學校、標語 | `SITE_DATA.site` |
| 導覽列項目 | `SITE_DATA.nav` |
| 六大主題卡片 | `SITE_DATA.subjects` |
| 今日學習 / 本週課程 | `SITE_DATA.today` |
| 最新消息 | `SITE_DATA.news`（新的放最前面） |
| 快速連結 | `SITE_DATA.quickLinks` |
| 教師專區 | `SITE_DATA.teacher` |
| 關於大南 | `SITE_DATA.about` |
| 各主題頁的學習重點 / 資源 / 任務 | `SITE_DATA.pages.<代號>` |

頁面代號：`chinese`、`math`、`env`、`ai`、`tasks`、`works`。

## 本機預覽

`index.html` 直接雙擊即可開啟。若要用本機伺服器預覽，在 `danan.edu/` 目錄下執行：

```sh
python -m http.server 8000
```

再開啟 <http://localhost:8000/>。

## 部署

### GitHub Pages

1. 把 `danan.edu/` 內容推上 GitHub 儲存庫。
2. 到 **Settings → Pages**，Source 選 **GitHub Actions**。
   （`.github/workflows/deploy.yml` 已設定好，推上 `main` 分支即會自動部署。）
3. 部署完成後網址為 `https://<帳號>.github.io/<專案名稱>/`。

### Vercel

1. 匯入 GitHub 儲存庫。
2. Framework Preset 選 **Other**，不需要 Build Command。
3. 直接部署即可。

## 嵌入 Google Sites

1. 在 Google Sites 編輯畫面，右側選 **插入 → 嵌入 → 透過網址**。
2. 貼上部署後的網址（例如 `https://<帳號>.github.io/<專案名稱>/`）。
3. 建議把嵌入區塊拉大到接近整頁，網站本身已支援響應式，iPad 也能正常顯示。

> 網站內頁（如 `pages/chinese.html`）是相對路徑連結，在 iframe 中會直接在同一個 iframe 內換頁，不需要另外設定。
