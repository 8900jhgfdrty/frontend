import type { RouteLocationNormalizedGeneric } from "vue-router"
import { pinia } from "@/pinia"
import { getCachedViews, getVisitedViews, setCachedViews, setVisitedViews } from "@@/utils/cache/local-storage"
import { useSettingsStore } from "./settings"

export type TagView = Partial<RouteLocationNormalizedGeneric>

export const useTagsViewStore = defineStore("tags-view", () => {
  const { cacheTagsView } = useSettingsStore()
  const visitedViews = ref<TagView[]>(cacheTagsView ? getVisitedViews() : [])
  const cachedViews = ref<string[]>(cacheTagsView ? getCachedViews() : [])

  // Cache tags view data
  watchEffect(() => {
    setVisitedViews(visitedViews.value)
    setCachedViews(cachedViews.value)
  })

  // #region add
  /** Add a view to visitedViews */
  const addVisitedView = (view: TagView) => {
    // Check if the view already exists
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index !== -1) {
      // Prevent losing query parameters
      visitedViews.value[index].fullPath !== view.fullPath && (visitedViews.value[index] = { ...view })
    } else {
      // Add new visited view
      visitedViews.value.push({ ...view })
    }
  }

  /** Add a view to cachedViews if it should be kept alive */
  const addCachedView = (view: TagView) => {
    if (typeof view.name !== "string") return
    if (cachedViews.value.includes(view.name)) return
    if (view.meta?.keepAlive) {
      cachedViews.value.push(view.name)
    }
  }
  // #endregion

  // #region del
  /** Remove a view from visitedViews */
  const delVisitedView = (view: TagView) => {
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index !== -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  /** Remove a view from cachedViews */
  const delCachedView = (view: TagView) => {
    if (typeof view.name !== "string") return
    const index = cachedViews.value.indexOf(view.name)
    if (index !== -1) {
      cachedViews.value.splice(index, 1)
    }
  }
  // #endregion

  // #region delOthers
  /** Remove all visitedViews except affixed ones and the specified view */
  const delOthersVisitedViews = (view: TagView) => {
    visitedViews.value = visitedViews.value.filter((v) => {
      return v.meta?.affix || v.path === view.path
    })
  }

  /** Keep only the specified view in cachedViews */
  const delOthersCachedViews = (view: TagView) => {
    if (typeof view.name !== "string") return
    const index = cachedViews.value.indexOf(view.name)
    if (index !== -1) {
      cachedViews.value = cachedViews.value.slice(index, index + 1)
    } else {
      // If not found, clear all cached views
      cachedViews.value = []
    }
  }
  // #endregion

  // #region delAll
  /** Remove all visitedViews except affixed ones */
  const delAllVisitedViews = () => {
    visitedViews.value = visitedViews.value.filter(tag => tag.meta?.affix)
  }

  /** Clear all cachedViews */
  const delAllCachedViews = () => {
    cachedViews.value = []
  }
  // #endregion

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOthersVisitedViews,
    delOthersCachedViews,
    delAllVisitedViews,
    delAllCachedViews
  }
})

/**
 * @description In SPA applications, can be used to access the store before the Pinia instance is activated.
 * @description In SSR applications, can be used to access the store outside of setup().
 */
export function useTagsViewStoreOutside() {
  return useTagsViewStore(pinia)
}
