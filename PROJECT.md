# 大南老邦教學網 — 正式專案規格

## 1. 專案定位

「大南老邦教學網」是一個公開瀏覽的國小高年級教學網站。

- Google Sites：負責最外層網站、主導覽列與發布入口。
- GitHub Pages：負責可維護的教材首頁、互動內容與主題頁。
- 外部服務：Google Classroom、Drive、Tinkercad、因材網等各自負責登入與權限。
- 本網站本身不保存學生帳號密碼，也不自行建立登入系統。

## 2. 正式網址

- Google Sites：`https://sites.google.com/view/dana-edu/`
- GitHub Pages：`https://panggihsieh.github.io/googlesite/`
- Google Sites 嵌入首頁：`https://panggihsieh.github.io/googlesite/google-sites-embed.html`
- GitHub Repo：`panggihsieh/googlesite`

## 3. 維護原則

1. Google Sites 的嵌入網址設定完成後，日常更新不需要重新嵌入。
2. 日常內容修改以 `data/` 為主，不直接改 HTML。
3. 版面修改集中在 `css/embed.css`。
4. 嵌入首頁互動集中在 `js/embed.js`。
5. `google-sites-embed.html` 只保留穩定的頁面骨架。
6. 不在 GitHub 公開儲存庫放學生個資、密碼、API Key 或私人檔案。
7. 需要登入的資源只提供外部連結，由該平台處理驗證。

## 4. 專案結構

```text
googlesite/
├─ index.html
├─ google-sites-embed.html
├─ style.css
├─ script.js
│
├─ css/
│  └─ embed.css
│
├─ js/
│  └─ embed.js
│
├─ data/
│  ├─ site-data.js        # 原完整版網站資料，保留相容性
│  ├─ site-config.js      # 網站名稱、Hero、關鍵字
│  ├─ subjects.js         # 六大主題卡片
│  ├─ courses.js          # 今日學習
│  ├─ news.js             # 最新消息
│  ├─ links.js            # 快速連結與登入提示
│  └─ embed-data.js       # 嵌入首頁資料組裝
│
├─ pages/
│  ├─ chinese.html
│  ├─ math.html
│  ├─ env.html
│  ├─ ai.html
│  ├─ tasks.html
│  └─ works.html
│
├─ assets/
│  ├─ images/
│  │  ├─ home-hero-banner.jpg     # 首頁 Hero 橫幅（layout.png Hero 全寬 1672×280）
│  │  └─ embed-hero-banner.jpg    # 嵌入版 Hero 背景（layout.png 照片區 1032×280）
│  └─ icons/
│
├─ PROJECT.md
├─ CHANGELOG.md
└─ README.md
```

## 5. 日常修改對照表

| 想修改的內容 | 修改檔案 |
| --- | --- |
| 網站名稱、Hero 標題、關鍵字 | `data/site-config.js` |
| 六大主題卡片 | `data/subjects.js` |
| 今日學習／課表 | `data/courses.js` |
| 最新消息 | `data/news.js` |
| 快速連結 | `data/links.js` |
| Google Sites 嵌入版外觀 | `css/embed.css` |
| 嵌入首頁渲染邏輯 | `js/embed.js` |
| 後台管理入口網址（首頁 ⚙️、嵌入版 ⚙️） | `index.html`、`google-sites-embed.html`（兩處要一起改；與 `data/site-config.js` 的 `publicApiUrl` 是同一個部署，只差 `?api=public`） |
| 首頁橫幅圖／嵌入版 Hero 圖 | `assets/images/home-hero-banner.jpg`、`assets/images/embed-hero-banner.jpg` |
| 首頁版面（區塊組成、容器寬度、卡片欄數） | `index.html`、`style.css`（設計依據：`layout.png`） |
| 首頁配色（藍色系主色、面板淡藍底） | `style.css` 的 `body[data-page="index"]` 變數區 |
| 首頁主題卡片底色／文字色（`tint`／`ink`） | `data/site-data.js` 的 `subjects` |
| 「開始今天的學習」按鈕文字與連結 | `data/site-data.js` 的 `today.cta` |
| 首頁快速連結的副標（例如 GeoGebra／數學工具） | `data/site-data.js` 的 `quickLinks[].note` |
| 國語／數學等完整主題頁內容 | 暫時仍由 `data/site-data.js` 管理 |

## 6. 響應式規則

- 桌機 Google Sites iframe 寬度 >= 900px：六張主題卡強制同一排。
- 首頁（GitHub Pages）：>= 1400px 六大主題卡一列 6 張；1400px 以下 3 欄、680px 以下單欄。
- 首頁內容寬度＝視窗寬度 − 26px×2（`--gutter: 26px`、`--maxw: 1700px`），與設計圖 `layout.png` 的內容邊界相同。
- 首頁儀表板：桌機三欄（1.164 : 1.071 : 1，間距 26px）、1000px 以下兩欄（快速連結整列）、680px 以下單欄。
- 首頁快速連結：面板內 2 欄方框（680px 以下單欄）。
- 700–899px：三欄。
- < 700px：兩欄。
- 禁止使用會導致 iframe 橫向溢出的固定大寬度。
- 不以 `100vw` 作主要容器寬度。

## 7. Google Sites 規則

Google Sites 保留自己的頂端導覽列；`google-sites-embed.html` 不再建立第二組導覽列。

Google Sites 只需嵌入：

```text
https://panggihsieh.github.io/googlesite/google-sites-embed.html
```

GitHub push 後，Google Sites 會自動載入新版。

## 8. 公開與登入資源

網站首頁與一般教材可以公開。

快速連結中的 `requiresLogin: true` 只表示外部平台通常需要登入，例如：

- Google Classroom
- Google Drive 私人／校內檔案
- Tinkercad 編輯功能
- 因材網

是否真的要求登入，以外部平台與分享權限設定為準。

## 9. 版本管理

- 正式分支：`main`
- 每次重要修改更新 `CHANGELOG.md`
- 重要版面修改建議以一個 Git commit 對應一項目的。
- 若日後改用 Codex / Zed，先閱讀 `PROJECT.md` 與 `CHANGELOG.md` 再修改。

## 10. 未來擴充

- 將完整主題頁也拆成獨立資料檔。
- 新增圖片／作品資料 JSON。
- 新增 Google Forms / Sheets 整合。
- 新增校園環境教育專區。
- 視需求增加 AI 輔助學習功能，但不把秘密金鑰直接放在前端。
