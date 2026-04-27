# Vercel Deployment Guide

This guide will help you deploy the DI Chatbot to Vercel, hosting both the React frontend and FastAPI backend as serverless functions.

## Prerequisites

- [Vercel Account](https://vercel.com) (free tier works)
- GitHub repository with this project
- GoldAPI API key from https://www.goldapi.io/

## Step 1: Prepare Your Repository

1. Make sure `.env` is in `.gitignore` (secrets should not be committed):
   ```bash
   echo ".env" >> .gitignore
   git add .gitignore
   git commit -m "Add .env to gitignore"
   ```

2. Copy `.env.example` to `.env` locally and fill in your credentials:
   ```bash
   cp .env.example .env
   # Edit .env and add your GOLDAPI_KEY
   ```

3. Commit everything else:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Vercel will automatically detect the configuration from `vercel.json`
5. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel
```

## Step 3: Configure Environment Variables

After deployment, go to your Vercel project dashboard:

1. Click **Settings** → **Environment Variables**
2. Add the following variable:
   - **Name:** `GOLDAPI_KEY`
   - **Value:** Your GoldAPI key from https://www.goldapi.io/
   - **Environments:** Select "Production", "Preview", "Development"
3. Click **Save**
4. Redeploy to apply changes:
   - Go to **Deployments**
   - Click the three-dot menu on the latest deployment
   - Click **Redeploy**

## Step 4: Update Frontend API URL

If deploying to a custom domain, update the API base URL in [frontend/src/api.ts](frontend/src/api.ts):

```typescript
// Before (local development)
const BASE = '/api'

// After (if needed for different domain)
const BASE = 'https://your-domain.vercel.app/api'
```

Then commit and push:
```bash
git add frontend/src/api.ts
git commit -m "Update API base URL for production"
git push
```

## Step 5: Verify Deployment

1. **Frontend:** Visit your Vercel URL (e.g., https://di-chatbot.vercel.app)
2. **Backend API Docs:** Visit https://your-domain.vercel.app/api/docs
3. **Health Check:** Visit https://your-domain.vercel.app/api/health

### Test Gold Price API

In the chat interface, try:
- "What is gold price?"
- "Gold price yesterday"
- "Gold price on 2024-04-01"

## Troubleshooting

### Issue: "Failed to fetch gold price data"

**Cause:** GOLDAPI_KEY not set or invalid

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify GOLDAPI_KEY is set
3. Make sure it's a valid key from https://www.goldapi.io/
4. Redeploy the project

### Issue: "Cannot find module" errors

**Cause:** Python dependencies not installed

**Solution:**
```bash
# Vercel installs dependencies from requirements.txt automatically
# Make sure all packages are listed in backend/requirements.txt
cat backend/requirements.txt
```

### Issue: Frontend shows "Error: Could not reach backend"

**Cause:** API routing not working

**Solution:**
1. Check that API requests use `/api/` prefix (not `http://localhost:8000`)
2. Verify `vercel.json` is correct
3. Check Vercel build logs in dashboard

### Issue: CORS errors in browser

**Solution:** CORS is already configured in [backend/main.py](backend/main.py):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Project Structure for Vercel

```
di_chatbot/
├── vercel.json              # Vercel configuration
├── .env.example             # Environment variable template
├── api/
│   └── index.py            # FastAPI app entry point (serverless)
├── backend/
│   ├── main.py             # FastAPI application
│   ├── models.py           # Pydantic models
│   ├── services.py         # Business logic
│   ├── requirements.txt     # Python dependencies
│   ├── routers/
│   │   ├── analyze.py
│   │   ├── events.py
│   │   └── chat.py
│   └── crawl_data/
│       └── data.py         # Gold API integration
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   └── ...
│   └── dist/               # Built files (auto-deployed)
└── README.md
```

## Local Testing Before Deploy

To test the full setup locally before deploying:

```bash
# Terminal 1: Start backend
cd backend
python main.py
# Backend runs on http://localhost:8000

# Terminal 2: Start frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Then test at http://localhost:5173

## What Gets Deployed

- **Frontend:** React app built to `frontend/dist/` and served as static files
- **Backend:** FastAPI app deployed as serverless functions in `api/`
- **Environment:** GOLDAPI_KEY loaded from Vercel environment variables

## Performance Notes

- Cold starts: ~2-3 seconds for first request after deploy
- Subsequent requests: <100ms (warm function)
- Database: Not needed (data fetched from GoldAPI)
- Scalability: Automatic (Vercel handles it)

## Monitoring

Monitor your deployment in Vercel Dashboard:
- **Analytics:** View request metrics and errors
- **Deployments:** See all deployment history
- **Functions:** Monitor serverless function performance
- **Logs:** Check console output and error logs

## Next Steps

After successful deployment:

1. **Custom Domain:** Go to Settings → Domains to add your own domain
2. **Auto-redeploy:** Pushes to main/master branch automatically redeploy
3. **Preview URLs:** Every PR gets a unique preview URL

## Getting Help

- Vercel Docs: https://vercel.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com/
- React/Vite Docs: https://vitejs.dev/

---

**Happy deploying! 🚀**
