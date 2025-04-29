// Unified localStorage utilities

import type { LayoutsConfig } from "@/layouts/config"
import type { TagView } from "@/pinia/stores/tags-view"
import type { ThemeName } from "@@/composables/useTheme"
import type { SidebarClosed, SidebarOpened } from "@@/constants/app-key"
import { CacheKey } from "@@/constants/cache-key"

// #region Layout configuration

/** Retrieve saved layout settings */
export function getLayoutsConfig(): LayoutsConfig | null {
  const json = localStorage.getItem(CacheKey.CONFIG_LAYOUT)
  return json ? (JSON.parse(json) as LayoutsConfig) : null
}

/** Save layout settings */
export function setLayoutsConfig(settings: LayoutsConfig): void {
  localStorage.setItem(CacheKey.CONFIG_LAYOUT, JSON.stringify(settings))
}

/** Remove saved layout settings */
export function removeLayoutsConfig(): void {
  localStorage.removeItem(CacheKey.CONFIG_LAYOUT)
}

// #endregion

// #region Sidebar status

/** Get saved sidebar open/closed state */
export function getSidebarStatus(): SidebarOpened | SidebarClosed | null {
  return localStorage.getItem(CacheKey.SIDEBAR_STATUS) as SidebarOpened | SidebarClosed | null
}

/** Save sidebar open/closed state */
export function setSidebarStatus(sidebarStatus: SidebarOpened | SidebarClosed): void {
  localStorage.setItem(CacheKey.SIDEBAR_STATUS, sidebarStatus)
}

// #endregion

// #region Active theme

/** Get the currently active theme name */
export function getActiveThemeName(): ThemeName | null {
  return localStorage.getItem(CacheKey.ACTIVE_THEME_NAME) as ThemeName | null
}

/** Set the active theme name */
export function setActiveThemeName(themeName: ThemeName): void {
  localStorage.setItem(CacheKey.ACTIVE_THEME_NAME, themeName)
}

// #endregion

// #region Tags view cache

/** Get list of visited views from cache */
export function getVisitedViews(): TagView[] {
  const json = localStorage.getItem(CacheKey.VISITED_VIEWS)
  return JSON.parse(json ?? "[]") as TagView[]
}

/** Save visited views to cache */
export function setVisitedViews(views: TagView[]): void {
  views.forEach(view => {
    // Remove unnecessary properties to avoid circular references
    delete view.matched
    delete view.redirectedFrom
  })
  localStorage.setItem(CacheKey.VISITED_VIEWS, JSON.stringify(views))
}

/** Get list of cached component names */
export function getCachedViews(): string[] {
  const json = localStorage.getItem(CacheKey.CACHED_VIEWS)
  return JSON.parse(json ?? "[]") as string[]
}

/** Save list of cached component names */
export function setCachedViews(views: string[]): void {
  localStorage.setItem(CacheKey.CACHED_VIEWS, JSON.stringify(views))
}

// #endregion

// #region Roles cache

/** Get cached user roles */
export function getCacheRoles(): string[] {
  const json = localStorage.getItem(CacheKey.CACHED_ROLES)
  return JSON.parse(json ?? "[]") as string[]
}

/** Save user roles to cache */
export function setCacheRoles(roles: string[]): void {
  localStorage.setItem(CacheKey.CACHED_ROLES, JSON.stringify(roles))
}

/** Remove cached user roles */
export function resetCacheRoles(): void {
  localStorage.removeItem(CacheKey.CACHED_ROLES)
}

// #endregion

// #region User info cache

/** Interface for cached user info */
interface CachedUserInfo {
  username: string
  userId: number
  user_type?: string
}

/** Get cached user info */
export function getCacheUserInfo(): CachedUserInfo {
  const json = localStorage.getItem(CacheKey.CACHED_USER)
  return JSON.parse(json ?? "{}") as CachedUserInfo
}

/** Save user info to cache */
export function setCacheUserInfo(userInfo: CachedUserInfo): void {
  localStorage.setItem(CacheKey.CACHED_USER, JSON.stringify(userInfo))
}

/** Remove cached user info */
export function resetCacheUserInfo(): void {
  localStorage.removeItem(CacheKey.CACHED_USER)
}

// #endregion
