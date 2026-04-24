"""
Shared business logic and ML services.
Contains decision tree model, SHAP explainer, and utility functions.
"""

import numpy as np
import shap
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder


# ── Mock Training Data ─────────────────────────────────────────────────────────
# Features: [vix, sentiment_score, pe_ratio, gdp_growth, inflation]
# Label: 0=sell, 1=hold, 2=buy

TRAIN_X = np.array([
    [30, 0.2, 35, 1.5, 4.5],
    [15, 0.8, 18, 3.2, 2.1],
    [25, 0.4, 28, 2.0, 3.5],
    [12, 0.9, 14, 4.1, 1.8],
    [35, 0.1, 40, 0.5, 5.2],
    [18, 0.7, 22, 2.8, 2.5],
    [28, 0.3, 32, 1.2, 4.0],
    [10, 0.95, 12, 4.5, 1.5],
    [22, 0.5, 25, 2.5, 3.0],
    [40, 0.05, 45, 0.2, 5.8],
])
TRAIN_Y = np.array([0, 2, 1, 2, 0, 2, 0, 2, 1, 0])

FEATURE_NAMES = ["vix", "sentiment_score", "pe_ratio", "gdp_growth", "inflation"]
LABEL_NAMES = ["sell", "hold", "buy"]


# ── Model Initialization ───────────────────────────────────────────────────────

def initialize_model():
    """Train and initialize the decision tree model with SHAP explainer."""
    model = DecisionTreeClassifier(max_depth=4, random_state=42)
    model.fit(TRAIN_X, TRAIN_Y)
    explainer = shap.TreeExplainer(model)
    return model, explainer


# Train once at module load
_model, _explainer = initialize_model()


# ── Analysis Functions ─────────────────────────────────────────────────────────

def get_model():
    """Get the trained decision tree model."""
    return _model


def get_explainer():
    """Get the SHAP TreeExplainer."""
    return _explainer


def predict_and_explain(feature_values: np.ndarray) -> dict:
    """
    Make a prediction and generate SHAP explanations.
    
    Args:
        feature_values: Array of shape (1, 5) with features
        
    Returns:
        dict with prediction, probabilities, and SHAP values
    """
    model = get_model()
    explainer = get_explainer()
    
    # Prediction
    pred_idx = int(model.predict(feature_values)[0])
    proba = model.predict_proba(feature_values)[0].tolist()

    # SHAP values
    shap_values = explainer.shap_values(feature_values)
    
    # Handle SHAP output format safely
    if isinstance(shap_values, list) and len(shap_values) > pred_idx:
        sv_array = shap_values[pred_idx]
    else:
        sv_array = shap_values
    
    # Ensure we have the right shape
    if sv_array.ndim > 1:
        sv = sv_array[0].tolist()
    else:
        sv = sv_array.tolist()
    
    base_value = float(explainer.expected_value[pred_idx])

    return {
        "prediction_idx": pred_idx,
        "prediction": LABEL_NAMES[pred_idx],
        "probabilities": {name: round(p, 3) for name, p in zip(LABEL_NAMES, proba)},
        "shap_values": {name: round(v, 4) for name, v in zip(FEATURE_NAMES, sv)},
        "base_value": round(base_value, 4),
        "raw_shap_values": sv,
    }


def build_graph(prediction_idx: int, shap_values: list, request_data: dict) -> dict:
    """
    Build graph representation of the decision tree.
    
    Args:
        prediction_idx: Index of predicted class
        shap_values: List of SHAP values
        request_data: Original request data with feature values
        
    Returns:
        dict with nodes and edges for visualization
    """
    pred_label = LABEL_NAMES[prediction_idx]
    proba = get_model().predict_proba(np.array([list(request_data.values())]))[0]
    
    nodes = [
        {
            "id": "root",
            "label": "Decision",
            "type": "root",
            "value": pred_label,
            "confidence": round(max(proba), 3)
        }
    ]
    edges = []

    for i, (fname, sv_val) in enumerate(zip(FEATURE_NAMES, shap_values)):
        node_id = f"factor_{i}"
        direction = "positive" if sv_val >= 0 else "negative"
        nodes.append({
            "id": node_id,
            "label": fname,
            "type": "factor",
            "raw_value": round(float(request_data[fname]), 3),
            "shap_value": round(sv_val, 4),
            "direction": direction,
            "importance_pct": round(abs(sv_val) / (sum(abs(v) for v in shap_values) + 1e-9) * 100, 1),
        })
        edges.append({
            "source": node_id,
            "target": "root",
            "weight": round(abs(sv_val), 4),
            "direction": direction,
        })

    return {"nodes": nodes, "edges": edges}
