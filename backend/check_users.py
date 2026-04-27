import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import User

async def check_users():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"- {u.name} ({u.email}) [Role: {u.role}]")

if __name__ == "__main__":
    asyncio.run(check_users())
