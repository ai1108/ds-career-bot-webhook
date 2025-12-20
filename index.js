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
  {
    k: ["機器學習工程師", "ml工程師", "machine learning engineer", "mle"],
    v: "機器學習工程師"
  },
  { k: ["AI工程師", "ai工程師", "ai engineer"], v: "AI工程師" },
  { k: ["資料工程師", "data engineer", "de"], v: "資料工程師" },
  {
    k: ["資料科學研究員", "data scientist", "researcher", "ds research"],
    v: "資料科學研究員"
  },
  { k: ["研究所", "研究生", "碩士", "研究", "graduate", "master"], v: "研究所" }
];

const fallbackByKey = {
  career_detail:
    "你想先了解哪一個職涯方向呢？我可以介紹：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所～",
  career_detail_work:
    "你想了解哪一個職位的工作內容呢？我可以介紹：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所。",
  career_detail_skill:
    "你想了解哪一個職位需要哪些技能呢？我可以依照職位整理：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所。",
  career_detail_background:
    "你想了解哪一個職位適合什麼背景與特質呢？我可以依照職位說明：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所。",
  learning_roadmap:
    "你想走哪一個方向？我可以給你一條清楚的學習路線：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所。",
  project_suggestions:
    "你想以哪個職位為目標做作品集？我可以給你對應的專題方向：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所。",
  tools_recommendation:
    "你想走哪一個職涯方向？我可以給你最常用、最該先學的工具清單：資料分析師、商業分析師、產品分析師、機器學習工程師、AI工程師、資料工程師、資料科學研究員、研究所。"
};

