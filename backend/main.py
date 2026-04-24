"""
DI Chatbot Backend - Decision Intelligence API
Main application entry point with FastAPI setup.

This is the refactored version using routers for better organization.
Each feature area (analyze, events, chat) has its own router file.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from routers import analyze_router, events_router, chat_router

# ── Application Setup ─────────────────────────────────────────────────────────

app = FastAPI(
    title="Decision Intelligence API",
    description="Market analysis using Decision Trees + SHAP explainability",
    version="1.0.0"
)

# ── CORS Middleware ───────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──────────────────────────────────────────────────────────

app.include_router(analyze_router)
app.include_router(events_router)
app.include_router(chat_router)

# ── Root Endpoint ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Root endpoint - API information."""
    return {
        "status": "ok",
        "title": "Decision Intelligence Chatbot API",
        "endpoints": [
            {"method": "POST", "path": "/analyze", "description": "Analyze market factors with SHAP"},
            {"method": "GET", "path": "/events", "description": "Get upcoming market events"},
            {"method": "POST", "path": "/chat", "description": "Talk to the decision intelligence bot"},
        ],
        "docs": "/docs"
    }


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
