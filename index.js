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

const CAREER_ALIASES = {
  "AI 工程師": "AI工程師",
  "AI工程": "AI工程師",
  "資料科學研究院": "資料科學研究員",
  "資料科學研究員": "資料科學研究員"
};

const CAREER_KEYWORDS = [
  { k: ["資料分析師", "data analyst", "da"], v: "資料分析師" },
  { k: ["商業分析師", "business analyst", "ba"], v: "商業分析師" },
  { k: ["產品分析師", "product analyst", "pa"], v: "產品分析師" },
  { k: ["機器學習工程師", "ml工程師", "machine learning engineer", "mle", "機器學習"], v: "機器學習工程師" },
  { k: ["AI工程師", "ai工程師", "ai engineer", "人工智慧工程師"], v: "AI工程師" },
  { k: ["資料工程師", "data engineer", "de"], v: "資料工程師" },
  { k: ["資料科學研究員", "資料科學家", "data scientist", "researcher", "ds research"], v: "資料科學研究員" },
  { k: ["研究所", "研究生", "碩士", "研究", "graduate", "master"], v: "研究所" }
];

const fallbackByKey = {
  career_detail:
    "你想先了解哪一個職涯方向呢？我可以介紹：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所。",
  career_detail_work:
    "你想了解哪一個職位的工作內容呢？你可以直接回我職位名稱。",
  career_detail_skill:
    "你想了解哪一個職位需要哪些技能呢？你可以直接回我職位名稱。",
  career_detail_background:
    "你想了解哪一個職位適合什麼背景與特質呢？你可以直接回我職位名稱。",
  learning_roadmap:
    "你想知道哪一個方向的學習路線呢？你可以直接回我職位名稱。",
  project_suggestions:
    "你想以哪個職位為目標做作品集？你可以直接回我職位名稱。",
  tools_recommendation:
    "你想知道哪一個職位常用的工具？你可以直接回我職位名稱。"
};

