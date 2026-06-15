import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ElementCreateRequest(BaseModel):
    name: str
    type: str
    style_id: uuid.UUID
    properties: dict = {}


class ElementResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    style_id: uuid.UUID
    properties: dict
    created_at: datetime

    model_config = {"from_attributes": True}
