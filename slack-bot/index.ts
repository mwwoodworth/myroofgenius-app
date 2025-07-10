import { App, ExpressReceiver } from '@slack/bolt';
import fetch from 'node-fetch';

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

const channels = {
  alerts: process.env.SLACK_CHANNEL_ALERTS ?? '',
  aiCopilot: process.env.SLACK_CHANNEL_AI_COPILOT ?? '',
  devFeed: process.env.SLACK_CHANNEL_DEV_FEED ?? '',
  opsFeed: process.env.SLACK_CHANNEL_OPS_FEED ?? '',
  salesEvents: process.env.SLACK_CHANNEL_SALES_EVENTS ?? '',
  clickupFeed: process.env.SLACK_CHANNEL_CLICKUP_FEED ?? '',
};

app.command('/vercel', async ({ command, ack, respond }) => {
  await ack();
  const [action] = command.text.trim().split(/\s+/);
  switch (action) {
    case 'ai-log':
      await respond('Fetching latest build logs...');
      // TODO: query Vercel logs and summarize with AI
      break;
    case 'changelog':
      await respond('Generating changelog...');
      // TODO: generate changelog with AI
      break;
    case 'help':
    default:
      await respond('Usage: /vercel [ai-log|changelog|help]');
  }
});

receiver.router.post('/vercel/webhook', async (req, res) => {
  const payload = req.body as any;
  if (payload?.type === 'deployment-error') {
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN ?? '',
      channel: channels.alerts,
      text: 'Build failed. AI summary pending.',
    });
  }
  res.status(200).end();
});

(async () => {
  const port = Number(process.env.PORT || 3001);
  await app.start(port);
  console.log(`Slack bot running on port ${port}`);
})();
