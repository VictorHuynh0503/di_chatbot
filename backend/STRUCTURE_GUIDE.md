# Backend Project Structure Guide

## Current Problem (Monolithic)
Everything is in `main.py`, making it hard to maintain with multiple endpoints.

## Solution: Split Using FastAPI Routers

### Project Structure
```
backend/
├── main.py                    # App initialization only
├── routers/
│   ├── __init__.py
│   ├── analyze.py            # /analyze endpoints
│   ├── events.py             # /events endpoints
│   ├── chat.py               # /chat endpoints
├── models.py                 # Shared data models (Pydantic)
├── services.py               # Shared business logic
├── requirements.txt
└── venv/
```

## Benefits
✅ Each endpoint has its own file (easy to find and modify)
✅ Shared logic is centralized (models, services)
✅ Easy to add new endpoints without cluttering main.py
✅ Better team collaboration (different people can work on different routers)
✅ Easier to test individual features

## How to Create This Structure

### 1. Move models to `models.py`
- All Pydantic models (AnalyzeRequest, ChatRequest)
- Shared type definitions

### 2. Create `services.py` for ML logic
- Decision tree training & prediction
- SHAP explainer logic
- Any utility functions shared between routers

### 3. Create router files in `routers/`
- `analyze.py`: @router.post("/analyze")
- `events.py`: @router.get("/events")
- `chat.py`: @router.post("/chat")

### 4. Update `main.py`
- Import all routers
- Register them with the app
- Keep only middleware & app setup

## Example Implementation Below ↓
