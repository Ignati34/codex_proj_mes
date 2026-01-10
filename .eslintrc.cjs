module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    es2022: true,
    node: true,
    browser: true
  },
  ignorePatterns: ["dist", ".next"],
  overrides: [
    {
      files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
      extends: ["next/core-web-vitals"]
    }
  ]
};
