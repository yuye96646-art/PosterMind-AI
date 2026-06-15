import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.element import Element
from app.schemas.element import ElementCreateRequest, ElementResponse

router = APIRouter(prefix="/api/elements", tags=["elements"])


@router.get("", response_model=list[ElementResponse])
async def list_elements(style_id: uuid.UUID | None = Query(None), db: AsyncSession = Depends(get_db)):
    stmt = select(Element)
    if style_id:
        stmt = stmt.where(Element.style_id == str(style_id))
    result = await db.execute(stmt.order_by(Element.created_at))
    return [ElementResponse.model_validate(e) for e in result.scalars().all()]


@router.post("", response_model=ElementResponse, status_code=201)
async def create_element(req: ElementCreateRequest, db: AsyncSession = Depends(get_db)):
    element = Element(
        name=req.name,
        type=req.type,
        style_id=str(req.style_id),
        properties=req.properties,
    )
    db.add(element)
    await db.commit()
    await db.refresh(element)
    return ElementResponse.model_validate(element)
