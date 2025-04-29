<script lang="ts" setup>
import { useAppStore } from "@/pinia/stores/app"
import { useSettingsStore } from "@/pinia/stores/settings"
import { useUserStore } from "@/pinia/stores/user"
import Screenfull from "@@/components/Screenfull/index.vue"
import SearchMenu from "@@/components/SearchMenu/index.vue"
import ThemeSwitch from "@@/components/ThemeSwitch/index.vue"
import { useDevice } from "@@/composables/useDevice"
import { useLayoutMode } from "@@/composables/useLayoutMode"
import { UserFilled } from "@element-plus/icons-vue"
import { Breadcrumb, Hamburger, Sidebar } from "../index"

const { isMobile } = useDevice()
const { isTop } = useLayoutMode()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

/** Toggle the sidebar open/closed */
function toggleSidebar() {
  appStore.toggleSidebar(false)
}

/** Log out the current user */
function logout() {
  userStore.logout()
  router.push("/login")
}
</script>

<template>
  <section class="navigation-bar">
    <Hamburger
      v-if="!isTop || isMobile"
      :is-active="appStore.sidebar.opened"
      class="hamburger"
      @toggle-click="toggleSidebar"
    />
    <Breadcrumb v-if="!isTop || isMobile" class="breadcrumb" />
    <Sidebar v-if="isTop && !isMobile" class="sidebar" />
    <div class="right-menu">
      <el-dropdown>
        <div class="right-menu-item user">
          <el-avatar :icon="UserFilled" :size="30" />
          <span>{{ userStore.username }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item divided @click="logout">
              Logout
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.navigation-bar {
  height: var(--v3-navigationbar-height);
  overflow: hidden;
  color: var(--v3-navigationbar-text-color);
  display: flex;
  justify-content: space-between;

  .hamburger {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 15px;
    cursor: pointer;
  }

  .breadcrumb {
    flex: 1;
    @media screen and (max-width: 576px) {
      display: none;
    }
  }

  .sidebar {
    flex: 1;
    min-width: 0;
    :deep(.el-menu) {
      background-color: transparent;
    }
    :deep(.el-sub-menu) {
      &.is-active {
        .el-sub-menu__title {
          color: var(--el-color-primary);
        }
      }
    }
  }

  .right-menu {
    margin-right: 10px;
    height: 100%;
    display: flex;
    align-items: center;

    &-item {
      margin: 0 10px;
      cursor: pointer;
      &:last-child {
        margin-left: 20px;
      }
    }

    .user {
      display: flex;
      align-items: center;
      .el-avatar {
        margin-right: 10px;
      }
      span {
        font-size: 16px;
      }
    }
  }
}
</style>
