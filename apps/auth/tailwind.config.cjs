/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/app/**/*.{ts,tsx}"],
  presets: [require("@propsto/ui/tailwind.base.config.cjs")],
};
