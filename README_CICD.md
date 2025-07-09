# BrainOps CI/CD (Phase 1)

This folder documents the continuous-integration and continuous-deployment
pipelines introduced in **Phase 1** of the BrainOps roadmap.

## Quick Start

```bash
# local test
docker compose -f render.yaml # spins both services

# run linters + tests
poetry run ruff .
poetry run pytest -q
npm run lint && npm run test:ci
Pipeline Highlights
Matrix builds for Python 3.11 and Node 20.

Security audits: pip-audit and npm audit.

Preview Environments: every PR spawns an isolated URL on Render.

Slack notifications wired via SLACK_WEBHOOK.

Manual promotion: merging to main triggers tagged image build & deploy.

Questions? Ping assistant.communication.mww@gmail.com.