/* =========================
   Replies
========================= */
const replies = {
  career_detail: {
    資料分析師:
      "如果你對用資料找出答案這件事感到有興趣，資料分析師通常會很適合你～\n" +
      "你會把混亂的資料整理成可讀的結果，並把結論講到大家聽得懂、用得上。\n" +
      "你想先從工作內容、需要的技能，還是你適不適合開始了解？",
    商業分析師:
      "商業分析師很像數據旁的策略夥伴。你會用資料協助公司做決策，回答這樣做值不值得。\n" +
      "你想先了解工作內容，還是我先幫你整理需要的能力？",
    產品分析師:
      "產品分析師用使用者數據讓產品更好用、更能成長。你會常做漏斗、留存、實驗分析。\n" +
      "你想先看工作內容，還是我直接給你常用指標與作品集方向？",
    機器學習工程師:
      "機器學習工程師會把模型做出來，也會想辦法讓它能上線、穩定運作。\n" +
      "你想先了解日常工作，還是技能路線怎麼走比較順？",
    AI工程師:
      "AI 工程師常做深度學習或 LLM 應用落地，重點是讓 AI 功能可用、可靠、能維護。\n" +
      "你對 NLP/LLM 比較有興趣，還是影像方向？",
    資料工程師:
      "資料工程師是資料世界的基礎建設者，確保資料能穩定取得、乾淨可用。\n" +
      "你想先了解工作內容，還是工具與技能清單？",
    資料科學研究員:
      "資料科學研究員偏研究與建模，會反覆實驗、比較方法、做嚴謹驗證。\n" +
      "你想先從工作內容或能力要求開始？",
    研究所:
      "研究所通常代表你想把某個領域學得更深，重點會是研究能力、文獻閱讀與實驗設計。\n" +
      "你想聊你適不適合念，還是我先給你準備路線？"
  },

  career_detail_work: {
    資料分析師:
      "資料分析師會把資料清理、分析、視覺化，最後產出可被採用的洞察與建議。\n" +
      "常見工作包含：清洗整併、EDA、儀表板、報告與溝通。",
    商業分析師:
      "商業分析師用數據支持決策，常做策略成效評估、KPI 分析、活動/營收拆解，並把結論轉成行動建議。",
    產品分析師:
      "產品分析師會看漏斗、留存、轉換與 A/B Test，找出產品流失點並提出改版方向，和 PM/設計/工程一起迭代。",
    機器學習工程師:
      "機器學習工程師會訓練與優化模型、做特徵工程，並部署到系統中，監控模型漂移與效能。",
    AI工程師:
      "AI 工程師會把深度學習或 LLM 能力導入產品，並做品質與風險評估（偏誤、幻覺、安全）。",
    資料工程師:
      "資料工程師負責 ETL/ELT 管線、資料庫與資料倉儲設計、資料品質與排程監控，讓資料可被可靠使用。",
    資料科學研究員:
      "資料科學研究員偏研究建模，做實驗設計、統計檢定、錯誤分析與方法改進，產出研究型報告。",
    研究所:
      "研究所會修課補強理論、讀論文、做研究題目與實驗，最後產出論文或研究成果。"
  },

  career_detail_skill: {
    資料分析師:
      "常見技能：Excel/Sheets、SQL、Python/R（pandas）、視覺化工具（Power BI/Tableau）、清楚表達結論。",
    商業分析師:
      "常見技能：商業問題拆解、Excel/SQL、KPI 與策略成效評估、簡報輸出、跨部門溝通。",
    產品分析師:
      "常見技能：事件資料 SQL、漏斗/留存/cohort、A/B Test、指標設計、產品思維與協作能力。",
    機器學習工程師:
      "常見技能：Python、ML 基礎、特徵工程、模型評估、部署（API/Docker）、監控與工程化習慣。",
    AI工程師:
      "常見技能：PyTorch/TensorFlow、Transformer/訓練技巧、LLM/RAG（視方向）、部署與推論效率、風險評估。",
    資料工程師:
      "常見技能：SQL、資料庫設計、ETL/ELT、排程工具、雲端與監控、資料品質觀念。",
    資料科學研究員:
      "常見技能：統計與實驗設計、ML/DL、多模型比較、錯誤分析、研究寫作與嚴謹推論。",
    研究所:
      "常見能力：線代/機率統計、Python 實驗能力、論文閱讀、研究設計、長期專題規劃與寫作。"
  },

  career_detail_background: {
    資料分析師:
      "常見背景：統計、資管、資料科學、工管、財金、理工科系。適合細心、對數據敏感、願意溝通的人。",
    商業分析師:
      "常見背景：企管、行銷、經濟、財金、資管、資料相關。適合喜歡策略、擅長表達與推動的人。",
    產品分析師:
      "常見背景：資管、工管、行銷、資訊、HCI、資料科學。適合關心使用者與產品成長的人。",
    機器學習工程師:
      "常見背景：資工、電機、資料科學、數學。適合喜歡寫程式、願意調參與處理實務限制的人。",
    AI工程師:
      "常見背景：資工/電機/資料科學，也有跨域。適合喜歡新技術、願意持續更新與落地的人。",
    資料工程師:
      "常見背景：資工、資管、後端相關。適合喜歡系統、架構、穩定性與可維護性的人。",
    資料科學研究員:
      "常見背景：統計、數學、資工、資料科學、研究相關。適合喜歡實驗、推論、鑽研方法的人。",
    研究所:
      "適合想深化理論、研究能力、走研發或高階建模的人；如果目標是快速就業，也可以先做作品集再評估。"
  },

  learning_roadmap: {
    資料分析師:
      "建議順序：Excel/Sheets → SQL → Python（清洗+EDA+視覺化）→ 統計基礎 → 作品集（儀表板+完整分析報告）。",
    商業分析師:
      "建議順序：商業指標概念 → Excel/SQL → 成效評估方法 → 視覺化與簡報 → 作品集（商業題目含效益估算）。",
    產品分析師:
      "建議順序：事件/漏斗/留存概念 → SQL → A/B Test → 追蹤工具與儀表板 → 作品集（產品成效分析+迭代方案）。",
    機器學習工程師:
      "建議順序：Python+資料處理 → ML 基礎 → 特徵工程與資料切分 → 實驗追蹤 → 部署（Docker/API）與監控。",
    AI工程師:
      "建議順序：深度學習基礎 → PyTorch/TensorFlow → 選一個方向（NLP/影像/LLM）→ 部署與評估 → 作品集（含限制與風險）。",
    資料工程師:
      "建議順序：SQL+資料庫設計 → ETL/排程 → 倉儲概念 → 常用工具（Airflow/DBT 等）→ 專案（管線+監控+可查詢成果）。",
    資料科學研究員:
      "建議順序：統計與實驗設計 → ML/DL → 論文閱讀與複現 → ablation/錯誤分析 → 研究型作品集（方法/實驗/限制）。",
    研究所:
      "建議順序：補數學（線代/機率統計）→ ML 基礎 → 選方向 → 研究型專題 → 申請文件與面試論述。"
  },

  project_suggestions: {
    資料分析師:
      "可以做：營運儀表板、用戶分群與行為分析、趨勢/異常分析。重點是結論與可執行建議。",
    商業分析師:
      "可以做：行銷活動成效分析、定價/促銷策略分析、決策模擬、競品分析。重點是像給主管看的輸出。",
    產品分析師:
      "可以做：漏斗分析、留存 cohort 分析、A/B Test 模擬、事件追蹤規格+儀表板。重點是數據到產品決策。",
    機器學習工程師:
      "可以做：預測模型、推薦系統、文本分類（加 API Demo 更好）、端到端專案（部署+監控）。",
    AI工程師:
      "可以做：文件問答（RAG）、客服助手、影像分類/偵測、模型評估與風險案例整理。",
    資料工程師:
      "可以做：API→清洗→入庫→查詢的 ETL、倉儲建模、Airflow 排程與告警、Spark demo。",
    資料科學研究員:
      "可以做：多模型比較+ablation、因果推論入門、時序/異常偵測、論文複現與差異分析。",
    研究所:
      "可以做：研究型專題、論文閱讀比較、論文複現、以論文格式寫報告。重點是研究潛力與嚴謹度。"
  },

  tools_recommendation: {
    資料分析師:
      "常用工具：Excel/Sheets、SQL、Python、Power BI/Tableau、Git/GitHub。",
    商業分析師:
      "常用工具：Excel、SQL、Power BI/Tableau、PowerPoint/Canva、基礎 Python（加分）。",
    產品分析師:
      "常用工具：SQL、GA4/Mixpanel 類、Python/R、儀表板工具、事件規格文件。",
    機器學習工程師:
      "常用工具：Python、PyTorch/TensorFlow（視方向）、Docker、實驗追蹤工具、雲端基礎。",
    AI工程師:
      "常用工具：深度學習框架、Hugging Face、生產部署工具、RAG 相關（向量檢索概念）、評估工具。",
    資料工程師:
      "常用工具：SQL、Airflow、雲端 Storage/Warehouse、Spark（視公司）、資料品質工具（加分）。",
    資料科學研究員:
      "常用工具：Python/R、Jupyter、統計工具、實驗追蹤工具、文獻整理工具。",
    研究所:
      "常用工具：Python、Jupyter/Colab、LaTeX、Git/GitHub、文獻管理工具。"
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

function intentToKey(intentName) {
  if (!intentName) return "";
  const n = String(intentName).trim().toLowerCase();

  // career_detail
  if (n.includes("career detail") && !n.includes("work") && !n.includes("skill") && !n.includes("background")) {
    return "career_detail";
  }
  if (n.includes("career_detail") && !n.includes("work") && !n.includes("skill") && !n.includes("background")) {
    return "career_detail";
  }

  // career_detail_work/skill/background
  if (n.includes("career detail
