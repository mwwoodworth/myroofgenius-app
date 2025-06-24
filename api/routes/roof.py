from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/roof", tags=["roof"])

class RoofReport(BaseModel):
    roof_id: int
    summary: str

@router.get("/report", response_model=RoofReport)
async def get_roof_report() -> RoofReport:
    """Return a sample roof report."""
    return RoofReport(roof_id=1, summary="Sample roof report")
