const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

/* =========================
   Career Config
========================= */
const CAREERS = [
  "資料分析師",
  "商業分析師",
  "產品分析師",
  "機器學習工程師",
  "AI工程師",
  "資料工程師",
  "資料科學研究員",
  "研究所"
];

/* =========================
   Intent Aliases
   (支援不同命名方式, 避免抓不到)
========================= */
const intentToKey = {
  // 你現在 Dialogflow 看到的是 career_detail_xxx
  career_detail_work: "career_detail_work",
  career_detail_skill: "career_detail_skill",
  career_detail_background: "career_detail_background",
  learning_roadmap: "learning_roadmap",
  project_suggestions: "project_suggestions",
  tools_recommendation: "tools_recommendation",

  // 也兼容英文 displayName (如果你之前用過)
  "Career Detail Work": "career_detail_work",
  "Career Detail Skill": "career_detail_skill",
  "Career Detail Background": "career_detail_background",
  "Learning Roadmap": "learning_roadmap",
  "Project Suggestions": "project_suggestions",
  "Tools Recommendations": "tools_recommendation",
  "Tools Recommendation": "tools_recommendation"
};

/* =========================
   Fallback (缺參數時用)
========================= */
function pickCareerFromContexts(req) {
  const contexts = req?.body?.queryResult?.outputContexts || [];

  for (const ctx of contexts) {
    if (ctx.name.includes("career-selected") || ctx.name.includes("career_detail")) {
      const params = ctx.parameters || {};

      return (
        params.career ||
        params.career_type ||
        params.job ||
        params.position ||
        null
      );
    }
  }
  return null;
}

function buildAskCareerText() {
  return (
    "🧠 你想了解哪一個方向呢～\n" +
    "📌 你可以直接回我職位名稱\n" +
    "🧷 資料分析師\n" +
    "🧷 商業分析師\n" +
    "🧷 產品分析師\n" +
    "🧷 機器學習工程師\n" +
    "🧷 AI工程師\n" +
    "🧷 資料工程師\n" +
    "🧷 資料科學研究員\n" +
    "🧷 研究所\n" +
    "✨ 你回一個我就能接著帶你深入聊!"
  );
}

const fallbackByKey = {
  career_detail_work:
    "🧠 你想先了解哪個職位的工作內容呢～\n" +
    "📌 你可以直接回我職位名稱\n" +
    "✨ 我會把每天在做什麼說得很清楚給你!!",

  career_detail_skill:
    "🧠 你想先了解哪個職位需要哪些技能呢～\n" +
    "📌 你可以直接回我職位名稱\n" +
    "✨ 我會幫你整理到可以照著練的程度!!",

  career_detail_background:
    "🧠 你想先了解哪個職位適合什麼背景與特質呢～\n" +
    "📌 你可以直接回我職位名稱\n" +
    "✨ 我會用很貼近真實職場的方式講給你聽!!",

  learning_roadmap:
    "🧠 你想走哪個方向，我就幫你排一條學習路線～\n" +
    "📌 你可以直接回我職位名稱\n" +
    "✨ 我會把先學什麼、後學什麼講到很明確!!",

  project_suggestions:
    "🧠 你想做作品集對吧～\n" +
    "📌 你先跟我說你的目標職位\n" +
    "✨ 我會給你做得出成果、又好講故事的專題方向!!",

  tools_recommendation:
    "🧠 你想知道要先學哪些工具最划算對吧～\n" +
    "📌 你先跟我說你的目標職位\n" +
    "✨ 我會按重要度幫你排出最有用清單!!"
};

