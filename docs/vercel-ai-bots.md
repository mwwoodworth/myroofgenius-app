# Vercel AI Bots Deployment

This guide outlines how to set up and deploy the Vercel AI templates and connect them to Slack via Make.com.

## Setup Scripts

Run `scripts/setup-vercel-ai-bots.sh` to clone the latest templates and install dependencies. Set `TEMPLATE_DIR` to control where repos are cloned.

```bash
TEMPLATE_DIR=ai-bots ./scripts/setup-vercel-ai-bots.sh
```

Use `VERCEL_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET` and the various channel environment variables in `.env.local` for each template.

## Make.com Scenarios

1. **Deploy Failure**
   - Triggered by Vercel webhook on `deployment-error`.
   - Call AI summarizer (OpenAI/Claude) on the log text.
   - Post summary to Slack `SLACK_CHANNEL_ALERTS` and create a ClickUp task.
2. **Pull Request Merge**
   - When a PR is merged, generate changelog from commits.
   - Post deploy link and notes to `SLACK_CHANNEL_DEV_FEED`.
3. **Production Deploy**
   - On successful production deploy, post metrics and summary to `SLACK_CHANNEL_OPS_FEED`.

These scenarios can be exported from Make.com as JSON blueprints. Use variables for Slack channels and tokens so the same blueprint works across repos.

## Scaling

Adding a new Vercel AI template only requires appending its repo name to `repos` in `setup-vercel-ai-bots.sh`. The Slack bot picks up channel configuration from environment variables, so the same deployment process works for future templates.
