# TRANAM — Production Development Guide
> AI-Powered Sewer Worker Protection Platform

---

## 📁 Table of Contents
1. [Project Overview](#overview)
2. [System Architecture](#architecture)
3. [Repository Structure](#repo)
4. [Environment Setup](#setup)
5. [Backend Development](#backend)
6. [Frontend Development](#frontend)
7. [AI/ML Services](#ai)
8. [Database Design](#database)
9. [Notification System](#notifications)
10. [Authentication & Security](#auth)
11. [API Documentation](#api)
12. [Testing Strategy](#testing)
13. [CI/CD Pipeline](#cicd)
14. [Deployment](#deployment)
15. [Monitoring & Observability](#monitoring)
16. [Scaling Strategy](#scaling)

---

## 1. Project Overview <a name="overview"></a>

### Mission
Protect underground sanitation workers globally through AI-powered risk assessment, accountability tracking, and legal empowerment.

### Core Modules
| Module | Purpose |
|--------|---------|
| **SafeCheck** | Pre-entry AI risk assessment |
| **DeadSwitch** | Missed check-in auto-alert system |
| **LegalAI** | Document generation in local languages |
| **ContractorRegistry** | Public accountability database |
| **GlobalMap** | Real-time incident tracking dashboard |
| **IVR Gateway** | Feature phone access via voice calls |

---

## 2. System Architecture <a name="architecture"></a>

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                   │
│   📱 Flutter App    🌐 React Web    📞 IVR    💬 WhatsApp Bot   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Kong)                           │
│         Rate Limiting | Auth | Load Balancing | Logging         │
└──────┬──────────────┬───────────────┬────────────────┬──────────┘
       │              │               │                │
       ▼              ▼               ▼                ▼
┌──────────┐  ┌──────────────┐ ┌──────────┐  ┌──────────────────┐
│  AUTH    │  │  CORE API    │ │  AI      │  │  NOTIFICATION    │
│ SERVICE  │  │  SERVICE     │ │  SERVICE │  │  SERVICE         │
│          │  │              │ │          │  │                  │
│ Firebase │  │  FastAPI     │ │  Claude  │  │  Twilio SMS      │
│ Auth     │  │  Python      │ │  Whisper │  │  SendGrid Email  │
│ JWT      │  │  Async       │ │  LangChn │  │  FCM Push        │
└──────────┘  └──────┬───────┘ └────┬─────┘  └──────────────────┘
                     │              │
          ┌──────────┴──────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│                                                                   │
│  PostgreSQL (Primary)   Redis (Cache)   MongoDB (Documents)      │
│  Elasticsearch (Search) AWS S3 (Files)  Polygon (Blockchain)     │
└─────────────────────────────────────────────────────────────────┘
```

### Microservices Breakdown
```
services/
├── auth-service/          # Authentication & authorization
├── worker-service/        # Worker profiles & check-ins
├── risk-service/          # AI risk assessment engine
├── alert-service/         # Dead man's switch & notifications
├── legal-service/         # AI document generation
├── contractor-service/    # Contractor registry & ratings
├── incident-service/      # Incident reporting & tracking
├── dashboard-service/     # Analytics & reporting
└── ivr-service/           # Feature phone IVR gateway
```

---

## 3. Repository Structure <a name="repo"></a>

```
safeflow-global/
├── 📁 backend/                # FastAPI Application
├── 📁 frontend/               # React Dashboard (Vite)
├── docker-compose.yml         # Database & service orchestration
└── README.md                  # Project overview
```

---

## 4. Environment Setup <a name="setup"></a>

### Prerequisites
```bash
# Required tools
- Python 3.11+
- Node.js 20+
- Flutter 3.16+
- Docker Desktop
- kubectl
- terraform
- PostgreSQL 15
- Redis 7
```

### Local Development Setup
```bash
# 1. Clone repository
git clone https://github.com/safeflow/safeflow-global
cd safeflow-global

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start all services with Docker Compose
docker-compose up -d

# 4. Run database migrations
./scripts/migrate.sh

# 5. Seed development data
./scripts/seed.sh

# 6. Start frontend dashboard
cd frontend && npm install && npm run dev
```

### Environment Variables
```bash
# .env.local

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/safeflow
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/safeflow

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...        # For Whisper
GOOGLE_TRANSLATE_KEY=...

# Communications
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
SENDGRID_API_KEY=...

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=safeflow-evidence

# Blockchain
POLYGON_RPC_URL=...
POLYGON_PRIVATE_KEY=...

# App
SECRET_KEY=your-secret-key-min-32-chars
ENVIRONMENT=development
DEBUG=true
```

---

## 5. Backend Development <a name="backend"></a>

### Core API — FastAPI

#### Main Application
```python
# services/core-api/src/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import uvicorn

from .routers import workers, checkins, incidents, contractors, legal, alerts
from .database import init_db, close_db
from .middleware import RateLimitMiddleware, LoggingMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()

app = FastAPI(
    title="SafeFlow Global API",
    version="1.0.0",
    description="Protecting underground sanitation workers worldwide",
    lifespan=lifespan
)

# Middleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

# Routers
app.include_router(workers.router, prefix="/api/v1/workers", tags=["Workers"])
app.include_router(checkins.router, prefix="/api/v1/checkins", tags=["Check-ins"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["Incidents"])
app.include_router(contractors.router, prefix="/api/v1/contractors", tags=["Contractors"])
app.include_router(legal.router, prefix="/api/v1/legal", tags=["Legal"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
```

#### Worker Router
```python
# services/core-api/src/routers/workers.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas.worker import WorkerCreate, WorkerResponse, WorkerUpdate
from ..services.worker_service import WorkerService
from ..auth.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=WorkerResponse, status_code=201)
async def register_worker(
    payload: WorkerCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new worker profile"""
    service = WorkerService(db)
    return await service.create_worker(payload)

@router.post("/{worker_id}/checkin")
async def start_checkin(
    worker_id: str,
    job_data: JobCheckInCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Start a job check-in with AI risk assessment"""
    service = WorkerService(db)
    risk = await service.assess_risk(worker_id, job_data)
    checkin = await service.create_checkin(worker_id, job_data, risk)
    
    # Start dead man's switch timer
    await service.start_deadswitch(checkin.id, job_data.estimated_duration)
    
    return {
        "checkin_id": checkin.id,
        "risk_level": risk.level,          # GREEN / YELLOW / RED
        "risk_score": risk.score,
        "risk_factors": risk.factors,
        "recommendation": risk.recommendation,
        "deadline": checkin.deadline
    }

@router.post("/{worker_id}/checkout")
async def checkout_worker(
    worker_id: str,
    checkin_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Worker safely exits — cancel dead man's switch"""
    service = WorkerService(db)
    await service.complete_checkin(checkin_id)
    return {"status": "safe", "message": "Check-out recorded successfully"}
```

#### Dead Man's Switch — Alert Service
```python
# services/alert-service/src/checkin_monitor.py

from celery import Celery
from celery.schedules import crontab
import asyncio
from datetime import datetime, timedelta

from .dispatcher import AlertDispatcher
from .database import get_checkins_past_deadline

celery_app = Celery('alert-service', broker='redis://redis:6379/0')

@celery_app.task
def monitor_active_checkins():
    """Runs every 5 minutes — checks for missed check-ins"""
    overdue = get_checkins_past_deadline()
    
    for checkin in overdue:
        if checkin.alert_level == 0:
            # First miss — send SMS ping to worker
            send_worker_ping.delay(checkin.id)
        elif checkin.alert_level == 1:
            # 10 min no response — EMERGENCY ALERT
            trigger_emergency_alert.delay(checkin.id)

@celery_app.task
def trigger_emergency_alert(checkin_id: str):
    """
    CRITICAL: Worker hasn't checked in
    Fires alerts to all emergency contacts simultaneously
    """
    dispatcher = AlertDispatcher()
    checkin = get_checkin(checkin_id)
    worker = checkin.worker
    
    alert_payload = {
        "worker_name": worker.name,
        "location": checkin.location,
        "job_started": checkin.started_at,
        "contractor": checkin.contractor_name,
        "manhole_id": checkin.location_id,
        "coordinates": checkin.gps_coordinates
    }
    
    # Fire all channels simultaneously
    asyncio.gather(
        dispatcher.send_sms(worker.emergency_contact, alert_payload),
        dispatcher.send_whatsapp(worker.emergency_contact, alert_payload),
        dispatcher.send_email_to_authority(worker.district, alert_payload),
        dispatcher.alert_ngo_partners(worker.region, alert_payload),
        dispatcher.create_incident_record(alert_payload),
        dispatcher.log_to_blockchain(alert_payload)
    )
```

#### Legal AI Service
```python
# services/ai-service/src/legal_ai/generator.py

import anthropic
from typing import Literal

client = anthropic.Anthropic()

DOCUMENT_TYPES = Literal[
    "rti_application",
    "fir_complaint", 
    "compensation_claim",
    "labour_court_notice",
    "death_certificate_request"
]

async def generate_legal_document(
    document_type: DOCUMENT_TYPES,
    worker_details: dict,
    incident_details: dict,
    language: str = "english"
) -> str:
    """
    Generate legally-formatted document using Claude API
    """
    
    system_prompt = f"""You are a legal expert specializing in labour law, 
    worker rights, and sanitation worker protection laws globally.
    
    Generate formal legal documents that are:
    - Legally accurate and properly formatted
    - Written in {language}
    - Ready to submit to authorities
    - Cite relevant laws (Manual Scavengers Act 2013, Labour Laws, etc.)
    
    Return ONLY the document text, properly formatted."""
    
    user_prompt = f"""Generate a {document_type.replace('_', ' ')} for:
    
    Worker Details:
    - Name: {worker_details['name']}
    - ID: {worker_details['id']}
    - Location: {worker_details['location']}
    - Contractor: {worker_details['contractor']}
    
    Incident Details:
    - Date: {incident_details['date']}
    - Location: {incident_details['location']}
    - What happened: {incident_details['description']}
    - Witnesses: {incident_details.get('witnesses', 'None recorded')}
    
    Include all relevant legal sections, proper addressing, 
    and clear demands for action/compensation."""
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[
            {"role": "user", "content": user_prompt}
        ],
        system=system_prompt
    )
    
    return message.content[0].text

async def assess_job_risk(job_data: dict) -> dict:
    """
    AI-powered risk assessment before manhole entry
    """
    prompt = f"""You are a safety expert for confined space work.
    
    Assess the risk level for this sewer entry job:
    - Location depth: {job_data['depth']}m
    - Last cleaned: {job_data['last_cleaned']} days ago  
    - Reported smell: {job_data['smell_reported']}
    - Weather: {job_data['weather']}
    - Worker equipment: {job_data['equipment']}
    - Sewer type: {job_data['sewer_type']}
    
    Respond ONLY in JSON:
    {{
        "risk_level": "GREEN|YELLOW|RED",
        "risk_score": 0-100,
        "primary_hazards": ["list", "of", "hazards"],
        "recommendation": "Clear action recommendation",
        "safe_to_enter": true|false,
        "required_precautions": ["list"]
    }}"""
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    import json
    return json.loads(message.content[0].text)
```

---

## 6. Database Design <a name="database"></a>

### PostgreSQL Schema
```sql
-- Workers table
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'en',
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    emergency_contact VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    profile_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractors table
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    region VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    risk_score DECIMAL(3,1) DEFAULT 5.0,
    total_jobs INTEGER DEFAULT 0,
    total_incidents INTEGER DEFAULT 0,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job check-ins table
CREATE TABLE job_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES workers(id),
    contractor_id UUID REFERENCES contractors(id),
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_description TEXT,
    manhole_id VARCHAR(100),
    
    -- Job details
    sewer_depth DECIMAL(5,2),
    estimated_duration INTEGER,    -- minutes
    equipment_available JSONB,
    smell_reported BOOLEAN,
    
    -- Risk assessment
    risk_level VARCHAR(10),        -- GREEN/YELLOW/RED
    risk_score INTEGER,
    risk_factors JSONB,
    ai_recommendation TEXT,
    
    -- Timeline
    started_at TIMESTAMPTZ DEFAULT NOW(),
    deadline TIMESTAMPTZ,          -- Expected check-out
    checked_out_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active/safe/emergency/missed
    alert_level INTEGER DEFAULT 0,
    
    -- Evidence
    voice_note_url VARCHAR(500),
    photo_urls JSONB,
    blockchain_tx_hash VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkin_id UUID REFERENCES job_checkins(id),
    worker_id UUID REFERENCES workers(id),
    contractor_id UUID REFERENCES contractors(id),
    
    incident_type VARCHAR(50),     -- death/injury/near_miss/illness
    severity VARCHAR(20),          -- critical/high/medium/low
    description TEXT,
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    country VARCHAR(100),
    region VARCHAR(100),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'reported',
    authority_notified BOOLEAN DEFAULT FALSE,
    authority_responded BOOLEAN DEFAULT FALSE,
    compensation_claimed BOOLEAN DEFAULT FALSE,
    compensation_received BOOLEAN DEFAULT FALSE,
    
    -- Evidence
    evidence_urls JSONB,
    blockchain_tx_hash VARCHAR(100),
    
    -- Timestamps
    incident_date TIMESTAMPTZ,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Legal documents table
CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES workers(id),
    incident_id UUID REFERENCES incidents(id),
    
    document_type VARCHAR(50),
    content TEXT,
    language VARCHAR(10),
    
    -- Submission tracking
    submitted_to VARCHAR(255),
    submitted_at TIMESTAMPTZ,
    response_received_at TIMESTAMPTZ,
    response_content TEXT,
    escalated_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractor ratings
CREATE TABLE contractor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID REFERENCES contractors(id),
    worker_id UUID REFERENCES workers(id),
    checkin_id UUID REFERENCES job_checkins(id),
    
    safety_score INTEGER CHECK (safety_score BETWEEN 1 AND 5),
    equipment_provided BOOLEAN,
    payment_on_time BOOLEAN,
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_checkins_worker_status ON job_checkins(worker_id, status);
CREATE INDEX idx_checkins_deadline ON job_checkins(deadline) WHERE status = 'active';
CREATE INDEX idx_incidents_location ON incidents(country, region);
CREATE INDEX idx_incidents_date ON incidents(incident_date DESC);
CREATE INDEX idx_contractors_region ON contractors(region, risk_score);
```

---

## 7. AI/ML Services <a name="ai"></a>

### Risk Scoring Model
```python
# services/ai-service/src/risk_engine/model.py

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

class RiskScoringModel:
    """
    ML model for pre-entry risk assessment
    Trained on historical incident data
    """
    
    FEATURES = [
        'sewer_depth',           # Depth in meters
        'days_since_cleaned',    # Days since last maintenance
        'smell_reported',        # Boolean
        'temperature',           # Ambient temperature
        'rainfall_last_24h',     # mm of rain
        'sewer_type_encoded',    # Storm/sewage/combined
        'equipment_score',       # 0-10 based on gear available
        'worker_experience',     # Years of experience
        'time_of_day',           # Hour (0-23)
        'season_encoded'         # Season
    ]
    
    def predict_risk(self, job_data: dict) -> dict:
        features = self._extract_features(job_data)
        
        risk_score = self.model.predict_proba([features])[0][1] * 100
        risk_level = self._score_to_level(risk_score)
        
        return {
            "score": round(risk_score, 1),
            "level": risk_level,
            "factors": self._explain_factors(features, risk_score)
        }
    
    def _score_to_level(self, score: float) -> str:
        if score < 30: return "GREEN"
        if score < 65: return "YELLOW"
        return "RED"
```

### Speech Processing Pipeline
```python
# services/ai-service/src/speech/processor.py

import whisper
import anthropic
from gtts import gTTS
import boto3

model = whisper.load_model("medium")  # Good balance of speed/accuracy

async def process_voice_input(audio_file_path: str, language: str) -> str:
    """Transcribe worker voice input"""
    result = model.transcribe(
        audio_file_path,
        language=language,
        task="transcribe"
    )
    return result["text"]

async def generate_voice_response(text: str, language: str) -> str:
    """Generate voice response for IVR / low-literacy workers"""
    tts = gTTS(text=text, lang=language, slow=False)
    audio_path = f"/tmp/response_{hash(text)}.mp3"
    tts.save(audio_path)
    
    # Upload to S3 for Twilio to serve
    s3 = boto3.client('s3')
    s3.upload_file(audio_path, 'safeflow-audio', f"responses/{hash(text)}.mp3")
    
    return f"https://safeflow-audio.s3.amazonaws.com/responses/{hash(text)}.mp3"
```

---

## 8. Notification System <a name="notifications"></a>

### Multi-Channel Alert Dispatcher
```python
# services/notification-service/src/dispatcher.py

from twilio.rest import Client
from sendgrid import SendGridAPIClient
import firebase_admin
from firebase_admin import messaging

class AlertDispatcher:
    
    def __init__(self):
        self.twilio = Client(TWILIO_SID, TWILIO_TOKEN)
        self.sendgrid = SendGridAPIClient(SENDGRID_KEY)
    
    async def dispatch_emergency(self, incident: dict, contacts: list):
        """
        Priority order for emergency alerts:
        1. SMS (most reliable, works on basic phones)
        2. WhatsApp (high open rate in Global South)
        3. Push notification (smartphone users)
        4. Email (authorities/NGOs)
        """
        
        message = self._format_emergency_message(incident)
        
        for contact in contacts:
            await self.send_sms(contact['phone'], message)
            
            if contact.get('whatsapp'):
                await self.send_whatsapp(contact['phone'], incident)
            
            if contact.get('email'):
                await self.send_authority_email(contact['email'], incident)
    
    async def send_sms(self, to: str, message: str):
        self.twilio.messages.create(
            body=message,
            from_=TWILIO_PHONE,
            to=to
        )
    
    async def send_whatsapp(self, to: str, incident: dict):
        template = self._get_whatsapp_template(incident)
        self.twilio.messages.create(
            from_=f"whatsapp:{TWILIO_WHATSAPP}",
            to=f"whatsapp:{to}",
            content_sid=template
        )
    
    async def send_authority_email(self, to: str, incident: dict):
        """
        Sends formal email to District Magistrate / Labour Commissioner
        with full incident details and legal obligations
        """
        html = self._render_authority_email_template(incident)
        message = Mail(
            from_email="alerts@safeflow.global",
            to_emails=to,
            subject=f"URGENT: Sewer Worker Emergency — {incident['location']}",
            html_content=html
        )
        self.sendgrid.send(message)
```

---

## 9. Authentication & Security <a name="auth"></a>

### Security Layers
```python
# Phone OTP (primary for workers — no email needed)
# Firebase Auth handles OTP verification

# JWT token structure
{
    "sub": "worker_id",
    "role": "worker|contractor|ngo|municipality|admin",
    "region": "IN-MH",
    "exp": 86400,
    "iat": timestamp
}

# Role-based access control
PERMISSIONS = {
    "worker": ["read:own", "write:own_checkins", "read:legal"],
    "ngo": ["read:incidents", "read:contractors", "write:reports"],
    "municipality": ["read:all", "write:responses", "read:compliance"],
    "admin": ["*"]
}
```

### Data Security
```python
# Evidence encryption before storage
from cryptography.fernet import Fernet

class EvidenceEncryption:
    """
    All voice notes and photos encrypted at rest
    Only worker + authorized NGO can decrypt
    """
    
    def encrypt_evidence(self, data: bytes, worker_id: str) -> bytes:
        key = self._derive_key(worker_id)
        f = Fernet(key)
        return f.encrypt(data)
    
    def _derive_key(self, worker_id: str) -> bytes:
        # Key derived from worker ID + master secret
        # Worker controls their own evidence
        kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, 
                         salt=worker_id.encode(), iterations=100000)
        return base64.urlsafe_b64encode(kdf.derive(MASTER_SECRET))
```

---

## 10. API Documentation <a name="api"></a>

### Core Endpoints
```yaml
# OpenAPI Spec Summary

/api/v1/workers:
  POST /register          # Register new worker
  GET  /{id}             # Get worker profile
  PUT  /{id}             # Update profile

/api/v1/checkins:
  POST /start            # Start job + get AI risk score
  POST /{id}/ping        # Heartbeat ping (every 30 min)
  POST /{id}/checkout    # Safe exit
  GET  /active           # All active check-ins (admin/NGO)

/api/v1/incidents:
  POST /report           # Report incident
  GET  /                 # List incidents (with filters)
  GET  /{id}             # Incident details
  PUT  /{id}/status      # Update incident status

/api/v1/legal:
  POST /generate         # Generate legal document
  GET  /documents        # Worker's documents
  POST /{id}/submit      # Submit to authority
  GET  /{id}/status      # Track submission status

/api/v1/contractors:
  GET  /                 # List contractors (region filter)
  GET  /{id}             # Contractor profile + ratings
  POST /{id}/rate        # Submit rating after job
  GET  /blacklisted      # Public blacklist

/api/v1/dashboard:
  GET  /stats            # Global statistics
  GET  /heatmap          # Incident heatmap data
  GET  /compliance       # Municipality compliance scores
```

---

## 11. Testing Strategy <a name="testing"></a>

```python
# Unit Tests — pytest
tests/
├── unit/
│   ├── test_risk_engine.py        # Risk scoring accuracy
│   ├── test_legal_generator.py    # Document generation
│   ├── test_alert_dispatcher.py   # Alert firing logic
│   └── test_deadswitch.py         # Timer accuracy
├── integration/
│   ├── test_checkin_flow.py       # Full check-in → alert flow
│   ├── test_legal_flow.py         # Generate → submit → track
│   └── test_notification_flow.py  # Multi-channel alerts
└── e2e/
    ├── test_worker_journey.py      # Full worker user journey
    └── test_emergency_scenario.py  # Emergency simulation

# Test critical path — missed check-in → alerts fire within 10 min
def test_deadswitch_fires_on_time():
    checkin = create_test_checkin(deadline=datetime.now() - timedelta(minutes=15))
    monitor_active_checkins()
    assert alert_was_sent(checkin.worker.emergency_contact)
    assert incident_was_created(checkin.id)
    assert authority_was_notified(checkin.worker.district)
```

---

## 12. CI/CD Pipeline <a name="cicd"></a>

```yaml
# .github/workflows/deploy.yml

name: SafeFlow CI/CD

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        run: |
          pip install -r requirements.txt
          pytest tests/ --coverage --fail-under=80

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: SAST Scan
        uses: github/super-linter@v5
      - name: Dependency Vulnerability Check
        run: pip audit

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Images
        run: docker-compose build
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS ...
          docker push $ECR_REGISTRY/safeflow-api:$GITHUB_SHA

  deploy-staging:
    needs: build-and-push
    if: github.ref == 'refs/heads/staging'
    steps:
      - name: Deploy to Staging
        run: kubectl set image deployment/api api=$ECR_REGISTRY/safeflow-api:$GITHUB_SHA

  deploy-production:
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    environment: production     # Requires manual approval
    steps:
      - name: Blue-Green Deploy
        run: ./scripts/blue-green-deploy.sh $GITHUB_SHA
```

---

## 13. Deployment <a name="deployment"></a>

### Kubernetes Production Setup
```yaml
# infrastructure/kubernetes/deployments/api.yml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: safeflow-api
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0          # Zero downtime deploys
  template:
    spec:
      containers:
      - name: api
        image: safeflow/api:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
```

### Multi-Region Deployment
```
Primary Regions (Phase 1):
├── ap-south-1      (India — Mumbai)
├── ap-southeast-1  (Bangladesh, Philippines)
└── af-south-1      (Nigeria, Ghana)

Phase 2:
├── sa-east-1       (Brazil)
├── me-south-1      (Egypt, Pakistan)
└── eu-west-1       (UK, Europe)

CDN: CloudFront for static assets
DNS: Route53 with latency-based routing
```

---

## 14. Monitoring <a name="monitoring"></a>

### Critical Alerts to Monitor
```python
# These alerts are life-critical — must be <5 min response

CRITICAL_METRICS = {
    "deadswitch_latency": {
        "description": "Time from missed checkin to alert firing",
        "threshold": "< 10 minutes",
        "alert_channel": "PagerDuty"
    },
    "notification_delivery_rate": {
        "description": "% of emergency SMS delivered",
        "threshold": "> 99%",
        "alert_channel": "PagerDuty"
    },
    "api_error_rate": {
        "description": "5xx errors",
        "threshold": "< 0.1%",
        "alert_channel": "Slack"
    },
    "ai_response_time": {
        "description": "Risk assessment latency",
        "threshold": "< 3 seconds",
        "alert_channel": "Slack"
    }
}
```

### Grafana Dashboard Panels
```
1. Active check-ins worldwide (real-time count)
2. Emergency alerts fired today
3. Alert delivery success rate by channel
4. Risk level distribution (Green/Yellow/Red)
5. Legal documents generated this month
6. API response times by endpoint
7. Deaths prevented estimate (based on RED alerts stopped)
```

---

## 15. Scaling Strategy <a name="scaling"></a>

### Growth Phases

```
Phase 1 — Hackathon MVP (Week 1)
├── Single server
├── Core check-in + alert flow
├── Basic legal document generation
└── Web dashboard only

Phase 2 — Pilot (Month 1-3)
├── 3 Indian cities (Mumbai, Delhi, Chennai)
├── Partner with 2 NGOs
├── 500 workers onboarded
└── Flutter mobile app launched

Phase 3 — National (Month 3-12)
├── All Indian states
├── IVR system for feature phones
├── Government dashboard for municipalities
├── 50,000 workers
└── Blockchain incident logging

Phase 4 — Global (Year 2)
├── Bangladesh, Nigeria, Philippines
├── 20+ languages
├── UN/World Bank partnership
├── 500,000 workers globally
└── Policy advocacy data reports
```

---

## 🚀 Quick Start for Hackathon (48 hrs)

### Build in this order:
```
Hour 1-4:   Database setup + Worker registration API
Hour 4-8:   Check-in flow + AI risk assessment
Hour 8-12:  Dead man's switch + Email alerts
Hour 12-16: Legal document AI generator
Hour 16-20: React dashboard + Mapbox incident map
Hour 20-24: Contractor rating system
Hour 24-36: Flutter mobile app (basic screens)
Hour 36-42: Polish UI + Fix bugs
Hour 42-48: Demo preparation + pitch rehearsal
```

---

*SafeFlow Global — Because every worker deserves to come home.*