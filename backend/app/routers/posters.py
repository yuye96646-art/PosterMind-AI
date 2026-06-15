import asyncio
import json
import logging
import re
import uuid

import requests
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.poster import PosterStatus, UserPoster
from app.models.style import Style
from app.models.template import PosterTemplate
from app.models.user import User
from app.schemas.poster import (
    PosterGenerateRequest,
    PosterGenerateResponse,
    PosterHistoryItem,
    PosterStatusResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/posters", tags=["posters"])


def _dispatch_generation(poster_id: str, req: PosterGenerateRequest):
    """Dispatch poster generation: Celery if Redis is configured, else asyncio background task."""
    if settings.REDIS_URL:
        from app.tasks.generate_poster import generate_poster

        generate_poster.delay(
            poster_id=poster_id,
            title=req.title or "",
            subtitle=req.subtitle or "",
            content=req.content or "",
            style_id=str(req.style_id),
            template_id=str(req.template_id) if req.template_id else "",
            width=req.width,
            height=req.height,
            advanced_prompt=req.advanced_prompt or "",
            primary_color_override=req.primary_color_override or "",
        )
    else:
        from app.tasks.generate_poster import run_generate_poster

        asyncio.create_task(
            run_generate_poster(
                poster_id=poster_id,
                title=req.title or "",
                subtitle=req.subtitle or "",
                content=req.content or "",
                style_id=str(req.style_id),
                template_id=str(req.template_id) if req.template_id else "",
                width=req.width,
                height=req.height,
                advanced_prompt=req.advanced_prompt or "",
                primary_color_override=req.primary_color_override or "",
            )
        )


@router.post("/generate", response_model=PosterGenerateResponse)
async def create_poster(req: PosterGenerateRequest, db: AsyncSession = Depends(get_db)):
    user = await db.execute(select(User).where(User.id == str(req.user_id)))
    if not user.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    style = await db.execute(select(Style).where(Style.id == str(req.style_id)))
    if not style.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style not found")

    poster = UserPoster(
        user_id=str(req.user_id),
        style_id=str(req.style_id),
        template_id=str(req.template_id) if req.template_id else None,
        title=req.title,
        subtitle=req.subtitle,
        content=req.content,
        status=PosterStatus.pending,
    )
    db.add(poster)
    await db.commit()
    await db.refresh(poster)

    _dispatch_generation(str(poster.id), req)

    return PosterGenerateResponse(task_id=str(poster.id), status="pending")


class AiGenerateRequest(BaseModel):
    description: str
    user_id: str

def _parse_description(desc: str) -> tuple:
    """Parse user description into title + subtitle + content. No API, always works."""
    title = ""
    subtitle = ""

    # Pattern 1: "标题叫X" / "标题是X" / "标题：X"
    m = re.search(r'标题[叫是：:]\s*[「""]?(.+?)[」""]?(?:[,，。\s]|$)', desc)
    if m:
        title = m.group(1).strip().rstrip("，,。")

    # Pattern 2: Quoted text
    if not title:
        m = re.findall(r'["""\'](.+?)["\"\']', desc)
        if m:
            title = m[0].strip()

    # Pattern 3: "叫X海报" / "叫X的"
    if not title:
        m = re.search(r'[叫是][「""]?(.+?)[」""]?(?:风格|海报|的)', desc)
        if m:
            title = m.group(1).strip()

    # Fallback: clean up description and use as title
    if not title:
        clean = re.sub(r'[做一个张搞个]|风格|海报|帮我|请|一下|啦|吧', '', desc).strip()
        if len(clean) > 30:
            title = clean[:20].strip("，,。. ")
        else:
            title = clean.strip("，,。. ")

    content = desc
    return title, subtitle, content


@router.post("/ai-generate", response_model=PosterGenerateResponse)
async def ai_generate(req: AiGenerateRequest, db: AsyncSession = Depends(get_db)):
    """AI Mode: natural language description → auto poster generation."""
    description = req.description
    user_id = req.user_id

    if not description or not user_id:
        raise HTTPException(status_code=400, detail="description and user_id required")

    # Pure keyword parsing — no API, always works
    title, subtitle, content = _parse_description(description)

    # Pick style based on keywords
    result = await db.execute(select(Style).order_by(Style.created_at))
    styles_all = result.scalars().all()
    if not styles_all:
        raise HTTPException(status_code=500, detail="No styles available")

    # Default to first style, override by keyword
    style_idx = 0
    dl = description.lower()
    if any(w in dl for w in ["cyber", "neon", "tech", "科技", "赛博", "霓虹"]):
        style_idx = 1
    elif any(w in dl for w in ["minimal", "clean", "极简", "简洁", "现代"]):
        style_idx = 2
    elif any(w in dl for w in ["info", "twitter", "数据", "信息图"]):
        style_idx = 3

    style_id = str(styles_all[min(style_idx, len(styles_all) - 1)].id)

    # Fallback: use first style if no match
    if not style_id:
        result = await db.execute(select(Style).limit(1))
        s = result.scalar_one_or_none()
        if s:
            style_id = str(s.id)

    # Verify user
    user = await db.execute(select(User).where(User.id == str(user_id)))
    if not user.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")

    poster = UserPoster(
        user_id=user_id,
        style_id=style_id,
        title=title,
        subtitle=subtitle,
        content=content,
        status=PosterStatus.pending,
    )
    db.add(poster)
    await db.commit()
    await db.refresh(poster)

    # Dispatch generation
    gen_req = PosterGenerateRequest(
        user_id=uuid.UUID(user_id),
        style_id=uuid.UUID(style_id) if style_id else uuid.uuid4(),
        title=title,
        subtitle=subtitle,
        content=content,
        width=1242,
        height=1660,
    )
    _dispatch_generation(str(poster.id), gen_req)

    return PosterGenerateResponse(task_id=str(poster.id), status="pending")


@router.get("/status/{task_id}", response_model=PosterStatusResponse)
async def get_poster_status(task_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserPoster).where(UserPoster.id == str(task_id)))
    poster = result.scalar_one_or_none()
    if not poster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    progress_map = {
        PosterStatus.pending: 5,
        PosterStatus.generating: 30,
        PosterStatus.rendering: 70,
        PosterStatus.uploading: 90,
        PosterStatus.completed: 100,
        PosterStatus.failed: 0,
    }

    return PosterStatusResponse(
        status=poster.status.value,
        image_url=poster.image_url,
        progress=progress_map.get(poster.status, 0),
    )


@router.get("/history", response_model=list[PosterHistoryItem])
async def get_history(user_id: uuid.UUID = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserPoster)
        .where(UserPoster.user_id == str(user_id))
        .order_by(UserPoster.created_at.desc())
    )
    posters = result.scalars().all()

    items = []
    for p in posters:
        style_name = ""
        if p.style_id:
            s = await db.execute(select(Style).where(Style.id == p.style_id))
            style = s.scalar_one_or_none()
            if style:
                style_name = style.name
        items.append(
            PosterHistoryItem(
                id=p.id,
                title=p.title,
                image_url=p.image_url,
                style_name=style_name,
                status=p.status.value,
                created_at=p.created_at,
            )
        )
    return items
