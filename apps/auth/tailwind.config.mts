import baseConfig from "@propsto/ui/tailwind.config.mjs";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/app/**/*.{ts,tsx}", ...baseConfig.content],
  presets: [baseConfig],
};
