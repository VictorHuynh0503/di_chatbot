"""
Chat endpoint router.
Handles natural language intent routing to other endpoints.
"""

from fastapi import APIRouter
import numpy as np

from models import ChatRequest, ChatResponse, AnalyzeRequest
from services import predict_and_explain, build_graph, FEATURE_NAMES
from routers.events import get_events
from crawl_data.data import gold_latest_price, gold_historical_price

router = APIRouter(tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """
    Intent-based router — maps each question to EXACTLY ONE endpoint.
    Uses priority-based matching to determine the primary intent.
    """
    msg = req.message.lower()
    
    # Define intent keywords with priority (higher = higher priority)
    intents = {
        "gold": {
            "keywords": ["gold", "silver", "xau", "xag", "precious metal", "spot price"],
            "priority": 3,
        },
        "analyze": {
            "keywords": ["analyze", "decision", "shap", "factor", "buy", "sell", "recommendation", "predict"],
            "priority": 2,
        },
        "events": {
            "keywords": ["event", "fed", "earnings", "gdp", "happening", "news", "upcoming"],
            "priority": 1,
        }
    }
    
    # Find matching intents with their priority scores
    matched_intents = []
    for intent_name, intent_config in intents.items():
        if any(keyword in msg for keyword in intent_config["keywords"]):
            matched_intents.append({
                "name": intent_name,
                "priority": intent_config["priority"],
            })
    
    # Route to the HIGHEST priority intent only (exact routing)
    if matched_intents:
        # Sort by priority (descending) and pick the first one
        selected_intent = max(matched_intents, key=lambda x: x["priority"])
        intent_name = selected_intent["name"]
        
        # Execute the selected endpoint
        if intent_name == "gold":
            # Get latest gold price data
            try:
                gold_data = gold_latest_price("XAU", "USD")
                result = {
                    # "metal": gold_data["metal"],
                    # "currency": gold_data["currency"],
                    "price": gold_data["price"],
                    "open": gold_data["open"],
                    "high": gold_data["high"],
                    "low": gold_data["low"]
                    # "change": gold_data["change"],
                    # "change_pct": gold_data["change_pct"],
                    # "timestamp": gold_data["timestamp"],
                    # "unit": gold_data["unit"],
                }
            except Exception as e:
                result = {
                    "error": str(e),
                    "message": "Failed to fetch gold price data"
                }
        elif intent_name == "analyze":
            # Call analyze with default parameters
            req_data = AnalyzeRequest()
            x = np.array([[req_data.vix, req_data.sentiment_score, req_data.pe_ratio,
                          req_data.gdp_growth, req_data.inflation]])
            
            analysis = predict_and_explain(x)
            graph = build_graph(
                analysis["prediction_idx"],
                analysis["raw_shap_values"],
                {
                    "vix": req_data.vix,
                    "sentiment_score": req_data.sentiment_score,
                    "pe_ratio": req_data.pe_ratio,
                    "gdp_growth": req_data.gdp_growth,
                    "inflation": req_data.inflation,
                }
            )
            
            result = {
                "prediction": analysis["prediction"],
                "prediction_index": analysis["prediction_idx"],
                "probabilities": analysis["probabilities"],
                "shap": {
                    "base_value": analysis["base_value"],
                    "values": analysis["shap_values"],
                },
                "graph": graph,
            }
        else:  # events
            result = get_events().dict()
        
        return {
            "routed_intent": intent_name,
            "confidence": "high",
            "context_data": result
        }
    else:
        # No matching intent found
        return {
            "routed_intent": None,
            "confidence": "low",
            "message": "Could not determine intent. Ask about [gold/analyze/decision/events/earnings/gdp]",
            "context_data": {}
        }
