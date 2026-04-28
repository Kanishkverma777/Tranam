# SafeFlow Global — Auth Router

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import User
from ..schemas import UserLogin, UserRegister, TokenResponse
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new dashboard user"""
    # Check if email exists
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        role=payload.role,
        region=payload.region,
    )
    db.add(user)
    await db.flush()

    # Create and link profiles based on role
    from ..models import Worker, Contractor
    if user.role == "worker":
        worker = Worker(name=user.name, phone_number="TBD-" + str(user.id)[:8], region=user.region or "Unknown")
        db.add(worker)
        await db.flush()
        user.worker_id = worker.id
    elif user.role == "contractor":
        contractor = Contractor(name=user.name, region=user.region or "Unknown")
        db.add(contractor)
        await db.flush()
        user.contractor_id = contractor.id
    
    await db.flush()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "worker_id": str(user.worker_id) if user.worker_id else None,
            "contractor_id": str(user.contractor_id) if user.contractor_id else None,
        },
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email/password"""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    token = create_access_token({"sub": str(user.id), "role": user.role})

    # AUTO-LINK REPAIR: If user is missing a profile link, create and link it now
    if (user.role == "worker" and not user.worker_id) or (user.role == "contractor" and not user.contractor_id):
        from ..models import Worker, Contractor
        if user.role == "worker" and not user.worker_id:
            worker = Worker(name=user.name, phone_number="TBD-" + str(user.id)[:8], region=user.region or "Unknown")
            db.add(worker)
            await db.flush()
            user.worker_id = worker.id
        elif user.role == "contractor" and not user.contractor_id:
            contractor = Contractor(name=user.name, region=user.region or "Unknown")
            db.add(contractor)
            await db.flush()
            user.contractor_id = contractor.id
        await db.flush()

    return TokenResponse(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "worker_id": str(user.worker_id) if user.worker_id else None,
            "contractor_id": str(user.contractor_id) if user.contractor_id else None,
        },
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "region": current_user.region,
        "worker_id": str(current_user.worker_id) if current_user.worker_id else None,
        "contractor_id": str(current_user.contractor_id) if current_user.contractor_id else None,
    }