/* =========================
   Replies
========================= */
const replies = {
  career_detail: {
    資料分析師:
      "資料分析師的重點是把資料整理、分析，最後轉成能被理解與採用的結論。你會常做指標追蹤、報表、儀表板與分析報告，並把洞察說清楚，讓團隊能用數據做決策。",
    商業分析師:
      "商業分析師會用數據支持策略與決策，回答活動值不值得、資源該放哪裡、哪些客群最重要等問題。你需要能把分析轉成可執行建議，並和不同部門溝通落地。",
    產品分析師:
      "產品分析師透過使用者行為數據讓產品更好用、更能成長。你會關注漏斗、留存、轉換與實驗結果，找出流失點並提出迭代方向，和 PM、設計、工程一起推進。",
    機器學習工程師:
      "機器學習工程師不只做模型，也要讓模型能上線並穩定運作。你會做資料處理、特徵工程、訓練與評估，並把模型部署到 API 或流程中，持續監控品質與效能。",
    AI工程師:
      "AI工程師偏向深度學習或 LLM 應用落地，重點是讓 AI 功能可用、可靠且可維護。你可能會做模型選型與微調、系統整合、推論效能優化，以及品質與風險評估。",
    資料工程師:
      "資料工程師負責資料管線與資料系統，確保資料能穩定取得、乾淨可用。你會做 ETL/ELT、資料庫與倉儲設計、排程監控與資料品質治理，讓分析與模型有可靠的資料基礎。",
    資料科學研究員:
      "資料科學研究員更偏研究與建模，重視方法、實驗設計與嚴謹驗證。你會比較多模型、做統計檢定與錯誤分析，撰寫研究或技術報告，追求更好的效果與可解釋性。",
    研究所:
      "研究所重點是研究能力與方法訓練，不只是上課寫作業。你會讀論文、設計實驗、分析結果並寫成報告或論文，培養提出問題、驗證假設與長期推進題目的能力。"
  },

  career_detail_work: {
    資料分析師:
      "資料分析師常見工作包含：資料清理與整併、探索性分析、指標設計與追蹤、視覺化與儀表板、撰寫分析報告，以及把洞察講清楚讓團隊採用。",
    商業分析師:
      "商業分析師常見工作包含：KPI 與績效分析、活動與策略成效評估、顧客與市場分析、營收與成本拆解、提出決策建議，並跨部門溝通把建議落地。",
    產品分析師:
      "產品分析師常見工作包含：漏斗分析找流失點、留存與 cohort 分析、A/B Test 設計與解讀、行為事件追蹤規格、建立產品儀表板，並協助 PM 做迭代決策。",
    機器學習工程師:
      "機器學習工程師常見工作包含：資料處理與特徵工程、模型訓練與調參、評估與錯誤分析、部署模型到 API 或批次流程、監控模型漂移與效能，並持續迭代。",
    AI工程師:
      "AI工程師常見工作包含：模型選型與訓練或微調、把 AI 能力整合到產品流程、推論效能與成本優化、建立評估與測試集、處理偏誤與可靠性議題，確保功能可用。",
    資料工程師:
      "資料工程師常見工作包含：建立 ETL/ELT 管線、資料庫與資料倉儲設計、排程與監控、資料品質檢核與血緣追蹤、權限治理與效能優化，提供可用的資料給下游。",
    資料科學研究員:
      "資料科學研究員常見工作包含：問題定義與指標設計、建立與比較多模型、實驗設計與統計檢定、特徵工程與錯誤分析、撰寫研究或技術報告，並提出改進方向。",
    研究所:
      "研究所常見內容包含：修課補強理論、閱讀與整理文獻、確立研究題目、蒐集資料與設計實驗、分析結果與撰寫論文或研究報告，並進行口頭報告或投稿。"
  },

  career_detail_skill: {
    資料分析師:
      "常見技能包含：Excel/Sheets、SQL（查詢與聚合、JOIN、視窗函數）、Python/R（清洗、EDA、統計、視覺化）、BI 工具（Power BI/Tableau），以及清楚表達結論與建議。",
    商業分析師:
      "常見技能包含：商業問題拆解（目標、指標、假設、驗證）、Excel/SQL 算 KPI、成效評估與解讀能力、簡報輸出能力、跨部門溝通能力與商業敏感度。",
    產品分析師:
      "常見技能包含：事件資料分析的 SQL、漏斗/留存/cohort、A/B Test 與統計解讀、指標設計（DAU、Retention、Conversion、LTV）、產品思維與協作能力。",
    機器學習工程師:
      "常見技能包含：Python、機器學習基礎（分類/回歸/評估指標）、特徵工程與資料切分避免洩漏、部署能力（API、Docker）、監控與工程化習慣（版本、可重現）。",
    AI工程師:
      "常見技能包含：深度學習框架（PyTorch/TensorFlow）、Transformer 與訓練技巧、LLM/RAG 或影像方向能力、部署與推論效率、品質與風險評估（偏誤、可靠性、安全）。",
    資料工程師:
      "常見技能包含：SQL 與資料庫設計、ETL/ELT 與排程、資料倉儲概念、雲端基礎（權限、儲存、計算）、監控與資料品質治理，以及穩定性與效能思維。",
    資料科學研究員:
      "常見技能包含：統計與實驗設計、ML/DL 建模與調參、多模型比較與錯誤分析、推論與可解釋性思維、研究寫作能力與嚴謹驗證習慣。",
    研究所:
      "常見能力包含：線代/機率統計基礎、程式實驗能力（Python）、文獻閱讀與整理、研究設計與實驗規劃、長期專題管理與寫作表達能力。"
  },

  career_detail_background: {
    資料分析師:
      "常見背景：統計、資管、資料科學、工管、財金、理工科系。適合特質：細心、有耐心、對數據敏感，願意把結果講清楚並與團隊協作。",
    商業分析師:
      "常見背景：企管、行銷、經濟、財金、資管、資料相關科系。適合特質：對商業有興趣、會拆解問題、能表達與說服，願意把分析推到決策與行動。",
    產品分析師:
      "常見背景：資管、工管、行銷、資訊、HCI、資料科學。適合特質：關心使用者行為與產品成長，願意用數據驗證想法，也擅長跨角色協作。",
    機器學習工程師:
      "常見背景：資工、電機、資料科學、數學相關。適合特質：喜歡寫程式、願意處理資料髒與模型不穩等現實問題，能耐心調參並做錯誤分析。",
    AI工程師:
      "常見背景：資工/電機/資料科學，也有跨域轉入。適合特質：喜歡新技術、能快速學習並落地，對模型品質、可靠性與風險敏感。",
    資料工程師:
      "常見背景：資工、資管、後端工程相關。適合特質：喜歡系統與架構、重視穩定性與可維護性，能和分析師與科學家協作把資料供應做好。",
    資料科學研究員:
      "常見背景：統計、數學、資工、資料科學、研究相關領域。適合特質：喜歡研究與實驗、重視證據與推論，能長時間迭代方法並把結果寫清楚。",
    研究所:
      "適合：想深化理論與研究能力、想走研發或高階建模的人。若目標是快速就業，也可以先以作品集與實務能力為主，再評估是否需要研究所。"
  },

  learning_roadmap: {
    資料分析師:
      "建議順序：Excel/Sheets（報表與指標）→ SQL（查詢、JOIN、聚合、視窗）→ Python/R（清洗、EDA、視覺化）→ 統計基礎（抽樣、檢定、回歸）→ 作品集（儀表板加完整分析報告）。",
    商業分析師:
      "建議順序：商業指標概念（營收、轉換、留存、CAC/LTV）→ Excel/SQL（算 KPI）→ 成效評估與拆解方法 → 視覺化與簡報輸出 → 作品集（商業題目含效益估算與建議）。",
    產品分析師:
      "建議順序：事件/漏斗/留存概念 → SQL（事件資料、cohort）→ A/B Test（假設、顯著性、解讀）→ 追蹤工具與儀表板 → 作品集（產品成效分析加迭代方案）。",
    機器學習工程師:
      "建議順序：Python 與資料處理 → ML 基礎（分類/回歸/樹模型/指標）→ 特徵工程與避免資料洩漏 → 實驗流程與追蹤 → 部署（Docker/API）與監控。",
    AI工程師:
      "建議順序：深度學習基礎（訓練技巧與 Transformer 概念）→ PyTorch/TensorFlow 擇一深入 → 選方向（NLP/影像/LLM）→ 部署與推論效率 → 作品集（效果、限制、風險與評估）。",
    資料工程師:
      "建議順序：SQL 與資料庫設計 → ETL/ELT（抓取、清洗、入庫、排程）→ 資料倉儲概念（維度/事實、分區、血緣）→ 工具（Airflow/DBT 等）→ 專案（管線加監控告警）。",
    資料科學研究員:
      "建議順序：統計與實驗設計 → ML/DL 建模 → 文獻閱讀與複現 → ablation/錯誤分析 → 研究型作品集（方法、實驗、限制、未來改進）。",
    研究所:
      "建議順序：補數學（線代、機率統計、最佳化）→ ML 基礎（演算法、評估、實作）→ 選方向（NLP/CV/推薦等）→ 研究型專題（動機、方法、實驗）→ 申請文件與面試論述。"
  },

  project_suggestions: {
    資料分析師:
      "作品集方向：營運或銷售儀表板、用戶分群與行為分析、趨勢與異常分析。重點是清楚結論與可執行建議。",
    商業分析師:
      "作品集方向：行銷活動成效分析、定價或促銷策略評估、決策模擬、競品與市場分析。重點是像給主管看的結論與建議。",
    產品分析師:
      "作品集方向：產品漏斗分析、留存 cohort 分析、A/B Test 模擬、事件追蹤規格加儀表板。重點是數據到產品決策的完整鏈路。",
    機器學習工程師:
      "作品集方向：預測模型（含特徵工程與比較）、推薦系統、文本分類或情緒分析（加 API Demo），端到端專案（部署加監控）。",
    AI工程師:
      "作品集方向：文件問答（RAG）、客服助理、影像分類或偵測、模型評估與風險案例整理。重點是可用性與評估。",
    資料工程師:
      "作品集方向：API→清洗→入庫→查詢的 ETL 管線、倉儲建模、排程與告警、資料品質檢核。重點是可重跑、可追蹤、穩定。",
    資料科學研究員:
      "作品集方向：多模型比較與 ablation、因果推論入門、時序或異常偵測、論文複現與差異分析。重點是嚴謹方法與清楚限制。",
    研究所:
      "作品集方向：研究型專題、論文閱讀比較、論文複現、以論文格式寫報告。重點是研究動機、方法與驗證能力。"
  },

  tools_recommendation: {
    資料分析師:
      "常用工具：Excel/Sheets、SQL、Python（pandas、視覺化）、Power BI/Tableau、Git/GitHub。",
    商業分析師:
      "常用工具：Excel、SQL、Power BI/Tableau、簡報工具（PowerPoint/Canva）、基礎 Python（加分）。",
    產品分析師:
      "常用工具：SQL、行為追蹤工具（GA4/Mixpanel 類）、Python/R（實驗與統計）、儀表板工具、事件與指標規格文件。",
    機器學習工程師:
      "常用工具：Python、sklearn、PyTorch/TensorFlow（依方向）、Docker、實驗追蹤工具（加分）、雲端基礎（加分）。",
    AI工程師:
      "常用工具：深度學習框架、模型與資料工具生態、Docker 與 API、向量檢索或 RAG 相關工具（視方向）、評估與測試流程。",
    資料工程師:
      "常用工具：SQL、排程工具（Airflow 類）、雲端儲存與倉儲概念、Spark（視公司）、資料品質與血緣工具（加分）。",
    資料科學研究員:
      "常用工具：Python/R、Jupyter、統計工具、實驗追蹤工具（加分）、文獻整理工具。",
    研究所:
      "常用工具：Python、Jupyter/Colab、LaTeX、Git/GitHub、文獻管理工具（Zotero/EndNote 類）。"
  }
};

