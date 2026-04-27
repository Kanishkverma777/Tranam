# 🚀 Deployment Guide: Render (Backend) + Vercel (Frontend)

This is a much simpler deployment path. We will use **Render** for the heavy lifting (API, Database, Redis) and **Vercel** for the lightning-fast frontend.

---

## 🏗 Part 1: Backend & Database (Render)

### 1. Create a Database
1. Go to [Render.com](https://render.com/) and log in.
2. Click **New +** > **PostgreSQL**.
3. Name it `tranam-db`.
4. Once created, copy the **Internal Database URL** (for the backend) or **External Database URL** (for local testing).

### 2. Create a Redis Instance
1. Click **New +** > **Redis**.
2. Name it `tranam-cache`.
3. Copy the **Internal Redis URL**.

### 3. Deploy the Backend API
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Set **Root Directory** to `backend`.
4. **Environment**: `Python 3`.
5. **Build Command**: `pip install -r requirements.txt`.
6. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
7. **Environment Variables**: Click "Advanced" and add:
   - `DATABASE_URL`: (Paste your Internal Database URL here)
   - `REDIS_URL`: (Paste your Internal Redis URL here)
   - `ALGORITHM`: `HS256`
   - `SECRET_KEY`: (Generate a random string)

---

## ⚡ Part 2: Frontend (Vercel)

### 1. Deploy the Website
1. Go to [Vercel.com](https://vercel.com/) and log in.
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Framework Preset**: `Vite`.
5. **Root Directory**: `frontend`.
6. **Environment Variables**:
   - `VITE_API_BASE_URL`: (Paste your **Render Web Service URL** here, e.g., `https://tranam-api.onrender.com/api/v1`)
7. Click **Deploy**.

---

## 🔗 Part 3: Connecting Them (CORS)

Once Vercel gives you a URL (e.g., `https://tranam.vercel.app`), you must tell the backend to allow it:

1. Go back to your **Render Web Service**.
2. Go to **Environment**.
3. Add a new variable:
   - `ALLOWED_ORIGINS`: `https://your-vercel-link.vercel.app`
4. Render will automatically redeploy and you're all set!

---
## 💡 Pro Tip
Render's free tier "sleeps" after 15 minutes of inactivity. The first time you visit the site, it might take 30 seconds to wake up. For production, consider their $7/month starter plan.
