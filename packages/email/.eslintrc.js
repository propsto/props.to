module.exports = {
  root: true,
  extends: [require.resolve("@propsto/config/eslint/react-internal.js")],
  rules: {
    "import/no-default-export": 0,
  },
};
