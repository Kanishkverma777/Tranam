# SafeFlow Global — Fix User Links Script
# Link existing users to Worker/Contractor records if missing

import asyncio
import os
import sys
from uuid import UUID

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.models import User, Worker, Contractor

DB_URL = os.getenv("DATABASE_URL")

async def fix():
    if not DB_URL:
        print("❌ DATABASE_URL not set")
        return

    engine = create_async_engine(DB_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as session:
        async with session.begin():
            # Get all users
            res = await session.execute(select(User))
            users = res.scalars().all()
            
            for user in users:
                updated = False
                if user.role == "worker" and not user.worker_id:
                    print(f"🔗 Linking Worker: {user.name}")
                    w = Worker(name=user.name, phone_number="TBD-" + str(user.id)[:8], region=user.region or "Unknown")
                    session.add(w)
                    await session.flush()
                    user.worker_id = w.id
                    updated = True
                elif user.role == "contractor" and not user.contractor_id:
                    print(f"🏢 Linking Contractor: {user.name}")
                    c = Contractor(name=user.name, region=user.region or "Unknown")
                    session.add(c)
                    await session.flush()
                    user.contractor_id = c.id
                    updated = True
                
                if updated:
                    print(f"✅ Fixed links for {user.name} ({user.role})")

        await session.commit()
    print("✨ All user links verified and fixed.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix())
