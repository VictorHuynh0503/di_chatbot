#!/usr/bin/env python3
"""
Quick test script to verify gold API integration works.
Run this from the backend directory or with PYTHONPATH set.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

# Test 1: Check if GOLDAPI_KEY is loaded
print("=" * 60)
print("TEST 1: Check GOLDAPI_KEY from .env")
print("=" * 60)
from backend.crawl_data.data import GOLDAPI_KEY
print(f"✓ GOLDAPI_KEY loaded: {GOLDAPI_KEY[:20]}..." if GOLDAPI_KEY != "YOUR_GOLDAPI_KEY" else "✗ GOLDAPI_KEY not set in .env")

# Test 2: Try to fetch gold price
print("\n" + "=" * 60)
print("TEST 2: Fetch Gold Price")
print("=" * 60)
try:
    from backend.crawl_data.data import gold_latest_price
    data = gold_latest_price("XAU", "USD")
    print("✓ Gold price fetched successfully!")
    print(f"  Price: ${data['price']:.2f} USD/troy oz")
    print(f"  Change: ${data['change']:.2f} ({data['change_pct']:.2f}%)")
    print(f"  Metal: {data['metal']}")
except Exception as e:
    print(f"✗ Error fetching gold price: {e}")

# Test 3: Check chat endpoint
print("\n" + "=" * 60)
print("TEST 3: Test Chat Endpoint Response")
print("=" * 60)
try:
    from backend.routers.chat import chat
    from backend.models import ChatRequest
    
    # Simulate a gold query
    req = ChatRequest(message="What is the gold price?")
    response = chat(req)
    
    print(f"✓ Chat endpoint works!")
    print(f"  Routed Intent: {response['routed_intent']}")
    print(f"  Confidence: {response['confidence']}")
    
    if response['routed_intent'] == 'gold':
        data = response['context_data']
        if 'error' not in data:
            print(f"  Gold Price: ${data['price']:.2f}")
            print(f"  Currency: {data['currency']}")
        else:
            print(f"  Error: {data['message']}")
    
except Exception as e:
    print(f"✗ Error testing chat endpoint: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TESTS COMPLETE")
print("=" * 60)
