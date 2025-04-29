/// <reference types="vitest/config" />

import { resolve } from "node:path"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import UnoCSS from "unocss/vite"
import AutoImport from "unplugin-auto-import/vite"
import SvgComponent from "unplugin-svg-component/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import { defineConfig, loadEnv } from "vite"
import svgLoader from "vite-svg-loader"

// Vite configuration: https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables (e.g. VITE_PUBLIC_PATH)
  const { VITE_PUBLIC_PATH } = loadEnv(mode, process.cwd(), "") as ImportMetaEnv

  return {
    // Base public path when serving or building
    base: VITE_PUBLIC_PATH,

    resolve: {
      alias: {
        // '@' maps to the 'src' directory
        "@": resolve(__dirname, "src"),
        // '@@' maps to the 'src/common' directory
        "@@": resolve(__dirname, "src/common")
      }
    },

    server: {
      // Listen on all network interfaces
      host: true,
      // Port number
      port: 3333,
      // Do not exit if the port is already in use
      strictPort: false,
      // Automatically open the browser
      open: true,
      // HTTP proxy configuration
      proxy: {
        "/api": {
          target: "http://127.0.0.1:18000",
          ws: false,
          changeOrigin: true
        },
        "/api/v1": {
          target: "https://apifoxmock.com/m1/2930465-2145633-default",
          ws: false,
          changeOrigin: true
        }
      },
      // Enable CORS
      cors: true,
      // Pre-warm frequently used files to speed up initial load
      warmup: {
        clientFiles: [
          "./src/layouts/**/*.*",
          "./src/pinia/**/*.*",
          "./src/router/**/*.*"
        ]
      }
    },

    build: {
      rollupOptions: {
        output: {
          /**
           * Split chunks strategy:
           * 1. Ensure these package names exist, or the build will fail.
           * 2. Remove this block entirely if you don't need custom chunk splitting.
           */
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"],
            element: ["element-plus", "@element-plus/icons-vue"],
            vxe: ["vxe-table"]
          }
        }
      },
      // Disable gzip size reporting to slightly improve build performance
      reportCompressedSize: false,
      // Warning threshold for chunk size (in KB)
      chunkSizeWarningLimit: 2048
    },

    esbuild:
      mode === "development"
        ? undefined
        : {
            // Remove console.log in production
            pure: ["console.log"],
            // Remove debugger statements in production
            drop: ["debugger"],
            // Strip out all comments in production
            legalComments: "none"
          },

    plugins: [
      vue(),
      // Enable JSX/TSX support
      vueJsx(),
      // Import SVG files as Vue components
      svgLoader({
        defaultImport: "url",
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  // Preserve the viewBox attribute
                  removeViewBox: false
                }
              }
            }
          ]
        }
      }),
      // Automatically generate SvgIcon components and sprite sheets
      SvgComponent({
        iconDir: [resolve(__dirname, "src/common/assets/icons")],
        preserveColor: resolve(__dirname, "src/common/assets/icons/preserve-color"),
        dts: true,
        dtsDir: resolve(__dirname, "types/auto")
      }),
      // Atomic CSS
      UnoCSS(),
      // Auto-import Vue/Vue Router/Pinia APIs
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        dts: "types/auto/auto-imports.d.ts",
        resolvers: [ElementPlusResolver()]
      }),
      // Auto-register Vue components
      Components({
        dts: "types/auto/components.d.ts",
        resolvers: [ElementPlusResolver()]
      })
    ],

    // Vitest configuration: https://vitest.dev/config/
    test: {
      include: ["tests/**/*.test.{ts,js}"],
      environment: "happy-dom",
      server: {
        deps: {
          inline: ["element-plus"]
        }
      }
    }
  }
})
