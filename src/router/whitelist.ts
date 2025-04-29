import type { RouteLocationNormalizedGeneric, RouteRecordNameGeneric } from "vue-router"

/** Routes that don’t require login (matched by path) */
const whiteListByPath: string[] = ["/login"]

/** Routes that don’t require login (matched by name) */
const whiteListByName: RouteRecordNameGeneric[] = []

/** Determine whether a route is whitelisted */
export function isWhiteList(to: RouteLocationNormalizedGeneric) {
  // Either path or name matching is sufficient
  return whiteListByPath.includes(to.path) || whiteListByName.includes(to.name)
}
