import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PosterGenerateRequest(BaseModel):
    user_id: uuid.UUID
    style_id: uuid.UUID
    template_id: Optional[uuid.UUID] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    width: int = 1242
    height: int = 1660
    advanced_prompt: Optional[str] = None
    primary_color_override: Optional[str] = None


class PosterGenerateResponse(BaseModel):
    task_id: str
    status: str = "pending"


class PosterStatusResponse(BaseModel):
    status: str
    image_url: Optional[str] = None
    progress: int = 0


class PosterHistoryItem(BaseModel):
    id: uuid.UUID
    title: Optional[str] = None
    image_url: Optional[str] = None
    style_name: str = ""
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
