# Feature: Interactive Roof Report UI

## Goal
Add a dashboard card that displays real‑time roof condition metrics.

## Acceptance Criteria
- React component under `src/components/RoofReportCard.tsx`
- Uses Tailwind classes for styling
- Fetches data from `/api/roof/report` every 30 s
- Shows loading spinner while fetching
- Unit tests in `src/components/__tests__/RoofReportCard.test.tsx`
