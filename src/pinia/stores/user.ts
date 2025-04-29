import { resetCacheRoles, resetCacheUserInfo, setCacheRoles, setCacheUserInfo } from "@/common/utils/cache/local-storage"
import { pinia } from "@/pinia"
import { resetRouter } from "@/router"
import { routerConfig } from "@/router/config"
import { getCurrentUserApi } from "@@/apis/users"
import { setToken as _setToken, getToken, removeToken } from "@@/utils/cache/cookies"
import { useSettingsStore } from "./settings"
import { useTagsViewStore } from "./tags-view"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")
  const roles = ref<string[]>([])
  const username = ref<string>("")
  const userId = ref<string>("")

  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** Set the authentication token */
  const setToken = (value: string) => {
    _setToken(value)
    token.value = value
  }
  const setRoles = (value: string[]) => {
    roles.value = value
  }

  const userMap: Record<number, string> = {
    0: "user",
    1: "admin",
    2: "root"
  }
  /** Fetch user details and initialize state */
  const getInfo = async (data: { username: string, user_id: string, user_type: string | number }) => {
    username.value = data.username
    userId.value = String(data.user_id)

    // Ensure user_type is valid and exists in userMap
    let userType = 0 // default to 'user'
    try {
      // Normalize user_type to a number
      const typeNumber = typeof data.user_type === "string"
        ? Number.parseInt(data.user_type, 10)
        : Number(data.user_type)
      if (!Number.isNaN(typeNumber) && Object.prototype.hasOwnProperty.call(userMap, typeNumber)) {
        userType = typeNumber
      }
    } catch (error) {
      console.error("Error converting user_type:", error)
    }
    // Determine role based on user type
    const role = userMap[userType]
    // Update roles array
    const roleArray = [role]
    roles.value = roleArray
    setCacheRoles(roleArray)

    // Save user info to local storage
    setCacheUserInfo({
      username: username.value,
      userId: Number(userId.value),
      user_type: String(userType)
    })

    console.log("Final user info set:", {
      username: username.value,
      userId: userId.value,
      user_type: userType,
      roles: roleArray
    })

    // 在登录成功后添加：
    console.log("登录用户信息:", {
      username: username.value,
      user_type: userType,
      typeof_user_type: typeof userType
    })
  }
  /** Simulate role change by updating token and reloading */
  const changeRoles = (role: string) => {
    const newToken = `token-${role}`
    token.value = newToken
    _setToken(newToken)
    // Reload page instead of re-login
    location.reload()
  }
  /** Log out the user */
  const logout = () => {
    console.log("Executing logout operation")
    removeToken()
    token.value = ""
    roles.value = []
    username.value = ""
    userId.value = ""
    resetRouter()
    resetTagsView()
    resetCacheRoles()
    resetCacheUserInfo()
  }

  /** Reset the authentication token */
  const resetToken = () => {
    console.log("Resetting token")
    removeToken()
    token.value = ""
    roles.value = []
    username.value = ""
    userId.value = ""
    resetCacheRoles()
    resetCacheUserInfo()
  }

  /** Clear visited and cached tag views if caching is disabled */
  const resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  const setUserName = (name: string) => {
    username.value = name
  }

  const setUserId = (id: number | string) => {
    userId.value = String(id)
  }

  return {
    token,
    roles,
    username,
    userId,
    setToken,
    getInfo,
    changeRoles,
    logout,
    resetToken,
    setRoles,
    setUserName,
    setUserId
  }
})

/**
 * @description In SPA applications, use before the Pinia instance is activated.
 * @description In SSR applications, use outside of setup().
 */
export function useUserStoreOutside() {
  return useUserStore(pinia)
}
