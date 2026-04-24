"""
Events endpoint router.
Handles upcoming market events requests.
"""

from fastapi import APIRouter
from models import EventsResponse, EventData

router = APIRouter(prefix="/events", tags=["Events"])


# ── Mock Events Data ──────────────────────────────────────────────────────────
MOCK_EVENTS = [
    {"id": 1, "name": "Fed Rate Decision", "date": "2025-05-01", "impact": "high"},
    {"id": 2, "name": "NVIDIA Earnings", "date": "2025-05-22", "impact": "high"},
    {"id": 3, "name": "Vietnam GDP Release", "date": "2025-04-28", "impact": "medium"},
]


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
