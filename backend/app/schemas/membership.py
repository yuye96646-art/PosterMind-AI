import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MembershipResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    level: str
    expire_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MembershipUpgradeRequest(BaseModel):
    user_id: uuid.UUID
    level: str


class SuccessResponse(BaseModel):
    success: bool
