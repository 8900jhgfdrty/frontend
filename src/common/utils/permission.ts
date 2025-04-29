import { useUserStore } from "@/pinia/stores/user"
import { isArray } from "@@/utils/validate"

/**
 * Global permission check function, similar to the v-permission directive.
 * @param permissionRoles - Array of roles that are allowed access
 * @returns true if the user has at least one of the specified roles
 */
export function checkPermission(permissionRoles: string[]): boolean {
  if (isArray(permissionRoles) && permissionRoles.length > 0) {
    const { roles } = useUserStore()
    return roles.some(role => permissionRoles.includes(role))
  } else {
    console.error("Parameter must be a non-empty array, e.g. checkPermission(['admin', 'editor'])")
    return false
  }
}
