import type { RouteRecordRaw } from "vue-router"
import { pinia } from "@/pinia"
import { constantRoutes, dynamicRoutes } from "@/router"
import { routerConfig } from "@/router/config"
import { flatMultiLevelRoutes } from "@/router/helper"

function hasPermission(roles: string[], route: RouteRecordRaw) {
  const routeRoles = route.meta?.roles
  return routeRoles ? roles.some(role => routeRoles.includes(role)) : true
}

function filterDynamicRoutes(routes: RouteRecordRaw[], roles: string[]) {
  const res: RouteRecordRaw[] = []
  routes.forEach((route) => {
    const tempRoute = { ...route }
    if (hasPermission(roles, tempRoute)) {
      if (tempRoute.children) {
        tempRoute.children = filterDynamicRoutes(tempRoute.children, roles)
      }
      res.push(tempRoute)
    }
  })
  return res
}

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])
  const setRoutes = async (roles: string[]) => {
    const accessedRoutes = filterDynamicRoutes(dynamicRoutes, roles)
    set(accessedRoutes)
    await nextTick()
  }
  const setAllRoutes = async () => {
    set(dynamicRoutes)
    // add delay to ensure route processing is complete
    await nextTick()
  }
  const set = (accessedRoutes: RouteRecordRaw[]) => {
    routes.value = constantRoutes.concat(accessedRoutes)
    addRoutes.value = routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(accessedRoutes) : accessedRoutes
  }

  return { routes, addRoutes, setRoutes, setAllRoutes }
})

/**
 * @description In SPA applications, can be used to access the store before the Pinia instance is activated.
 * @description In SSR applications, can be used to access the store outside of setup().
 */

export function usePermissionStoreOutside() {
  return usePermissionStore(pinia)
}
