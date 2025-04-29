import antfu from "@antfu/eslint-config"

// For more custom configuration, see: https://github.com/antfu/eslint-config
export default antfu(
  {
    // Use external formatters for css, html, markdown, etc.
    formatters: true,
    // Enable stylistic rules
    stylistic: {
      // Indentation size
      indent: 2,
      // Quote style: 'single' | 'double'
      quotes: "double",
      // Use semicolons at the end of statements
      semi: false
    },
    // Files to ignore
    ignores: []
  },
  {
    // Global custom rules
    rules: {
      // Vue-specific
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "vue/attributes-order": "off",
      // TypeScript
      "ts/no-use-before-define": "off",
      // Node.js
      "node/prefer-global/process": "off",
      // Style rules
      "style/comma-dangle": ["error", "never"],
      "style/brace-style": ["error", "1tbs"],
      // RegExp
      "regexp/no-unused-capturing-group": "off",
      // Miscellaneous
      "no-console": "off",
      "no-debugger": "off",
      "symbol-description": "off",
      "antfu/if-newline": "off",
      "unicorn/no-instanceof-builtins": "off"
    }
  }
)
