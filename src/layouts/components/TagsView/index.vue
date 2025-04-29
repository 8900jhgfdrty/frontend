<script lang="ts" setup>
import type { TagView } from "@/pinia/stores/tags-view"
import type { RouteLocationNormalizedGeneric, RouteRecordRaw, RouterLink } from "vue-router"
import { usePermissionStore } from "@/pinia/stores/permission"
import { useTagsViewStore } from "@/pinia/stores/tags-view"
import { useRouteListener } from "@@/composables/useRouteListener"
import { Close } from "@element-plus/icons-vue"
import path from "path-browserify"
import ScrollPane from "./ScrollPane.vue"

const router = useRouter()
const route = useRoute()
const tagsViewStore = useTagsViewStore()
const permissionStore = usePermissionStore()
const { listenerRouteChange } = useRouteListener()

/** Array of <router-link> element refs for each tag */
const tagRefs = ref<InstanceType<typeof RouterLink>[]>([])

/** Whether the context menu is visible */
const visible = ref(false)

/** Top position (in pixels) for the context menu */
const top = ref(0)

/** Left position (in pixels) for the context menu */
const left = ref(0)

/** The tag currently being right‑clicked */
const selectedTag = ref<TagView>({})

/** List of permanently affixed tags */
let affixTags: TagView[] = []

/** Check if a tag is the active one */
function isActive(tag: TagView) {
  return tag.path === route.path
}

/** Check if a tag is affixed (cannot be closed) */
function isAffix(tag: TagView) {
  return tag.meta?.affix
}

/** Collect all affixed tags from the route definitions */
function filterAffixTags(routes: RouteRecordRaw[], basePath = "/") {
  const tags: TagView[] = []
  routes.forEach((route) => {
    if (isAffix(route)) {
      const tagPath = path.resolve(basePath, route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      tags.push(...filterAffixTags(route.children, route.path))
    }
  })
  return tags
}

/** Initialize the tag bar with affixed tags */
function initTags() {
  affixTags = filterAffixTags(permissionStore.routes)
  affixTags.forEach(tag => {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag)
    }
  })
}

/** Add a new tag when navigating */
function addTags(route: RouteLocationNormalizedGeneric) {
  if (route.name) {
    tagsViewStore.addVisitedView(route)
    tagsViewStore.addCachedView(route)
  }
}

/** Refresh the currently selected tag */
function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view)
  router.replace({ path: `/redirect${view.path}`, query: view.query })
}

/** Close the currently selected tag */
function closeSelectedTag(view: TagView) {
  tagsViewStore.delVisitedView(view)
  tagsViewStore.delCachedView(view)
  if (isActive(view)) {
    toLastView(tagsViewStore.visitedViews, view)
  }
}

/** Close all other tags except the selected one */
function closeOthersTags() {
  const fp = selectedTag.value.fullPath
  if (fp !== route.path && fp !== undefined) {
    router.push(fp)
  }
  tagsViewStore.delOthersVisitedViews(selectedTag.value)
  tagsViewStore.delOthersCachedViews(selectedTag.value)
}

/** Close all tags */
function closeAllTags(view: TagView) {
  tagsViewStore.delAllVisitedViews()
  tagsViewStore.delAllCachedViews()
  if (!affixTags.some(tag => tag.path === route.path)) {
    toLastView(tagsViewStore.visitedViews, view)
  }
}

/** Navigate to the last open tag */
function toLastView(visitedViews: TagView[], view: TagView) {
  const last = visitedViews.slice(-1)[0]
  const fp = last?.fullPath
  if (fp) {
    router.push(fp)
  } else {
    // If none left, go home or reload dashboard
    if (view.name === "Dashboard") {
      router.push({ path: `/redirect${view.path}`, query: view.query })
    } else {
      router.push("/")
    }
  }
}

/** Show the context menu at the cursor for a given tag */
function openMenu(tag: TagView, e: MouseEvent) {
  const minWidth = 100
  const bodyWidth = document.body.offsetWidth
  const maxLeft = bodyWidth - minWidth
  const x = e.clientX + 10
  left.value = x > maxLeft ? maxLeft : x
  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

/** Hide the context menu */
function closeMenu() {
  visible.value = false
}

watch(visible, (val) => {
  if (val) {
    document.body.addEventListener("click", closeMenu)
  } else {
    document.body.removeEventListener("click", closeMenu)
  }
})

initTags()

// Listen for route changes to add tags
listenerRouteChange((route) => {
  addTags(route)
}, true)
</script>

<template>
  <div class="tags-view-container">
    <ScrollPane class="tags-view-wrapper" :tag-refs="tagRefs">
      <router-link
        v-for="tag in tagsViewStore.visitedViews"
        :key="tag.path"
        ref="tagRefs"
        :class="{ active: isActive(tag) }"
        class="tags-view-item"
        :to="{ path: tag.path, query: tag.query }"
        @click.middle="!isAffix(tag) && closeSelectedTag(tag)"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.meta?.title }}
        <el-icon
          v-if="!isAffix(tag)"
          :size="12"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </ScrollPane>

    <ul
      v-show="visible"
      class="contextmenu"
      :style="{ left: `${left}px`, top: `${top}px` }"
    >
      <li @click="refreshSelectedTag(selectedTag)">
        Refresh
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        Close
      </li>
      <li @click="closeOthersTags">
        Close Others
      </li>
      <li @click="closeAllTags(selectedTag)">
        Close All
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.tags-view-container {
  height: var(--v3-tagsview-height);
  width: 100%;
  color: var(--v3-tagsview-text-color);
  overflow: hidden;

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid var(--v3-tagsview-tag-border-color);
      border-radius: var(--v3-tagsview-tag-border-radius);
      background-color: var(--v3-tagsview-tag-bg-color);
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;

      &:first-of-type {
        margin-left: 5px;
      }
      &:last-of-type {
        margin-right: 5px;
      }
      &.active {
        background-color: var(--v3-tagsview-tag-active-bg-color);
        color: var(--v3-tagsview-tag-active-text-color);
        border-color: var(--v3-tagsview-tag-active-border-color);
      }
      .el-icon {
        margin-left: 5px;
        margin-right: 1px;
        border-radius: 50%;
        &:hover {
          background-color: var(--v3-tagsview-tag-icon-hover-bg-color);
          color: var(--v3-tagsview-tag-icon-hover-color);
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    z-index: 3000;
    position: fixed;
    list-style: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    color: var(--v3-tagsview-contextmenu-text-color);
    background-color: var(--v3-tagsview-contextmenu-bg-color);
    box-shadow: var(--v3-tagsview-contextmenu-box-shadow);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        color: var(--v3-tagsview-contextmenu-hover-text-color);
        background-color: var(--v3-tagsview-contextmenu-hover-bg-color);
      }
    }
  }
}
</style>
