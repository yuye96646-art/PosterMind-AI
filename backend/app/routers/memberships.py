import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.membership import Membership
from app.schemas.membership import MembershipResponse, MembershipUpgradeRequest, SuccessResponse

router = APIRouter(prefix="/api/memberships", tags=["memberships"])


@router.get("", response_model=MembershipResponse)
async def get_membership(user_id: uuid.UUID = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Membership).where(Membership.user_id == str(user_id)))
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found")
    return MembershipResponse.model_validate(membership)


@router.post("/upgrade", response_model=SuccessResponse)
async def upgrade_membership(req: MembershipUpgradeRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Membership).where(Membership.user_id == str(req.user_id)))
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found")

    from app.models.user import MembershipLevel

    membership.level = MembershipLevel(req.level)
    await db.commit()
    return SuccessResponse(success=True)
