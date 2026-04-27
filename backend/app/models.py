# SafeFlow Global — SQLAlchemy Models

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, Text, DateTime, ForeignKey, JSON,
    Numeric, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .database import Base


class Worker(Base):
    __tablename__ = "workers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    language_preference = Column(String(10), default="en")
    region = Column(String(100), nullable=False)
    district = Column(String(100))
    emergency_contact = Column(String(20))
    emergency_contact_name = Column(String(255))
    profile_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    checkins = relationship("JobCheckin", back_populates="worker")
    incidents = relationship("Incident", back_populates="worker")


class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    registration_number = Column(String(100))
    region = Column(String(100), nullable=False)
    contact_phone = Column(String(20))
    risk_score = Column(Numeric(3, 1), default=5.0)
    total_jobs = Column(Integer, default=0)
    total_incidents = Column(Integer, default=0)
    is_blacklisted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    checkins = relationship("JobCheckin", back_populates="contractor")
    ratings = relationship("ContractorRating", back_populates="contractor")


class JobCheckin(Base):
    __tablename__ = "job_checkins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"))
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractors.id", ondelete="SET NULL"))

    # Location
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    location_description = Column(Text)
    manhole_id = Column(String(100))

    # Job details
    sewer_depth = Column(Numeric(5, 2))
    estimated_duration = Column(Integer)  # minutes
    equipment_available = Column(JSON, default=list)
    smell_reported = Column(Boolean, default=False)

    # Risk assessment
    risk_level = Column(String(10))  # GREEN / YELLOW / RED
    risk_score = Column(Integer)
    risk_factors = Column(JSON, default=list)
    ai_recommendation = Column(Text)

    # Timeline
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    deadline = Column(DateTime(timezone=True))
    checked_out_at = Column(DateTime(timezone=True))

    # Status
    status = Column(String(20), default="active")
    alert_level = Column(Integer, default=0)

    # Evidence
    voice_note_url = Column(String(500))
    photo_urls = Column(JSON, default=list)
    blockchain_tx_hash = Column(String(100))

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    worker = relationship("Worker", back_populates="checkins")
    contractor = relationship("Contractor", back_populates="checkins")
    incidents = relationship("Incident", back_populates="checkin")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    checkin_id = Column(UUID(as_uuid=True), ForeignKey("job_checkins.id", ondelete="SET NULL"))
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"))
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractors.id", ondelete="SET NULL"))

    incident_type = Column(String(50))
    severity = Column(String(20))
    description = Column(Text)

    # Location
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    country = Column(String(100))
    region = Column(String(100))

    # Status tracking
    status = Column(String(50), default="reported")
    authority_notified = Column(Boolean, default=False)
    authority_responded = Column(Boolean, default=False)
    compensation_claimed = Column(Boolean, default=False)
    compensation_received = Column(Boolean, default=False)

    # Evidence
    evidence_urls = Column(JSON, default=list)
    blockchain_tx_hash = Column(String(100))

    # Timestamps
    incident_date = Column(DateTime(timezone=True))
    reported_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    resolved_at = Column(DateTime(timezone=True))

    # Relationships
    checkin = relationship("JobCheckin", back_populates="incidents")
    worker = relationship("Worker", back_populates="incidents")


class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"))
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="SET NULL"))

    document_type = Column(String(50))
    content = Column(Text)
    language = Column(String(10))

    submitted_to = Column(String(255))
    submitted_at = Column(DateTime(timezone=True))
    response_received_at = Column(DateTime(timezone=True))
    response_content = Column(Text)
    escalated_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class ContractorRating(Base):
    __tablename__ = "contractor_ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractors.id", ondelete="CASCADE"))
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"))
    checkin_id = Column(UUID(as_uuid=True), ForeignKey("job_checkins.id", ondelete="SET NULL"))

    safety_score = Column(Integer)
    equipment_provided = Column(Boolean)
    payment_on_time = Column(Boolean)
    review_text = Column(Text)
    is_anonymous = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    contractor = relationship("Contractor", back_populates="ratings")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="worker")
    region = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
