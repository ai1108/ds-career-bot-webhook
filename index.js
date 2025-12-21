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
  // Dialogflow intents (你現在看到的是 career_detail_xxx)
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
   NEW: intents that should NOT override webhook routing
   (就算 Dialogflow 判到這些 intent, 我們仍用 queryText + career 來回正確內容)
========================= */
const IGNORE_INTENTS = new Set([
  "career_overview",
  "Career Overview",
  "Default Fallback Intent"
]);

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
   ✅ 這區完全不動你原本內容
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

  career_detail_skill: {
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

  career_detail_background: {
    資料分析師:
      "🧠【資料分析師｜適合背景與特質】\n" +
      "📌 背景\n" +
      "🧷 統計、資管、資料科學、工管、財金或理工科系都常見\n" +
      "🧷 不一定要資工, 但要願意把資料處理流程練扎實\n" +
      "📌 特質\n" +
      "🧷 細心與耐心, 因為資料真的常常不乾淨\n" +
      "🧷 喜歡把混亂變清楚, 願意反覆驗證自己的結論\n" +
      "✨ 如果你看到雜亂資料會想把它整理成有意義的故事, 你很適合～!!",

    商業分析師:
      "🧠【商業分析師｜適合背景與特質】\n" +
      "📌 背景\n" +
      "🧷 企管、行銷、經濟、財金、資管與資料相關都很常見\n" +
      "🧷 重點不是你學什麼系, 是你能不能懂商業邏輯\n" +
      "📌 特質\n" +
      "🧷 喜歡拆解問題, 也敢跟別人確認真正的需求\n" +
      "🧷 擅長溝通, 你能讓人聽懂並願意採用你的建議\n" +
      "✨ 如果你想用數據影響決策, 這個職位會很對味～!!",

    產品分析師:
      "🧠【產品分析師｜適合背景與特質】\n" +
      "📌 背景\n" +
      "🧷 資管、工管、資訊、行銷、HCI、資料科學都有人走這條\n" +
      "🧷 有產品或使用者研究概念會很加分\n" +
      "📌 特質\n" +
      "🧷 對使用者行為敏感, 會想追問為什麼會這樣用\n" +
      "🧷 喜歡和 PM、設計、工程一起解題, 不怕來回討論\n" +
      "✨ 如果你想讓產品變得更順更好用, 又想用數據說服大家～!!",

    機器學習工程師:
      "🧠【機器學習工程師｜適合背景與特質】\n" +
      "📌 背景\n" +
      "🧷 資訊、數學、統計或相關科系都很常見\n" +
      "🧷 需要對 ML 基礎與程式實作有一定熟悉度\n" +
      "📌 特質\n" +
      "🧷 喜歡建模與實驗, 願意反覆調整與找問題\n" +
      "🧷 邏輯思維清楚, 能拆解複雜問題並建立驗證流程\n" +
      "✨ 如果你不只想做分析, 而是想讓模型真的跑在系統裡, 你很適合～!!",

    AI工程師:
      "🧠【AI工程師｜適合背景與特質】\n" +
      "📌 背景\n" +
      "🧷 資工、電機、資料科學常見, 也有人從其他領域轉入\n" +
      "🧷 對深度學習或 LLM 應用有興趣會很加分\n" +
      "📌 特質\n" +
      "🧷 喜歡新技術, 也願意持續跟上工具更新\n" +
      "🧷 會在意使用情境, 想把模型做成可用功能而不是 demo\n" +
      "✨ 如果你想把 AI 變成真正能被使用的東西, 這條路很適合你～!!",

    資料工程師:
      "🧠【資料工程師｜適合背景與特質】\n" +
      "📌 背景\n" +
      "🧷 資工、資管、後端或系統相關背景很常見\n" +
      "🧷 對資料庫、系統與雲端概念有興趣會很吃香\n" +
      "📌 特質\n" +
      "🧷 重視穩定與可維護, 喜歡把流程做成可長期運作\n" +
      "🧷 能跟不同角色合作, 願意把資料供應做得可靠\n" +
      "✨ 如果你喜歡做底層架構, 讓大家拿到好資料, 你會很有成就感～!!",

    資料科學研究員:
      "🧠【資料科學研究員｜適合背景與特質】\n" +
      "📌 背景\n" +
      "🧷 統計、數學、資工、資料科學或研究取向領域很常見\n" +
      "🧷 對模型與推論有熱情, 也願意做嚴謹實驗\n" +
      "📌 特質\n" +
      "🧷 喜歡追根究柢, 對結果會想問它到底可信嗎\n" +
      "🧷 能長時間迭代, 不怕一直試一直修一直驗證\n" +
      "✨ 如果你喜歡用證據做推理, 這條路會很適合～!!",

    研究所:
      "🧠【研究所｜適合背景與特質】\n" +
      "📌 適合的人\n" +
      "🧷 想把理論學得更深, 也想練研究能力與寫作能力\n" +
      "🧷 想走研發、研究或高階建模, 需要更高門檻與深度\n" +
      "📌 需要的特質\n" +
      "🧷 能自律與長期投入, 因為研究常常不是立刻看到成果\n" +
      "🧷 願意被否定再重來, 也願意把過程寫清楚\n" +
      "✨ 如果你想把自己訓練成能獨立解題的人, 研究所會很適合～!!"
  },

  learning_roadmap: {
    資料分析師:
      "🧠【資料分析師｜學習路線】\n" +
      "📌 第一步\n" +
      "🧷 先把 SQL 練到順, 你才有能力拿到真實資料\n" +
      "📌 第二步\n" +
      "🧷 用 Python 做資料清洗與 EDA, 讓你能獨立跑完整流程\n" +
      "📌 第三步\n" +
      "🧷 補統計觀念, 相關、回歸、檢定要能解讀並避免誤判\n" +
      "📌 第四步\n" +
      "🧷 做一個儀表板與一份完整分析報告, 讓作品集能說服人\n" +
      "✨ 你只要照順序做, 很快就能做出像樣的成果～!!",

    商業分析師:
      "🧠【商業分析師｜學習路線】\n" +
      "📌 第一步\n" +
      "🧷 先學 KPI 與商業指標, 你才知道公司在意什麼\n" +
      "📌 第二步\n" +
      "🧷 Excel 與 SQL 練速度, 能快速拉數據算出關鍵指標\n" +
      "📌 第三步\n" +
      "🧷 學會把問題拆成假設與驗證方式, 才會做出可採用結論\n" +
      "📌 第四步\n" +
      "🧷 練簡報敘事, 一頁講清楚問題、洞察、建議與預估效益\n" +
      "✨ 你越能講出下一步, 你就越像真正的商業分析師～!!",

    產品分析師:
      "🧠【產品分析師｜學習路線】\n" +
      "📌 第一步\n" +
      "🧷 先理解事件資料與用戶旅程, 你才會看得懂產品數據\n" +
      "📌 第二步\n" +
      "🧷 SQL 練漏斗、留存、cohort, 這是產品分析的基本功\n" +
      "📌 第三步\n" +
      "🧷 學 A/B Test 的設計與解讀, 避免被漂亮數字騙到\n" +
      "📌 第四步\n" +
      "🧷 做一份產品成效分析報告, 提出具體優化方案與驗證方式\n" +
      "✨ 你能把數據變成產品決策, 你就會越來越像產品分析師～!!",

    機器學習工程師:
      "🧠【機器學習工程師｜學習路線】\n" +
      "📌 第一步\n" +
      "🧷 Python 與資料處理練熟, 包含清洗、特徵工程與切分\n" +
      "📌 第二步\n" +
      "🧷 ML 基礎模型與指標學扎實, 先做出 baseline 才能談提升\n" +
      "📌 第三步\n" +
      "🧷 練誤差分析與避免資料洩漏, 這會直接影響你專業度\n" +
      "📌 第四步\n" +
      "🧷 做一個可 demo 的端到端專案, 包含部署與簡單監控\n" +
      "✨ 你越能把模型做成可用系統, 你就越接近業界需求～!!",

    AI工程師:
      "🧠【AI工程師｜學習路線】\n" +
      "📌 第一步\n" +
      "🧷 先把深度學習基礎打穩, 你才知道模型為什麼會成功或失敗\n" +
      "📌 第二步\n" +
      "🧷 框架選一套深入, PyTorch 或 TensorFlow 不要兩個都淺\n" +
      "📌 第三步\n" +
      "🧷 選一個方向做深, NLP、影像或 LLM, 讓你有主戰場\n" +
      "📌 第四步\n" +
      "🧷 做落地專案, 加上評估、風險與限制說明, 讓你更像業界\n" +
      "✨ 你能講清楚效果與限制, 你就會比只會跑模型的人更強～!!",

    資料工程師:
      "🧠【資料工程師｜學習路線】\n" +
      "📌 第一步\n" +
      "🧷 SQL 與資料庫設計練熟, Schema、索引、權限先打好底\n" +
      "📌 第二步\n" +
      "🧷 做一條 ETL 管線, 從抓資料到清洗到入庫要能自動化\n" +
      "📌 第三步\n" +
      "🧷 學排程與監控, 讓資料能準時到且出錯能告警\n" +
      "📌 第四步\n" +
      "🧷 了解雲端 Storage 與 Warehouse 概念, 你才接得上公司環境\n" +
      "✨ 你做得越穩定, 你的價值就越像公司核心基礎建設～!!",

    資料科學研究員:
      "🧠【資料科學研究員｜學習路線】\n" +
      "📌 第一步\n" +
      "🧷 統計與實驗設計先打底, 否則你會很難判斷結果可信度\n" +
      "📌 第二步\n" +
      "🧷 多模型比較與調參練熟, 並且把誤差分析寫得清楚\n" +
      "📌 第三步\n" +
      "🧷 練讀論文與複現, 你會快速學到研究怎麼被驗證\n" +
      "📌 第四步\n" +
      "🧷 做研究型專題, 把動機、方法、實驗與限制寫成完整報告\n" +
      "✨ 你越能把過程講清楚, 你就越像真正的研究員～!!",

    研究所:
      "🧠【研究所｜準備與學習路線】\n" +
      "📌 第一步\n" +
      "🧷 補基礎數學, 線代、機率統計、最佳化抓重點練到熟\n" +
      "📌 第二步\n" +
      "🧷 ML 理論與實作並行, 你要能講也要能跑出結果\n" +
      "📌 第三步\n" +
      "🧷 選定研究方向, 找題目並做研究型專題, 讓你有申請主線\n" +
      "📌 第四步\n" +
      "🧷 準備文件與口條, 讀書計畫要能說出你想研究什麼與為什麼\n" +
      "✨ 你越早把主題聚焦, 你申請與就讀的路就越順～!!"
  },

  project_suggestions: {
    資料分析師:
      "🧠【資料分析師｜作品集專題建議】\n" +
      "📌 推薦方向\n" +
      "🧷 做一個營運或銷售儀表板, 讓人看到你會定義 KPI\n" +
      "🧷 做用戶分群與行為分析, 例如 RFM 或 cohort 追留存\n" +
      "🧷 做趨勢與異常分析, 找出波動原因並提出改善建議\n" +
      "📌 做專題時要注意\n" +
      "🧷 你的重點不是圖漂亮, 是結論清楚且能提出下一步\n" +
      "✨ 只要你能把洞察說成可行建議, 作品集就會很有說服力～!!",

    商業分析師:
      "🧠【商業分析師｜作品集專題建議】\n" +
      "📌 推薦方向\n" +
      "🧷 行銷活動成效分析, 把 ROI、轉換率、客單價說清楚\n" +
      "🧷 定價或促銷策略分析, 做情境比較並估算影響\n" +
      "🧷 市場與競品分析, 用資料支持結論而不是只用觀感\n" +
      "📌 做專題時要注意\n" +
      "🧷 你的輸出要像給主管看的, 結論先行並附上建議\n" +
      "✨ 你能講清楚公司下一步該怎麼做, 你就會很像真正 BA～!!",

    產品分析師:
      "🧠【產品分析師｜作品集專題建議】\n" +
      "📌 推薦方向\n" +
      "🧷 產品漏斗分析, 找流失關卡並提出改善方案與驗證方式\n" +
      "🧷 留存 cohort 分析, 找出回訪提升點並設計對策\n" +
      "🧷 A/B Test 模擬專題, 從假設到指標到檢定到結論完整跑一次\n" +
      "📌 做專題時要注意\n" +
      "🧷 你要把數據連到產品決策, 讓人看到你會推動迭代\n" +
      "✨ 你做的不是報表, 你做的是一條能讓產品變好的路～!!",

    機器學習工程師:
      "🧠【機器學習工程師｜作品集專題建議】\n" +
      "📌 推薦方向\n" +
      "🧷 預測模型專案, 特徵工程與模型比較要寫清楚\n" +
      "🧷 推薦系統入門, 先做召回再做排序, 展示你的系統思維\n" +
      "🧷 文字分類或情緒分析, 加上 API 部署會非常加分\n" +
      "📌 做專題時要注意\n" +
      "🧷 展示你如何做評估與誤差分析, 以及你怎麼避免資料洩漏\n" +
      "✨ 你能把模型做成可 demo 的服務, 面試官會很有感～!!",

    AI工程師:
      "🧠【AI工程師｜作品集專題建議】\n" +
      "📌 推薦方向\n" +
      "🧷 文件問答或知識庫助手, 加上 RAG 與評估方式\n" +
      "🧷 NLP 任務, 例如摘要、分類、意圖辨識, 強調真實使用場景\n" +
      "🧷 影像任務, 例如瑕疵檢測或物件偵測, 說清楚資料與限制\n" +
      "📌 做專題時要注意\n" +
      "🧷 不要只秀效果, 也要秀你怎麼測可靠性與怎麼控風險\n" +
      "✨ 你越能把 AI 做成可靠功能, 作品集就越像業界專案～!!",

    資料工程師:
      "🧠【資料工程師｜作品集專題建議】\n" +
      "📌 推薦方向\n" +
      "🧷 做一條 ETL 管線, 從 API 或資料來源到入庫到查詢\n" +
      "🧷 做一個資料倉儲模型, 維度表與事實表設計清楚\n" +
      "🧷 做排程與監控, 出錯告警與重跑策略要寫清楚\n" +
      "📌 做專題時要注意\n" +
      "🧷 你要展示可重跑、可追蹤、可維護, 這是工程職最在意的\n" +
      "✨ 你把資料做得穩, 你的作品集就會像公司真的會用的管線～!!",

    資料科學研究員:
      "🧠【資料科學研究員｜作品集專題建議】\n" +
      "📌 推薦方向\n" +
      "🧷 多模型比較與 ablation, 用實驗證明每一步的價值\n" +
      "🧷 因果推論入門題目, 強調偏誤控制與推論邏輯\n" +
      "🧷 論文複現專題, 跑出接近結果並分析差異原因\n" +
      "📌 做專題時要注意\n" +
      "🧷 把方法、實驗、限制與未來改進寫清楚, 這會讓你很像研究者\n" +
      "✨ 你越能把研究過程講清楚, 你就越能打動真正看重研究的人～!!",

    研究所:
      "🧠【研究所｜研究型專題建議】\n" +
      "📌 推薦方向\n" +
      "🧷 做研究型專題, 從動機到方法到實驗到限制都完整呈現\n" +
      "🧷 做論文閱讀比較, 整理 3 到 5 篇同主題並提自己的觀點\n" +
      "🧷 做論文複現, 跑出結果並解釋為什麼會不同\n" +
      "📌 做專題時要注意\n" +
      "🧷 用論文式結構寫報告, 讓教授一看就知道你有研究潛力\n" +
      "✨ 你越能把研究脈絡說清楚, 你申請研究所就越有底氣～!!"
  },

  tools_recommendation: {
    資料分析師:
      "🧠【資料分析師｜工具清單】\n" +
      "📌 必備工具\n" +
      "🧷 SQL, 任何分析工作都繞不開\n" +
      "🧷 Excel 或 Sheets, 快速檢查與算指標很常用\n" +
      "🧷 Python, pandas 與視覺化讓你能獨立完成分析流程\n" +
      "📌 加分工具\n" +
      "🧷 Tableau 或 Power BI, 儀表板會讓你更像職場即戰力\n" +
      "🧷 GitHub, 讓作品集看起來更專業也更好管理\n" +
      "✨ 先把最常用的練熟, 你就能做出真的能用的分析成果～!!",

    商業分析師:
      "🧠【商業分析師｜工具清單】\n" +
      "📌 必備工具\n" +
      "🧷 Excel, 樞紐與指標計算是日常\n" +
      "🧷 SQL, 你要能自己拉數據而不是等別人\n" +
      "🧷 PowerPoint 或 Canva, 你需要把洞察講得讓人願意做\n" +
      "📌 加分工具\n" +
      "🧷 Power BI 或 Tableau, 讓主管能自助追指標\n" +
      "🧷 Python, 自動化資料處理會讓你效率直接拉開差距\n" +
      "✨ 工具不是重點, 重點是你能把結論變成行動～!!",

    產品分析師:
      "🧠【產品分析師｜工具清單】\n" +
      "📌 必備工具\n" +
      "🧷 SQL, 事件資料分析的核心工具\n" +
      "🧷 指標與事件規格文件, 定義清楚才不會每次都吵架\n" +
      "🧷 Dashboard 工具, 讓團隊能持續追漏斗與留存\n" +
      "📌 加分工具\n" +
      "🧷 GA4 或 Mixpanel 類工具, 懂追蹤邏輯會很吃香\n" +
      "🧷 Python 或 R, 做 A/B Test 與統計分析會更扎實\n" +
      "✨ 你能把追蹤與分析串起來, 你就能真正影響產品走向～!!",

    機器學習工程師:
      "🧠【機器學習工程師｜工具清單】\n" +
      "📌 必備工具\n" +
      "🧷 Python, sklearn 與資料處理是基本盤\n" +
      "🧷 Git, 版本控制與協作不可少\n" +
      "🧷 Docker, 讓環境可重現也方便部署\n" +
      "📌 加分工具\n" +
      "🧷 MLflow 或 W&B, 實驗追蹤會讓你更像專業團隊\n" +
      "🧷 雲端基礎, 讓你能把模型放到可用的地方跑起來\n" +
      "✨ 你工具越熟, 就越能把模型從筆記本推到真實系統～!!",

    AI工程師:
      "🧠【AI工程師｜工具清單】\n" +
      "📌 必備工具\n" +
      "🧷 PyTorch 或 TensorFlow, 深度學習要能自己控訓練流程\n" +
      "🧷 Hugging Face 生態, 模型、資料與推論都很常用\n" +
      "🧷 Docker 與 API, 讓功能能被產品端真的叫得到\n" +
      "📌 加分工具\n" +
      "🧷 向量檢索概念, 你做 RAG 或知識庫會用到\n" +
      "🧷 評估與測試流程, 讓你能說清楚品質與限制\n" +
      "✨ 你越能把 AI 變得可靠可控, 就越像能上線的 AI 工程師～!!",

    資料工程師:
      "🧠【資料工程師｜工具清單】\n" +
      "📌 必備工具\n" +
      "🧷 SQL, 這是你的核心語言\n" +
      "🧷 資料庫與倉儲概念, 你要懂結構與效能\n" +
      "🧷 排程與監控工具, 讓資料每天穩定到位\n" +
      "📌 加分工具\n" +
      "🧷 Airflow, 很多公司排程會用到\n" +
      "🧷 雲端 Storage 與 Warehouse, 接上公司架構會更順\n" +
      "✨ 你把工具用成流程, 就能把資料供應做得像基礎建設一樣穩～!!",

    資料科學研究員:
      "🧠【資料科學研究員｜工具清單】\n" +
      "📌 必備工具\n" +
      "🧷 Python 或 R, 建模與分析的主力\n" +
      "🧷 Jupyter 或 Colab, 實驗與紀錄很方便\n" +
      "🧷 統計與建模套件, 讓你能做更嚴謹的推論\n" +
      "📌 加分工具\n" +
      "🧷 MLflow 或 W&B, 實驗追蹤與比較會更有說服力\n" +
      "🧷 文獻管理工具, 讓你能整理研究脈絡並快速寫作\n" +
      "✨ 你把研究紀錄做得越完整, 你的結論就越有可信度～!!",

    研究所:
      "🧠【研究所｜工具清單】\n" +
      "📌 必備工具\n" +
      "🧷 Python, 做實驗與資料處理會一直用\n" +
      "🧷 GitHub, 讓你版本可控也方便合作\n" +
      "🧷 文獻管理工具, 讀越多越需要整理系統\n" +
      "📌 加分工具\n" +
      "🧷 LaTeX, 寫論文或研究報告會更順\n" +
      "🧷 Colab 或 GPU 環境, 讓你能跑較重的實驗\n" +
      "✨ 你把工具變成習慣, 研究效率會差很多～!!"
  }
};

