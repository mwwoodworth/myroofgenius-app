import { create } from "@storybook/theming";
import tokens from "../tokens.json";

export default create({
  base: "light",
  colorPrimary: tokens.colors["color-primary-base"],
  colorSecondary: tokens.colors["color-accent-base"],
  appBg: tokens.colors["color-bg-default"],
  appContentBg: tokens.colors["color-bg-card"],
  textColor: tokens.colors["color-text-primary"],
  fontBase: tokens.fontFamily["font-family-sans"].join(", "),
  fontCode: tokens.fontFamily["font-family-mono"].join(", "),
});
