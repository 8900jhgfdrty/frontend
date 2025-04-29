import type { LayoutsConfig } from "@/layouts/config"
import type { Ref } from "vue"
import { layoutsConfig } from "@/layouts/config"
import { pinia } from "@/pinia"
import { setLayoutsConfig } from "@@/utils/cache/local-storage"

type SettingsStore = {
  // Use a mapped type to iterate over the keys of LayoutsConfig
  [Key in keyof LayoutsConfig]: Ref<LayoutsConfig[Key]>
}

type SettingsStoreKey = keyof SettingsStore

export const useSettingsStore = defineStore("settings", () => {
  // State object
  const state = {} as SettingsStore

  // Iterate over each key/value pair in layoutsConfig
  for (const [key, value] of Object.entries(layoutsConfig)) {
    // Create a reactive ref for each config value
    const refValue = ref(value)
    // @ts-expect-error ignore
    state[key as SettingsStoreKey] = refValue

    // Watch each reactive variable
    watch(refValue, () => {
      // On change, cache the updated settings
      const settings = getCacheData()
      setLayoutsConfig(settings)
    })
  }

  // Helper to collect current state values for caching
  const getCacheData = () => {
    const settings = {} as LayoutsConfig
    for (const [key, value] of Object.entries(state)) {
      // @ts-expect-error ignore
      settings[key as SettingsStoreKey] = value.value
    }
    return settings
  }

  return state
})

/**
 * @description In SPA applications, use this to access the store before the Pinia instance is activated.
 * @description In SSR applications, use this to access the store outside of setup().
 */
export function useSettingsStoreOutside() {
  return useSettingsStore(pinia)
}
