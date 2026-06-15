import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    from app.models.user import User
    from app.models.style import Style
    from app.models.template import PosterTemplate
    from app.models.poster import UserPoster
    from app.models.element import Element
    from app.models.membership import Membership

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        result = await session.execute(text("SELECT COUNT(*) FROM styles"))
        count = result.scalar()
        if count == 0:
            await _seed_data(session)
            await session.commit()

        # Create default admin account if no users exist
        user_result = await session.execute(text("SELECT COUNT(*) FROM users"))
        user_count = user_result.scalar()
        if user_count == 0:
            await _seed_user(session)
            await session.commit()


async def _seed_data(session: AsyncSession):
    now = datetime.now(timezone.utc)

    style1_id = str(uuid.uuid4())
    style2_id = str(uuid.uuid4())
    style3_id = str(uuid.uuid4())
    style4_id = str(uuid.uuid4())

    from app.models.style import Style, SpacingLevel

    styles = [
        Style(
            id=style1_id,
            name="小红书爆款风格",
            description=" vibrant and trendy social media marketing poster in the Xiaohongshu style, warm coral pink and orange gradients, soft rounded decorative elements, clean structured layout, energetic and youthful, Chinese modern aesthetic, high contrast",
            font_family="NotoSansSC-Bold",
            primary_color="#ff6b6b",
            secondary_color="#ffa500",
            spacing=SpacingLevel.medium,
            allowed_elements=["circle", "gradient", "icon"],
            prompt_template="A vibrant and trendy social media marketing poster in the Xiaohongshu style, featuring title '{title}' and subtitle '{subtitle}'. The design uses warm coral pink and orange gradients, soft rounded decorative elements, and a clean structured layout. The mood is energetic and youthful. Chinese modern aesthetic, high contrast, 小红书 style, {width}x{height}.",
            created_at=now,
            updated_at=now,
        ),
        Style(
            id=style2_id,
            name="赛博朋克潮流",
            description="cyberpunk style poster with neon cyan and magenta accents, geometric wireframe elements, holographic overlays, glitch effects, dense futuristic city atmosphere, high contrast, dark mode, synthwave aesthetic",
            font_family="Orbitron",
            primary_color="#00ffff",
            secondary_color="#ff00ff",
            spacing=SpacingLevel.small,
            allowed_elements=["line", "square", "gradient"],
            prompt_template="A cyberpunk style poster design with title '{title}' and subtitle '{subtitle}'. Dark background with neon cyan and magenta accents, geometric wireframe elements, holographic overlays, glitch effects. Dense futuristic city atmosphere. High contrast, dark mode, synthwave aesthetic, {width}x{height}.",
            created_at=now,
            updated_at=now,
        ),
        Style(
            id=style3_id,
            name="极简现代主义",
            description="minimalist modern poster design with clean white and off-white background, generous whitespace, subtle geometric accents, Swiss design influence, elegant and professional, high-end corporate aesthetic",
            font_family="Inter",
            primary_color="#1a1a1a",
            secondary_color="#f5f5f5",
            spacing=SpacingLevel.large,
            allowed_elements=["line", "square"],
            prompt_template="A minimalist modern poster design for '{title}' with subtitle '{subtitle}'. Clean white and off-white background, generous whitespace, subtle geometric accents, Swiss design influence. Elegant and professional. High-end corporate aesthetic, {width}x{height}.",
            created_at=now,
            updated_at=now,
        ),
        Style(
            id=style4_id,
            name="X/Twitter 信息图",
            description="infographic-style social media poster with Twitter/X brand aesthetic with blue accents, clean data visualization elements, modular card layout, modern social media design, high information density, professional",
            font_family="Inter",
            primary_color="#1da1f2",
            secondary_color="#14171a",
            spacing=SpacingLevel.medium,
            allowed_elements=["line", "square", "icon", "gradient"],
            prompt_template="An infographic-style social media poster for '{title}' with subtitle '{subtitle}'. Twitter/X brand aesthetic with blue accents, clean data visualization elements, modular card layout. Modern social media design, high information density, professional, {width}x{height}.",
            created_at=now,
            updated_at=now,
        ),
    ]
    session.add_all(styles)

    from app.models.template import PosterTemplate

    layout_default = [
        {"element": "title", "x": 60, "y": 80, "width": 960, "font_size": 72, "color": "#ffffff", "align": "left"},
        {"element": "subtitle", "x": 60, "y": 180, "width": 960, "font_size": 36, "color": "rgba(255,255,255,0.8)", "align": "left"},
        {"element": "content", "x": 60, "y": 800, "width": 960, "font_size": 28, "color": "rgba(255,255,255,0.7)", "align": "left"},
    ]
    locked_default = [
        {"type": "circle", "x": 100, "y": 400, "radius": 40, "color": "rgba(255,255,255,0.15)"},
        {"type": "line", "x": 60, "y": 750, "width": 960, "height": 2, "color": "rgba(255,255,255,0.2)"},
    ]

    templates = [
        PosterTemplate(
            id=str(uuid.uuid4()), style_id=style1_id, template_name="小红书标准",
            layout_json=[
                {"element": "title", "x": 80, "y": 120, "width": 1080, "font_size": 80, "color": "#ffffff", "align": "center"},
                {"element": "subtitle", "x": 80, "y": 230, "width": 1080, "font_size": 40, "color": "rgba(255,255,255,0.85)", "align": "center"},
                {"element": "content", "x": 80, "y": 1050, "width": 1080, "font_size": 32, "color": "rgba(255,255,255,0.75)", "align": "left"},
            ],
            locked_elements=[
                {"type": "circle", "x": 150, "y": 500, "radius": 60, "color": "rgba(255,107,107,0.2)"},
                {"type": "gradient", "x": 0, "y": 1400, "width": 1242, "height": 260, "colors": ["rgba(255,107,107,0)", "rgba(255,107,107,0.3)"]},
            ],
            created_at=now, updated_at=now,
        ),
        PosterTemplate(
            id=str(uuid.uuid4()), style_id=style2_id, template_name="赛博朋克标准",
            layout_json=[
                {"element": "title", "x": 60, "y": 100, "width": 900, "font_size": 68, "color": "#00ffff", "align": "left"},
                {"element": "subtitle", "x": 60, "y": 200, "width": 900, "font_size": 34, "color": "rgba(255,0,255,0.9)", "align": "left"},
                {"element": "content", "x": 60, "y": 850, "width": 900, "font_size": 26, "color": "rgba(0,255,255,0.7)", "align": "left"},
            ],
            locked_elements=[
                {"type": "line", "x": 60, "y": 160, "width": 200, "height": 3, "color": "#ff00ff"},
                {"type": "square", "x": 520, "y": 400, "width": 120, "height": 120, "color": "rgba(0,255,255,0.08)", "rotation": 45},
            ],
            created_at=now, updated_at=now,
        ),
        PosterTemplate(
            id=str(uuid.uuid4()), style_id=style3_id, template_name="极简现代标准",
            layout_json=[
                {"element": "title", "x": 120, "y": 200, "width": 2240, "font_size": 96, "color": "#1a1a1a", "align": "left"},
                {"element": "subtitle", "x": 120, "y": 340, "width": 2240, "font_size": 40, "color": "rgba(26,26,26,0.7)", "align": "left"},
                {"element": "content", "x": 120, "y": 2800, "width": 2240, "font_size": 36, "color": "rgba(26,26,26,0.6)", "align": "left"},
            ],
            locked_elements=[
                {"type": "line", "x": 120, "y": 440, "width": 120, "height": 4, "color": "#1a1a1a"},
            ],
            created_at=now, updated_at=now,
        ),
        PosterTemplate(
            id=str(uuid.uuid4()), style_id=style4_id, template_name="X信息图标准",
            layout_json=[
                {"element": "title", "x": 80, "y": 60, "width": 1440, "font_size": 64, "color": "#ffffff", "align": "left"},
                {"element": "subtitle", "x": 80, "y": 150, "width": 1440, "font_size": 32, "color": "rgba(29,161,242,0.9)", "align": "left"},
                {"element": "content", "x": 80, "y": 600, "width": 1440, "font_size": 28, "color": "rgba(255,255,255,0.8)", "align": "left"},
            ],
            locked_elements=[
                {"type": "line", "x": 80, "y": 560, "width": 1440, "height": 2, "color": "rgba(29,161,242,0.4)"},
                {"type": "icon", "x": 40, "y": 820, "width": 24, "height": 24, "icon_type": "heart", "color": "#1da1f2"},
            ],
            created_at=now, updated_at=now,
        ),
    ]
    session.add_all(templates)

    from app.models.element import Element, ElementType

    elements = [
        Element(id=str(uuid.uuid4()), name="装饰圆", type=ElementType.circle, style_id=style1_id, properties={"radius": 50, "color": "rgba(255,107,107,0.15)", "position": {"x": 200, "y": 600}}, created_at=now, updated_at=now),
        Element(id=str(uuid.uuid4()), name="霓虹线", type=ElementType.line, style_id=style2_id, properties={"width": 300, "height": 2, "color": "#00ffff", "position": {"x": 60, "y": 300}}, created_at=now, updated_at=now),
        Element(id=str(uuid.uuid4()), name="分隔线", type=ElementType.line, style_id=style3_id, properties={"width": 100, "height": 3, "color": "#1a1a1a", "position": {"x": 120, "y": 500}}, created_at=now, updated_at=now),
        Element(id=str(uuid.uuid4()), name="蓝色区块", type=ElementType.square, style_id=style4_id, properties={"width": 60, "height": 60, "color": "rgba(29,161,242,0.15)", "position": {"x": 1400, "y": 80}}, created_at=now, updated_at=now),
    ]
    session.add_all(elements)


async def _seed_user(session: AsyncSession):
    from app.models.user import User, MembershipLevel, UserRole
    from app.models.membership import Membership
    from app.auth import hash_password

    now = datetime.now(timezone.utc)
    user = User(
        username="admin",
        email="admin@postermind.ai",
        password_hash=hash_password("admin123"),
        role=UserRole.admin,
        membership_level=MembershipLevel.premium,
        created_at=now,
        updated_at=now,
    )
    session.add(user)
    await session.flush()

    membership = Membership(
        user_id=user.id,
        level=MembershipLevel.premium,
        created_at=now,
        updated_at=now,
    )
    session.add(membership)
