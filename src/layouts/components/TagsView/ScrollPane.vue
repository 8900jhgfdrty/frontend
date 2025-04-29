<script lang="ts" setup>
import type { ElScrollbar } from "element-plus"
import type { RouterLink } from "vue-router"
import { useSettingsStore } from "@/pinia/stores/settings"
import Screenfull from "@@/components/Screenfull/index.vue"
import { useRouteListener } from "@@/composables/useRouteListener"
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue"

interface Props {
  tagRefs: InstanceType<typeof RouterLink>[]
}

const props = defineProps<Props>()
const route = useRoute()
const settingsStore = useSettingsStore()
const { listenerRouteChange } = useRouteListener()

/** Reference to the scrollbar component */
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

/** Reference to the scrollbar content container */
const scrollbarContentRef = ref<HTMLDivElement>()

/** Current scroll offset from the left */
let currentScrollLeft = 0

/** Distance to scroll on each step */
const translateDistance = 200

/** Triggered on scrollbar scroll */
function scroll({ scrollLeft }: { scrollLeft: number }) {
  currentScrollLeft = scrollLeft
}

/** Triggered on mouse wheel scroll */
function wheelScroll({ deltaY }: WheelEvent) {
  if (deltaY < 0) {
    scrollTo("left")
  } else {
    scrollTo("right")
  }
}

/** Compute widths needed for scrolling calculations */
function getWidth() {
  const contentWidth = scrollbarContentRef.value!.clientWidth
  const containerWidth = scrollbarRef.value!.wrapRef!.clientWidth
  const remaining = contentWidth - containerWidth - currentScrollLeft
  return { contentWidth, containerWidth, remaining }
}

/** Scroll left or right by given distance */
function scrollTo(direction: "left" | "right", distance: number = translateDistance) {
  const { contentWidth, containerWidth, remaining } = getWidth()
  // If no horizontal scrollbar, do nothing
  if (containerWidth >= contentWidth) return

  let scrollLeft = 0
  if (direction === "left") {
    scrollLeft = Math.max(0, currentScrollLeft - distance)
  } else {
    scrollLeft = Math.min(currentScrollLeft + distance, currentScrollLeft + remaining)
  }
  scrollbarRef.value!.setScrollLeft(scrollLeft)
}

/** Ensure the active tag is visible by scrolling if necessary */
function moveTo() {
  for (const link of props.tagRefs) {
    // @ts-expect-error ignore
    if (route.path === link.$props.to.path) {
      // @ts-expect-error ignore
      const el: HTMLElement = link.$el
      const offset = el.offsetLeft
      const width = el.offsetWidth
      const { containerWidth } = getWidth()

      // If tag is left of view
      if (offset < currentScrollLeft) {
        scrollTo("left", currentScrollLeft - offset)
        return
      }
      // If tag is right of view
      const visibleRight = containerWidth + currentScrollLeft - width
      if (offset > visibleRight) {
        scrollTo("right", offset - visibleRight)
        return
      }
    }
  }
}

// Listen for route changes to move to the active tag
listenerRouteChange(() => {
  nextTick(moveTo)
})
</script>

<template>
  <div class="scroll-container">
    <el-tooltip content="Scroll tags left (click when overflow)">
      <el-icon class="arrow left" @click="scrollTo('left')">
        <ArrowLeft />
      </el-icon>
    </el-tooltip>

    <el-scrollbar
      ref="scrollbarRef"
      @wheel.passive="wheelScroll"
      @scroll="scroll"
    >
      <div ref="scrollbarContentRef" class="scrollbar-content">
        <slot />
      </div>
    </el-scrollbar>

    <el-tooltip content="Scroll tags right (click when overflow)">
      <el-icon class="arrow right" @click="scrollTo('right')">
        <ArrowRight />
      </el-icon>
    </el-tooltip>

    <Screenfull
      v-if="settingsStore.showScreenfull"
      :content="true"
      class="screenfull"
    />
  </div>
</template>

<style lang="scss" scoped>
.scroll-container {
  height: 100%;
  user-select: none;
  display: flex;
  justify-content: space-between;

  .arrow {
    width: 40px;
    height: 100%;
    font-size: 18px;
    cursor: pointer;

    &.left {
      box-shadow: 5px 0 5px -6px var(--el-border-color-darker);
    }
    &.right {
      box-shadow: -5px 0 5px -6px var(--el-border-color-darker);
    }
  }

  .el-scrollbar {
    flex: 1;
    white-space: nowrap; // Prevent wrapping, show horizontal scrollbar when overflow
    .scrollbar-content {
      display: inline-block;
    }
  }

  .screenfull {
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
</style>
