"""
Analysis endpoint router.
Handles Decision Tree + SHAP analysis requests.
"""

from fastapi import APIRouter
import numpy as np

from models import AnalyzeRequest, AnalyzeResult
from services import predict_and_explain, build_graph, FEATURE_NAMES

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("", response_model=AnalyzeResult)
def analyze(req: AnalyzeRequest):
    """
    Decision Tree + SHAP analysis.
    Returns: prediction, probabilities, SHAP values, and decision graph.
    """
    # Build feature array from request
    x = np.array([[req.vix, req.sentiment_score, req.pe_ratio,
                   req.gdp_growth, req.inflation]])

    # Get predictions and SHAP values
    analysis = predict_and_explain(x)
    
    # Build visualization graph
    graph = build_graph(
        analysis["prediction_idx"],
        analysis["raw_shap_values"],
        {
            "vix": req.vix,
            "sentiment_score": req.sentiment_score,
            "pe_ratio": req.pe_ratio,
            "gdp_growth": req.gdp_growth,
            "inflation": req.inflation,
        }
    )

    return {
        "prediction": analysis["prediction"],
        "prediction_index": analysis["prediction_idx"],
        "probabilities": analysis["probabilities"],
        "shap": {
            "base_value": analysis["base_value"],
            "values": analysis["shap_values"],
        },
        "graph": graph,
    }
