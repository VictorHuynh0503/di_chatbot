# Decision Intelligence Chatbot

A full-stack Decision Intelligence app:
- **Frontend**: React + TypeScript (Vite), Claude-style dark chat UI
- **Backend**: FastAPI + Uvicorn, Decision Tree + SHAP analysis endpoint

```
project/
├── frontend/       # React + TypeScript (Vite)
│   └── src/
│       ├── App.tsx          # main chat UI
│       ├── api.ts           # typed API client
│       └── components/
│           └── ShapGraph.tsx   # SHAP factor bar chart
└── backend/
    ├── main.py              # FastAPI app + /analyze /events /chat
    └── requirements.txt
```

---

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/analyze` | Decision Tree + SHAP — returns prediction, probabilities, SHAP values, and graph nodes/edges |
| GET | `/events` | Upcoming market events |
| POST | `/chat` | Keyword router — calls the right endpoints and returns context data |

### `/analyze` example request

```json
{
  "vix": 18.4,
  "sentiment_score": 0.65,
  "pe_ratio": 22.0,
  "gdp_growth": 2.8,
  "inflation": 2.5
}
```

### `/analyze` example response (abridged)

```json
{
  "prediction": "buy",
  "probabilities": { "sell": 0.0, "hold": 0.0, "buy": 1.0 },
  "shap": {
    "base_value": 0.8,
    "values": {
      "vix": -0.12,
      "sentiment_score": 0.45,
      "pe_ratio": -0.08,
      "gdp_growth": 0.31,
      "inflation": -0.05
    }
  },
  "graph": {
    "nodes": [ { "id": "root", "label": "Decision", ... }, ... ],
    "edges": [ { "source": "factor_0", "target": "root", ... } ]
  }
}
```

---

## How Decision Tree + SHAP works

1. A `DecisionTreeClassifier` is trained on 5 market features (VIX, sentiment, P/E ratio, GDP growth, inflation) with labels: `sell / hold / buy`.
2. `shap.TreeExplainer` computes the Shapley value for each feature — the marginal contribution of that feature to the prediction vs. the base rate.
3. The SHAP values are returned both as raw numbers and as graph nodes/edges (source = factor, target = root decision node) so you can build any graph visualisation on top.
4. The frontend renders a zero-centred bar chart — green bars push toward the prediction, red bars push against it.
