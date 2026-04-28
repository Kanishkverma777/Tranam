import asyncio
from app.database import engine, Base
from app.models import User, Worker, Contractor, JobCheckin, Incident, LegalDocument, ContractorRating
from app.auth import hash_password
from sqlalchemy import select
from app.database import AsyncSessionLocal

async def init_db():
    print("🚀 Initializing database schema...")
    async with engine.begin() as conn:
        # Drop all tables and recreate them to ensure schema matches models
        # WARNING: This deletes all data. Since this is a fresh setup, it's fine.
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Schema created.")
    
    print("👤 Seeding admin user...")
    async with AsyncSessionLocal() as db:
        admin_email = "admin@safeflow.global"
        result = await db.execute(select(User).where(User.email == admin_email))
        if not result.scalar_one_or_none():
            admin = User(
                email=admin_email,
                password_hash=hash_password("admin123"),
                name="Admin User",
                role="admin",
                region="IN-MH"
            )
            db.add(admin)
            await db.commit()
            print(f"✅ Admin user created: {admin_email} / admin123")
        else:
            print("ℹ️ Admin user already exists.")

if __name__ == "__main__":
    asyncio.run(init_db())
