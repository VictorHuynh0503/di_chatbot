"""
FastAPI routers for DI Chatbot API.
Each router handles a specific feature area.
"""

from fastapi import APIRouter

# Import all routers
from .analyze import router as analyze_router
from .events import router as events_router
from .chat import router as chat_router

# Export routers for main.py
__all__ = ["analyze_router", "events_router", "chat_router"]
