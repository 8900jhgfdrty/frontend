import type { RouteRecordRaw } from "vue-router"
import { routerConfig } from "@/router/config"
import { registerNavigationGuard } from "@/router/guard"
import { createRouter } from "vue-router"
import { flatMultiLevelRoutes } from "./helper"

const Layouts = () => import("@/layouts/index.vue")

/**
 * @name Constant Routes
 * @description Apart from redirect/403/404/login hidden pages, it’s recommended to set a unique `name` for other routes
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/pages/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/pages/error/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/pages/error/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      hidden: true
    }
  }
]

/**
 * @name Dynamic Routes
 * @description Used for routes protected by roles
 * @description Must have a unique `name` property
 */
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    component: Layouts,
    redirect: "/notice",
    meta: {
      title: "Notice Management",
      elIcon: "Lock",
      roles: ["admin", "user"],
      alwaysShow: true
    },
    children: [
      {
        path: "notice",
        component: () => import("@/pages/notice/index.vue"),
        name: "notice",
        meta: {
          title: "Notice Page",
          svgIcon: "dashboard",
          roles: ["admin", "user"]
        }
      }
    ]
  },
  {
    path: "/book",
    component: Layouts,
    redirect: "/book/list",
    name: "BookManagement",
    meta: {
      title: "Book Management",
      elIcon: "Notebook",
      roles: ["admin", "user"],
      alwaysShow: true
    },
    children: [
      {
        path: "list",
        component: () => import("@/pages/book/index.vue"),
        name: "bookList",
        meta: {
          title: "Books",
          svgIcon: "dashboard"
        }
      },
      {
        path: "record",
        component: () => import("@/pages/record/index.vue"),
        name: "recordList",
        meta: {
          title: "Borrow Records",
          svgIcon: "dashboard"
        }
      }
    ]
  },
  {
    path: "/dashboard",
    component: Layouts,
    redirect: "/dashboard/index",
    meta: {
      title: "Data Dashboard",
      elIcon: "Lock",
      roles: ["root"],
      alwaysShow: true
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/dashboard/index.vue"),
        name: "dashboard",
        meta: {
          title: "Data Dashboard",
          svgIcon: "dashboard",
          roles: ["root"]
        }
      }
    ]
  },
  {
    path: "/userbook",
    component: Layouts,
    redirect: "/userbook/list",
    name: "SmartRecommendation",
    meta: {
      title: "Smart Recommendation",
      elIcon: "Notebook",
      roles: ["user"],
      alwaysShow: true
    },
    children: [
      {
        path: "list",
        component: () => import("@/pages/userbook/guard.vue"),
        name: "userbookList",
        meta: {
          title: "Smart Recommendation",
          svgIcon: "dashboard"
        }
      }
    ]
  },
  {
    path: "/adminList",
    component: Layouts,
    redirect: "/adminList/list",
    name: "UserManagement",
    meta: {
      title: "User Management",
      elIcon: "Notebook",
      roles: ["root"],
      alwaysShow: true
    },
    children: [
      {
        path: "list",
        component: () => import("@/pages/adminList/index.vue"),
        name: "adminList",
        meta: {
          title: "User Management",
          svgIcon: "dashboard"
        }
      }
    ]
  }
]

/** Router instance */
export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache
    ? flatMultiLevelRoutes(constantRoutes)
    : constantRoutes
})

/** Reset router */

export function resetRouter() {
  try {
    // Note: All dynamic routes must have a `name`, otherwise they may not be fully removed
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // Fallback: force reload the browser (not ideal UX)
    location.reload()
  }
}

// Register navigation guards
registerNavigationGuard(router)
