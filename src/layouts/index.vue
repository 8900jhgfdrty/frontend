<script lang="ts" setup>
import { useSettingsStore } from "@/pinia/stores/settings"
import { useDevice } from "@@/composables/useDevice"
import { useLayoutMode } from "@@/composables/useLayoutMode"
import { useWatermark } from "@@/composables/useWatermark"
import { getCssVar, setCssVar } from "@@/utils/css"
import { useResize } from "./composables/useResize"
import LeftMode from "./modes/LeftMode.vue"

// Enable responsive layout adjustments on window resize
useResize()

const { setWatermark, clearWatermark } = useWatermark()
const { isMobile } = useDevice()
const { isLeft, isTop, isLeftTop } = useLayoutMode()
const settingsStore = useSettingsStore()
const { showSettings, showTagsView, showWatermark } = storeToRefs(settingsStore)

// #region When hiding the tags view, set its height CSS variable to 0
// This keeps the Logo component height matching the Header height
const cssVarName = "--v3-tagsview-height"
const originalTagsViewHeight = getCssVar(cssVarName)
watchEffect(() => {
  if (showTagsView.value) {
    setCssVar(cssVarName, originalTagsViewHeight)
  } else {
    setCssVar(cssVarName, "0px")
  }
})
// #endregion

// Enable or disable the system watermark based on the setting
watchEffect(() => {
  if (showWatermark.value) {
    setWatermark(import.meta.env.VITE_APP_TITLE)
  } else {
    clearWatermark()
  }
})
</script>

<template>
  <div>
    <!-- Render the LeftMode layout -->
    <LeftMode />
  </div>
</template>
