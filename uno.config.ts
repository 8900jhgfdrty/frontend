import { defineConfig, presetAttributify, presetWind3 } from "unocss"

export default defineConfig({
  // Presets
  presets: [
    // Attributify mode & boolean attribute support
    presetAttributify({
      prefix: "un-",
      prefixedOnly: false,
    }),
    // Default Wind(3) preset with scoped importance
    presetWind3({
      important: "#app",
    }),
  ],
  // Custom rules (empty for now)
  rules: [],
  // Custom shortcuts
  shortcuts: {
    "wh-full": "w-full h-full",
    "flex-center": "flex justify-center items-center",
    "flex-x-center": "flex justify-center",
    "flex-y-center": "flex items-center",
  },
})
