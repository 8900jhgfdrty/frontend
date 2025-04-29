import type { RouterHistory } from "vue-router"
import { createWebHashHistory, createWebHistory } from "vue-router"

/** Router configuration */
interface RouterConfig {
  /**
   * @name Routing mode
   * @description hash mode or html5 mode
   */
  history: RouterHistory
  /**
   * @name Enable dynamic routing
   * @description 1. When enabled, the backend must cooperate by returning, in the user details API, a field (in this project it's the `roles` field) used to determine and load dynamic routes.
   * @description 2. If the project does not need to show different pages to different users, set `dynamic: false`.
   */
  dynamic: boolean
  /**
   * @name Default roles
   * @description When dynamic routing is disabled:
   * @description 1. All routes should be written in the constant routes list (indicating that all logged‑in users have access to the same pages).
   * @description 2. The system will automatically assign the current user a default role that has no actual permissions.
   */
  defaultRoles: Array<string>
  /**
   * @name Enable caching for third‑level and deeper routes
   * @description 1. When enabled, routes of level 3 and deeper will be downgraded (converted into second‑level routes).
   * @description 2. Because they are all converted to second‑level routes, any nested child routes under second‑level or deeper routes will no longer work.
   */
  thirdLevelRouteCache: boolean
}

const VITE_ROUTER_HISTORY = import.meta.env.VITE_ROUTER_HISTORY

const VITE_PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH

export const routerConfig: RouterConfig = {
  history: VITE_ROUTER_HISTORY === "hash"
    ? createWebHashHistory(VITE_PUBLIC_PATH)
    : createWebHistory(VITE_PUBLIC_PATH),
  dynamic: true,
  defaultRoles: ["DEFAULT_ROLE"],
  thirdLevelRouteCache: false
}
