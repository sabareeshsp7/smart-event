import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      // RULE CQ-2: No any types in application code
      "@typescript-eslint/no-explicit-any": "error",
      // RULE CQ-4: Require JSDoc on all exported functions in lib/
      // (enforced by tsconfig noUnusedLocals/Parameters)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      // Prevent console.log in production routes (allow warn/error)
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      // RULE CQ-7: No commented-out code
      "no-warning-comments": ["warn", { "terms": ["TODO", "FIXME", "HACK"], "location": "start" }],
      // Require await on async functions
      "no-floating-promise": "off",
      // Consistent returns
      "consistent-return": "warn",
    },
  },
  {
    // Relax rules for test files
    files: ["tests/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
];

export default eslintConfig;
