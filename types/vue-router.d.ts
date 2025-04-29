import type * as ElementPlusIconsVue from "@element-plus/icons-vue"
import type { SvgName } from "~virtual/svg-component"
import "vue-router"

export {}

type ElementPlusIconsName = keyof typeof ElementPlusIconsVue

declare module "vue-router" {
  interface RouteMeta {
    /**
     * @description Set the name to display in the sidebar and breadcrumb
     */
    title?: string
    /**
     * @description Set the icon for this route, remember to import svg into src/common/assets/icons
     */
    svgIcon?: SvgName
    /**
     * @description Set the icon for this route using Element Plus Icon (when set with svgIcon, svgIcon takes precedence)
     */
    elIcon?: ElementPlusIconsName
    /**
     * @description Default false, when set to true, this route will not appear in the sidebar
     */
    hidden?: boolean
    /**
     * @description Set the roles that can access this route, supports multiple roles
     */
    roles?: string[]
    /**
     * @description Default true, if set to false, it will not show in breadcrumb
     */
    breadcrumb?: boolean
    /**
     * @description Default false, if set to true, it will be fixed in tags-view
     */
    affix?: boolean
    /**
     * @description When a route's children property declares only 1 non-hidden child route and this child route is a leaf node,
     * @description this child route will be displayed as the parent route in the sidebar
     * @description When more than 1, it will revert to nested mode
     * @description If you want to always show the parent route regardless of the number, set alwaysShow: true on the parent route
     */
    alwaysShow?: boolean
    /**
     * @description Example: activeMenu: "/xxx/xxx"
     * @description When entering a route with this property set, it will highlight the corresponding sidebar menu of activeMenu
     * @description This property is suitable for routes with hidden: true
     */
    activeMenu?: string
    /**
     * @description Whether to cache this route page
     * @description Default is false, when true it means caching is needed, and both the route and page need to set consistent Names
     */
    keepAlive?: boolean
  }
}
