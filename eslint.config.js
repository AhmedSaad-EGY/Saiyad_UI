import js from "@eslint/js";
import globals from "globals";

export default [
  // Ignore generated / vendored directories
  { ignores: ["dist/", "node_modules/", ".git/"] },

  // Apply recommended rules to all JS files
  js.configs.recommended,

  // Custom configuration
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2022,
        Alpine: "readonly",   // Alpine.js global
      },
    },
    rules: {
      // --- Style & correctness ---
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-var": "error",
      "prefer-const": ["error", { destructuring: "all" }],

      // --- Variables ---
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // --- Alerts & debugging ---
      "no-alert": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // --- Async ---
      "no-async-promise-executor": "error",
      "require-atomic-updates": "error",

      // --- Best practices ---
      "no-else-return": ["warn", { allowElseIf: false }],
      "no-implicit-globals": "error",
      "no-shadow": ["warn", { hoist: "all" }],
      "prefer-template": "warn",
      "prefer-spread": "warn",
    },
  },
];
