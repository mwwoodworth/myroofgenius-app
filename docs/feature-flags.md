# Feature Flags & Maintenance

Toggles are managed with environment variables. Set them in `.env` or the host deployment settings.

| Variable | Description |
| --- | --- |
| `MAINTENANCE_MODE` / `NEXT_PUBLIC_MAINTENANCE_MODE` | When `true`, the app returns a maintenance message. |
| `AI_COPILOT_ENABLED` / `NEXT_PUBLIC_AI_COPILOT_ENABLED` | Enable the AI Copilot widget. |
| `ESTIMATOR_ENABLED` / `NEXT_PUBLIC_ESTIMATOR_ENABLED` | Enable the roof estimator page. |
| `AR_MODE_ENABLED` / `NEXT_PUBLIC_AR_MODE_ENABLED` | Allow AR features. |
| `SALES_ENABLED` / `NEXT_PUBLIC_SALES_ENABLED` | Expose the marketplace and product pages. |

Update `.env` and redeploy to toggle features or enter maintenance mode.

Feature flags can be toggled in the Admin Settings page (/admin/settings) and persist in localStorage.
