import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from app.database import Base


class ElementType(str, enum.Enum):
    circle = "circle"
    square = "square"
    line = "line"
    gradient = "gradient"
    icon = "icon"


class Element(Base):
    __tablename__ = "elements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False)
    type = Column(Enum(ElementType), nullable=False)
    style_id = Column(String(36), ForeignKey("styles.id"), nullable=False)
    properties = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    style = relationship("Style", back_populates="elements")
