=== ESLint Error Analysis ===
npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> myroofgenius-app@1.0.0 lint
> next lint

Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry


./app/api/webhook/route.ts
6:27  Warning: Forbidden non-null assertion.  @typescript-eslint/no-non-null-assertion
10:24  Warning: Forbidden non-null assertion.  @typescript-eslint/no-non-null-assertion
14:3  Warning: Forbidden non-null assertion.  @typescript-eslint/no-non-null-assertion
15:3  Warning: Forbidden non-null assertion.  @typescript-eslint/no-non-null-assertion
20:15  Warning: Forbidden non-null assertion.  @typescript-eslint/no-non-null-assertion
26:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
37:1  Error: Trailing spaces not allowed.  no-trailing-spaces
42:18  Error: Trailing spaces not allowed.  no-trailing-spaces
74:7  Warning: Unexpected console statement.  no-console
75:1  Error: Trailing spaces not allowed.  no-trailing-spaces

./app/success/page.tsx
4:3  Error: 'searchParams' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
24:1  Error: Trailing spaces not allowed.  no-trailing-spaces

./components/CopilotPanel.tsx
12:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
16:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
17:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
107:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
108:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
113:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
145:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/Dashboard3D.tsx
14:14  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment

./components/EstimatorAR.tsx
14:14  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment

./components/ui/Button.tsx
28:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/ui/Card.tsx
17:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
