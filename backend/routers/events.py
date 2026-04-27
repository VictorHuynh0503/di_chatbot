"""
Events endpoint router.
Handles upcoming market events and chat requests with sport/event data.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import re
import requests
from models import EventsResponse, EventData, ChatRequest

router = APIRouter(prefix="/events", tags=["Events"])


# ── Mock Events Data ──────────────────────────────────────────────────────────
MOCK_EVENTS = [
    {"id": 1, "name": "Fed Rate Decision", "date": "2025-05-01", "impact": "high"},
    {"id": 2, "name": "NVIDIA Earnings", "date": "2025-05-22", "impact": "high"},
    {"id": 3, "name": "Vietnam GDP Release", "date": "2025-04-28", "impact": "medium"},
]

# ── Sport Event Database Configuration ─────────────────────────────────────────
DEFAULT_SQL: str = """
    SELECT * FROM "188bet_log"
    WHERE "run_time"::TIMESTAMP >= (NOW()::timestamp) - INTERVAL '1.5 hours'
    AND "run_time"::TIMESTAMP <= (NOW()::timestamp + INTERVAL '7 hours')
"""

DB_API_URL: str = "http://165.232.188.235:8000/query/log"
DB_TIMEOUT: int = 15


@router.get("", response_model=EventsResponse)
def get_events():
    """
    Retrieve upcoming market events.
    Returns: list of event data with dates and impact levels.
    """
    return {
        "data": [
            EventData(**event) for event in MOCK_EVENTS
        ]
    }


# ── Helper Functions ──────────────────────────────────────────────────────────

def build_sql(msg: str) -> str:
    """
    Build SQL query from user message for sport event data.
    Extracts time intervals from natural language.
    
    Args:
        msg: User message containing time references
        
    Returns:
        SQL query string for 188bet_log database
    """
    msg = msg.lower()
    if "hour" in msg:
        nums = re.findall(r'\d+\.?\d*', msg)
        hours: float = float(nums[0]) if nums else 1.5
        return f"""
            SELECT * FROM "188bet_log"
            WHERE "run_time"::TIMESTAMP >= NOW() - INTERVAL '{hours} hours'
            AND "run_time"::TIMESTAMP <= NOW() + INTERVAL '7 hours'
        """
    return DEFAULT_SQL


def normalize_data(raw: Any) -> List[Dict[str, Any]]:
    """
    Normalize database response into consistent list format.
    Handles various response structures from database API.
    
    Args:
        raw: Raw response from database API (list, dict, or other)
        
    Returns:
        List of dictionaries containing sport event data
    """
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        for key in ("data", "rows", "result", "results", "records"):
            if key in raw and isinstance(raw[key], list):
                return raw[key]
        return [raw]
    return []


# ── Sport Event Chat Endpoints ────────────────────────────────────────────────

@router.post("/chat")
def chat(body: ChatRequest) -> Dict[str, Any]:
    """
    Chat endpoint for querying sport event data.
    Accepts natural language queries and returns sport/betting data.
    
    Args:
        body: ChatRequest with message containing sport event query
        
    Returns:
        Dictionary with status, SQL query, and event data
    """
    sql: str = build_sql(body.message.strip())
    try:
        resp = requests.post(
            DB_API_URL,
            json={"sql": sql.strip()},
            timeout=DB_TIMEOUT
        )
        resp.raise_for_status()
        raw: Dict[str, Any] = resp.json()
        data: List[Dict[str, Any]] = normalize_data(raw)
        return {"status": "ok", "sql": sql.strip(), "data": data}
    except requests.exceptions.ConnectionError:
        return {
            "status": "error",
            "message": f"Cannot connect to database API at {DB_API_URL}",
            "data": []
        }
    except requests.exceptions.Timeout:
        return {
            "status": "error",
            "message": f"Database API timed out after {DB_TIMEOUT} seconds",
            "data": []
        }
    except requests.exceptions.HTTPError as e:
        return {
            "status": "error",
            "message": f"Database API returned error: {e}",
            "data": []
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }


@router.get("/health")
def health() -> Dict[str, str]:
    """
    Health check endpoint for sport event service.
    
    Returns:
        Status dictionary indicating service health
    """
    return {"status": "ok"}
