import { request } from "@/http/axios"

/** Fetch the user list */
export function getUserListApi(username: string, page_size: number, page: number) {
  return request<any>({
    url: `user/`,
    method: "get",
    params: {
      username,
      page_size,
      page
    }
  })
}

/** Fetch the list of user types */
export function getUserTypesApi() {
  return request<any>({
    url: "user/user-types/",
    method: "get"
  })
}

/** Add a new user */
export function addUsersApi(username: string, password: string, user_type: string) {
  return request<any>({
    url: "user/",
    method: "post",
    data: {
      username,
      password,
      user_type
    }
  })
}

/** Update an existing user */
export function editUsersApi(id: number, username: string, password: string, user_type?: string) {
  return request<any>({
    url: `user/${id}/`,
    method: "put",
    data: {
      id,
      username,
      password,
      user_type
    }
  })
}

/** Delete a user */
export function deleteUsersApi(id: number) {
  return request<any>({
    url: `user/${id}/`,
    method: "delete"
  })
}

// 定义用户类型检查结果的接口
interface UsernameCheckResult {
  exists: boolean
  error?: boolean
}

export function checkUsernameExistsApi(username: string) {
  return request<any>({
    url: `user/`,
    method: "get",
    params: {
      username,
      page_size: 1,
      page: 1
    }
  }).then((response) => {
    // 处理可能的不同响应格式
    const responseData = response || {}
    const data = responseData.data || responseData

    // 安全检查，确保data和data.results都存在
    let exists = false
    try {
      if (data) {
        if (Array.isArray(data)) {
          // 如果直接返回数组
          exists = data.some((user: any) => user.username === username)
        } else if (data.results && Array.isArray(data.results)) {
          // 如果返回分页对象
          exists = data.results.length > 0
            && data.results.some((user: any) => user.username === username)
        } else if (typeof data === "object" && "exists" in data) {
          // 如果已经包含exists字段
          exists = Boolean(data.exists)
        }
      }
    } catch (error) {
      console.error("Error checking username existence:", error)
    }

    return { data: { exists } as UsernameCheckResult }
  }).catch((error) => {
    console.error("Username check API error:", error)
    // 返回一个默认值，避免错误传播
    return { data: { exists: false, error: true } as UsernameCheckResult }
  })
}

// 定义用户类型接口
export interface UserType {
  value: string | number
  label: string
}

/**
 * 转换用户类型API响应为一致的格式
 * @param data API返回的数据
 * @returns 标准化的用户类型数组
 */
export function normalizeUserTypes(data: any): UserType[] {
  if (!data) return []

  // 如果已经是数组格式
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (typeof item === "object" && item !== null) {
        // 确保每个项都有value和label属性
        return {
          value: "value" in item ? item.value : ("id" in item ? item.id : ""),
          label: "label" in item ? item.label : ("name" in item ? item.name : "未知类型")
        }
      } else {
        // 如果是原始类型，使用它作为value和label
        return { value: item, label: String(item) }
      }
    })
  }

  // 如果是对象格式，将其转换为数组
  if (typeof data === "object" && data !== null) {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === "object" && value !== null && "value" in value && "label" in value) {
        // 已经是 { value, label } 格式
        return value as UserType
      } else {
        // 将键作为值，值作为标签
        return { value: key, label: typeof value === "string" ? value : String(value) }
      }
    })
  }

  return []
}
