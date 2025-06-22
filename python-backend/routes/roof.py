from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class RoofReport(BaseModel):
    status: str
    lastInspection: datetime
    damageScore: float


async def _build_report() -> RoofReport:
    """Create a sample roof report."""
    return RoofReport(
        status="ok",
        lastInspection=datetime(2024, 1, 1),
        damageScore=0.0,
    )


@router.get("/api/roof/report", response_model=RoofReport)
async def roof_report():
    """Return a sample roof report."""
    try:
        return await _build_report()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate roof report")
