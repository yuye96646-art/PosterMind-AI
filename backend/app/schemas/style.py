import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class StyleResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    font_family: str
    primary_color: str
    secondary_color: str
    spacing: str
    allowed_elements: list
    prompt_template: str
    created_at: datetime

    model_config = {"from_attributes": True}
