# SafeFlow Global — Dashboard Router (Analytics)

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Worker, JobCheckin, Incident, Contractor
from ..schemas import DashboardStats
from ..auth import get_current_user

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Global dashboard statistics"""
    # Total workers
    workers_result = await db.execute(select(func.count(Worker.id)))
    total_workers = workers_result.scalar() or 0

    # Active check-ins
    active_result = await db.execute(
        select(func.count(JobCheckin.id)).where(JobCheckin.status == "active")
    )
    active_checkins = active_result.scalar() or 0

    # Total incidents
    incidents_result = await db.execute(select(func.count(Incident.id)))
    total_incidents = incidents_result.scalar() or 0

    # Incidents this month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_result = await db.execute(
        select(func.count(Incident.id)).where(Incident.reported_at >= month_start)
    )
    incidents_this_month = monthly_result.scalar() or 0

    # Alerts fired today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    alerts_result = await db.execute(
        select(func.count(JobCheckin.id)).where(
            JobCheckin.status.in_(["emergency", "missed"]),
            JobCheckin.created_at >= today_start,
        )
    )
    alerts_today = alerts_result.scalar() or 0

    # Risk distribution
    risk_dist = {"GREEN": 0, "YELLOW": 0, "RED": 0}
    for level in ["GREEN", "YELLOW", "RED"]:
        r = await db.execute(
            select(func.count(JobCheckin.id)).where(JobCheckin.risk_level == level)
        )
        risk_dist[level] = r.scalar() or 0

    # Top risk regions
    region_result = await db.execute(
        select(Incident.region, func.count(Incident.id).label("count"))
        .where(Incident.region.isnot(None))
        .group_by(Incident.region)
        .order_by(func.count(Incident.id).desc())
        .limit(5)
    )
    top_regions = [{"region": r[0], "incidents": r[1]} for r in region_result.all()]

    return DashboardStats(
        total_workers=total_workers,
        active_checkins=active_checkins,
        total_incidents=total_incidents,
        incidents_this_month=incidents_this_month,
        alerts_fired_today=alerts_today,
        risk_distribution=risk_dist,
        top_risk_regions=top_regions,
    )


@router.get("/heatmap")
async def get_heatmap_data(db: AsyncSession = Depends(get_db)):
    """Incident heatmap data for map visualization"""
    result = await db.execute(
        select(
            Incident.latitude, Incident.longitude,
            Incident.severity, Incident.incident_type,
            Incident.country, Incident.region,
        ).where(
            Incident.latitude.isnot(None),
            Incident.longitude.isnot(None),
        )
    )
    return [
        {
            "lat": float(r[0]), "lng": float(r[1]),
            "severity": r[2], "type": r[3],
            "country": r[4], "region": r[5],
        }
        for r in result.all()
    ]
