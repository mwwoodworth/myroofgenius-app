Build errors have been resolved. The following issues were fixed:

- app/api/webhook/route.ts: removed trailing spaces and replaced `any` casts.
- app/success/page.tsx: removed unused parameters and whitespace.
- components/Dashboard3D.tsx and EstimatorAR.tsx: replaced `@ts-ignore` with `@ts-expect-error`.
- components/ui/Button.tsx and Card.tsx: typed generic props instead of `any`.
- components/CopilotPanel.tsx: cleaned up `any` usages.

`npm run build` and `npm run lint` now pass.
