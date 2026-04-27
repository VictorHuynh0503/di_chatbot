"""
Gold Price API: GoldAPI.io
===========================
GoldAPI.io  → https://www.goldapi.io/  (requires free API key, sign up)

Setup:
    pip install requests python-dotenv

API Keys:
    GOLDAPI_KEY   : Sign up at https://www.goldapi.io/ (free, no credit card)
                    Store in .env file
"""

import requests
from datetime import datetime, timedelta
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# ─────────────────────────── CONFIG ───────────────────────────
GOLDAPI_KEY  = os.getenv("GOLDAPI_KEY", "YOUR_GOLDAPI_KEY")  # Load from .env

GOLDAPI_BASE = "https://www.goldapi.io/api"


# ══════════════════════════════════════════════════════════════
#  GOLDAPI.IO  —  Gold, Silver, Platinum, Palladium
# ══════════════════════════════════════════════════════════════

def _goldapi_headers():
    return {
        "x-access-token": GOLDAPI_KEY,
        "Content-Type": "application/json",
    }


def gold_latest_price(metal: str = "XAU", currency: str = "USD") -> dict:
    """
    Get the latest spot price for a precious metal.

    metals  : XAU (Gold), XAG (Silver), XPT (Platinum), XPD (Palladium)
    currency: USD, EUR, VND, GBP, JPY, etc.

    Returns dict with keys: price, open, high, low, change, change_pct,
                            timestamp, metal, currency, unit (troy oz)
    Example:
        >>> data = gold_latest_price("XAU", "USD")
        >>> print(data["price"])   # e.g. 3340.75
    """
    url = f"{GOLDAPI_BASE}/{metal}/{currency}"
    resp = requests.get(url, headers=_goldapi_headers(), timeout=10)
    resp.raise_for_status()
    raw = resp.json()

    return {
        "metal":      raw.get("metal"),
        "currency":   raw.get("currency"),
        "price":      raw.get("price"),          # spot price per troy oz
        "open":       raw.get("open_price"),
        "high":       raw.get("high_price"),
        "low":        raw.get("low_price"),
        "change":     raw.get("ch"),             # absolute change
        "change_pct": raw.get("chp"),            # % change
        "timestamp":  raw.get("timestamp"),
        "unit":       "troy oz",
        "raw":        raw,
    }


def gold_historical_price(metal: str = "XAU", currency: str = "USD",
                          date: str = None) -> dict:
    """
    Get historical spot price for a precious metal on a specific date.

    date: "YYYYMMDD" string, e.g. "20240101"
          Defaults to yesterday if not provided.

    Note: GoldAPI free plan supports limited historical lookups.

    Returns same structure as gold_latest_price().
    """
    if date is None:
        date = (datetime.utcnow() - timedelta(days=1)).strftime("%Y%m%d")

    url = f"{GOLDAPI_BASE}/{metal}/{currency}/{date}"
    resp = requests.get(url, headers=_goldapi_headers(), timeout=10)
    resp.raise_for_status()
    raw = resp.json()

    return {
        "metal":      raw.get("metal"),
        "currency":   raw.get("currency"),
        "date":       date,
        "price":      raw.get("price"),
        "open":       raw.get("open_price"),
        "high":       raw.get("high_price"),
        "low":        raw.get("low_price"),
        "change":     raw.get("ch"),
        "change_pct": raw.get("chp"),
        "timestamp":  raw.get("timestamp"),
        "unit":       "troy oz",
        "raw":        raw,
    }



# ══════════════════════════════════════════════════════════════
#  DEMO — run all functions and print results
# ══════════════════════════════════════════════════════════════

def _fmt(label, value, unit=""):
    if isinstance(value, float):
        print(f"  {label:<22}: {value:,.2f} {unit}".rstrip())
    else:
        print(f"  {label:<22}: {value}")


def demo():
    print("=" * 60)
    print("  GOLDAPI.IO DEMO")
    print("=" * 60)

    # ── Latest gold price ──
    print("\n📌 Gold (XAU) — Latest Price")
    g = gold_latest_price("XAU", "USD")
    _fmt("Price (USD/troy oz)", g["price"])
    _fmt("Open",  g["open"])
    _fmt("High",  g["high"])
    _fmt("Low",   g["low"])
    _fmt("Change",     g["change"])
    _fmt("Change (%)", g["change_pct"])

    # ── Latest silver price ──
    print("\n📌 Silver (XAG) — Latest Price")
    s = gold_latest_price("XAG", "USD")
    _fmt("Price (USD/troy oz)", s["price"])
    _fmt("Change (%)",          s["change_pct"])

    # ── Historical gold price ──
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y%m%d")
    print(f"\n📅 Gold (XAU) — Historical ({yesterday})")
    gh = gold_historical_price("XAU", "USD", date=yesterday)
    _fmt("Price (USD/troy oz)", gh["price"])
    _fmt("High",  gh["high"])
    _fmt("Low",   gh["low"])


    print("\n✅ Done.\n")


if __name__ == "__main__":
    demo()