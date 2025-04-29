import type { AxiosInstance, AxiosRequestConfig } from "axios"
import { useUserStore } from "@/pinia/stores/user"
import { getToken } from "@@/utils/cache/cookies"
import axios from "axios"
import { get, merge } from "lodash-es"

/** Log out the user and force a full page reload (will redirect to login) */
function logout() {
  useUserStore().logout()
  location.reload()
}

/** Create and configure an Axios instance */
function createInstance() {
  const instance = axios.create()

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Detailed logging for login requests
      if (config.url?.includes("login")) {
        console.log("Sending login request, payload:", JSON.stringify(config.data))
      }
      return config
    },
    error => Promise.reject(error)
  )

  // Response interceptor (adjust as needed for your API)
  instance.interceptors.response.use(
    (response) => {
      try {
        const apiData = response.data
        const responseType = response.request?.responseType

        // Return binary data directly
        if (responseType === "blob" || responseType === "arraybuffer") {
          return apiData
        }

        // Log response data for debugging
        console.log(`Response from ${response.config.url} (status ${response.status}):`, apiData)

        // Handle case where response is a string instead of JSON
        if (typeof apiData === "string") {
          console.warn(`Response from ${response.config.url} is a string, not JSON:`, apiData)
          return { data: apiData, message: "Action successful" }
        }

        // Special handling for login endpoint
        if (response.config.url?.includes("login")) {
          console.log("Full login response:", {
            status: response.status,
            statusText: response.statusText,
            data: apiData
          })
          // Return raw data so the login component can handle it
          return apiData
        }

        // deal with 201 Created
        if (response.status === 201) {
          console.log("Resource created successfully:", response.config.url)
          return {
            success: true,
            message: "Action successful",
            data: apiData
          }
        }

        // Handle Django REST Framework or Flask style responses
        // that return data directly without a code field
        if (response.status === 200 || response.status === 201) {
          // If no code field is present, assume it's a successful direct data response
          if (apiData.code === undefined) {
            // wrap the original response, ensure the return standard format
            if (!apiData.message && !apiData.success) {
              // if the standard field is missing, add it
              const wrappedData = { ...apiData }
              if (wrappedData.message === undefined) {
                wrappedData.message = "Action successful"
              }
              if (wrappedData.success === undefined) {
                wrappedData.success = true
              }
              return wrappedData
            }
            return apiData
          }

          // Otherwise, process based on the code field
          switch (apiData.code) {
            case 0:
              // code === 0 indicates success
              return apiData
            case 401:
              // Token expired
              return logout()
            case 2002:
              // Permission error
              console.log("Permission error: user type mismatch", apiData)
              return apiData
            default:
              // Other business error codes
              console.error("API error:", apiData)
              ElMessage.error(apiData.message || "Error")
              return Promise.reject(new Error("Error"))
          }
        }

        // Return response data for all other successful responses
        return apiData
      } catch (err) {
        console.error("Error in response interceptor:", err)
        return { data: response.data, message: "操作成功", success: true } // 确保返回标准格式
      }
    },
    (error) => {
      const status = get(error, "response.status")
      const message = get(error, "response.data.message")
      const code = get(error, "response.data.code")

      // Handle user-type mismatch error (2002) without rejecting the promise
      if (code === 2002) {
        console.log("Caught permission error (2002)", error.response?.data)
        // Resolve with error data so login component handles it
        return Promise.resolve({
          code: 2002,
          message: message || ["You do not have permission to log in with this role"]
        })
      }

      // Map HTTP status codes to user-friendly messages
      switch (status) {
        case 400:
          console.error("Bad Request (400):", error.response?.data)
          console.error("Request URL:", error.config?.url)
          console.error("Request method:", error.config?.method)
          console.error("Request payload:", error.config?.data)
          console.error("Full error object:", error)

          if (error.response?.data?.errors) {
            console.error("Validation errors:", error.response.data.errors)
            error.message = `Invalid data: ${JSON.stringify(error.response.data.errors)}`
          } else if (error.response?.data?.title) {
            console.error("Title error:", error.response.data.title)
            // add title error to error.message for display
            if (Array.isArray(error.response.data.title)) {
              error.message = error.response.data.title[0] || "Title error"
            } else {
              error.message = error.response.data.title || "Title error"
            }
            // let the component handle the error
            return Promise.reject(error)
          } else if (error.response?.data?.detail) {
            // handle errors with the detail field
            error.message = error.response.data.detail || "Request error"
            return Promise.reject(error)
          } else {
            error.message = message || "Invalid data"
          }
          break
        case 401:
          // Token expired or unauthorized
          error.message = message || "Unauthorized"
          logout()
          break
        case 403:
          error.message = message || "Forbidden"
          break
        case 404:
          error.message = "Not Found"
          break
        case 408:
          error.message = "Request Timeout"
          break
        case 500:
          error.message = "Internal Server Error"
          break
        case 501:
          error.message = "Not Implemented"
          break
        case 502:
          error.message = "Bad Gateway"
          break
        case 503:
          error.message = "Service Unavailable"
          break
        case 504:
          error.message = "Gateway Timeout"
          break
        case 505:
          error.message = "HTTP Version Not Supported"
          break
      }

      // For title-duplication or validation errors, let the component handle them
      if (status === 400 && (error.response?.data?.title || error.response?.data?.errors)) {
        return Promise.reject(error)
      }

      ElMessage.error(error.message)
      return Promise.reject(error)
    }
  )

  return instance
}

/** Wrap an Axios instance to provide a typed request function */
function createRequest(instance: AxiosInstance) {
  return <T>(config: AxiosRequestConfig): Promise<T> => {
    const token = getToken()
    const defaultConfig: AxiosRequestConfig = {
      baseURL: import.meta.env.VITE_BASE_URL,
      headers: {
        "Authorization": token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json"
      },
      data: {},
      timeout: 5000,
      withCredentials: false
    }
    const mergedConfig = merge(defaultConfig, config)
    return instance(mergedConfig)
  }
}

const instance = createInstance()
export const request = createRequest(instance)
