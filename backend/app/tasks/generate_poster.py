import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.models.poster import PosterStatus, UserPoster
from app.models.style import Style
from app.models.template import PosterTemplate
from app.models.user import User
from app.models.membership import Membership
from app.models.element import Element
from app.services.image_generator import generate_background
from app.services.poster_renderer import render_poster
from app.services.prompt_builder import build_prompt
from app.services.storage import upload_poster

logger = logging.getLogger(__name__)

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def _update_status(poster_id: str, status: PosterStatus, image_url: str | None = None):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserPoster).where(UserPoster.id == poster_id))
        poster = result.scalar_one_or_none()
        if poster:
            poster.status = status
            if image_url:
                poster.image_url = image_url
            poster.updated_at = datetime.now(timezone.utc)
            await session.commit()


async def _get_style(style_id: str) -> dict | None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Style).where(Style.id == style_id))
        style = result.scalar_one_or_none()
        if style:
            return {
                "id": str(style.id),
                "name": style.name,
                "font_family": style.font_family,
                "primary_color": style.primary_color,
                "secondary_color": style.secondary_color,
                "spacing": style.spacing.value if style.spacing else "medium",
                "allowed_elements": style.allowed_elements,
                "prompt_template": style.prompt_template,
            }
    return None


async def _get_template(template_id: str) -> dict | None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(PosterTemplate).where(PosterTemplate.id == template_id))
        template = result.scalar_one_or_none()
        if template:
            return {
                "id": str(template.id),
                "layout_json": template.layout_json,
                "locked_elements": template.locked_elements,
            }
    return None


async def run_generate_poster(
    poster_id: str,
    title: str = "",
    subtitle: str = "",
    content: str = "",
    style_id: str = "",
    template_id: str = "",
    width: int = 1242,
    height: int = 1660,
    advanced_prompt: str = "",
    primary_color_override: str = "",
) -> dict:
    """
    8-step AI Poster Generation Workflow (async, callable directly or via Celery).
    """
    try:
        # Step 1: Parse payload
        logger.info(f"[Step 1/7] Parsing payload for poster {poster_id}")
        await _update_status(poster_id, PosterStatus.generating)

        style_data = await _get_style(style_id)
        if not style_data:
            raise ValueError(f"Style {style_id} not found")

        template_data = None
        if template_id:
            template_data = await _get_template(template_id)

        layout = template_data["layout_json"] if template_data else [
            {"element": "title", "x": 60, "y": 80, "width": 960, "font_size": 72, "color": "#ffffff", "align": "left"},
            {"element": "subtitle", "x": 60, "y": 180, "width": 960, "font_size": 36, "color": "rgba(255,255,255,0.8)", "align": "left"},
            {"element": "content", "x": 60, "y": 800, "width": 960, "font_size": 28, "color": "rgba(255,255,255,0.7)", "align": "left"},
        ]
        locked = template_data["locked_elements"] if template_data else []

        # Step 2: Build AI prompt via GPT-4o
        logger.info(f"[Step 2/7] Building AI prompt with GPT-4o for poster {poster_id}")
        bg_prompt = build_prompt(
            style_prompt_template=style_data["prompt_template"],
            title=title,
            subtitle=subtitle,
            content=content,
            advanced_prompt=advanced_prompt,
            width=width,
            height=height,
        )

        # Step 3: Generate background image
        logger.info(f"[Step 3/7] Generating background image for poster {poster_id}")
        background_bytes = generate_background(prompt=bg_prompt, width=width, height=height)

        await _update_status(poster_id, PosterStatus.rendering)

        # Step 4+5: Render text onto background
        logger.info(f"[Step 4+5/7] Rendering text onto background for poster {poster_id}")
        primary_color = primary_color_override or style_data["primary_color"]
        rendered_bytes = render_poster(
            background_bytes=background_bytes,
            layout_json=layout,
            locked_elements=locked,
            texts={"title": title, "subtitle": subtitle, "content": content},
            font_family=style_data["font_family"],
            primary_color=primary_color,
            secondary_color=style_data["secondary_color"],
        )

        await _update_status(poster_id, PosterStatus.uploading)

        # Step 6: Store poster
        logger.info(f"[Step 6/7] Uploading poster for poster {poster_id}")
        filename = f"poster_{poster_id}_{uuid.uuid4().hex[:8]}.png"
        image_url = upload_poster(rendered_bytes, filename)

        # Step 7: Mark completed
        logger.info(f"[Step 7/7] Poster {poster_id} completed → {image_url}")
        await _update_status(poster_id, PosterStatus.completed, image_url)

        return {"status": "completed", "image_url": image_url}

    except Exception as exc:
        logger.error(f"Poster generation failed for {poster_id}: {exc}")
        await _update_status(poster_id, PosterStatus.failed)
        raise


# Celery task wrapper (only used when REDIS_URL is configured)
if settings.REDIS_URL:
    from app.tasks.celery_app import celery_app
    from celery.utils.log import get_task_logger as _celery_logger

    celery_logger = _celery_logger(__name__)

    @celery_app.task(bind=True, name="generate_poster", max_retries=2)
    def generate_poster(
        self,
        poster_id: str,
        title: str = "",
        subtitle: str = "",
        content: str = "",
        style_id: str = "",
        template_id: str = "",
        width: int = 1242,
        height: int = 1660,
        advanced_prompt: str = "",
        primary_color_override: str = "",
    ):
        import asyncio

        async def _run():
            return await run_generate_poster(
                poster_id=poster_id,
                title=title,
                subtitle=subtitle,
                content=content,
                style_id=style_id,
                template_id=template_id,
                width=width,
                height=height,
                advanced_prompt=advanced_prompt,
                primary_color_override=primary_color_override,
            )

        try:
            loop = asyncio.new_event_loop()
            try:
                return loop.run_until_complete(_run())
            finally:
                loop.close()
        except Exception as exc:
            celery_logger.error(f"Poster generation failed for {poster_id}: {exc}")
            raise self.retry(exc=exc, countdown=10)
