import { LayoutModeEnum } from "@@/constants/app-key"
import { getLayoutsConfig } from "@@/utils/cache/local-storage"

/** Layout configuration type */
export interface LayoutsConfig {
  /** Whether to show the settings button and panel */
  showSettings: boolean
  /** Layout mode */
  layoutMode: LayoutModeEnum
  /** Whether to show the tags view */
  showTagsView: boolean
  /** Whether to show the logo */
  showLogo: boolean
  /** Whether to fix the header */
  fixedHeader: boolean
  /** Whether to show the footer */
  showFooter: boolean
  /** Whether to show notifications */
  showNotify: boolean
  /** Whether to show the theme switch button */
  showThemeSwitch: boolean
  /** Whether to show the full‑screen button */
  showScreenfull: boolean
  /** Whether to show the search button */
  showSearchMenu: boolean
  /** Whether to cache the tags view */
  cacheTagsView: boolean
  /** Whether to enable system watermark */
  showWatermark: boolean
  /** Whether to enable grey‑scale mode */
  showGreyMode: boolean
  /** Whether to enable color‑weakness mode */
  showColorWeakness: boolean
}

/** Default layout configuration */
const DEFAULT_CONFIG: LayoutsConfig = {
  layoutMode: LayoutModeEnum.Left,
  showSettings: true,
  showTagsView: true,
  fixedHeader: true,
  showFooter: true,
  showLogo: true,
  showNotify: true,
  showThemeSwitch: false,
  showScreenfull: false,
  showSearchMenu: true,
  cacheTagsView: false,
  showWatermark: false,
  showGreyMode: false,
  showColorWeakness: false
}

/** Final project layout configuration, combining defaults and saved settings */
export const layoutsConfig: LayoutsConfig = {
  ...DEFAULT_CONFIG,
  ...getLayoutsConfig()
}
