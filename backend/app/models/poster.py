import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class PosterStatus(str, enum.Enum):
    pending = "pending"
    generating = "generating"
    rendering = "rendering"
    uploading = "uploading"
    completed = "completed"
    failed = "failed"


class UserPoster(Base):
    __tablename__ = "user_posters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    template_id = Column(String(36), ForeignKey("poster_templates.id"), nullable=True)
    style_id = Column(String(36), ForeignKey("styles.id"), nullable=False)
    title = Column(String(200), nullable=True)
    subtitle = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    status = Column(Enum(PosterStatus), default=PosterStatus.pending, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="posters")
    template = relationship("PosterTemplate", back_populates="posters")
    style = relationship("Style", back_populates="posters")
