#!/bin/bash

echo "📦 Structuring BrainStack backend..."

mkdir -p agents routes memory tasks integrations schemas tests langgraph docker db prompt_templates

# --- Move & Rename Agent Files ---
mv backend_agents_base.py agents/base.py
mv backend_agents_claude.py agents/claude.py
mv backend_agents_codex.py agents/codex.py
mv backend_agents_gemini.py agents/gemini.py
mv backend_agents_langgraph.yml langgraph/agents.yml

# --- Routes ---
mv backend_routes_auth.py routes/auth.py
mv backend_routes_tasks.py routes/tasks.py
mv backend_routes_webhooks.py routes/webhooks.py
mv backend_routes_agents.py routes/agents.py
mv backend_routes_memory.py routes/memory.py

# --- Memory ---
mv backend_memory_*.py memory/
mv memory-knowledge.py memory/knowledge.py
mv memory-models.py memory/models.py

# --- Tasks ---
mv backend_tasks_autopublish.py tasks/autopublish.py
mv backend_tasks_generate_product_docs.py tasks/generate_product_docs.py
mv backend_tasks_generate_roof_estimate.py tasks/generate_roof_estimate.py
mv backend_tasks_init.py tasks/init.py
mv task-autopublish-content.py tasks/autopublish_content.py
mv task-customer-onboarding.py tasks/customer_onboarding.py
mv task-generate-weekly-report.py tasks/weekly_report.py
mv task-generate-roof-estimate.py tasks/roof_estimate.py
mv task-generate-product-docs.py tasks/product_docs.py
mv task-sync-database.py tasks/sync_database.py

# --- Integrations ---
mv backend_integrations_clickup.py integrations/clickup.py
mv backend_integrations_notion.py integrations/notion.py
mv backend_integrations_slack.py integrations/slack.py
mv slack-integration.py integrations/slack_extra.py
mv stripe-integration.py integrations/stripe.py
mv make-integration.py integrations/make.py
mv notion-integration.py integrations/notion_extra.py

# --- Prompt Templates ---
mv prompt-template-claude-sop.txt prompt_templates/claude-sop.txt
mv prompt-template-codex-code-gen.txt prompt_templates/codex-code-gen.txt
mv prompt-template-gemini-seo.txt prompt_templates/gemini-seo.txt
mv prompt-template-research.txt prompt_templates/research.txt

# --- Tests ---
mv test-agents.py tests/agents.py
mv test-integrations.py tests/integrations.py
mv test-memory-system.py tests/memory.py
mv test-tasks.py tests/tasks.py
mv test-tasks-execution.py tests/execution.py

# --- DB & Migration ---
mv db-models.py db/models.py
mv db-schema.sql db/schema.sql
mv db-schema-sql.sql db/schema_postgres.sql
mv migration-*.py db/

# --- Main App + Config ---
mv backend_main.py main.py
mv backend-main.py main_alt.py
mv backend-dockerfile.txt docker/Dockerfile
mv backend-requirements.txt requirements.txt

# --- LangGraph Setup ---
mv langgraph.yaml.txt langgraph/definition.txt

# --- Meta ---
touch REPO_ORGANIZED_BY_BRAINOPS.log
echo "Organized on $(date)" >> REPO_ORGANIZED_BY_BRAINOPS.log
echo "Moved and renamed all backend source files to match modular architecture." >> REPO_ORGANIZED_BY_BRAINOPS.log

echo "✅ Done. Your backend is now structured and clean."