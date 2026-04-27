# TRANAM — Main FastAPI Application

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from .config import get_settings
from .database import init_db, close_db
from .routers import auth, workers, checkins, incidents, contractors, dashboard

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 TRANAM API starting...")
    await init_db()
    logger.info("✅ Database connected")
    yield
    await close_db()
    logger.info("👋 TRANAM API shut down")


app = FastAPI(
    title="TRANAM API",
    version="1.0.0",
    description="AI-Powered Sewer Worker Protection Platform",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(workers.router, prefix="/api/v1/workers", tags=["Workers"])
app.include_router(checkins.router, prefix="/api/v1/checkins", tags=["Check-ins"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["Incidents"])
app.include_router(contractors.router, prefix="/api/v1/contractors", tags=["Contractors"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "tranam-api", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "message": "TRANAM API — Protecting underground workers worldwide",
        "docs": "/docs",
        "health": "/health",
    }
