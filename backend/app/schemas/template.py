import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TemplateResponse(BaseModel):
    id: uuid.UUID
    style_id: uuid.UUID
    template_name: str
    layout_json: list
    locked_elements: list
    created_at: datetime

    model_config = {"from_attributes": True}
