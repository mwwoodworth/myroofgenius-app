Build failed due to ESLint errors:

- app/api/webhook/route.ts: trailing spaces and unexpected `any` usage
- app/success/page.tsx: unused `searchParams` parameter and trailing spaces
- components/Dashboard3D.tsx and EstimatorAR.tsx: requires `@ts-expect-error` instead of `@ts-ignore`
- components/ui/Button.tsx and Card.tsx: unexpected `any` types
- components/CopilotPanel.tsx: multiple `any` usages

See /tmp/build.log for full output.