/* =========================
   Replies (6 intents x 8 careers)
   每一行內容都以表情符號開頭
   結尾不使用句號, 以 !! 或 ～ 收尾
========================= */
const replies = {
  career_detail_work: {
    資料分析師:
      "🧠【資料分析師｜工作內容與日常】\n" +
      "📌 你會做的事\n" +
      "🧷 把資料整理乾淨, 缺值、異常、欄位不一致都要先處理\n" +
      "🧷 做探索性分析, 找趨勢、找關聯、找出值得追的指標\n" +
      "🧷 把結果做成圖表或儀表板, 讓別人一眼看懂發生什麼事\n" +
      "🧷 把洞察講成可行建議, 不是只有結果而是下一步怎麼做\n" +
      "✨ 這份工作最關鍵是把複雜的資料翻譯成清楚的決策線索!!",

    商業分析師:
      "🧠【商業分析師｜工作內容與日常】\n" +
      "📌 你會做的事\n" +
      "🧷 先釐清老闆真正想問什麼, 把問題拆成可量化的指標\n" +
      "🧷 分析銷售、行銷、顧客行為, 找出成長或下滑的原因\n" +
      "🧷 評估策略成效, 例如活動前後差異、ROI、轉換率、客單價\n" +
      "🧷 把分析變成建議, 讓團隊知道該加碼、該停、該改哪裡\n" +
      "✨ 你不是在做數學題, 你是在幫公司少走冤枉路!!",

    產品分析師:
      "🧠【產品分析師｜工作內容與日常】\n" +
      "📌 你會做的事\n" +
      "🧷 追使用者旅程, 看註冊到使用到留存, 哪一段開始掉人\n" +
      "🧷 做漏斗與留存分析, 找出產品卡關點與改善優先順序\n" +
      "🧷 設計與分析 A/B Test, 驗證改版到底有沒有真的更好\n" +
      "🧷 跟 PM、設計、工程討論, 把洞察落成新功能或優化方案\n" +
      "✨ 這角色很像產品的顯微鏡, 幫大家看清楚問題出在哪～!!",

    機器學習工程師:
      "🧠【機器學習工程師｜工作內容與日常】\n" +
      "📌 你會做的事\n" +
      "🧷 把資料變成可訓練的樣子, 包含特徵工程與資料切分策略\n" +
      "🧷 訓練與比較模型, 用指標與誤差分析找到真正的提升點\n" +
      "🧷 讓模型能上線, 做 API 或批次推論, 還要顧速度與穩定性\n" +
      "🧷 監控模型表現, 追資料漂移與效能衰退, 必要時重新訓練\n" +
      "✨ 你做的不只是模型, 而是把模型變成能長期運作的系統!!",

    AI工程師:
      "🧠【AI工程師｜工作內容與日常】\n" +
      "📌 你會做的事\n" +
      "🧷 把 AI 技術接到真實需求, 例如 NLP、影像、語音或 LLM 應用\n" +
      "🧷 選模型、調模型、做評估, 讓效果在真實場景也站得住\n" +
      "🧷 把功能整合進產品流程, 包含部署、權限、效能與成本控制\n" +
      "🧷 管理風險, 例如偏誤、幻覺、資料安全與使用情境限制\n" +
      "✨ 你像是 AI 與產品之間的翻譯官, 讓技術真的被用起來!!",

    資料工程師:
      "🧠【資料工程師｜工作內容與日常】\n" +
      "📌 你會做的事\n" +
      "🧷 建資料管線, 把資料從各來源抓回來、清洗、轉換、入庫\n" +
      "🧷 設計資料庫或資料倉儲, 讓查詢快、結構穩、權限清楚\n" +
      "🧷 排程與監控, 讓資料每天準時到, 出錯就能立刻知道並修復\n" +
      "🧷 服務分析與模型團隊, 提供乾淨可用的資料表與資料接口\n" +
      "✨ 你的價值是讓整間公司拿到可靠的資料, 才能往前跑!!",

    資料科學研究員:
      "🧠【資料科學研究員｜工作內容與日常】\n" +
      "📌 你會做的事\n" +
      "🧷 先把問題定義清楚, 指標怎麼算, 什麼叫更好要講明白\n" +
      "🧷 建立 baseline 再做進階方法, 用實驗說話而不是用感覺\n" +
      "🧷 做誤差分析與實驗設計, 找出提升點並驗證是否真的有效\n" +
      "🧷 把方法與結果寫成技術報告, 讓團隊能理解也能延續\n" +
      "✨ 這條路很像在做推理, 你要用證據一步步逼近答案～!!",

    研究所:
      "🧠【研究所｜在做什麼與日常】\n" +
      "📌 你會做的事\n" +
      "🧷 修課補強基礎, 線代、機率統計、ML、最佳化視領域而定\n" +
      "🧷 讀大量論文, 練習看懂方法、實驗設計與結果可信度\n" +
      "🧷 做研究題目, 從資料蒐集到實驗到分析到寫作都是你要扛\n" +
      "🧷 產出成果, 可能是論文、投稿、專題或可被驗證的研究結論\n" +
      "✨ 研究所最重要的不是忙, 而是你有沒有變得更會思考～!!"
  },

  career_detail_skill: { /* 你原本內容保持不動 */
    資料分析師:
      "🧠【資料分析師｜需要的技能】\n" +
      "📌 基礎必備\n" +
      "🧷 SQL 查詢能力, 特別是 JOIN、聚合、視窗函數\n" +
      "🧷 Excel 或 Sheets 的報表邏輯, 能把指標算清楚\n" +
      "📌 進階加分\n" +
      "🧷 Python 或 R 做清洗、EDA、統計分析與視覺化\n" +
      "🧷 Tableau 或 Power BI 做儀表板, 讓主管能每天追數據\n" +
      "✨ 最加分的是你能把結論講清楚, 讓人願意照著做～!!",
    商業分析師:
      "🧠【商業分析師｜需要的技能】\n" +
      "📌 核心能力\n" +
      "🧷 問題拆解能力, 把模糊目標變成明確指標與假設\n" +
      "🧷 指標思維, 懂轉換率、留存、CAC、LTV、ROI 的意義\n" +
      "📌 工具能力\n" +
      "🧷 Excel 與 SQL 快速拉數據算 KPI, 速度很重要\n" +
      "🧷 簡報與敘事能力, 先講結論再講證據, 才會被採用\n" +
      "✨ 你越能把數據翻成決策語言, 就越像真正的商業分析師!!",
    產品分析師:
      "🧠【產品分析師｜需要的技能】\n" +
      "📌 行為數據必備\n" +
      "🧷 事件資料的 SQL 能力, 會做漏斗、留存、cohort\n" +
      "🧷 指標設計能力, 讓 DAU、Retention、Conversion 有一致定義\n" +
      "📌 實驗能力\n" +
      "🧷 A/B Test 觀念與解讀, 知道顯著性與陷阱在哪\n" +
      "🧷 產品溝通能力, 能跟 PM、設計、工程說清楚你看到什麼\n" +
      "✨ 你不只是在算數字, 你是在幫產品找下一步的方向～!!",
    機器學習工程師:
      "🧠【機器學習工程師｜需要的技能】\n" +
      "📌 建模必備\n" +
      "🧷 Python 與資料處理, pandas、特徵工程、資料切分觀念\n" +
      "🧷 機器學習基礎, 回歸、分類、樹模型、評估指標\n" +
      "📌 工程化加分\n" +
      "🧷 版本控制與可重現實驗, Git 與實驗紀錄要做得起來\n" +
      "🧷 部署概念, API、Docker、監控與推論效能\n" +
      "✨ 模型做得出來不難, 難的是做得穩、做得久、做得可維護!!",
    AI工程師:
      "🧠【AI工程師｜需要的技能】\n" +
      "📌 深度學習能力\n" +
      "🧷 Python 與框架, PyTorch 或 TensorFlow 至少熟一套\n" +
      "🧷 了解 Transformer 與訓練技巧, 知道怎麼讓模型更穩\n" +
      "📌 落地能力\n" +
      "🧷 部署與效能, API、Docker、推論加速與成本控制\n" +
      "🧷 品質與風險評估, 幻覺、偏誤、資料安全要能說清楚\n" +
      "✨ 你越能把 AI 做成可靠功能, 就越像真正的 AI 工程師～!!",
    資料工程師:
      "🧠【資料工程師｜需要的技能】\n" +
      "📌 資料系統核心\n" +
      "🧷 SQL 與資料庫設計, Schema、索引、權限與效能概念\n" +
      "🧷 ETL/ELT 流程, 會處理清洗、排程、錯誤重跑\n" +
      "📌 平台與工具\n" +
      "🧷 雲端基礎, Storage、Compute、IAM 的概念要懂\n" +
      "🧷 排程與監控, 例如 Airflow 與告警, 保證資料準時可靠\n" +
      "✨ 你越能讓資料穩定流動, 全公司就越會依賴你～!!",
    資料科學研究員:
      "🧠【資料科學研究員｜需要的技能】\n" +
      "📌 研究型能力\n" +
      "🧷 統計與實驗設計, 檢定、估計、偏誤控制要有底\n" +
      "🧷 模型能力, 多模型比較、調參、誤差分析與 ablation\n" +
      "📌 表達與推論\n" +
      "🧷 寫作能力, 把方法、實驗、限制講清楚\n" +
      "🧷 思考能力, 能提出可驗證假設並用資料證明\n" +
      "✨ 你越重視證據與推論, 你就越像研究員～!!",
    研究所:
      "🧠【研究所｜需要準備的能力】\n" +
      "📌 學術基礎\n" +
      "🧷 線性代數、機率統計、最佳化, 這些會一直用到\n" +
      "🧷 程式實作能力, 能把想法變成可跑的實驗\n" +
      "📌 研究能力\n" +
      "🧷 文獻閱讀, 能看懂方法與結果, 也能提出質疑\n" +
      "🧷 長期專題管理, 能規劃迭代、紀錄與寫作輸出\n" +
      "✨ 如果你想把能力拉到更深的層次, 研究所會很有幫助～!!"
  },

  career_detail_background: { /* 你原本內容保持不動 */ /* ...原樣略... */ },
  learning_roadmap: { /* 你原本內容保持不動 */ /* ...原樣略... */ },
  project_suggestions: { /* 你原本內容保持不動 */ /* ...原樣略... */ },
  tools_recommendation: { /* 你原本內容保持不動 */ /* ...原樣略... */ }
};

