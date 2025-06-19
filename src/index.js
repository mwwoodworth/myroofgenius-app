import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CopilotProvider from './components/CopilotProvider';
import './index.css';

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CopilotProvider>
      <App />
    </CopilotProvider>
  </React.StrictMode>
);
