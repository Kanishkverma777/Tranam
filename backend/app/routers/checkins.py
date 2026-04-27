# SafeFlow Global — Check-ins Router (Core Workflow)

from uuid import UUID
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import JobCheckin, Worker, Contractor
from ..schemas import CheckinCreate, CheckinResponse, RiskAssessmentResponse
from ..services.risk_engine import assess_job_risk
from ..auth import get_current_user

router = APIRouter()


@router.post("/start", response_model=RiskAssessmentResponse, status_code=201)
async def start_checkin(payload: CheckinCreate, db: AsyncSession = Depends(get_db)):
    """Start a job check-in with AI risk assessment"""
    # Verify worker exists
    result = await db.execute(select(Worker).where(Worker.id == payload.worker_id))
    worker = result.scalar_one_or_none()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    # Check for active check-ins
    active = await db.execute(
        select(JobCheckin).where(
            JobCheckin.worker_id == payload.worker_id,
            JobCheckin.status == "active",
        )
    )
    if active.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Worker already has an active check-in")

    # Run AI risk assessment
    risk = await assess_job_risk(payload.model_dump())

    # Calculate deadline
    deadline = datetime.utcnow() + timedelta(minutes=payload.estimated_duration)

    # Create check-in record
    checkin = JobCheckin(
        worker_id=payload.worker_id,
        contractor_id=payload.contractor_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_description=payload.location_description,
        manhole_id=payload.manhole_id,
        sewer_depth=payload.sewer_depth,
        estimated_duration=payload.estimated_duration,
        equipment_available=payload.equipment_available,
        smell_reported=payload.smell_reported,
        risk_level=risk["risk_level"],
        risk_score=risk["risk_score"],
        risk_factors=risk["primary_hazards"],
        ai_recommendation=risk["recommendation"],
        deadline=deadline,
        status="active",
    )
    db.add(checkin)
    await db.flush()
    await db.refresh(checkin)

    # Update contractor job count
    if payload.contractor_id:
        contractor_result = await db.execute(
            select(Contractor).where(Contractor.id == payload.contractor_id)
        )
        contractor = contractor_result.scalar_one_or_none()
        if contractor:
            contractor.total_jobs += 1

    return RiskAssessmentResponse(
        checkin_id=checkin.id,
        risk_level=risk["risk_level"],
        risk_score=risk["risk_score"],
        risk_factors=risk["primary_hazards"],
        recommendation=risk["recommendation"],
        safe_to_enter=risk["safe_to_enter"],
        required_precautions=risk["required_precautions"],
        deadline=deadline,
    )


@router.post("/{checkin_id}/ping")
async def ping_checkin(checkin_id: UUID, db: AsyncSession = Depends(get_db)):
    """Heartbeat ping — extends deadline by 30 minutes"""
    result = await db.execute(
        select(JobCheckin).where(JobCheckin.id == checkin_id, JobCheckin.status == "active")
    )
    checkin = result.scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Active check-in not found")

    checkin.deadline = datetime.utcnow() + timedelta(minutes=30)
    checkin.alert_level = 0  # Reset alert level on ping
    await db.flush()

    return {"status": "ok", "new_deadline": checkin.deadline.isoformat()}


@router.post("/{checkin_id}/checkout")
async def checkout(checkin_id: UUID, db: AsyncSession = Depends(get_db)):
    """Worker safely exits — mark check-in as safe"""
    result = await db.execute(
        select(JobCheckin).where(JobCheckin.id == checkin_id, JobCheckin.status == "active")
    )
    checkin = result.scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Active check-in not found")

    checkin.status = "safe"
    checkin.checked_out_at = datetime.utcnow()
    await db.flush()

    return {"status": "safe", "message": "Check-out recorded successfully", "checked_out_at": checkin.checked_out_at.isoformat()}


@router.get("/active", response_model=list[CheckinResponse])
async def list_active_checkins(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all active check-ins (admin/NGO dashboard)"""
    result = await db.execute(
        select(JobCheckin).where(JobCheckin.status == "active").order_by(JobCheckin.deadline.asc())
    )
    return result.scalars().all()


@router.get("/", response_model=list[CheckinResponse])
async def list_checkins(
    worker_id: UUID = Query(None),
    status: str = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List check-ins with optional filters"""
    query = select(JobCheckin).offset(skip).limit(limit).order_by(JobCheckin.created_at.desc())
    if worker_id:
        query = query.where(JobCheckin.worker_id == worker_id)
    if status:
        query = query.where(JobCheckin.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/overdue")
async def get_overdue_checkins(db: AsyncSession = Depends(get_db)):
    """Get check-ins past their deadline (for dead man's switch monitoring)"""
    result = await db.execute(
        select(JobCheckin).where(
            JobCheckin.status == "active",
            JobCheckin.deadline < datetime.utcnow(),
        )
    )
    checkins = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "worker_id": str(c.worker_id),
            "deadline": c.deadline.isoformat(),
            "alert_level": c.alert_level,
            "minutes_overdue": int((datetime.utcnow() - c.deadline).total_seconds() / 60),
        }
        for c in checkins
    ]
