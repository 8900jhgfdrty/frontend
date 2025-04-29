import type { App, Directive } from "vue"
import { useUserStore } from "@/pinia/stores/user"
import { isArray } from "@@/utils/validate"

/**
 * @name Permission Directive
 * @description Provides functionality similar to the `checkPermission` function
 */
const permission: Directive = {
  mounted(el, binding) {
    const { value: permissionRoles } = binding
    const { roles } = useUserStore()
    if (isArray(permissionRoles) && permissionRoles.length > 0) {
      const hasPermission = roles.some(role => permissionRoles.includes(role))
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error(`The argument must be a non-empty array. Example: v-permission="['admin', 'editor']"`)
    }
  }
}

export function installPermissionDirective(app: App) {
  app.directive("permission", permission)
}