/* =========================
   Helpers
========================= */
function normalizeCareer(raw) {
  if (!raw) return "";
  let c = String(raw).trim();
  c = c.replace(/\s+/g, "");
  if (CAREER_ALIASES[c]) c = CAREER_ALIASES[c];
  return c;
}

function pickCareerFromParameters(params = {}) {
  return params.career_type || params.career || params.careerType || params.job || "";
}

function guessCareerFromText(text) {
  if (!text) return "";
  const t = String(text).toLowerCase();
  for (const item of CAREER_KEYWORDS) {
    for (const kw of item.k) {
      if (t.includes(String(kw).toLowerCase())) return item.v;
    }
  }
  return "";
}

// Intent name mapping (tolerant)
function intentToKey(intentName) {
  if (!intentName) return "";
  const n = String(intentName).trim().toLowerCase();

  // career_detail (overview)
  if (
    (n.includes("career detail") || n.includes("career_detail")) &&
    !n.includes("work") &&
    !n.includes("skill") &&
    !n.includes("background")
  ) {
    return "career_detail";
  }

  // career_detail_work
  if (n.includes("career detail work") || n.includes("career_detail_work") || (n.includes("career") && n.includes("work"))) {
    return "career_detail_work";
  }

  // career_detail_skill
  if (n.includes("career detail skill") || n.includes("career_detail_skill") || (n.includes("career") && n.includes("skill"))) {
    return "career_detail_skill";
  }

  // career_detail_background
  if (
    n.includes("career detail background") ||
    n.includes("career_detail_background") ||
    (n.includes("career") && n.includes("background"))
  ) {
    return "career_detail_background";
  }

  // learning_roadmap
  if (n.includes("learning roadmap") || n.includes("learning_roadmap") || n.includes("roadmap")) {
    return "learning_roadmap";
  }

  // project_suggestions
  if (n.includes("project suggestions") || n.includes("project_suggestions") || n.includes("project")) {
    return "project_suggestions";
  }

  // tools_recommendation
  if (
    n.includes("tools recommendations") ||
    n.includes("tools recommendation") ||
    n.includes("tools_recommendation") ||
    n.includes("tools")
  ) {
    return "tools_recommendation";
  }

  return "";
}

