# Codex Dev Agent – MyRoofGenius‑app

## 1. Required GitHub Secrets
| Secret | Purpose |
|--------|---------|
| CODEX_API_KEY | Auth key for Codex code generation |
| OPENAI_API_KEY | Backup / extended model access |

Add them in **Settings → Secrets and variables → Actions**.

## 2. Workflow Permissions
Default GitHub token requires:
- `contents: write`
- `pull-requests: write`
- `statuses: write`

## 3. Branch Protection Rules
- Protect `main`
- Require status check: `codex`
- Require **1** approving review
- Optional: signed commits, linear history

## 4. Local Bootstrap
```bash
npm i -g @openai/codex-cli
codex generate
```

> **Note**
> The helper script `scripts/bootstrap_codex.sh` used for Codex CLI setup is
> obsolete and now performs no actions. It remains for reference only. Run
> `codex generate` directly instead.

## 5. Cross‑Repo Dependency
Relies on **brainops‑langgraph‑orchestrator** API; deploy orchestrator first.