/* =========================
   Helpers
========================= */
function buildAskAspectText(career) {
  const c = normalizeText(career);
  if (!c) return buildAskCareerText();

  return (
    `了解～你是對「${c}」有興趣對吧!!\n` +
    "那你比較想先知道這個職位\n" +
    "📌 平常在做什麼\n" +
    "📌 需要具備哪些技能\n" +
    "📌 或是學習／準備的方向呢？\n" +
    "✨ 你直接回「工作內容 / 技能 / 學習路線」就可以囉!!"
  );
}

function normalizeText(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function pickCareerFromRequest(req) {
  const p = req?.body?.queryResult?.parameters || {};

  const c1 = p.career_type;
  const c2 = p.careerType;
  const c3 = p.career;
  const c4 = p.job;
  const c5 = p.position;

  const raw = c1 || c2 || c3 || c4 || c5;

  if (Array.isArray(raw)) return normalizeText(raw[0]);

  const queryText = normalizeText(req?.body?.queryResult?.queryText);
  if (queryText) {
    for (const c of CAREERS) {
      if (queryText.includes(c)) return c;
    }
    if (queryText.includes("研究所")) return "研究所";
  }

  return normalizeText(raw);
}

function getReplyByIntentAndCareer(intentName, career) {
  const intent = normalizeText(intentName);
  const key = intentToKey[intent];

  if (!key) return null;

  const c = normalizeText(career);
  if (!c) return fallbackByKey[key] || buildAskCareerText();

  const normalizedCareer =
    CAREERS.includes(c) ? c : c.includes("研究所") ? "研究所" : "";

  if (!normalizedCareer) return fallbackByKey[key] || buildAskCareerText();

  const bucket = replies[key];
  if (!bucket) return fallbackByKey[key] || buildAskCareerText();

  return bucket[normalizedCareer] || fallbackByKey[key] || buildAskCareerText();
}

/* =========================
   FIX #1: Infer aspect from queryText (精準, 避免「機器學習」誤判成學習路線)
   FIX #2: 攔截 career overview, 只要有職位就走 webhook 正常職位回覆
   (不動原 7 個職位內容, 只改 inferKeyFromText + webhook 判斷)
========================= */
function inferKeyFromText(text) {
  const t = normalizeText(text);

  // ✅ 優先判斷：工具/作品集 (避免被「學習」搶走)
  if (/(工具清單|工具|tool|要用什麼|軟體|平台|推薦工具)/.test(t)) return "tools_recommendation";
  if (/(作品集|作品集專題建議|專題建議|project|專題|題目|可以做什麼專案)/.test(t)) return "project_suggestions";

  // 背景/特質
  if (/(背景|特質|適合|適不適合|人格|個性|哪種人)/.test(t)) return "career_detail_background";

  // 技能
  if (/(技能|需要會|要學什麼|能力|會哪些|門檻|要求)/.test(t)) return "career_detail_skill";

  // 工作內容
  if (/(工作內容|做什麼|日常|平常在做|工作在幹嘛)/.test(t)) return "career_detail_work";

  // ✅ 學習路線：不要用單獨「學習」當觸發詞 (會誤判機器學習工程師)
  if (/(學習路線|準備方向|怎麼準備|roadmap|讀書順序|先學什麼|後學什麼|學習順序|準備路線)/.test(t))
    return "learning_roadmap";

  return null;
}

function normalizeCareer(career) {
  const c = normalizeText(career);
  if (!c) return "";
  if (CAREERS.includes(c)) return c;
  if (c.includes("研究所")) return "研究所";
  return "";
}

/* =========================
   Webhook
========================= */
app.get("/", (req, res) => {
  res.status(200).send("DS Career Bot Webhook is running");
});

app.post("/webhook", (req, res) => {
  const intentName = req?.body?.queryResult?.intent?.displayName;
  const queryText = normalizeText(req?.body?.queryResult?.queryText);

  const career =
    pickCareerFromRequest(req) ||
    pickCareerFromContexts(req);

  const keyByIntent = intentToKey[normalizeText(intentName)];
  const keyByText = inferKeyFromText(queryText);
  const key = keyByIntent || keyByText;

  // ✅ FIX #2：攔截 career overview，把「資料科學研究員」拉回 webhook
  const nc_for_overview = normalizeCareer(career);
  const intentLower = normalizeText(intentName).toLowerCase();
  const isOverviewIntent =
    intentLower.includes("career overview") ||
    intentLower.includes("career_overview") ||
    intentLower.includes("職涯總覽");

  if (nc_for_overview && isOverviewIntent) {
    // 只打職位 => 問面向
    if (!keyByText) {
      return res.json({ fulfillmentText: buildAskAspectText(nc_for_overview) });
    }
    // 職位 + 面向 => 直接回
    if (replies[keyByText] && replies[keyByText][nc_for_overview]) {
      return res.json({ fulfillmentText: replies[keyByText][nc_for_overview] });
    }
    return res.json({ fulfillmentText: fallbackByKey[keyByText] || buildAskCareerText() });
  }

  // ✅ 0️⃣ 只有職位、但沒有具體 intent 也沒有面向字 → 問面向
  if (career && !key) {
    return res.json({
      fulfillmentText: buildAskAspectText(career)
    });
  }

  // ✅ 1️⃣【第一優先】有命中 intent → 一定先回 intent (完全保留原邏輯)
  if (intentName && intentToKey[intentName]) {
    const reply = getReplyByIntentAndCareer(intentName, career);
    if (reply) return res.json({ fulfillmentText: reply });
  }

  // ✅ 2️⃣【補救】intent 沒命中但文字有面向 + 有職位 → 直接回對應內容
  if (career && key && replies[key]) {
    const nc = normalizeCareer(career);
    if (nc && replies[key][nc]) {
      return res.json({ fulfillmentText: replies[key][nc] });
    }
    return res.json({
      fulfillmentText: fallbackByKey[key] || buildAskCareerText()
    });
  }

  // ✅ 3️⃣【第二優先】只有職位，沒有 intent → 才問面向 (保留原)
  if (career) {
    return res.json({
      fulfillmentText: buildAskAspectText(career)
    });
  }

  // ✅ 4️⃣ 如果只有面向沒有職位 → 先叫他選職位
  if (key) {
    return res.json({
      fulfillmentText: fallbackByKey[key] || buildAskCareerText()
    });
  }

  // ✅ 5️⃣ 最後 fallback
  return res.json({
    fulfillmentText: "你可以先告訴我你感興趣的職位喔～"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`DS Career Bot Webhook running on port ${PORT}`);
});




