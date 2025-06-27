const requiredEnvVars = [
  'REACT_APP_API_URL',
  'REACT_APP_WS_URL',
  'REACT_APP_AUTH_DOMAIN',
  'REACT_APP_AUTH_CLIENT_ID'
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\nPlease check your .env.local file.`
    );
  }
  try {
    new URL(process.env.REACT_APP_API_URL);
    new URL(process.env.REACT_APP_WS_URL);
  } catch {
    throw new Error('Invalid URL in environment variables');
  }
}