function getReply(intentName, parameters, queryText) {
  const key = intentToKey(intentName);
  if (!key) return null;

  let career = normalizeCareer(pickCareerFromParameters(parameters));
  if (!career) {
    career = normalizeCareer(guessCareerFromText(queryText));
  }

  if (!career || !CAREERS.includes(career)) {
    return fallbackByKey[key] || "你想了解哪一個職涯方向呢？";
  }

  return (replies[key] && replies[key][career]) || fallbackByKey[key] || "你想了解哪一個職涯方向呢？";
}

/* =========================
   Webhook
========================= */
app.post("/webhook", (req, res) => {
  const intent = req.body?.queryResult?.intent?.displayName || "";
  const parameters = req.body?.queryResult?.parameters || {};
  const queryText = req.body?.queryResult?.queryText || "";

  // Debug logs: confirm webhook is hit and see what Dialogflow sends
  console.log("[webhook] intent =", intent);
  console.log("[webhook] queryText =", queryText);
  console.log("[webhook] parameters =", JSON.stringify(parameters));

  const reply =
    getReply(intent, parameters, queryText) ||
    "我有收到你的問題，但我需要你提供職位名稱，例如：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所。";

  res.json({ fulfillmentText: reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("DS Career Bot Webhook is running on port " + PORT);
});
