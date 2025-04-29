<script lang="ts" setup>
import type { RouteLocationMatched } from "vue-router"
import { useRouteListener } from "@@/composables/useRouteListener"
import { compile } from "path-to-regexp"

const route = useRoute()
const router = useRouter()
const { listenerRouteChange } = useRouteListener()

/** Reactive breadcrumbs array for storing breadcrumb navigation items */
const breadcrumbs = ref<RouteLocationMatched[]>([])

/** Populate breadcrumbs based on matched routes with titles (excluding those with breadcrumb disabled) */
function getBreadcrumb() {
  breadcrumbs.value = route.matched.filter(
    item => item.meta?.title && item.meta?.breadcrumb !== false
  )
}

/** Compile a route path template with current route params */
function pathCompile(path: string) {
  const toPath = compile(path)
  return toPath(route.params)
}

/** Handle click on a breadcrumb item: redirect or navigate to the compiled path */
function handleLink(item: RouteLocationMatched) {
  const { redirect, path } = item
  if (redirect) return router.push(redirect as string)
  router.push(pathCompile(path))
}

// Listen for route changes and update breadcrumbs (skip redirect routes)
listenerRouteChange((route) => {
  if (route.path.startsWith("/redirect/")) return
  getBreadcrumb()
}, true)
</script>

<template>
  <el-breadcrumb>
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="item.path"
    >
      <span
        v-if="item.redirect === 'noRedirect' || index === breadcrumbs.length - 1"
        class="no-redirect"
      >
        {{ item.meta.title }}
      </span>
      <a v-else @click.prevent="handleLink(item)">
        {{ item.meta.title }}
      </a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style lang="scss" scoped>
.el-breadcrumb {
  line-height: var(--v3-navigationbar-height);

  .no-redirect {
    color: var(--el-text-color-placeholder);
  }

  a {
    font-weight: normal;
  }
}
</style>
