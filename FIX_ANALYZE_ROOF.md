=== Analyzing roof route error ===
17:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
Failed to compile.

./app/api/ai/analyze-roof/route.ts:58:5
Type error: Type 'unknown' is not assignable to type 'AnalysisResult'.

[0m [90m 56 |[39m     [36mif[39m ([33m![39mmatch) [36mthrow[39m [36mnew[39m [33mError[39m([32m'no json'[39m)[33m;[39m[0m
[0m [90m 57 |[39m     [36mconst[39m json [33m=[39m [33mJSON[39m[33m.[39mparse(match[[35m0[39m])[33m;[39m[0m
[0m[31m[1m>[22m[39m[90m 58 |[39m     [36mreturn[39m json[33m;[39m[0m
