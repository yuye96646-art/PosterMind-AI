import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from app.database import Base


class SpacingLevel(str, enum.Enum):
    small = "small"
    medium = "medium"
    large = "large"


class Style(Base):
    __tablename__ = "styles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    font_family = Column(String(50), nullable=False)
    primary_color = Column(String(7), nullable=False)
    secondary_color = Column(String(7), nullable=False)
    spacing = Column(Enum(SpacingLevel), default=SpacingLevel.medium, nullable=False)
    allowed_elements = Column(JSON, default=list, nullable=False)
    prompt_template = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    templates = relationship("PosterTemplate", back_populates="style")
    posters = relationship("UserPoster", back_populates="style")
    elements = relationship("Element", back_populates="style")
