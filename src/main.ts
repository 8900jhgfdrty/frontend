/* eslint-disable perfectionist/sort-imports */

// core
import { pinia } from "@/pinia"
import { router } from "@/router"
import { installPlugins } from "@/plugins"
import App from "@/App.vue"
// css
import "normalize.css"
import "nprogress/nprogress.css"
import "element-plus/theme-chalk/dark/css-vars.css"
import "vxe-table/lib/style.css"
import "@@/assets/styles/index.scss"
import "virtual:uno.css"

import { useUserStore } from "@/pinia/stores/user"
import { usePermissionStore } from "@/pinia/stores/permission"
import { getCacheRoles, getCacheUserInfo } from "@/common/utils/cache/local-storage"

const app = createApp(App)

// Install plugins (global components, custom directives, etc.)
installPlugins(app)

// Install pinia
app.use(pinia)

const userStore = useUserStore()
const permissionStore = usePermissionStore()
const cachedRoles = getCacheRoles()
const cachedUserInfo = getCacheUserInfo()

// Used to ensure all routes are initialized
async function initializeRouter() {
  if (cachedRoles && cachedRoles.length > 0) {
    console.log("Load user roles from cache:", cachedRoles)
    userStore.setRoles(cachedRoles)

    if (cachedUserInfo) {
      userStore.setUserName(cachedUserInfo.username)
      userStore.setUserId(cachedUserInfo.userId)
    }

    // Preload dynamic routes, using await to ensure routes are loaded
    await permissionStore.setRoutes(cachedRoles)

    const routesToAdd = permissionStore.addRoutes
    // Use Promise.all to wait for all routes to be added
    const routePromises = routesToAdd.map((route) => {
      if (!router.hasRoute(route.name as string)) {
        console.log("Preloading route:", route.path)
        return router.addRoute(route)
      }
      return Promise.resolve()
    })

    await Promise.all(routePromises)
    console.log("All routes preloaded")
  }

  // Install router
  app.use(router)

  // Mount the app after the router is ready
  await router.isReady()
  app.mount("#app")
}

// Initialize the router and mount the app
initializeRouter()
