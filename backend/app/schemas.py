# SafeFlow Global — Pydantic Schemas (Request/Response Validation)

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# ============================================
# AUTH SCHEMAS
# ============================================

class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: str
    role: str = "worker"
    region: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ============================================
# WORKER SCHEMAS
# ============================================

class WorkerCreate(BaseModel):
    phone_number: str
    name: str
    region: str
    district: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    language_preference: str = "en"


class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    language_preference: Optional[str] = None


class WorkerResponse(BaseModel):
    id: UUID
    phone_number: str
    name: str
    language_preference: str
    region: str
    district: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    profile_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# CHECK-IN SCHEMAS
# ============================================

class CheckinCreate(BaseModel):
    worker_id: UUID
    contractor_id: Optional[UUID] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_description: Optional[str] = None
    manhole_id: Optional[str] = None
    sewer_depth: Optional[float] = None
    estimated_duration: int = 60  # minutes
    equipment_available: list[str] = []
    smell_reported: bool = False
    sewer_type: str = "combined"
    weather: str = "clear"


class CheckinResponse(BaseModel):
    id: UUID
    worker_id: UUID
    contractor_id: Optional[UUID] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_description: Optional[str] = None
    manhole_id: Optional[str] = None
    sewer_depth: Optional[float] = None
    estimated_duration: Optional[int] = None
    risk_level: Optional[str] = None
    risk_score: Optional[int] = None
    risk_factors: Optional[list] = None
    ai_recommendation: Optional[str] = None
    status: str
    started_at: datetime
    deadline: Optional[datetime] = None
    checked_out_at: Optional[datetime] = None
    alert_level: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class RiskAssessmentResponse(BaseModel):
    checkin_id: UUID
    risk_level: str
    risk_score: int
    risk_factors: list[str]
    recommendation: str
    safe_to_enter: bool
    required_precautions: list[str]
    deadline: datetime


# ============================================
# INCIDENT SCHEMAS
# ============================================

class IncidentCreate(BaseModel):
    checkin_id: Optional[UUID] = None
    worker_id: UUID
    contractor_id: Optional[UUID] = None
    incident_type: str  # death / injury / near_miss / illness
    severity: str  # critical / high / medium / low
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    country: str = "India"
    region: Optional[str] = None
    incident_date: Optional[datetime] = None


class IncidentResponse(BaseModel):
    id: UUID
    checkin_id: Optional[UUID] = None
    worker_id: UUID
    contractor_id: Optional[UUID] = None
    incident_type: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    country: Optional[str] = None
    region: Optional[str] = None
    status: str
    authority_notified: bool
    incident_date: Optional[datetime] = None
    reported_at: datetime

    class Config:
        from_attributes = True


class IncidentStatusUpdate(BaseModel):
    status: str
    authority_notified: Optional[bool] = None
    authority_responded: Optional[bool] = None
    compensation_claimed: Optional[bool] = None
    compensation_received: Optional[bool] = None


# ============================================
# CONTRACTOR SCHEMAS
# ============================================

class ContractorCreate(BaseModel):
    name: str
    registration_number: Optional[str] = None
    region: str
    contact_phone: Optional[str] = None


class ContractorUpdate(BaseModel):
    name: Optional[str] = None
    registration_number: Optional[str] = None
    region: Optional[str] = None
    contact_phone: Optional[str] = None


class ContractorResponse(BaseModel):
    id: UUID
    name: str
    registration_number: Optional[str] = None
    region: str
    contact_phone: Optional[str] = None
    risk_score: float
    total_jobs: int
    total_incidents: int
    is_blacklisted: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ContractorRatingCreate(BaseModel):
    worker_id: UUID
    checkin_id: Optional[UUID] = None
    safety_score: int = Field(ge=1, le=5)
    equipment_provided: bool
    payment_on_time: bool
    review_text: Optional[str] = None
    is_anonymous: bool = True


# ============================================
# DASHBOARD SCHEMAS
# ============================================

class DashboardStats(BaseModel):
    total_workers: int
    active_checkins: int
    total_incidents: int
    incidents_this_month: int
    alerts_fired_today: int
    risk_distribution: dict  # {"GREEN": n, "YELLOW": n, "RED": n}
    top_risk_regions: list[dict]
