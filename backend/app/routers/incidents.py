# SafeFlow Global — Incidents Router

from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Incident
from ..schemas import IncidentCreate, IncidentResponse, IncidentStatusUpdate
from ..auth import get_current_user

router = APIRouter()


@router.post("/report", response_model=IncidentResponse, status_code=201)
async def report_incident(payload: IncidentCreate, db: AsyncSession = Depends(get_db)):
    """Report a new incident"""
    incident = Incident(
        **payload.model_dump(),
        incident_date=payload.incident_date or datetime.utcnow(),
    )
    db.add(incident)
    await db.flush()
    await db.refresh(incident)
    return incident


@router.get("/", response_model=list[IncidentResponse])
async def list_incidents(
    country: str = Query(None),
    region: str = Query(None),
    severity: str = Query(None),
    status: str = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List incidents with filters"""
    query = select(Incident).offset(skip).limit(limit).order_by(Incident.reported_at.desc())
    if country:
        query = query.where(Incident.country == country)
    if region:
        query = query.where(Incident.region == region)
    if severity:
        query = query.where(Incident.severity == severity)
    if status:
        query = query.where(Incident.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/count")
async def count_incidents(db: AsyncSession = Depends(get_db)):
    """Count incidents"""
    total = await db.execute(select(func.count(Incident.id)))
    this_month = await db.execute(
        select(func.count(Incident.id)).where(
            Incident.reported_at >= datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
        )
    )
    return {"total": total.scalar(), "this_month": this_month.scalar()}


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get incident details"""
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.put("/{incident_id}/status")
async def update_incident_status(
    incident_id: UUID,
    payload: IncidentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update incident status"""
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(incident, key, value)
    await db.flush()

    return {"status": "updated", "incident_id": str(incident_id)}
