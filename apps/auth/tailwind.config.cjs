const baseConfig = require("@propsto/ui/tailwind.config.cjs");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/app/**/*.{ts,tsx}", ...baseConfig.content],
  presets: [baseConfig],
};
