# Quick Testing Guide - Historical Gold Prices & Deployment

## Local Testing (Before Deploy)

### Start Services

```bash
# Terminal 1: Backend
cd backend
python main.py
# Runs on http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173 (or similar)
```

### Test Cases

#### Current Gold Price Queries
```
✓ "What is gold price?"
✓ "Show me gold"
✓ "Gold price now"
✓ "Current gold price"
✓ "XAU price"
✓ "Silver price"  (also works - XAG)
```

**Expected Response:**
```
💰 Gold (XAU) Price

Price: $2,345.50 USD/troy oz
Open: $2,340.00
High: $2,350.25
Low: $2,335.75
Change: $5.50 (0.24%)
Updated: [current timestamp]
```

#### Historical Price Queries
```
✓ "Gold price yesterday"
✓ "Gold yesterday"
✓ "What was gold price yesterday"
✓ "Gold price 3 days ago"
✓ "Gold price on 2024-04-15"
✓ "Gold price 2024-04-15"
✓ "Gold price April 15 2024"
✓ "April 2024 gold price"
```

**Expected Response:**
```
📅 Gold (XAU) Price (Historical)

Date: 20240414
Price: $2,340.25 USD/troy oz
Open: $2,335.00
High: $2,345.75
Low: $2,330.50
Change: $2.50 (0.11%)
Updated: [historical timestamp]
```

#### Analyze Query
```
✓ "Analyze market"
✓ "Should I buy or sell?"
✓ "What factors affect the market?"
```

#### Events Query
```
✓ "Show events"
✓ "Upcoming earnings?"
✓ "Fed news"
```

---

## Vercel Deployment Testing

### Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] `.env` is in `.gitignore`
- [ ] `vercel.json` exists
- [ ] `api/index.py` exists
- [ ] `api/requirements.txt` exists
- [ ] Code committed to GitHub

```bash
# Check files exist
ls -la vercel.json
ls -la api/index.py
ls -la api/requirements.txt
ls -la .env.example
```

### Deploy Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add historical gold prices and Vercel deployment config"
   git push origin main
   ```

2. **Create Vercel Project**
   - Go to https://vercel.com/new
   - Select your GitHub repo
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

3. **Configure Environment**
   - Go to project Settings → Environment Variables
   - Add: `GOLDAPI_KEY` = your API key
   - Select all environments (Production, Preview, Development)
   - Click "Save"

4. **Redeploy**
   - Go to Deployments tab
   - Click three-dot menu on latest deployment
   - Select "Redeploy"
   - Wait for new deployment

### Post-Deployment Testing

**Test URLs:**

1. **Frontend:** `https://your-project.vercel.app`
   - Should show chat interface
   - Try: "Gold price?"

2. **API Health:** `https://your-project.vercel.app/api/health`
   - Should return: `{"status":"healthy"}`

3. **API Docs:** `https://your-project.vercel.app/api/docs`
   - Should show Swagger UI with endpoints

4. **Chat Endpoint:** `https://your-project.vercel.app/api/chat`
   - POST with: `{"message": "What is gold price?"}`
   - Should return gold data

---

## Test Script for API Endpoints

### Using curl (Command Line)

```bash
# Test health
curl https://your-project.vercel.app/api/health

# Test chat - current price
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is gold price?"}'

# Test chat - historical price
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Gold price yesterday"}'
```

### Using Python

```python
import requests

BASE = "https://your-project.vercel.app/api"

# Health check
r = requests.get(f"{BASE}/health")
print(r.json())

# Chat - current
r = requests.post(f"{BASE}/chat", json={"message": "What is gold price?"})
print(r.json())

# Chat - historical
r = requests.post(f"{BASE}/chat", json={"message": "Gold price yesterday"})
print(r.json())
```

---

## Debugging Checklist

### Frontend Issue: Shows loading forever

1. Check browser console (F12 → Console)
2. Check if backend is responding: visit `/api/health`
3. Check Vercel build logs (Deployments tab)

**Fix:**
```bash
# Redeploy
vercel redeploy
```

### Backend Issue: "Failed to fetch gold price data"

1. Verify GOLDAPI_KEY is set in Vercel dashboard
2. Verify key is valid at https://www.goldapi.io/
3. Check API limit not exceeded

**Fix:**
1. Go to Vercel Settings → Environment Variables
2. Update GOLDAPI_KEY
3. Redeploy

### Date Not Parsing

1. Try different date formats:
   - "yesterday" (most reliable)
   - "3 days ago"
   - "2024-04-15" (YYYY-MM-DD)
   - "April 15 2024"

2. Check console logs for parsing errors

---

## Performance Notes

- **First request (cold start):** 2-3 seconds
- **Subsequent requests:** <100ms
- **Max timeout:** 60 seconds per request
- **Memory:** 3GB allocated

## Monitoring

In Vercel Dashboard:

1. **Analytics** → View request metrics
2. **Functions** → See cold starts, duration, errors
3. **Logs** → See console output and errors

---

## Success Indicators

✅ Frontend loads
✅ Chat responds to current gold price queries
✅ Chat responds to historical gold price queries
✅ Date parsing works for multiple formats
✅ API docs available
✅ No console errors

---

## Troubleshooting Links

- Vercel Docs: https://vercel.com/docs
- FastAPI: https://fastapi.tiangolo.com/
- GoldAPI: https://www.goldapi.io/

---

**You're all set! 🚀**
