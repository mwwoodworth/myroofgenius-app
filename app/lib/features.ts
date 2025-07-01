export const maintenanceMode = (process.env.NEXT_PUBLIC_MAINTENANCE_MODE || process.env.MAINTENANCE_MODE) === 'true';

function flag(name: string, defaultVal: boolean = true): boolean {
  const val = process.env[`NEXT_PUBLIC_${name}`] ?? process.env[name];
  if (val === undefined) return defaultVal && !maintenanceMode;
  return val === 'true' && !maintenanceMode;
}

export const aiCopilotEnabled = flag('AI_COPILOT_ENABLED');
export const estimatorEnabled = flag('ESTIMATOR_ENABLED');
export const arModeEnabled = flag('AR_MODE_ENABLED', false);
export const salesEnabled = flag('SALES_ENABLED');
