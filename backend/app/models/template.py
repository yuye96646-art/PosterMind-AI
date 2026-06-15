import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from app.database import Base


class PosterTemplate(Base):
    __tablename__ = "poster_templates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    style_id = Column(String(36), ForeignKey("styles.id"), nullable=False, index=True)
    template_name = Column(String(100), nullable=False)
    layout_json = Column(JSON, default=list, nullable=False)
    locked_elements = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    style = relationship("Style", back_populates="templates")
    posters = relationship("UserPoster", back_populates="template")
