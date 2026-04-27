# Google Cloud Platform (GCP) Deployment Guide — TRANAM

This guide provides a step-by-step workflow to deploy the TRANAM ecosystem (FastAPI, React, PostgreSQL, Redis) on Google Cloud using modern serverless infrastructure.

## 🏗 Target Architecture
- **Backend**: Cloud Run (Serverless containers)
- **Frontend**: Cloud Run (or Firebase Hosting / GCS Static Website)
- **Database**: Cloud SQL for PostgreSQL
- **Cache**: Memorystore for Redis
- **Networking**: VPC Connector (for private communication between services)

---

## Step 1: Project Initialization & CLI Setup

1. **Create a GCP Project**: Go to [GCP Console](https://console.cloud.google.com/) and create `tranam-production`.
2. **Install Google Cloud SDK**: [Follow instructions here](https://cloud.google.com/sdk/docs/install).
3. **Initialize CLI**:
   ```bash
   gcloud init
   gcloud auth login
   gcloud config set project tranam-production
   ```
4. **Enable Services**:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     sqladmin.googleapis.com \
     redis.googleapis.com \
     artifactregistry.googleapis.com \
     vpcaccess.googleapis.com \
     cloudbuild.googleapis.com
   ```

---

## Step 2: Database & Redis Setup

### 1. Cloud SQL (PostgreSQL)
```bash
gcloud sql instances create tranam-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=YOUR_SECURE_PASSWORD
```
*Note: Create a database named `tranam` inside the instance.*

### 2. Memorystore (Redis)
```bash
gcloud redis instances create tranam-cache \
    --size=1 \
    --region=us-central1 \
    --redis-version=6.0
```

### 3. Serverless VPC Access
*Required for Cloud Run to access the database and cache private IPs.*
```bash
gcloud compute networks vpc-access connectors create tranam-vpc-connector \
    --region=us-central1 \
    --range=10.8.0.0/28
```

---

## Step 3: Containerization

### 1. Backend Dockerfile Adjustment
Ensure `backend/Dockerfile` uses the `PORT` env variable:
```dockerfile
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
```

### 2. Create Artifact Registry
```bash
gcloud artifacts repositories create tranam-repo \
    --repository-format=docker \
    --location=us-central1
```

---

## Step 4: Build & Push Images

Run these from the project root:

### Build Backend
```bash
cd backend
gcloud builds submit --tag us-central1-docker.pkg.dev/tranam-production/tranam-repo/backend:latest .
```

### Build Frontend
```bash
cd frontend
# IMPORTANT: Update VITE_API_BASE_URL in your build environment
gcloud builds submit --tag us-central1-docker.pkg.dev/tranam-production/tranam-repo/frontend:latest .
```

---

## Step 5: Deployment to Cloud Run

### 1. Deploy Backend
```bash
gcloud run deploy tranam-api \
    --image=us-central1-docker.pkg.dev/tranam-production/tranam-repo/backend:latest \
    --region=us-central1 \
    --vpc-connector=tranam-vpc-connector \
    --set-env-vars="DATABASE_URL=postgresql://user:pass@PRIVATE_IP/tranam,REDIS_URL=redis://REDIS_PRIVATE_IP:6379" \
    --allow-unauthenticated
```
*Note: Get the private IPs from the SQL and Redis instance details.*

### 2. Deploy Frontend
```bash
gcloud run deploy tranam-web \
    --image=us-central1-docker.pkg.dev/tranam-production/tranam-repo/frontend:latest \
    --region=us-central1 \
    --allow-unauthenticated
```

---

## Step 6: Post-Deployment

1. **CORS Configuration**: Update the Backend `ALLOWED_ORIGINS` with the URL of the deployed `tranam-web`.
2. **Custom Domains**: Use the "Manage Custom Domains" tab in the Cloud Run console to map your own URL (e.g., `tranam.io`).
3. **SSL**: Cloud Run manages SSL/TLS certificates automatically.

---
*For automated CI/CD, consider using **GitHub Actions** with the `google-github-actions/auth` and `google-github-actions/deploy-cloudrun` actions.*
