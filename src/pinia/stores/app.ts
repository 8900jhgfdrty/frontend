import { pinia } from "@/pinia"
import { DeviceEnum, SIDEBAR_CLOSED, SIDEBAR_OPENED } from "@@/constants/app-key"
import { getSidebarStatus, setSidebarStatus } from "@@/utils/cache/local-storage"

interface Sidebar {
  opened: boolean
  withoutAnimation: boolean
}

/** Persist sidebar open/closed state to local storage */
function handleSidebarStatus(opened: boolean) {
  opened
    ? setSidebarStatus(SIDEBAR_OPENED)
    : setSidebarStatus(SIDEBAR_CLOSED)
}

export const useAppStore = defineStore("app", () => {
  // Sidebar state
  const sidebar: Sidebar = reactive({
    opened: getSidebarStatus() !== SIDEBAR_CLOSED,
    withoutAnimation: false
  })

  // Device type
  const device = ref<DeviceEnum>(DeviceEnum.Desktop)

  // Watch for sidebar open state changes to update cache
  watch(
    () => sidebar.opened,
    (opened) => {
      handleSidebarStatus(opened)
    }
  )

  /** Toggle sidebar open/closed with optional animation flag */
  const toggleSidebar = (withoutAnimation: boolean) => {
    sidebar.opened = !sidebar.opened
    sidebar.withoutAnimation = withoutAnimation
  }

  /** Close the sidebar with optional animation flag */
  const closeSidebar = (withoutAnimation: boolean) => {
    sidebar.opened = false
    sidebar.withoutAnimation = withoutAnimation
  }

  /** Change the current device type (e.g., Desktop, Mobile) */
  const toggleDevice = (value: DeviceEnum) => {
    device.value = value
  }

  return { device, sidebar, toggleSidebar, closeSidebar, toggleDevice }
})

/**
 * @description Use this in SPA before the Pinia instance is activated,
 * or in SSR to use the store outside of setup().
 */
export function useAppStoreOutside() {
  return useAppStore(pinia)
}
