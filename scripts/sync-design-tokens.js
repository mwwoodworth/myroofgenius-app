const fs = require("fs");
const path = require("path");

const tokensPath = path.join(__dirname, "../design-system/tokens.json");
const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf-8"));

function buildTailwindConfig(tokens) {
  const spacing = Object.entries(tokens.spacing)
    .map(([k, v]) => `      ${k.replace("spacing-", "")}: '${v}'`)
    .join(",\n");

  return `module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '${tokens.colors["color-bg-default"]}',
          card: '${tokens.colors["color-bg-card"]}'
        },
        primary: '${tokens.colors["color-primary-base"]}',
        accent: '${tokens.colors["color-accent-base"]}',
        secondary: '${tokens.colors["color-secondary-base"]}',
        success: '${tokens.colors["color-success-base"]}',
        warning: '${tokens.colors["color-warning-base"]}',
        danger: '${tokens.colors["color-danger-base"]}',
        text: {
          primary: '${tokens.colors["color-text-primary"]}',
          secondary: '${tokens.colors["color-text-secondary"]}'
        }
      },
      fontFamily: {
        sans: ${JSON.stringify(tokens.fontFamily["font-family-sans"])},
        mono: ${JSON.stringify(tokens.fontFamily["font-family-mono"])}
      },
      fontSize: {
        h1: ['${tokens.fontSize["font-size-h1"]}', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['${tokens.fontSize["font-size-h2"]}', { lineHeight: '1.3', fontWeight: '700' }],
        h3: ['${tokens.fontSize["font-size-h3"]}', { lineHeight: '1.4', fontWeight: '600' }],
        base: ['${tokens.fontSize["font-size-base"]}', { lineHeight: '1.5', fontWeight: '400' }],
        sm: ['${tokens.fontSize["font-size-sm"]}', { lineHeight: '1.5', fontWeight: '400' }],
        label: ['${tokens.fontSize["font-size-label"]}', { lineHeight: '1.5', fontWeight: '500' }],
        caption: ['${tokens.fontSize["font-size-caption"]}', { lineHeight: '1.5', fontWeight: '400' }]
      },
      spacing: {
${spacing}
      },
      borderRadius: {
        DEFAULT: '${tokens.radius["radius-DEFAULT"]}',
        lg: '${tokens.radius["radius-lg"]}'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
`;
}

function buildStorybookTheme(tokens) {
  return `import { create } from '@storybook/theming';
import tokens from '../tokens.json';

export default create({
  base: 'light',
  colorPrimary: tokens.colors['color-primary-base'],
  colorSecondary: tokens.colors['color-accent-base'],
  appBg: tokens.colors['color-bg-default'],
  appContentBg: tokens.colors['color-bg-card'],
  textColor: tokens.colors['color-text-primary'],
  fontBase: tokens.fontFamily['font-family-sans'].join(', '),
  fontCode: tokens.fontFamily['font-family-mono'].join(', ')
});
`;
}

fs.writeFileSync(
  path.join(__dirname, "../tailwind.config.js"),
  buildTailwindConfig(tokens),
);
fs.writeFileSync(
  path.join(__dirname, "../design-system/theme.ts"),
  buildStorybookTheme(tokens),
);
console.log("Design tokens synced");