/* =========================
   Helpers
========================= */
function normalizeText(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

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

function pickCareerFromRequest(req) {
  const p = req?.body?.queryResult?.parameters || {};

  const c1 = p.career_type;
  const c2 = p.careerType;
  const c3 = p.career;
  const c4 = p.job;
  const c5 = p.position;

  const raw = c1 || c2 || c3 || c4 || c5;

  if (Array.isArray(raw)) return normalizeText(raw[0]);

  // 用 queryText 容錯
  const queryText = normalizeText(req?.body?.queryResult?.queryText);
  if (queryText) {
    for (const c of CAREERS) {
      if (queryText.includes(c)) return c;
    }
    if (queryText.includes("研究所")) return "研究所";
  }

  return normalizeText(raw);
}

function normalizeCareer(career) {
  const c = normalizeText(career);
  if (!c) return "";

  const compact = c.replace(/\s+/g, "");

  for (const careerName of CAREERS) {
    if (compact === careerName.replace(/\s+/g, "")) {
      return careerName;
    }
  }

  if (compact.includes("研究所")) return "研究所";

  return "";
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
   NEW: Infer aspect from queryText
   ✅ 修正你遇到的錯誤:
   -「機器學習工程師工具清單」以前會被「學習」誤判成 learning_roadmap
   - 現在先判工具/作品集，再判學習路線，且學習路線不再用「學習」這種太泛的關鍵字
========================= */
function inferKeyFromText(text) {
  const t = normalizeText(text);

  // 工具（先判，避免被「學習」吃掉）
  if (/(工具清單|工具|tool|要用什麼|軟體|平台|推薦工具)/.test(t)) return "tools_recommendation";

  // 作品集/專題（先判）
  if (/(作品集專題建議|作品集|專題|project|題目|可以做什麼專案)/.test(t)) return "project_suggestions";

  // 工作內容
  if (/(工作內容|做什麼|日常|平常在做|工作在幹嘛)/.test(t)) return "career_detail_work";

  // 技能
  if (/(技能|需要會|要學什麼|能力|會哪些|門檻|要求)/.test(t)) return "career_detail_skill";

  // 背景/特質
  if (/(背景|特質|適合|適不適合|人格|個性|哪種人)/.test(t)) return "career_detail_background";

  // 學習路線（最後判，且避免「機器學習」中的「學習」誤判）
  if (/(學習路線|準備方向|怎麼準備|roadmap|讀書順序|先學什麼|後學什麼)/.test(t)) return "learning_roadmap";

  return null;
}

/* =========================
   Webhook
========================= */
app.get("/", (req, res) => {
  res.status(200).send("DS Career Bot Webhook is running");
});

app.post("/webhook", (req, res) => {
  let intentName = req?.body?.queryResult?.intent?.displayName;
  const queryText = normalizeText(req?.body?.queryResult?.queryText);

  const career =
    pickCareerFromRequest(req) ||
    pickCareerFromContexts(req);

  // ✅ 如果 Dialogflow 判到 career_overview / fallback，
  //    但 queryText 裡有職位或面向，我們直接忽略這個 intent，用文字推斷
  if (IGNORE_INTENTS.has(normalizeText(intentName))) {
    intentName = ""; // 讓下面流程走「補救」而不是被總覽 intent 帶走
  }

  const keyByIntent = intentToKey[normalizeText(intentName)];
  const keyByText = inferKeyFromText(queryText);
  const key = keyByIntent || keyByText;

  // ✅ 0️⃣ 只有職位、但沒有面向字 → 問面向
  if (career && !key) {
    return res.json({ fulfillmentText: buildAskAspectText(career) });
  }

  // ✅ 1️⃣【第一優先】有命中 intent → 回 intent（保留原邏輯）
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
    return res.json({ fulfillmentText: fallbackByKey[key] || buildAskCareerText() });
  }

  // ✅ 3️⃣ 只有職位 → 問面向
  if (career) {
    return res.json({ fulfillmentText: buildAskAspectText(career) });
  }

  // ✅ 4️⃣ 只有面向沒有職位 → 叫他選職位
  if (key) {
    return res.json({ fulfillmentText: fallbackByKey[key] || buildAskCareerText() });
  }

  // ✅ 5️⃣ 最後 fallback
  return res.json({ fulfillmentText: "你可以先告訴我你感興趣的職位喔～" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DS Career Bot Webhook running on port ${PORT}`);
});

// LINE SDK (如果有使用 LINE Messaging API)
const line = require('@line/bot-sdk');

// 用 process.env 讀取環境變數
const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
});

// 測試是否讀到
console.log("Channel Access Token:", process.env.CHANNEL_ACCESS_TOKEN ? "OK" : "Missing");
console.log("Channel Secret:", process.env.CHANNEL_SECRET ? "OK" : "Missing");

app.post("/webhook", async (req, res) => {
  console.log("收到 LINE 訊息:", req.body);

  try {
    const events = req.body.events || [];
    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMsg = event.message.text;
        let replyText = buildAskCareerText(); // 暫時回 fallback
        await lineClient.replyMessage(event.replyToken, {
          type: "text",
          text: replyText
        });
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


app.get("/test", (req, res) => {
  console.log("有人訪問 /test");
  res.send("ok");
});

app.post("/webhook", (req, res) => {
  console.log("收到任何事件:", req.body);
  res.sendStatus(200);
});





