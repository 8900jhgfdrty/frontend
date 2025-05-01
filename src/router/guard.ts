import type { Router } from "vue-router"
import { getCacheRoles, getCacheUserInfo } from "@/common/utils/cache/local-storage"
import { usePermissionStore } from "@/pinia/stores/permission"
import { useUserStore } from "@/pinia/stores/user"
import { routerConfig } from "@/router/config"
import { isWhiteList } from "@/router/whitelist"
import { setRouteChange } from "@@/composables/useRouteListener"
import { useTitle } from "@@/composables/useTitle"
import { getToken } from "@@/utils/cache/cookies"
import NProgress from "nprogress"

NProgress.configure({ showSpinner: false })

const { setTitle } = useTitle()

const LOGIN_PATH = "/login"

export function registerNavigationGuard(router: Router) {
  // Global before guard
  router.beforeEach(async (to, _from) => {
    NProgress.start()
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    // First step: check the whitelist
    if (isWhiteList(to)) return true
    // Second step: check if logged in
    if (!getToken()) {
      return LOGIN_PATH
    }
    // If already logged in and trying to access the login page, redirect accordingly
    if (to.path === LOGIN_PATH) {
      const userInfo = getCacheUserInfo()
      // If system administrator (user_type = "2"), go to dashboard
      if (userInfo && userInfo.user_type === "2") {
        return "/dashboard"
      }
      // Otherwise, go to home
      return "/"
    }

    // Third step: load roles and user info from cache if available
    if (!userStore.roles.length) {
      if (getCacheRoles()) {
        userStore.setRoles(getCacheRoles())
      }
      if (getCacheUserInfo()) {
        const userInfo = getCacheUserInfo()
        userStore.setUserName(userInfo.username)
        userStore.setUserId(userInfo.userId)
      }
    }

    // Fourth step: generate dynamic routes if needed
    if (!permissionStore.addRoutes.length) {
      try {
        const roles = userStore.roles
        console.log("Generating routes, user roles:", roles)

        // Set routes
        routerConfig.dynamic
          ? await permissionStore.setRoutes(roles)
          : await permissionStore.setAllRoutes()

        // Add dynamic routes
        const routesToAdd = permissionStore.addRoutes
        console.log("Dynamic routes to add:", routesToAdd.map(r => r.path))

        // Wait for all routes to be added
        const routeAddPromises = routesToAdd.map((route) => {
          if (!router.hasRoute(route.name as string)) {
            console.log("Adding route:", route.path)
            return router.addRoute(route)
          }
          return Promise.resolve()
        })

        await Promise.all(routeAddPromises)
        console.log("All dynamic routes added successfully")

        // After adding routes, redirect to the original target
        return { ...to, replace: true }
      } catch (error) {
        userStore.resetToken()
        ElMessage.error((error as Error).message || "An error occurred in the navigation guard")
        return LOGIN_PATH
      }
    }

    // Fifth step: check permissions
    const hasAccess = to.matched.some((record) => {
      const roles = record.meta?.roles
      if (!roles || !Array.isArray(roles)) return true
      return userStore.roles.some(role => roles.includes(role))
    })

    if (!hasAccess && to.path !== "/403") {
      return "/403"
    }

    // Sixth step: check if route exists
    if (to.matched.length === 0 && to.path !== "/404") {
      console.log("Route does not exist, redirecting to 404:", to.path)
      return "/404"
    }

    return true
  })

  // Global after hook
  router.afterEach((to) => {
    setRouteChange(to)
    setTitle(to.meta.title)
    localStorage.removeItem("just_logged_in")
    NProgress.done()
  })
}
