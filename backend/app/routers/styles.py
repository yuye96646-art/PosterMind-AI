import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.style import Style
from app.schemas.style import StyleResponse

router = APIRouter(prefix="/api/styles", tags=["styles"])


@router.get("", response_model=list[StyleResponse])
async def list_styles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Style).order_by(Style.created_at))
    return [StyleResponse.model_validate(s) for s in result.scalars().all()]


@router.get("/{style_id}", response_model=StyleResponse)
async def get_style(style_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Style).where(Style.id == str(style_id)))
    style = result.scalar_one_or_none()
    if not style:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style not found")
    return StyleResponse.model_validate(style)
