import type { Router, RouteRecordNormalized, RouteRecordRaw } from "vue-router"
import { cloneDeep, omit } from "lodash-es"
import { createRouter } from "vue-router"
import { routerConfig } from "./config"

/** Flatten multi‑level routes (convert third‑level and deeper routes into second‑level routes) */
export function flatMultiLevelRoutes(routes: RouteRecordRaw[]) {
  const routesMirror = cloneDeep(routes)
  routesMirror.forEach((route) => {
    // If the route is third‑level or deeper, perform downgrade
    isMultipleRoute(route) && promoteRouteLevel(route)
  })
  return routesMirror
}

/** Check if a route has level greater than 2 */
function isMultipleRoute(route: RouteRecordRaw) {
  const children = route.children
  // If any child has its own children, it's third‑level or deeper
  if (children?.length) return children.some(child => child.children?.length)
  return false
}

/** Promote route to second level */
function promoteRouteLevel(route: RouteRecordRaw) {
  // Create a temporary router to retrieve all normalized routes for this module
  let router: Router | null = createRouter({
    history: routerConfig.history,
    routes: [route]
  })
  const routes = router.getRoutes()
  // Use the normalized routes to update the original route's children
  addToChildren(routes, route.children || [], route)
  router = null
  // After flattening, remove any nested `children` properties
  route.children = route.children?.map(item => omit(item, "children") as RouteRecordRaw)
}

/** Recursively add matching normalized routes into the module's children */
function addToChildren(
  routes: RouteRecordNormalized[],
  children: RouteRecordRaw[],
  routeModule: RouteRecordRaw
) {
  children.forEach((child) => {
    const route = routes.find(item => item.name === child.name)
    if (route) {
      // Initialize the module's children array if needed
      routeModule.children = routeModule.children || []
      // Add the normalized route if it's not already present
      if (!routeModule.children.includes(route)) {
        routeModule.children.push(route)
      }
      // If this child has its own children, recurse to include them too
      if (child.children?.length) {
        addToChildren(routes, child.children, routeModule)
      }
    }
  })
}
