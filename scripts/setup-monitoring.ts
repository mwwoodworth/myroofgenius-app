// Basic monitoring setup script
// Configure Sentry and custom metrics

import * as Sentry from '@sentry/nextjs'

export async function setupMonitoring() {
  Sentry.init({ dsn: process.env.SENTRY_DSN || '' })
  // Custom metrics would be sent to chosen analytics provider
  console.log('Monitoring configured')
}

if (require.main === module) {
  setupMonitoring()
}
