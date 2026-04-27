# SafeFlow Global — Workers Router

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Worker
from ..schemas import WorkerCreate, WorkerUpdate, WorkerResponse
from ..auth import get_current_user

router = APIRouter()


@router.post("/register", response_model=WorkerResponse, status_code=201)
async def register_worker(payload: WorkerCreate, db: AsyncSession = Depends(get_db)):
    """Register a new field worker"""
    # Check duplicate phone
    existing = await db.execute(select(Worker).where(Worker.phone_number == payload.phone_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    worker = Worker(**payload.model_dump())
    db.add(worker)
    await db.flush()
    await db.refresh(worker)
    return worker


@router.get("/", response_model=list[WorkerResponse])
async def list_workers(
    region: str = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all workers (filtered by region)"""
    query = select(Worker).offset(skip).limit(limit)
    if region:
        query = query.where(Worker.region == region)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/count")
async def count_workers(db: AsyncSession = Depends(get_db)):
    """Get total worker count"""
    result = await db.execute(select(func.count(Worker.id)))
    return {"total": result.scalar()}


@router.get("/{worker_id}", response_model=WorkerResponse)
async def get_worker(worker_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a specific worker profile"""
    result = await db.execute(select(Worker).where(Worker.id == worker_id))
    worker = result.scalar_one_or_none()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker


@router.put("/{worker_id}", response_model=WorkerResponse)
async def update_worker(
    worker_id: UUID, payload: WorkerUpdate, db: AsyncSession = Depends(get_db)
):
    """Update worker profile"""
    result = await db.execute(select(Worker).where(Worker.id == worker_id))
    worker = result.scalar_one_or_none()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(worker, key, value)

    await db.flush()
    await db.refresh(worker)
    return worker
