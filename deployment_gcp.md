# 🚀 Simplified Google Cloud Deployment Guide

If you've never deployed to the cloud before, don't worry! This guide breaks down the process into simple steps.

## 💡 What are we doing?
We are moving your project from your computer to Google's computers so anyone in the world can visit your website.
- **Cloud Run**: This is where your code "lives".
- **Cloud SQL**: This is where your data (Database) "lives".
- **Docker**: This packages your code so it works the same on Google's computers as it does on yours.

---

## Step 1: The Basics
1. **Create an Account**: Go to [Google Cloud Console](https://console.cloud.google.com/) and sign up.
2. **Create a Project**: Click the project dropdown at the top and click "New Project". Name it something like `tranam-app`.
3. **Billing**: Make sure you link a credit card or billing account (Google usually gives $300 free credit).

---

## Step 2: Install the "Remote Control" (gcloud CLI)
You need a tool on your computer to talk to Google Cloud.
1. **Download**: [Download the Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. **Login**: Open your terminal and type:
   ```bash
   gcloud auth login
   ```
   *This will open your browser to log in.*
3. **Set Project**: Tell the tool which project to use:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## Step 3: Turn on Google's Features
Run this one command in your terminal. it tells Google "Hey, I want to use your Database and Hosting features":
```bash
gcloud services enable run.googleapis.com sqladmin.googleapis.com cloudbuild.googleapis.com
```

---

## Step 4: Create your Database
Think of this as creating a "Excel sheet" in the cloud for your data.
1. Run this command:
   ```bash
   gcloud sql instances create tranam-db --database-version=POSTGRES_15 --tier=db-f1-micro --region=us-central1
   ```
2. Set a password for your database user when prompted.

---

## Step 5: Upload your Code (The "Magic" Step)
Google Cloud has a feature called `gcloud run deploy`. It will take your code, build it into a package, and put it on a website URL.

### 1. Upload Backend (API)
Go to your `backend` folder and run:
```bash
gcloud run deploy tranam-api --source . --region us-central1 --allow-unauthenticated
```
*When it asks "Allow unauthenticated invocations", type **y**.*

### 2. Upload Frontend (Website)
Go to your `frontend` folder and run:
```bash
gcloud run deploy tranam-frontend --source . --region us-central1 --allow-unauthenticated
```

---

## Step 6: Connect them
Once both are uploaded, Google will give you two links (URLs).
1. Copy the **Backend Link**.
2. In your Google Cloud console, go to the **Frontend** settings and add the Backend Link as an environment variable named `VITE_API_BASE_URL`.

---

## 🎉 You're Live!
Your website should now be accessible via the Frontend URL Google provided.
