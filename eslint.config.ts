import { defineConfig } from "eslint/config";
import { common, typescript, prettier } from "eslint-config-neon";

export default defineConfig([
  {
    ignores: ["**/dist/*"],
  },
  ...common,
  ...typescript,
  ...prettier,
  {
    languageOptions: {
      parserOptions: { project: ["./tsconfig.json", "./tsconfig.eslint.json"] },
    },
  },
  {
    rules: {
      "promise/prefer-await-to-then": "off",
      "promise/prefer-await-to-callbacks": "off",
    },
  },
]);
