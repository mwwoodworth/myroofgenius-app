# Feature: Roof Report API Endpoint

## Goal
Expose `/api/roof/report` returning JSON metrics.

## Acceptance Criteria
- FastAPI route in `api/routes/roof.py`
- Response model: `RoofReport` (status, lastInspection, damageScore)
- 200 OK with sample payload
- PyTest covering happy‑path & 500 error
