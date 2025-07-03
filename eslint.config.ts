import { common, typescript, prettier } from "eslint-config-neon";
import { defineConfig } from "eslint/config";
export default defineConfig([
  {
    ignores: ["**/dist/*"],
  },
  ...common,
  ...typescript,
  ...prettier,
  { languageOptions: { parserOptions: { project: "./tsconfig.json" } } },
]);
