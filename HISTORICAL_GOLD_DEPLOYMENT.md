# Historical Gold Prices & Vercel Deployment

## What Was Added

### 1. Historical Gold Price Support ✓

#### Backend Changes (chat.py):
- Added `parse_date_from_message()` function to extract dates from user messages
  - Supports: "yesterday", "today", "N days ago", "2024-01-15", month names, etc.
- Added `is_historical_request()` function to detect historical queries
- Updated gold intent handler to:
  - Check if request is for historical data
  - Parse date from message
  - Call `gold_historical_price()` with appropriate date
  - Return data with `"type": "historical"` or `"type": "current"`

#### Frontend Changes (App.tsx):
- Updated gold data handler to check `goldData.type`
- Display "📅" emoji for historical, "💰" for current
- Show date when displaying historical data
- Updated suggestions to include "Gold price yesterday"
- Updated help text to mention historical queries

### 2. Vercel Deployment Configuration ✓

#### Files Created:
1. **vercel.json** - Main Vercel configuration
   - Configures build command (npm + pip)
   - Sets environment variables reference
   - Configures API rewrites and CORS headers
   - Frontend served as static, API as serverless functions

2. **api/index.py** - FastAPI app entry point
   - Imports FastAPI app from backend
   - Loads environment variables
   - Exposes app for Vercel's serverless runtime

3. **api/requirements.txt** - Python dependencies
   - Lists all packages needed for serverless functions

4. **.env.example** - Template for environment variables
   - Shows what variables need to be configured

5. **.vercelignore** - Files to ignore during deployment

6. **VERCEL_DEPLOYMENT.md** - Complete deployment guide
   - Step-by-step instructions
   - Troubleshooting tips
   - Configuration details

## Testing Historical Prices Locally

Try these messages in the chat:

```
Current price:
- "What is gold price?"
- "Show me gold"
- "Gold price now"

Historical price:
- "Gold price yesterday"
- "Gold price 3 days ago"
- "Gold price on 2024-04-15"
- "Gold price in April 2024"
- "Gold price yesterday" → uses yesterday's date
```

## Date Parsing Examples

The `parse_date_from_message()` function supports:

| Input | Parsed Date |
|-------|-------------|
| "yesterday" | Previous day |
| "today" | Current day |
| "3 days ago" | 3 days before today |
| "2024-04-15" | April 15, 2024 |
| "20240415" | April 15, 2024 |
| "April 15 2024" | April 15, 2024 |
| "Apr 2024" | April 1, 2024 |

## Backend Flow for Historical Data

```
User: "What was gold price yesterday?"
    ↓
Frontend → POST /api/chat { message: "..." }
    ↓
Backend chat.py:
  1. is_historical_request(msg) → True
  2. parse_date_from_message(msg) → "YYYYMMDD"
  3. gold_historical_price("XAU", "USD", date="YYYYMMDD")
  4. Returns { type: "historical", date: "YYYYMMDD", price: X, ... }
    ↓
Frontend:
  1. Detects routed_intent === "gold"
  2. Checks goldData.type === "historical"
  3. Shows "📅 Gold (XAU) Price (Historical)"
  4. Displays date, price, and changes
```

## Deploying to Vercel

### Quick Start (3 Steps)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add historical gold prices and Vercel config"
   git push
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Click "Deploy"

3. **Add Environment Variable**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `GOLDAPI_KEY` with your API key
   - Redeploy

### Full Instructions
See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed setup

## Key Features

### For Users
✓ Ask for current gold price
✓ Ask for historical gold price (any past date)
✓ See formatted prices with changes
✓ Different emojis for current vs historical

### For Deployment
✓ One-click deployment to Vercel
✓ Automatic frontend build (npm)
✓ Automatic backend deployment (Python serverless)
✓ Environment variables securely stored
✓ CORS enabled for frontend-backend communication
✓ Zero-config setup with vercel.json

## Next Steps

1. **Test locally**
   ```bash
   cd backend && python main.py  # Terminal 1
   cd frontend && npm run dev     # Terminal 2
   ```

2. **Try historical queries**
   - "Gold price yesterday"
   - "Gold price 2024-01-01"

3. **Deploy to Vercel**
   - See VERCEL_DEPLOYMENT.md for step-by-step

4. **Monitor**
   - Check Vercel Dashboard for logs and metrics

## File Changes Summary

```
backend/routers/chat.py
├── + parse_date_from_message()
├── + is_historical_request()
└── Updated gold handler for historical data

frontend/src/App.tsx
├── Updated gold data display logic
├── Show date for historical prices
└── Updated suggestions & help text

New files:
├── vercel.json
├── api/index.py
├── api/requirements.txt
├── .env.example
├── .vercelignore
├── VERCEL_DEPLOYMENT.md
└── GOLD_API_SETUP.md
```

Done! 🎉
