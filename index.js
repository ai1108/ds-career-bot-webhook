const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const career = req.body.queryResult.parameters.career_type;

  let reply = "這個部分我可以再幫你更詳細說明，或你也可以換一個職涯方向詢問。";

  /* =========================
     Career Detail - Work
  ========================= */
  if (intent === "Career Detail Work") {
    if (career === "商業分析師") {
      reply = `商業分析師的核心工作是「透過資料協助企業做出更好的決策」。  
實際工作內容包含：  
1️⃣ 分析銷售、行銷與顧客行為資料，找出趨勢與異常  
2️⃣ 協助產品、行銷或業務團隊評估策略成效  
3️⃣ 將複雜的數據結果轉化為商業洞察與建議  
4️⃣ 與跨部門溝通，確保資料分析結果能實際被應用  
這個角色非常重視「資料解讀能力」與「商業理解能力」。`;
    } 
    else if (career === "資料分析師") {
      reply = `資料分析師主要負責資料的整理、分析與視覺化，協助組織理解資料背後的意義。  
工作內容通常包括：  
1️⃣ 資料清理與前處理，確保資料品質  
2️⃣ 進行探索性資料分析（EDA），找出資料特徵  
3️⃣ 建立圖表、儀表板，呈現數據趨勢  
4️⃣ 支援決策單位進行數據導向決策  
此職位偏向「技術導向分析」，但仍需要基本溝通能力。`;
    }
    else if (career === "資料工程師") {
      reply = `資料工程師的主要任務是「打造穩定可用的資料系統」。  
常見工作內容包括：  
1️⃣ 建立資料管道（ETL/ELT）  
2️⃣ 設計與維護資料庫與資料倉儲  
3️⃣ 處理大量資料的收集、儲存與轉換  
4️⃣ 與資料分析師、科學家合作，確保資料可被使用  
這是一個偏重系統架構與工程能力的角色。`;
    }
    else if (career === "機器學習工程師") {
      reply = `機器學習工程師負責將模型真正「部署並運作在產品中」。  
工作內容包含：  
1️⃣ 訓練與優化機器學習模型  
2️⃣ 將模型整合到實際系統  
3️⃣ 監控模型表現與效能  
4️⃣ 與工程團隊合作解決實務問題  
此角色結合理論、程式與系統能力。`;
    }
    else if (career === "AI工程師") {
      reply = `AI工程師專注於人工智慧應用的開發與落地。  
實際工作包含：  
1️⃣ 使用深度學習模型解決影像、語音或語言問題  
2️⃣ 設計 AI 應用系統  
3️⃣ 與產品團隊合作導入 AI 功能  
4️⃣ 評估模型效能與風險  
此職位通常需要較強的數學與程式背景。`;
    }
  }

  /* =========================
     Career Detail - Skill
  ========================= */
  if (intent === "Career Detail Skill") {
    if (career === "商業分析師") {
      reply = `商業分析師需要結合「資料能力」與「商業思維」。  
常見技能包括：  
✔ SQL、Excel、Python  
✔ 資料分析與視覺化能力  
✔ 商業邏輯與問題拆解能力  
✔ 與非技術人員溝通的能力  
相較於純技術職位，商業理解非常重要。`;
    }
    else if (career === "資料分析師") {
      reply = `資料分析師需要扎實的資料處理與分析技能。  
核心技能包含：  
✔ Python / R  
✔ SQL  
✔ 資料清理與探索性分析  
✔ 資料視覺化工具（如 Tableau、Power BI）  
此外，也需要基本的統計觀念。`;
    }
    else if (career === "資料工程師") {
      reply = `資料工程師重視工程與系統能力。  
技能需求包括：  
✔ SQL 與資料庫設計  
✔ ETL 流程  
✔ 大數據工具（如 Spark）  
✔ 雲端平台（AWS、GCP、Azure）  
✔ 系統效能與穩定性設計`;
    }
  }

  /* =========================
     Career Detail - Background
  ========================= */
  if (intent === "Career Detail Background") {
    if (career === "商業分析師") {
      reply = `商業分析師適合具有商管、行銷、經濟或資料背景的人。  
特質包括：  
✔ 喜歡分析問題  
✔ 善於溝通與表達  
✔ 對商業運作有興趣  
✔ 能將數據轉為決策建議`;
    }
    else if (career === "資料分析師") {
      reply = `資料分析師適合具備理工或資料相關背景的人。  
特質包括：  
✔ 對數據敏感  
✔ 細心且有耐心  
✔ 喜歡從資料中找規律  
✔ 願意與他人討論分析結果`;
    }
  }

  /* =========================
     Learning Roadmap
  ========================= */
  if (intent === "Learning Roadmap") {
    if (career === "研究所") {
      reply = `若目標為研究所，建議學習路線如下：  
1️⃣ 強化數學與統計基礎  
2️⃣ 系統性學習機器學習理論  
3️⃣ 參與研究型專題或論文閱讀  
4️⃣ 培養程式實作與實驗設計能力  
這對申請研究所非常重要。`;
    }
  }

  /* =========================
     Project Suggestions
  ========================= */
  if (intent === "Project Suggestions") {
    reply = `你可以嘗試以下專題方向：  
✔ 資料分析儀表板  
✔ 使用者行為分析  
✔ 預測模型或推薦系統  
✔ 商業問題導向的資料分析專題  
重點是「問題定義清楚」與「分析有結論」。`;
  }

  /* =========================
     Tools Recommendation
  ========================= */
  if (intent === "Tools Recommendations") {
    reply = `建議熟悉的工具包含：  
✔ Python、SQL  
✔ Jupyter Notebook  
✔ Tableau / Power BI  
✔ Git 與 GitHub  
✔ 雲端平台基礎  
這些工具在資料相關職涯中非常實用。`;
  }

  /* =========================
     Beginner Advice
  ========================= */
  if (intent === "Beginner Advice") {
    reply = `給初學者的建議：  
1️⃣ 不要只學工具，先理解問題  
2️⃣ 多做專題而不是只看課程  
3️⃣ 養成整理與解釋資料的習慣  
4️⃣ 勇於詢問與分享成果  
穩定累積比一次學很多更重要。`;
  }

  /* =========================
     Internship Preparation
  ========================= */
  if (intent === "Internship Preparation") {
    reply = `實習準備建議：  
✔ 準備清楚的專題作品  
✔ 熟悉基礎資料分析流程  
✔ 能清楚說明你做過的事情  
✔ 了解產業背景與公司需求  
實習單位通常重視「學習能力」而非完美技能。`;
  }

  res.json({
    fulfillmentText: reply
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`DS Career Bot Webhook is running on port ${PORT}`);
});