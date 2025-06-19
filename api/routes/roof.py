from fastapi import APIRouter

router = APIRouter(prefix="/api/roof")

@router.get("/report")
async def get_roof_report():
    """Return a sample roof report."""
    return {"report": "sample"}
