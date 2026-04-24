"""
Shared data models and schemas for the DI Chatbot API.
All Pydantic models are centralized here for reusability.
"""

from pydantic import BaseModel
from typing import Dict, List, Optional


# ── Input Models ──────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    """Request body for market analysis endpoint."""
    vix: float = 18.4
    sentiment_score: float = 0.65
    pe_ratio: float = 22.0
    gdp_growth: float = 2.8
    inflation: float = 2.5


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str


# ── Output Models ─────────────────────────────────────────────────────────────

class ShapResult(BaseModel):
    """SHAP explanation values."""
    base_value: float
    values: Dict[str, float]


class GraphNode(BaseModel):
    """Node in the decision tree visualization graph."""
    id: str
    label: str
    type: str  # 'root' | 'factor'
    value: Optional[str] = None
    confidence: Optional[float] = None
    raw_value: Optional[float] = None
    shap_value: Optional[float] = None
    direction: Optional[str] = None  # 'positive' | 'negative'
    importance_pct: Optional[float] = None


class GraphEdge(BaseModel):
    """Edge in the decision tree visualization graph."""
    source: str
    target: str
    weight: float
    direction: str  # 'positive' | 'negative'


class AnalyzeResult(BaseModel):
    """Full response from analysis endpoint."""
    prediction: str
    prediction_index: int
    probabilities: Dict[str, float]
    shap: ShapResult
    graph: Dict[str, List]  # { "nodes": [...], "edges": [...] }


class EventData(BaseModel):
    """Market event information."""
    id: int
    name: str
    date: str
    impact: str  # 'high' | 'medium' | 'low'


class EventsResponse(BaseModel):
    """Response from events endpoint."""
    data: List[EventData]


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    routed_intent: Optional[str]
    confidence: str
    message: Optional[str] = None
    context_data: Dict = {}
