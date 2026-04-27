# TRANAM — README

## Quick Start

### Prerequisites
- Python 3.11+
- Docker Desktop (for PostgreSQL & Redis)
- Node.js 20+ (for frontend)

### 1. Start databases
```bash
docker-compose up -d
```

### 2. Start backend
```bash
cd backend
cp .env.example .env        # Edit with your keys
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Start frontend
```bash
cd frontend
npm install
npm run dev
```

### API Docs
Once backend is running: http://localhost:8000/docs

### Default Login
- Email: `admin@safeflow.global`
- Password: `admin123`
