<script lang="ts" setup>
import { useSettingsStore } from "@/pinia/stores/settings"
import { useTagsViewStore } from "@/pinia/stores/tags-view"
import { Footer } from "../index"

const tagsViewStore = useTagsViewStore()
const settingsStore = useSettingsStore()
</script>

<template>
  <section class="app-main">
    <div class="app-scrollbar">
      <!-- Use route.path as key (more generic than fullPath) -->
      <router-view v-slot="{ Component, route }">
        <transition name="el-fade-in" mode="out-in">
          <keep-alive :include="tagsViewStore.cachedViews">
            <component :is="Component" :key="route.path" class="app-container-grow" />
          </keep-alive>
        </transition>
      </router-view>
      <!-- Footer -->
      <Footer v-if="settingsStore.showFooter" />
    </div>
    <!-- Back to top -->
    <el-backtop />
    <!-- Back to top (for fixed Header layouts) -->
    <el-backtop target=".app-scrollbar" />
  </section>
</template>

<style lang="scss" scoped>
@import "@@/assets/styles/mixins.scss";

.app-main {
  width: 100%;
  display: flex;
}

.app-scrollbar {
  flex-grow: 1;
  overflow: auto;
  @extend %scrollbar;
  display: flex;
  flex-direction: column;

  .app-container-grow {
    flex-grow: 1;
  }
}
</style>
