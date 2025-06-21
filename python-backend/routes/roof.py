from fastapi import APIRouter

router = APIRouter()

@router.get("/api/roof/report")
async def roof_report():
    """Return a placeholder roof report."""
    return {"report": "All clear"}
