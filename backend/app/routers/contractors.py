# SafeFlow Global — Contractors Router

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Contractor, ContractorRating
from ..schemas import ContractorCreate, ContractorResponse, ContractorRatingCreate, ContractorUpdate
from ..auth import get_current_user

router = APIRouter()


@router.post("/", response_model=ContractorResponse, status_code=201)
async def create_contractor(
    payload: ContractorCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Register a new contractor"""
    contractor = Contractor(**payload.model_dump())
    db.add(contractor)
    await db.flush()
    await db.refresh(contractor)
    return contractor


@router.get("/", response_model=list[ContractorResponse])
async def list_contractors(
    region: str = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List contractors with region filter"""
    query = select(Contractor).offset(skip).limit(limit)
    if region:
        query = query.where(Contractor.region == region)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/blacklisted", response_model=list[ContractorResponse])
async def list_blacklisted(db: AsyncSession = Depends(get_db)):
    """Public blacklist of unsafe contractors"""
    result = await db.execute(
        select(Contractor).where(Contractor.is_blacklisted == True)
    )
    return result.scalars().all()


@router.get("/{contractor_id}", response_model=ContractorResponse)
async def get_contractor(contractor_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get contractor profile"""
    result = await db.execute(select(Contractor).where(Contractor.id == contractor_id))
    contractor = result.scalar_one_or_none()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    return contractor


@router.put("/{contractor_id}", response_model=ContractorResponse)
async def update_contractor(
    contractor_id: UUID, payload: ContractorUpdate, db: AsyncSession = Depends(get_db)
):
    """Update contractor profile"""
    result = await db.execute(select(Contractor).where(Contractor.id == contractor_id))
    contractor = result.scalar_one_or_none()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contractor, key, value)

    await db.flush()
    await db.refresh(contractor)
    return contractor


@router.post("/{contractor_id}/rate", status_code=201)
async def rate_contractor(
    contractor_id: UUID,
    payload: ContractorRatingCreate,
    db: AsyncSession = Depends(get_db),
):
    """Submit a rating for a contractor"""
    result = await db.execute(select(Contractor).where(Contractor.id == contractor_id))
    contractor = result.scalar_one_or_none()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    rating = ContractorRating(contractor_id=contractor_id, **payload.model_dump())
    db.add(rating)
    await db.flush()

    return {"status": "rated", "contractor_id": str(contractor_id)}
