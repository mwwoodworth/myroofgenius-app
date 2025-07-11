import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);
const { colors, spacing, fontSize, borderRadius } = fullConfig.theme.extend;

export const designTokens = {
  colors: {
    'color-bg-default': colors.bg.DEFAULT,
    'color-bg-card': colors.bg.card,
    'color-primary-base': colors.primary,
    'color-accent-base': colors.accent,
    'color-secondary-base': colors.secondary,
    'color-success-base': colors.success,
    'color-warning-base': colors.warning,
    'color-danger-base': colors.danger,
    'color-text-primary': colors.text.primary,
    'color-text-secondary': colors.text.secondary,
  },
  spacing: Object.fromEntries(
    Object.entries(spacing).map(([k, v]) => [`spacing-${k}`, v])
  ),
  fontSize: Object.fromEntries(
    Object.entries(fontSize).map(([k, v]: any) => [
      `font-size-${k}`,
      Array.isArray(v) ? v[0] : v,
    ])
  ),
  radius: Object.fromEntries(
    Object.entries(borderRadius).map(([k, v]) => [`radius-${k}`, v])
  ),
};
