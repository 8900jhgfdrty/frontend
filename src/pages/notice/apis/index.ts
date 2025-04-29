import { request } from "@/http/axios"

interface AnnouncementResponse {
  success?: boolean
  message?: string
  data?: any
  is_visible?: boolean
  announcement?: any
}

interface ResponseData {
  data?: any
  message?: string
  success?: boolean
  is_visible?: boolean
  announcement?: any
}

/** Fetch announcement data */
export function getAnnouncementsApi(title: string, page_size: number, page: number) {
  return request<any>({
    url: "announcements/",
    method: "get",
    params: {
      title,
      page_size,
      page
    }
  })
}
/** Add a new announcement */
export function addAnnouncementsApi(title: string, content: string) {
  return request<any>({
    url: "announcements/",
    method: "post",
    data: {
      title,
      content
    }
  }).then((response) => {
    const responseObj: ResponseData = response || {}
    const data = responseObj.data !== undefined ? responseObj.data : responseObj
    return {
      success: responseObj.success !== undefined ? responseObj.success : true,
      message: responseObj.message || "Add announcement successfully",
      data
    } as AnnouncementResponse
  }).catch((error) => {
    if (error.response?.data?.title) {
      const titleError = Array.isArray(error.response.data.title)
        ? error.response.data.title[0]
        : error.response.data.title
      error.message = titleError || "Title validation failed"
    }
    throw error
  })
}

/** Edit an announcement */
export function editAnnouncementsApi(id: number, title: string, content: string) {
  return request<any>({
    url: `announcements/${id}/`,
    method: "put",
    data: {
      title,
      content
    }
  }).then((response) => {
    const data = response?.data || response || {}
    console.log("Edit announcement API response:", data)

    // Ensure we don't return the raw response directly
    return {
      success: data.success !== undefined ? data.success : true,
      message: data.message || "Announcement updated successfully",
      data: data.data || data
    } as AnnouncementResponse
  }).catch((error) => {
    console.error("Edit announcement API error:", error)
    throw error
  })
}

/** Delete an announcement */
export function deleteAnnouncementsApi(id: number) {
  return request<any>({
    url: `announcements/${id}/`,
    method: "delete"
  }).then((response) => {
    const data = response?.data || response || {}
    console.log("Delete announcement API response:", data)

    // Ensure we don't return the raw response directly
    return {
      success: data.success !== undefined ? data.success : true,
      message: data.message || "Announcement deleted successfully"
    } as AnnouncementResponse
  }).catch((error) => {
    console.error("Delete announcement API error:", error)
    throw error
  })
}

// Toggle announcement visibility
export function updateAnnouncementStatusApi(id: number) {
  return request({
    url: `announcements/${id}/toggle-visibility/`,
    method: "patch"
  }).then((response) => {
    // Handle safe type conversion
    const responseObj: ResponseData = response || {}
    const data = responseObj.data !== undefined ? responseObj.data : responseObj

    console.log("Toggle announcement visibility API response:", data)

    // Ensure we don't return the raw response directly
    return {
      success: responseObj.success !== undefined ? responseObj.success : true,
      message: responseObj.message || "Announcement status updated",
      is_visible: responseObj.is_visible,
      announcement: responseObj.announcement
    } as AnnouncementResponse
  }).catch((error) => {
    console.error("Toggle announcement visibility API error:", error)
    throw error
  })
}
