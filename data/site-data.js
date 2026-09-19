/* =============================================================================
 * 大南老邦教學網 — 靜態資料
 * -----------------------------------------------------------------------------
 * MVP 第一版不使用後端，全站內容都放在這個檔案。
 * 老師只要修改下方的資料，頁面就會自動更新，不需要動 HTML 結構。
 *
 * 修改方式：
 *   1. 新增消息 → 在 SITE_DATA.news 陣列最前面加一筆
 *   2. 調整課程 → 修改 SITE_DATA.today.courses
 *   3. 換連結   → 修改 SITE_DATA.quickLinks
 *   4. 頁面內容 → 修改 SITE_DATA.pages.<頁面代號>
 * ========================================================================== */

const SITE_DATA = {
  /* --- 網站基本資料 ------------------------------------------------------ */
  site: {
    name: "大南老邦教學網",
    school: "大南國小",
    schoolEn: "Da-Nan Elementary School",
    grade: "高年級數位學習",
    tagline: "學習 × 探究 × 創造更好的自己",
    keywords: ["閱讀世界", "探索自然", "擁抱科技", "創造未來"],
    description: "大南國小高年級數位學習 × AI × 探究實作",
    updated: "2025-08-30"
  },

  /* --- 導覽列 ------------------------------------------------------------ */
  nav: [
    { label: "首頁", href: "index.html", match: "index" },
    { label: "國語", href: "pages/chinese.html", match: "chinese" },
    { label: "數學", href: "pages/math.html", match: "math" },
    { label: "環境教育", href: "pages/env.html", match: "env" },
    { label: "AI 科技", href: "pages/ai.html", match: "ai" },
    { label: "學習任務", href: "pages/tasks.html", match: "tasks" },
    { label: "學生作品", href: "pages/works.html", match: "works" },
    { label: "教師專區", href: "index.html#teacher", match: "teacher" },
    { label: "關於大南", href: "index.html#about", match: "about" }
  ],

  /* --- 六大主題入口 ------------------------------------------------------ */
  subjects: [
    {
      id: "chinese",
      title: "國語",
      icon: "📖",
      color: "#d1564f",
      desc: "課文 • 生字 • 成語",
      extra: "閱讀理解",
      href: "pages/chinese.html"
    },
    {
      id: "math",
      title: "數學",
      icon: "📐",
      color: "#3b74d1",
      desc: "概念 • 例題 • 互動練習",
      extra: "數學遊戲",
      href: "pages/math.html"
    },
    {
      id: "env",
      title: "環境教育",
      icon: "🌿",
      color: "#2f9367",
      desc: "校園植物 • 生態觀察",
      extra: "永續 • 防災",
      href: "pages/env.html"
    },
    {
      id: "ai",
      title: "AI 科技",
      icon: "🤖",
      color: "#6d5bd0",
      desc: "AI 入門 • 程式設計",
      extra: "機器人 • 3D 設計",
      href: "pages/ai.html"
    },
    {
      id: "tasks",
      title: "學習任務",
      icon: "📝",
      color: "#c8791c",
      desc: "作業 • 學習單",
      extra: "線上測驗",
      href: "pages/tasks.html"
    },
    {
      id: "works",
      title: "學生作品",
      icon: "🎨",
      color: "#c74f8c",
      desc: "作文 • 專題 • 3D 作品",
      extra: "作品展示",
      href: "pages/works.html"
    }
  ],

  /* --- 今日學習 / 本週課程 ----------------------------------------------- */
  today: {
    date: "2025-08-30",
    dateLabel: "2025 年 8 月 30 日（六）",
    courses: [
      { period: "第一節", subject: "國語", title: "高明說話（南一五下 第 5 課）", href: "pages/chinese.html" },
      { period: "第二節", subject: "數學", title: "分數除法", href: "pages/math.html" },
      { period: "第三節", subject: "環境", title: "校園樹木與環境", href: "pages/env.html" },
      { period: "第四節", subject: "AI", title: "校園樹木辨識", href: "pages/ai.html" }
    ]
  },

  /* --- 最新消息 ---------------------------------------------------------- */
  news: [
    { date: "08/28", tag: "公告", title: "大南老邦教學網正式上線！", href: "pages/works.html" },
    { date: "08/27", tag: "活動", title: "校園植物觀察活動開始報名", href: "pages/env.html" },
    { date: "08/25", tag: "教材", title: "五下國語第 5 課教材已更新", href: "pages/chinese.html" },
    { date: "08/22", tag: "作品", title: "學生 3D 設計作品展示區上架", href: "pages/works.html" },
    { date: "08/20", tag: "社團", title: "AI 科技社團開始招生", href: "pages/ai.html" }
  ],

  /* --- 快速連結 ---------------------------------------------------------- */
  quickLinks: [
    { name: "Google 雲端硬碟", icon: "📁", url: "https://drive.google.com/" },
    { name: "Google Classroom", icon: "🏫", url: "https://classroom.google.com/" },
    { name: "Google 表單", icon: "📋", url: "https://docs.google.com/forms/" },
    { name: "Scratch", icon: "🐱", url: "https://scratch.mit.edu/" },
    { name: "GeoGebra", icon: "📈", url: "https://www.geogebra.org/" },
    { name: "Tinkercad", icon: "🧊", url: "https://www.tinkercad.com/" },
    { name: "因材網", icon: "🧮", url: "https://adl.edu.tw/" },
    { name: "教育雲", icon: "☁️", url: "https://cloud.edu.tw/" }
  ],

  /* --- 教師專區 ---------------------------------------------------------- */
  teacher: {
    note: "教材、作業與成績登記統一放在 Google 雲端工具，登入學校帳號即可使用。",
    links: [
      { name: "Google Classroom", icon: "🏫", url: "https://classroom.google.com/" },
      { name: "雲端硬碟教材區", icon: "📁", url: "https://drive.google.com/" },
      { name: "作業表單", icon: "📋", url: "https://docs.google.com/forms/" },
      { name: "成績試算表", icon: "📊", url: "https://docs.google.com/spreadsheets/" }
    ]
  },

  /* --- 關於大南 ---------------------------------------------------------- */
  about: {
    text: "大南國小位於自然環繞的校園環境，我們把閱讀、生態與科技放進同一個學習現場：孩子在課文裡讀世界，在校園裡做觀察，在電腦教室裡寫程式、做 3D 設計，把所學變成看得見的作品。",
    facts: [
      { label: "年級", value: "高年級" },
      { label: "學習主題", value: "6 大" },
      { label: "核心能力", value: "閱讀・探究・實作" }
    ]
  },

  /* --- 頁尾 -------------------------------------------------------------- */
  footer: {
    note: "本網站以 HTML / CSS / JavaScript 靜態建置，透過 iframe 嵌入 Google Sites，不須登入、沒有後端。"
  },

  /* --- 各主題頁內容 ------------------------------------------------------ */
  pages: {
    chinese: {
      features: [
        { icon: "📖", title: "課文導讀", desc: "段落大意、寫作手法與作者觀點，五下第 5 課〈高明說話〉重點整理。" },
        { icon: "✍️", title: "生字詞語", desc: "每課生字筆順、造詞與例句，附生字詞語表的線上測驗。" },
        { icon: "🀄", title: "成語教室", desc: "依主題分類的成語整理，加上情境填空練習。" },
        { icon: "🔍", title: "閱讀理解", desc: "從字面理解到推論、批判，四層次提問練習與自我檢核。" }
      ],
      resources: [
        { name: "五下第 5 課 教材講義", desc: "課文、注釋與段落大意", url: "#" },
        { name: "生字詞語線上測驗", desc: "Google 表單，共 20 題", url: "https://docs.google.com/forms/" },
        { name: "成語學習單", desc: "主題成語 30 則", url: "#" },
        { name: "閱讀理解練習", desc: "四層次提問共 12 題", url: "#" }
      ],
      tasks: [
        "朗讀第 5 課課文一次，錄音後上傳 Classroom。",
        "完成本課生字造詞 3 個，並各寫一個句子。",
        "寫一段 100 字心得：你覺得「高明說話」的重點是什麼？"
      ]
    },

    math: {
      features: [
        { icon: "🔢", title: "概念講解", desc: "分數除法的意義與算則，用圖形說明「除以分數等於乘以倒數」。" },
        { icon: "📐", title: "例題示範", desc: "由簡到難的示範例題，逐步拆解計算流程。" },
        { icon: "🧮", title: "互動練習", desc: "用 GeoGebra 拖拉操作，親眼看見分數除法的結果。" },
        { icon: "🎲", title: "數學遊戲", desc: "分數心算挑戰與小組競賽，把練習變成遊戲。" }
      ],
      resources: [
        { name: "GeoGebra 分數除法操作", desc: "互動圖形，可拖拉驗證", url: "https://www.geogebra.org/" },
        { name: "因材網 五下數學", desc: "依進度指派自學任務", url: "https://adl.edu.tw/" },
        { name: "分數除法練習單", desc: "基礎 20 題 + 進階 10 題", url: "#" },
        { name: "單位換算表", desc: "長度、面積、體積、容量", url: "#" }
      ],
      tasks: [
        "完成分數除法練習單基礎 20 題，錯誤題目要訂正。",
        "在 GeoGebra 上操作一題並截圖上傳。",
        "和同學玩一次分數心算挑戰，記錄成績。"
      ]
    },

    env: {
      features: [
        { icon: "🌿", title: "校園植物圖鑑", desc: "校園常見樹木與草花的辨識特徵，含葉形、樹皮與花期。" },
        { icon: "🔬", title: "生態觀察記錄", desc: "認養一棵樹，記錄一個月的變化與到訪的生物。" },
        { icon: "♻️", title: "永續行動", desc: "從省水省電、減塑到落葉堆肥，在生活中實踐永續。" },
        { icon: "⚠️", title: "防災演練", desc: "地震、火災與颱風的避難流程與校園避難地圖。" }
      ],
      resources: [
        { name: "校園樹木辨識表", desc: "20 種校園樹木圖文對照", url: "#" },
        { name: "生態觀察記錄表", desc: "可列印或於 Google 表單填寫", url: "#" },
        { name: "臺灣原生植物資料庫", desc: "查詢原生樹種與分布", url: "https://www.taiwanflora.tw/" },
        { name: "防災教育網", desc: "地震、颱洪、火災學習資源", url: "https://disaster.moe.edu.tw/" }
      ],
      tasks: [
        "認養一棵校園樹木，替它拍照並寫下辨識特徵。",
        "連續四週記錄樹木的變化（葉、花、果實或到訪生物）。",
        "提出一項可以在班上做到的永續行動並實際執行。"
      ]
    },

    ai: {
      features: [
        { icon: "🤖", title: "AI 入門", desc: "什麼是 AI？從圖像辨識談起，理解 AI 的能與不能。" },
        { icon: "💻", title: "程式設計", desc: "用 Scratch 建立事件、迴圈與變數概念，做出第一個小遊戲。" },
        { icon: "🧊", title: "3D 設計", desc: "用 Tinkercad 建立立體模型，從名牌到小工具。" },
        { icon: "🦾", title: "機器人", desc: "感測器、馬達與程式邏輯整合，完成指定任務。" }
      ],
      resources: [
        { name: "Scratch 線上版", desc: "瀏覽器直接寫程式，免安裝", url: "https://scratch.mit.edu/" },
        { name: "Tinkercad 3D 設計", desc: "線上建模，作品可匯出 STL", url: "https://www.tinkercad.com/" },
        { name: "AI 工具介紹", desc: "圖像辨識與生成式 AI 簡介", url: "#" },
        { name: "程式設計學習單", desc: "Scratch 積木對照與任務卡", url: "#" }
      ],
      tasks: [
        "用 Scratch 做一個有 3 個場景的小遊戲，並分享專案連結。",
        "在 Tinkercad 設計一個名牌（尺寸 6 × 3 × 0.4 公分）。",
        "在校園裡拍 5 張樹木照片，觀察 AI 辨識的準確度。"
      ]
    },

    tasks: {
      features: [
        { icon: "📝", title: "本週作業", desc: "六個主題的本週作業清單，標示截止日與繳交方式。" },
        { icon: "📄", title: "學習單下載", desc: "國語、數學、環境、AI 各主題學習單，可線上下載列印。" },
        { icon: "✅", title: "線上測驗", desc: "Google 表單即時評分，作答後立刻看到解說。" },
        { icon: "📊", title: "學習進度", desc: "檢核自己的完成度，找出還沒補齊的項目。" }
      ],
      resources: [
        { name: "Google Classroom", desc: "作業繳交與公告", url: "https://classroom.google.com/" },
        { name: "作業繳交表單", desc: "檔案上傳與心得填寫", url: "https://docs.google.com/forms/" },
        { name: "學習進度檢核表", desc: "自我檢核六個主題完成度", url: "#" },
        { name: "學習單專區", desc: "各主題學習單集中下載", url: "#" }
      ],
      tasks: [
        "確認本週各科作業是否都已繳交。",
        "完成一項線上測驗，並記下答錯的題目。",
        "在學習進度檢核表上更新自己的完成度。"
      ]
    },

    works: {
      features: [
        { icon: "✏️", title: "作文精選", desc: "各班優良作文與教師回饋，看見文字的力量。" },
        { icon: "🔎", title: "專題研究", desc: "小組探究成果，從提問、資料蒐集到結論。" },
        { icon: "🧊", title: "3D 作品", desc: "Tinkercad 立體模型展示，可下載 STL 檔。" },
        { icon: "🏆", title: "競賽成果", desc: "校內外競賽與科展的參與紀錄。" }
      ],
      resources: [
        { name: "作品上傳表單", desc: "上傳作品檔案與說明", url: "https://docs.google.com/forms/" },
        { name: "作品展示區", desc: "歷年作品線上展覽", url: "#" },
        { name: "作品撰寫指引", desc: "作品說明該寫哪些重點", url: "#" },
        { name: "授權說明", desc: "公開展示的授權與同意事項", url: "#" }
      ],
      tasks: [
        "選一件自己的作品，補上 50 字作品說明。",
        "到展示區觀摩兩件同學的作品，寫下一個優點。",
        "把作品檔案整理好，上傳到作品上傳表單。"
      ],
      gallery: [
        { title: "我的家鄉・大南", author: "五年甲班 小安", tag: "作文", desc: "從校門口的茄苳樹寫起，描述家鄉的四季。" },
        { title: "校園樹木葉形觀察", author: "五年乙班 小組 A", tag: "專題", desc: "採集 12 種落葉，比對葉形與葉脈做成圖表。" },
        { title: "班級置物架模型", author: "六年甲班 小宇", tag: "3D 作品", desc: "Tinkercad 設計，層板可調高度，已列印實體。" },
        { title: "Scratch 數學挑戰遊戲", author: "六年乙班 小涵", tag: "程式", desc: "分數心算闖關遊戲，含計時與分數排行榜。" }
      ]
    }
  }
};

/* 讓其他檔案可以直接取用（同時支援 module 以外的載入方式） */
if (typeof window !== "undefined") {
  window.SITE_DATA = SITE_DATA;
}
