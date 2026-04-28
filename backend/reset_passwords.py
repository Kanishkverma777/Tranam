import asyncio
from app.database import AsyncSessionLocal
from app.models import User
from app.auth import hash_password
from sqlalchemy import select

async def reset_passwords():
    async with AsyncSessionLocal() as db:
        users_to_reset = ["test777@gmail.com", "test222@gmail.com"]
        for email in users_to_reset:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if user:
                user.password_hash = hash_password("password123")
                print(f"✅ Reset password for {email} to: password123")
        await db.commit()

if __name__ == "__main__":
    asyncio.run(reset_passwords())
