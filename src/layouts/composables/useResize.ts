import { useAppStore } from "@/pinia/stores/app"
import { useRouteListener } from "@@/composables/useRouteListener"
import { DeviceEnum } from "@@/constants/app-key"

/** Based on Bootstrap’s breakpoints, treat widths under 992px as mobile */
const MAX_MOBILE_WIDTH = 992

/**
 * @name useResize
 * @description A composable that listens for window resize and route changes
 *              to adjust layout for mobile or desktop devices.
 */
export function useResize() {
  const appStore = useAppStore()
  const { listenerRouteChange } = useRouteListener()

  /** Determine if the current viewport should be considered mobile */
  const isMobile = () => {
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < MAX_MOBILE_WIDTH
  }

  /** Handle window resize events: toggle device type & close sidebar on mobile */
  const resizeHandler = () => {
    if (!document.hidden) {
      const mobile = isMobile()
      appStore.toggleDevice(mobile ? DeviceEnum.Mobile : DeviceEnum.Desktop)
      if (mobile) {
        appStore.closeSidebar(true)
      }
    }
  }

  /** On route change, if on mobile and sidebar is open, close it */
  listenerRouteChange(() => {
    if (appStore.device === DeviceEnum.Mobile && appStore.sidebar.opened) {
      appStore.closeSidebar(false)
    }
  })

  /** Before component mounts, start listening to resize events */
  onBeforeMount(() => {
    window.addEventListener("resize", resizeHandler)
  })

  /** After mounting, set initial device type and close sidebar if needed */
  onMounted(() => {
    if (isMobile()) {
      appStore.toggleDevice(DeviceEnum.Mobile)
      appStore.closeSidebar(true)
    }
  })

  /** Cleanup: remove the resize listener before unmounting */
  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeHandler)
  })
}
