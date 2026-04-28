# SafeFlow Global — Delete User Script
import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, delete

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
from app.models import User, Contractor, Worker

DB_URL = "postgresql+asyncpg://tranam_db_user:rFh5pAn9S2p2f703v3Zz66fE3O9E2sS7@dpg-cv20rll2ngec738m2idg-a.oregon-postgres.render.com/tranam?ssl=require"
EMAIL_TO_DELETE = "contractor777@gmail.com"

async def delete_user():
    engine = create_async_engine(DB_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as session:
        async with session.begin():
            # Find the user
            res = await session.execute(select(User).where(User.email == EMAIL_TO_DELETE))
            user = res.scalar_one_or_none()
            
            if not user:
                print(f"❌ User with email {EMAIL_TO_DELETE} not found.")
                return

            print(f"🔍 Found user: {user.name} ({user.role})")
            
            # Delete linked records if they exist
            if user.contractor_id:
                print(f"🗑️ Deleting linked contractor record...")
                await session.execute(delete(Contractor).where(Contractor.id == user.contractor_id))
            
            if user.worker_id:
                print(f"🗑️ Deleting linked worker record...")
                await session.execute(delete(Worker).where(Worker.id == user.worker_id))

            # Delete the user itself
            print(f"🗑️ Deleting user login...")
            await session.execute(delete(User).where(User.id == user.id))
            
            print(f"✅ Successfully deleted {EMAIL_TO_DELETE} and all linked profiles.")
            
        await session.commit()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(delete_user())
