# DS Career Bot – Webhook

A Dialogflow fulfillment webhook that powers **Byte Your Career**, a LINE chatbot that gives students personalized guidance across 8 data-science career tracks. Built for the Digital Humanities Poster Competition, where it won **1st Place**.

## What it does

Students chat with the LINE bot and pick a career track (e.g. Data Analyst, Machine Learning Engineer, Research Assistant). Dialogflow classifies the user's intent, and this webhook routes the request to the right response for that track — job scope, required skills, a learning roadmap, project ideas, or recommended tools.

## Career tracks covered

- 資料分析師 (Data Analyst)
- 商業分析師 (Business Analyst)
- 產品分析師 (Product Analyst)
- 機器學習工程師 (Machine Learning Engineer)
- AI工程師 (AI Engineer)
- 資料工程師 (Data Engineer)
- 資料科學研究員 (Data Science Researcher)
- 研究所 (Graduate School)

## How it works

1. User messages on LINE are sent to Dialogflow, which classifies intent (e.g. `career_detail_work`, `learning_roadmap`, `tools_recommendation`).
2. Dialogflow calls this webhook with the matched intent, plus any contexts/parameters (such as the selected career track).
3. The webhook maps the intent — including alias and fallback handling for naming variations — to the right career track and returns the matching structured response text.
4. Dialogflow relays the response back to the user on LINE.

## Tech stack

Node.js, Express, body-parser, Dialogflow (intent recognition & context management), LINE Messaging API (`@line/bot-sdk`)

## Running locally

```
npm install
CHANNEL_ACCESS_TOKEN=your_token CHANNEL_SECRET=your_secret npm start
```

Credentials are read from environment variables (`CHANNEL_ACCESS_TOKEN`, `CHANNEL_SECRET`) — never hardcoded.

## Background

Built as part of **Byte Your Career** — 1st Place, Digital Humanities Poster Competition, Soochow University.

