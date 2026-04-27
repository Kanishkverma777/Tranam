"""
TRANAM — Comprehensive Production Seed Script
Seeds rich, realistic data across ALL dashboard sections:
  - Workers (12 diverse profiles)
  - Contractors (8, including blacklisted ones)
  - Job Check-ins (active, safe, emergency, missed)
  - Incidents (multiple types, severities, regions, with geo coordinates)
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add backend to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.models import Worker, Contractor, JobCheckin, Incident

DB_URL = os.getenv("DATABASE_URL")


async def seed():
    if not DB_URL:
        print("❌ Error: DATABASE_URL not set.")
        return

    print("🚀 Connecting to Render Database...")
    engine = create_async_engine(DB_URL)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        async with session.begin():

            # ─────────────────────────────────
            # 1. WORKERS (12 profiles)
            # ─────────────────────────────────
            print("👷 Seeding Workers...")
            workers_data = [
                {"phone_number": "+919000000001", "name": "Rajesh Kumar",    "region": "IN-MH", "district": "Mumbai",       "emergency_contact": "+919000000010", "emergency_contact_name": "Priya Kumar",  "profile_verified": True},
                {"phone_number": "+919000000002", "name": "Suresh Babu",     "region": "IN-TN", "district": "Chennai",      "emergency_contact": "+919000000020", "emergency_contact_name": "Lakshmi Babu","profile_verified": True},
                {"phone_number": "+919000000003", "name": "Ahmed Khan",      "region": "IN-DL", "district": "New Delhi",    "emergency_contact": "+919000000030", "emergency_contact_name": "Fatima Khan", "profile_verified": True},
                {"phone_number": "+919000000004", "name": "Vikram Singh",    "region": "IN-DL", "district": "South Delhi",  "emergency_contact": "+919000000040", "emergency_contact_name": "Sita Singh",  "profile_verified": True},
                {"phone_number": "+919000000005", "name": "Anjali Rao",      "region": "IN-KA", "district": "Bangalore",    "emergency_contact": "+919000000050", "emergency_contact_name": "Kiran Rao",   "profile_verified": True},
                {"phone_number": "+919000000006", "name": "Deepak Varma",    "region": "IN-MH", "district": "Pune",         "emergency_contact": "+919000000060", "emergency_contact_name": "Meena Varma", "profile_verified": False},
                {"phone_number": "+919000000007", "name": "Ravi Sharma",     "region": "IN-GJ", "district": "Surat",        "emergency_contact": "+919000000070", "emergency_contact_name": "Kavita Sharma","profile_verified": True},
                {"phone_number": "+919000000008", "name": "Mohan Das",       "region": "IN-WB", "district": "Kolkata",      "emergency_contact": "+919000000080", "emergency_contact_name": "Sonal Das",   "profile_verified": False},
                {"phone_number": "+919000000009", "name": "Pradeep Nair",    "region": "IN-KL", "district": "Kochi",        "emergency_contact": "+919000000090", "emergency_contact_name": "Suma Nair",   "profile_verified": True},
                {"phone_number": "+919000000010", "name": "Santosh Yadav",   "region": "IN-UP", "district": "Lucknow",      "emergency_contact": "+919000000100", "emergency_contact_name": "Geeta Yadav", "profile_verified": True},
                {"phone_number": "+919000000011", "name": "Imran Sheikh",    "region": "IN-RJ", "district": "Jaipur",       "emergency_contact": "+919000000110", "emergency_contact_name": "Aisha Sheikh","profile_verified": False},
                {"phone_number": "+919000000012", "name": "Bhaskar Reddy",   "region": "IN-TG", "district": "Hyderabad",    "emergency_contact": "+919000000120", "emergency_contact_name": "Vani Reddy",  "profile_verified": True},
            ]
            worker_objs = {}
            for wd in workers_data:
                res = await session.execute(select(Worker).filter_by(phone_number=wd["phone_number"]))
                existing = res.scalars().first()
                if existing:
                    worker_objs[wd["name"]] = existing
                else:
                    w = Worker(**wd)
                    session.add(w)
                    await session.flush()
                    worker_objs[wd["name"]] = w

            # ─────────────────────────────────
            # 2. CONTRACTORS (8 companies)
            # ─────────────────────────────────
            print("🏗️ Seeding Contractors...")
            contractors_data = [
                {"name": "Metro Sanitation Corp",       "registration_number": "MSC-2024-001", "region": "IN-MH", "contact_phone": "+919876543210", "risk_score": 6.5,  "total_jobs": 320, "total_incidents": 5,  "is_blacklisted": False},
                {"name": "City Clean Services",         "registration_number": "CCS-2024-002", "region": "IN-DL", "contact_phone": "+919876543211", "risk_score": 4.2,  "total_jobs": 215, "total_incidents": 3,  "is_blacklisted": False},
                {"name": "Safe Sewer Works",            "registration_number": "SSW-2024-003", "region": "IN-TN", "contact_phone": "+919876543212", "risk_score": 8.1,  "total_jobs": 178, "total_incidents": 11, "is_blacklisted": False},
                {"name": "Bharat Infra Solutions",      "registration_number": "BIS-9922",     "region": "IN-DL", "contact_phone": "+919876543213", "risk_score": 8.5,  "total_jobs": 450, "total_incidents": 14, "is_blacklisted": False},
                {"name": "Cauvery Drainage Corp",       "registration_number": "CDC-4411",     "region": "IN-KA", "contact_phone": "+919876543214", "risk_score": 4.2,  "total_jobs": 120, "total_incidents": 8,  "is_blacklisted": False},
                {"name": "Urban Pipe Masters",          "registration_number": "UPM-7700",     "region": "IN-MH", "contact_phone": "+919876543215", "risk_score": 2.1,  "total_jobs": 85,  "total_incidents": 12, "is_blacklisted": True},
                {"name": "Ganga Waterworks Ltd",        "registration_number": "GWL-1133",     "region": "IN-UP", "contact_phone": "+919876543216", "risk_score": 7.3,  "total_jobs": 267, "total_incidents": 9,  "is_blacklisted": False},
                {"name": "Kerala Sanitation Board",     "registration_number": "KSB-5566",     "region": "IN-KL", "contact_phone": "+919876543217", "risk_score": 9.1,  "total_jobs": 142, "total_incidents": 2,  "is_blacklisted": False},
            ]
            contractor_objs = {}
            for cd in contractors_data:
                res = await session.execute(select(Contractor).filter_by(name=cd["name"]))
                existing = res.scalars().first()
                if existing:
                    contractor_objs[cd["name"]] = existing
                else:
                    c = Contractor(**cd)
                    session.add(c)
                    await session.flush()
                    contractor_objs[cd["name"]] = c

            # ─────────────────────────────────
            # 3. JOB CHECK-INS (varied statuses)
            # ─────────────────────────────────
            print("🕐 Seeding Job Check-ins...")
            now = datetime.utcnow()

            checkins_data = [
                # --- ACTIVE (currently underground) ---
                {"worker": "Rajesh Kumar",  "contractor": "Metro Sanitation Corp",    "depth": 10.5, "duration": 60,  "risk_level": "YELLOW", "risk_score": 6, "status": "active",    "smell": True,  "equipment": ["gas_mask","rope","torch"],         "location": "Dharavi Main Line, Manhole #D-12",    "lat": 19.0390, "lng": 72.8516, "started_offset": -30, "deadline_offset": 30,   "factors": ["H2S detected","Limited ventilation"]},
                {"worker": "Vikram Singh",  "contractor": "Bharat Infra Solutions",   "depth": 5.0,  "duration": 120, "risk_level": "GREEN",  "risk_score": 3, "status": "active",    "smell": False, "equipment": ["torch","rope"],                    "location": "Connaught Place Sewer, Manhole #CP-4","lat": 28.6315, "lng": 77.2167, "started_offset": -15, "deadline_offset": 105,  "factors": ["Moderate depth"]},
                {"worker": "Anjali Rao",    "contractor": "Cauvery Drainage Corp",    "depth": 15.2, "duration": 45,  "risk_level": "RED",    "risk_score": 9, "status": "active",    "smell": True,  "equipment": ["gas_mask","harness","oxygen_tank"],  "location": "Indiranagar Storm Drain, Node #I-07", "lat": 12.9784, "lng": 77.6408, "started_offset": -40, "deadline_offset": 5,    "factors": ["Toxic gas","High depth","Flooding risk"]},
                {"worker": "Suresh Babu",   "contractor": "Safe Sewer Works",         "depth": 7.0,  "duration": 90,  "risk_level": "YELLOW", "risk_score": 5, "status": "active",    "smell": False, "equipment": ["gas_mask","torch"],                "location": "Marina Beach Road, Tunnel #MB-3",     "lat": 13.0500, "lng": 80.2824, "started_offset": -25, "deadline_offset": 65,   "factors": ["Tidal influence","Limited exit"]},
                {"worker": "Pradeep Nair",  "contractor": "Kerala Sanitation Board",  "depth": 4.5,  "duration": 60,  "risk_level": "GREEN",  "risk_score": 2, "status": "active",    "smell": False, "equipment": ["torch","rope"],                    "location": "Kochi Backwaters Drain, Node #K-01",  "lat": 9.9312,  "lng": 76.2673, "started_offset": -10, "deadline_offset": 50,   "factors": ["Minimal risk"]},

                # --- MISSED (no check-out — EMERGENCY) ---
                {"worker": "Deepak Varma",  "contractor": "Urban Pipe Masters",       "depth": 12.0, "duration": 60,  "risk_level": "RED",    "risk_score": 8, "status": "missed",    "smell": True,  "equipment": ["gas_mask"],                       "location": "Pune Cantonment, Sewer #PC-19",       "lat": 18.5204, "lng": 73.8567, "started_offset": -90, "deadline_offset": -30,  "factors": ["No equipment","H2S","Lone worker"]},
                {"worker": "Mohan Das",     "contractor": "Ganga Waterworks Ltd",     "depth": 8.5,  "duration": 60,  "risk_level": "YELLOW", "risk_score": 7, "status": "missed",    "smell": False, "equipment": ["torch"],                          "location": "Kolkata Port Trust Drain, Node #KP-5","lat": 22.5726, "lng": 88.3639, "started_offset": -75, "deadline_offset": -15,  "factors": ["Corroded walls","Poor drainage"]},

                # --- EMERGENCY (SOS triggered) ---
                {"worker": "Imran Sheikh",  "contractor": "City Clean Services",      "depth": 11.0, "duration": 45,  "risk_level": "RED",    "risk_score": 9, "status": "emergency", "smell": True,  "equipment": ["gas_mask","rope"],                "location": "Jaipur Old City, Tunnel #JO-8",       "lat": 26.9124, "lng": 75.7873, "started_offset": -50, "deadline_offset": -5,   "factors": ["H2S critical","Flooding","SOS triggered"]},

                # --- COMPLETED SAFE (historical data) ---
                {"worker": "Rajesh Kumar",  "contractor": "Metro Sanitation Corp",    "depth": 6.0,  "duration": 60,  "risk_level": "GREEN",  "risk_score": 3, "status": "safe",      "smell": False, "equipment": ["torch","rope"],                    "location": "Worli Sea Link Drain, #W-02",         "lat": 19.0176, "lng": 72.8193, "started_offset": -1440,"deadline_offset": -1380,"factors": ["Low risk"]},
                {"worker": "Santosh Yadav", "contractor": "Ganga Waterworks Ltd",     "depth": 9.0,  "duration": 90,  "risk_level": "YELLOW", "risk_score": 5, "status": "safe",      "smell": True,  "equipment": ["gas_mask","torch"],                "location": "Hazratganj Drain, Lucknow #HG-4",     "lat": 26.8467, "lng": 80.9462, "started_offset": -2880,"deadline_offset": -2790,"factors": ["Moderate H2S","Restricted space"]},
                {"worker": "Bhaskar Reddy", "contractor": "Safe Sewer Works",         "depth": 5.5,  "duration": 75,  "risk_level": "GREEN",  "risk_score": 4, "status": "safe",      "smell": False, "equipment": ["torch"],                          "location": "Hyderabad Old City Drain, #OC-11",    "lat": 17.3616, "lng": 78.4747, "started_offset": -4320,"deadline_offset": -4245,"factors": ["Mild risk"]},
                {"worker": "Ahmed Khan",    "contractor": "City Clean Services",      "depth": 14.0, "duration": 60,  "risk_level": "RED",    "risk_score": 8, "status": "safe",      "smell": True,  "equipment": ["gas_mask","harness","oxygen_tank"],  "location": "Yamuna Drain, Delhi #YD-3",           "lat": 28.7041, "lng": 77.1025, "started_offset": -5760,"deadline_offset": -5700,"factors": ["High depth","Toxic gas"]},
                {"worker": "Ravi Sharma",   "contractor": "Kerala Sanitation Board",  "depth": 3.5,  "duration": 45,  "risk_level": "GREEN",  "risk_score": 2, "status": "safe",      "smell": False, "equipment": ["torch"],                          "location": "Surat BRTS Drain, #BR-7",             "lat": 21.1702, "lng": 72.8311, "started_offset": -7200,"deadline_offset": -7155,"factors": ["Minimal risk"]},
            ]

            for cd in checkins_data:
                worker = worker_objs.get(cd["worker"])
                contractor = contractor_objs.get(cd["contractor"])
                if not worker or not contractor:
                    print(f"  ⚠️ Skipping check-in: {cd['worker']} or {cd['contractor']} not found")
                    continue

                started = now + timedelta(minutes=cd["started_offset"])
                deadline = now + timedelta(minutes=cd["deadline_offset"])
                checked_out = None
                if cd["status"] == "safe":
                    checked_out = deadline + timedelta(minutes=5)

                checkin = JobCheckin(
                    worker_id=worker.id,
                    contractor_id=contractor.id,
                    latitude=cd["lat"],
                    longitude=cd["lng"],
                    location_description=cd["location"],
                    sewer_depth=cd["depth"],
                    estimated_duration=cd["duration"],
                    equipment_available=cd["equipment"],
                    smell_reported=cd["smell"],
                    risk_level=cd["risk_level"],
                    risk_score=cd["risk_score"],
                    risk_factors=cd["factors"],
                    ai_recommendation=f"Risk level {cd['risk_level']}. Ensure {', '.join(cd['equipment'])} are used.",
                    started_at=started,
                    deadline=deadline,
                    checked_out_at=checked_out,
                    status=cd["status"],
                    alert_level=2 if cd["status"] in ["missed", "emergency"] else 0,
                )
                session.add(checkin)

            await session.flush()

            # ─────────────────────────────────
            # 4. INCIDENTS (diverse types & regions)
            # ─────────────────────────────────
            print("🚨 Seeding Incidents...")
            incidents_data = [
                # Critical / Fatalities
                {"type": "death",                "severity": "critical", "desc": "Worker fatality due to H2S poisoning at Dharavi Trunk Sewer.", "status": "resolved", "country": "India", "region": "IN-MH", "lat": 19.0390, "lng": 72.8516, "authority_notified": True,  "authority_responded": True,  "days_ago": 45},
                {"type": "death",                "severity": "critical", "desc": "Oxygen depletion fatality in confined sewer tunnel, Yamuna River section.", "status": "resolved", "country": "India", "region": "IN-DL", "lat": 28.7041, "lng": 77.1025, "authority_notified": True,  "authority_responded": True,  "days_ago": 92},

                # High severity
                {"type": "gas_leak",             "severity": "critical", "desc": "H2S levels exceeded 100ppm in Sector 4 — worker evacuated.", "status": "resolved",   "country": "India", "region": "IN-MH", "lat": 19.0596, "lng": 72.8295, "authority_notified": True,  "authority_responded": True,  "days_ago": 5},
                {"type": "structural_collapse",  "severity": "high",     "desc": "Partial wall collapse in 40-year-old drainage tunnel. Two workers injured.", "status": "resolved", "country": "India", "region": "IN-TN", "lat": 13.0827, "lng": 80.2707, "authority_notified": True,  "authority_responded": True,  "days_ago": 12},
                {"type": "flooding",             "severity": "high",     "desc": "Sudden surge from storm drain. Worker pulled to safety by safety rope.", "status": "resolved", "country": "India", "region": "IN-KA", "lat": 12.9716, "lng": 77.5946, "authority_notified": True,  "authority_responded": False, "days_ago": 7},
                {"type": "gas_leak",             "severity": "high",     "desc": "Methane accumulation detected in Jaipur Old City tunnel. Site evacuated.", "status": "investigating", "country": "India", "region": "IN-RJ", "lat": 26.9124, "lng": 75.7873, "authority_notified": True,  "authority_responded": False, "days_ago": 2},

                # Medium severity
                {"type": "near_miss",            "severity": "medium",   "desc": "Worker slipped on slick tunnel floor. No injuries. Harness prevented fall.", "status": "resolved", "country": "India", "region": "IN-GJ", "lat": 21.1702, "lng": 72.8311, "authority_notified": False, "authority_responded": False, "days_ago": 3},
                {"type": "near_miss",            "severity": "medium",   "desc": "Pump failure in Kolkata Port drain. Worker was alone — no backup.", "status": "investigating", "country": "India", "region": "IN-WB", "lat": 22.5726, "lng": 88.3639, "authority_notified": True,  "authority_responded": False, "days_ago": 1},
                {"type": "illness",              "severity": "medium",   "desc": "Worker developed skin rash after exposure to sewer effluent. Hospitalized.", "status": "resolved", "country": "India", "region": "IN-UP", "lat": 26.8467, "lng": 80.9462, "authority_notified": False, "authority_responded": False, "days_ago": 18},
                {"type": "near_miss",            "severity": "medium",   "desc": "Ladder rungs corroded — collapsed during descent. Worker held on by rope.", "status": "resolved", "country": "India", "region": "IN-TG", "lat": 17.3616, "lng": 78.4747, "authority_notified": False, "authority_responded": False, "days_ago": 22},
                {"type": "illness",              "severity": "medium",   "desc": "Multiple workers reported nausea after entering unventilated manhole. Overcrowding.", "status": "resolved", "country": "India", "region": "IN-KL", "lat": 9.9312,  "lng": 76.2673, "authority_notified": True,  "authority_responded": True,  "days_ago": 30},

                # Low severity / recent
                {"type": "near_miss",            "severity": "low",      "desc": "Incorrect gas meter reading — no H2S but meter alarmed falsely.", "status": "reported",  "country": "India", "region": "IN-MH", "lat": 18.5204, "lng": 73.8567, "authority_notified": False, "authority_responded": False, "days_ago": 0},
                {"type": "illness",              "severity": "low",      "desc": "Minor eye irritation from sewer gas. Worker recovered without hospitalization.", "status": "reported",  "country": "India", "region": "IN-DL", "lat": 28.6139, "lng": 77.2090, "authority_notified": False, "authority_responded": False, "days_ago": 0},
                {"type": "near_miss",            "severity": "low",      "desc": "Traffic vehicle nearly drove over open manhole during inspection — no injuries.", "status": "resolved", "country": "India", "region": "IN-TN", "lat": 13.0500, "lng": 80.2824, "authority_notified": False, "authority_responded": False, "days_ago": 10},
            ]

            workers_list = list(worker_objs.values())
            contractors_list = list(contractor_objs.values())

            for i, idata in enumerate(incidents_data):
                # Check if it already exists by description
                res = await session.execute(select(Incident).filter_by(description=idata["desc"]))
                if res.scalars().first():
                    continue

                incident = Incident(
                    incident_type=idata["type"],
                    severity=idata["severity"],
                    description=idata["desc"],
                    status=idata["status"],
                    country=idata["country"],
                    region=idata["region"],
                    latitude=idata["lat"],
                    longitude=idata["lng"],
                    authority_notified=idata["authority_notified"],
                    authority_responded=idata["authority_responded"],
                    worker_id=workers_list[i % len(workers_list)].id,
                    contractor_id=contractors_list[i % len(contractors_list)].id,
                    reported_at=now - timedelta(days=idata["days_ago"]),
                    incident_date=now - timedelta(days=idata["days_ago"]),
                    resolved_at=(now - timedelta(days=idata["days_ago"] - 1)) if idata["status"] == "resolved" else None,
                )
                session.add(incident)

        await session.commit()

    print("")
    print("✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("✅  DATABASE SEEDED SUCCESSFULLY!")
    print("✅  - 12 Workers across 10 Indian states")
    print("✅  - 8 Contractors (1 blacklisted)")
    print("✅  - 13 Job Check-ins (5 active, 2 missed, 1 emergency, 5 safe)")
    print("✅  - 14 Incidents (2 deaths, gas leaks, collapses, near misses)")
    print("✅  Refresh your Netlify dashboard to see the data!")
    print("✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
