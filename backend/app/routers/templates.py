import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.template import PosterTemplate
from app.schemas.template import TemplateResponse

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[TemplateResponse])
async def list_templates(style_id: uuid.UUID | None = Query(None), db: AsyncSession = Depends(get_db)):
    stmt = select(PosterTemplate)
    if style_id:
        stmt = stmt.where(PosterTemplate.style_id == str(style_id))
    result = await db.execute(stmt.order_by(PosterTemplate.created_at))
    return [TemplateResponse.model_validate(t) for t in result.scalars().all()]


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PosterTemplate).where(PosterTemplate.id == str(template_id)))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return TemplateResponse.model_validate(template)
