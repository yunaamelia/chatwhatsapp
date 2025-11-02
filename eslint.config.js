module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Buffer: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-async-promise-executor": "warn",
      "require-await": "error",
      "prefer-const": "warn",
      "no-var": "warn",
    },
  },
  {
    ignores: [
      "node_modules/",
      ".wwebjs_auth/",
      "logs/",
      "payment_proofs/",
      "payment_qris/",
      "*.log",
    ],
  },
];
