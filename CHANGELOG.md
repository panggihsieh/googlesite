# CHANGELOG — 大南老邦教學網

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
