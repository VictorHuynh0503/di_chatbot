# Backend Refactoring Guide: Splitting main.py

## Quick Summary

I've created a **router-based structure** for better organization. This allows you to:
- Keep each endpoint in its own file
- Share common logic in `services.py`
- Easily add new features without cluttering `main.py`

---

## What Was Created

### 📁 New File Structure
```
backend/
├── main.py                    # ← OLD (monolithic)
├── main_refactored.py         # ← NEW (router-based) - RENAME THIS!
├── models.py                  # NEW: All Pydantic models
├── services.py                # NEW: Shared ML logic & utilities
└── routers/
    ├── __init__.py
    ├── analyze.py             # NEW: @router.post("/analyze")
    ├── events.py              # NEW: @router.get("/events")
    └── chat.py                # NEW: @router.post("/chat")
```

---

## Migration Steps

### Step 1: Rename the refactored file
```bash
cd backend
rm main.py                    # Delete old monolithic main.py
mv main_refactored.py main.py # Use the new refactored version
```

### Step 2: Start the app
```bash
# From start.bat, or manually:
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Verify it works
- Visit http://localhost:8000/docs
- Test all endpoints (they should work exactly as before)

---

## File Descriptions

### `models.py`
Contains all Pydantic model definitions:
- **Input models**: AnalyzeRequest, ChatRequest
- **Output models**: AnalyzeResult, ChatResponse, EventsResponse
- **Helper models**: ShapResult, GraphNode, GraphEdge

**Usage in routers:**
```python
from models import AnalyzeRequest, AnalyzeResult

@router.post("", response_model=AnalyzeResult)
def analyze(req: AnalyzeRequest):
    ...
```

### `services.py`
Contains reusable business logic:
- **Model training**: `initialize_model()` - trains the Decision Tree
- **Prediction**: `predict_and_explain()` - gets predictions + SHAP values
- **Visualization**: `build_graph()` - creates graph for frontend
- **Getters**: `get_model()`, `get_explainer()` - access trained models
- **Constants**: Feature names, label names, training data

**Usage in routers:**
```python
from services import predict_and_explain, build_graph

analysis = predict_and_explain(x)  # Get predictions + SHAP
graph = build_graph(pred_idx, shap_values, request_data)
```

### `routers/analyze.py`
Handles `/analyze` endpoint:
- Takes market factors as input (VIX, sentiment, PE ratio, etc.)
- Uses services to predict decision (buy/sell/hold)
- Returns probabilities, SHAP values, and visualization graph

### `routers/events.py`
Handles `/events` endpoint:
- Returns list of upcoming market events
- Mock data (can be replaced with real data source)

### `routers/chat.py`
Handles `/chat` endpoint:
- Routes user questions to the right endpoint based on intent
- Priority-based matching (analyze > events)
- Returns context data from the triggered endpoint

---

## Why This Structure?

| Aspect | Monolithic (main.py) | Router-Based |
|--------|--------|----------|
| **Finding code** | Everything in one file (hard to scroll) | Each feature in its own file |
| **Adding endpoints** | Edit main.py, scroll to find where to add | Create new `routers/feature.py` |
| **Shared logic** | Duplicated or buried in main.py | Centralized in `services.py` |
| **Testing** | Test entire app or complex mocking | Test routers independently |
| **Team work** | Changes conflict in one big file | Different devs work on different routers |

---

## Example: Adding a New Endpoint

### Without Routers (Old way):
1. Edit `main.py`
2. Add imports at top
3. Scroll down to find where to add @app.post/get
4. Copy-paste logic at the end
5. Might duplicate code from other endpoints

### With Routers (New way):
1. Create `routers/my_feature.py`:
   ```python
   from fastapi import APIRouter
   from models import MyRequest, MyResponse
   from services import my_helper_function
   
   router = APIRouter(prefix="/my-feature", tags=["MyFeature"])
   
   @router.post("", response_model=MyResponse)
   def my_endpoint(req: MyRequest):
       result = my_helper_function(req)
       return result
   ```

2. Register in `main.py`:
   ```python
   from routers import my_feature_router
   app.include_router(my_feature_router)
   ```

**That's it!** No scrolling, no cluttering main.py, no code duplication.

---

## How Routers Work (Behind the Scenes)

```python
# In main.py
from routers import analyze_router
app.include_router(analyze_router)

# This makes ALL routes in analyze_router available:
# - @router.post("/analyze", ...) becomes POST /analyze
# - With prefix="/analyze", @router.post("") becomes POST /analyze
```

---

## Testing Individual Routers

```python
# routers/analyze.py - can be tested independently
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_analyze():
    response = client.post("/analyze", json={
        "vix": 20,
        "sentiment_score": 0.7,
        "pe_ratio": 25,
        "gdp_growth": 2.5,
        "inflation": 3.0
    })
    assert response.status_code == 200
    assert "prediction" in response.json()
```

---

## Common Questions

### Q: Can I still have logic in main.py?
**A:** Yes! Keep app-level logic there (middleware, CORS, global error handlers). Feature logic goes in routers.

### Q: Do I need to change the frontend?
**A:** No! The API endpoints are identical. Frontend works with both old and new structure.

### Q: How do I share state between routers?
**A:** Use `services.py`. Models are initialized once when the app starts.

### Q: What if I want multiple files for one router?
**A:** Create a subdirectory:
```
routers/
├── analyze/
│   ├── __init__.py  (exports router)
│   ├── routes.py    (endpoint definitions)
│   ├── utils.py     (helper functions)
│   └── models.py    (router-specific models)
```

---

## Next Steps

1. **Backup old main.py** (just in case)
2. **Replace with main_refactored.py**
3. **Test all endpoints work**
4. **Start using router structure for new features**

---

**Questions? The new structure follows FastAPI best practices and is production-ready! 🚀**
