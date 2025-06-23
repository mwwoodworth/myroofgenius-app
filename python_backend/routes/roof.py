from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .. import main

router = APIRouter()


class RoofReport(BaseModel):
    status: str
    lastInspection: datetime
    damageScore: float


async def _build_report() -> RoofReport:
    """Fetch the latest roof report from Supabase."""
    resp = (
        main.supabase_client.table("roof_reports")
        .select("*")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not resp.data:
        raise ValueError("No roof report data")
    row = resp.data[0]
    last_inspection = row.get("last_inspection") or row.get("created_at")
    try:
        last_dt = datetime.fromisoformat(str(last_inspection))
    except Exception:
        last_dt = datetime.fromtimestamp(0)
    return RoofReport(
        status=row.get("status", "unknown"),
        lastInspection=last_dt,
        damageScore=row.get("damage_score", 0.0),
    )


@router.get("/api/roof/report", response_model=RoofReport)
async def roof_report():
    """Return the latest roof report."""
    try:
        return await _build_report()
    except Exception as e:
        main.logger.error("roof_report failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch roof report")
