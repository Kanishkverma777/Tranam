# SafeFlow Global — Dead Man's Switch (Background Monitor)
# 
# Run independently: python -m app.services.deadswitch
# Or integrate with Celery for production.
#
# This monitors active check-ins and fires alerts when deadlines pass.

import asyncio
import logging
from datetime import datetime

from sqlalchemy import select, update
from ..database import AsyncSessionLocal
from ..models import JobCheckin, Worker, Incident
from .notifications import send_emergency_alert, send_worker_ping

logger = logging.getLogger(__name__)

CHECK_INTERVAL_SECONDS = 300  # 5 minutes


async def monitor_checkins():
    """
    Main monitoring loop — runs every 5 minutes.
    Checks for overdue check-ins and escalates alerts.
    """
    logger.info("🔔 Dead Man's Switch monitor started")

    while True:
        try:
            async with AsyncSessionLocal() as db:
                # Find all active check-ins past their deadline
                result = await db.execute(
                    select(JobCheckin).where(
                        JobCheckin.status == "active",
                        JobCheckin.deadline < datetime.utcnow(),
                    )
                )
                overdue_checkins = result.scalars().all()

                for checkin in overdue_checkins:
                    # Get worker info
                    worker_result = await db.execute(
                        select(Worker).where(Worker.id == checkin.worker_id)
                    )
                    worker = worker_result.scalar_one_or_none()
                    if not worker:
                        continue

                    minutes_overdue = int(
                        (datetime.utcnow() - checkin.deadline).total_seconds() / 60
                    )

                    if checkin.alert_level == 0:
                        # Level 0: First miss — ping worker via SMS
                        logger.warning(
                            f"⚠️ Worker {worker.name} overdue by {minutes_overdue}min — sending ping"
                        )
                        await send_worker_ping(worker.phone_number, worker.name)
                        checkin.alert_level = 1
                        await db.commit()

                    elif checkin.alert_level == 1 and minutes_overdue >= 10:
                        # Level 1: 10+ min no response — EMERGENCY
                        logger.critical(
                            f"🚨 EMERGENCY: Worker {worker.name} — {minutes_overdue}min overdue!"
                        )

                        # Send emergency alerts
                        coordinates = None
                        if checkin.latitude and checkin.longitude:
                            coordinates = {
                                "lat": float(checkin.latitude),
                                "lng": float(checkin.longitude),
                            }

                        if worker.emergency_contact:
                            await send_emergency_alert(
                                worker_name=worker.name,
                                location=checkin.location_description or "Unknown",
                                emergency_contact=worker.emergency_contact,
                                coordinates=coordinates,
                            )

                        # Create incident record
                        incident = Incident(
                            checkin_id=checkin.id,
                            worker_id=worker.id,
                            contractor_id=checkin.contractor_id,
                            incident_type="missed_checkin",
                            severity="critical",
                            description=f"Worker {worker.name} failed to check out. "
                                        f"Overdue by {minutes_overdue} minutes.",
                            latitude=checkin.latitude,
                            longitude=checkin.longitude,
                            country="India",
                            region=worker.region,
                            incident_date=datetime.utcnow(),
                            authority_notified=True,
                        )
                        db.add(incident)

                        # Update check-in status
                        checkin.status = "emergency"
                        checkin.alert_level = 2
                        await db.commit()

                if overdue_checkins:
                    logger.info(f"Processed {len(overdue_checkins)} overdue check-ins")

        except Exception as e:
            logger.error(f"Dead Man's Switch error: {e}")

        await asyncio.sleep(CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    asyncio.run(monitor_checkins())
