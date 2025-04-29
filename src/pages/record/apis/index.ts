import { request } from "@/http/axios"
import { useUserStore } from "@/pinia/stores/user"

interface BorrowResponse {
  message?: string
  status?: string
  status_description?: string
  button_text?: string
  book_id?: number
  book_title?: string
  success?: boolean
  action?: string
  record_id?: number
  user_id?: number
  username?: string
  action_type?: string
  refresh_needed?: boolean
  expected_return_date?: string
  can_borrow?: boolean
  borrow_date?: string
  return_date?: string
  days_remaining?: number
  return_date_info?: string
}
/** Fetch borrow records */
export function getRecordsApi(
  title: string,
  page_size: number,
  page: number,
  status?: string,
  borrowerName?: string
) {
  const userStore = useUserStore()
  const isAdmin = userStore.roles.includes("admin")

  // Build basic pagination parameters
  const params: Record<string, any> = {
    page_size,
    page
  }

  // Handle user ID/name
  if (!isAdmin) {
    // Regular users can only view their own borrow records
    params.user_id = userStore.userId
  } else if (borrowerName) {
    // If admin enters borrower name, filter by name
    // Assuming backend accepts username parameter for filtering
    params.username = borrowerName
  }
  // When admin doesn't input specific username, don't pass user_id or username params, backend will return all records

  if (title) params.title = title
  if (status) params.status = status

  console.log("Borrow records API request parameters:", params)

  return request<any>({
    url: "borrow-records/",
    method: "get",
    params
  })
}
/** Fetch list of users */
export function getUserListApi() {
  return request<any>({
    url: `user/`,
    method: "get"
  })
}
/** Create or update a borrow/return request */
export function borrowBookApi(params: {
  id: number
  user: number
  book: number
  return_date?: string
  status: string
}) {
  const { id, user, book, return_date, status } = params
  if (id === 0) {
    // Create new borrow record
    return request<any>({
      url: `borrow-records/`,
      method: "post",
      data: {
        user,
        book,
        return_date,
        status
      }
    }).then((response) => {
      const data = response?.data || response || {}
      console.log("borrow book response:", data)
      return {
        message: data.message || "Borrow request submitted, waiting for admin approval",
        status: data.status || "pending",
        status_description: data.status_description || "Borrow request pending approval",
        button_text: data.button_text || "Waiting for Approval",
        book_id: data.book_id || book,
        book_title: data.book_title,
        success: data.success !== undefined ? data.success : true,
        action: data.action || "borrow_request"
      } as BorrowResponse
    })
  } else {
    // Update existing borrow record (e.g., return request)
    return request<any>({
      url: `borrow-records/${id}/`,
      method: "put",
      data: {
        user,
        book,
        return_date,
        status
      }
    }).then((response) => {
      const data = response?.data || response || {}
      console.log("update borrow record response:", data)
      return {
        message: data.message || (status === "approval" ? "Return request submitted, waiting for admin approval" : "Borrow record updated"),
        status: data.status || status,
        status_description: data.status_description || (status === "approval" ? "Return request pending approval" : "Record updated"),
        button_text: data.button_text || "Waiting for Approval",
        book_id: data.book_id || book,
        book_title: data.book_title,
        success: data.success !== undefined ? data.success : true,
        action: data.action || (status === "approval" ? "return_request" : "update_record")
      } as BorrowResponse
    })
  }
}
/** Approve a borrow or return request */
export function approveBookApi(record_id: number, status: string) {
  return request<any>({
    url: `borrow-records/${record_id}/approve/`,
    method: "post",
    data: {
      status
    }
  }).then((response) => {
    const data = response?.data || response || {}
    return {
      message: data.message || `Request ${status === "borrowed" ? "approved" : "rejected"}`,
      status: data.status || status,
      success: data.success !== undefined ? data.success : true,
      book_id: data.book_id,
      book_title: data.book_title,
      record_id: data.record_id,
      user_id: data.user_id,
      username: data.username,
      button_text: data.button_text,
      action_type: data.action_type,
      refresh_needed: data.refresh_needed !== undefined ? data.refresh_needed : true,
      expected_return_date: data.expected_return_date
    } as BorrowResponse
  })
}
/** Submit a return action for a borrowed book */
export function returnBookApi(id: number) {
  const userStore = useUserStore()

  return request<any>({
    url: `borrow-records/${id}/return/`,
    method: "post",
    data: {},
    params: {
      user_id: userStore.userId
    }
  }).then((response) => {
    const data = response?.data || response || {}
    return {
      message: data.message || "Book returned successfully",
      status: data.status || "returned",
      book_id: data.book_id,
      book_title: data.book_title,
      button_text: data.button_text || "Borrow"
    } as BorrowResponse
  })
}
/** Fetch pending borrow approvals */
export function getPendingApprovalsApi(page_size: number, page: number, username?: string) {
  return request<any>({
    url: "borrow-records/pending-approvals/",
    method: "get",
    params: {
      page_size,
      page,
      username
    }
  })
}
/** Fetch pending return approvals */
export function getApprovalReturnsApi(page_size: number, page: number, username?: string) {
  return request<any>({
    url: "borrow-records/approval-returns/",
    method: "get",
    params: {
      page_size,
      page,
      username
    }
  })
}
/** Check current status of a book */
export function checkBookStatusApi(book_id: number) {
  const userStore = useUserStore()
  return request<any>({
    url: `borrow-records/check-book-status/`,
    method: "get",
    params: {
      book_id,
      user_id: userStore.userId
    }
  }).then((response) => {
    const data = response?.data || response || {}
    const originalStatus = data.status || "available"
    let statusInfo = {
      status: originalStatus,
      status_description: data.status_description || "This book is available for borrowing",
      can_borrow: data.can_borrow !== undefined ? data.can_borrow : true
    }
    if (originalStatus === "borrowed" && data.record_id) {
      statusInfo = {
        status: "borrowed",
        status_description: "You have borrowed this book,please wait for approval",
        can_borrow: false
      }
    } else if (originalStatus === "pending") {
      statusInfo = {
        status: "pending",
        status_description: "You have requested to borrow this book; awaiting administrator approval",
        can_borrow: false
      }
    } else if (originalStatus === "approval") {
      statusInfo = {
        status: "approval",
        status_description: "You have requested to return this book; awaiting administrator approval",

        can_borrow: false
      }
    } else if (originalStatus === "rejected") {
      statusInfo = {
        status: "rejected",
        status_description: "Your borrow request was rejected; you may reapply",
        can_borrow: true
      }
    } else if (originalStatus === "returned" || originalStatus === "available") {
      statusInfo = {
        status: "available",
        status_description: "This book is available for borrowing",

        can_borrow: true
      }
    }
    return {
      book_id: data.book_id || book_id,
      ...statusInfo,
      record_id: data.record_id,
      borrow_date: data.borrow_date,
      return_date: data.return_date,
      expected_return_date: data.expected_return_date,
      days_remaining: data.days_remaining,
      return_date_info: data.return_date_info
    } as BorrowResponse
  })
}

export function rateBookApi(params: {
  book_id: number
  score: number
  comment: string
}) {
  return request<any>({
    url: "ratings/",
    method: "post",
    data: params
  }).then((response) => {
    const data = response?.data || response || {}
    return {
      success: data.success !== undefined ? data.success : true,
      message: data.message || "Rating submitted successfully",
      book_id: data.book_id,
      score: data.score,
      comment: data.comment
    }
  })
}

/** Submit a return request for a borrowed book */
export function submitReturnRequestApi(recordId: number) {
  return request<any>({
    url: `borrow-records/${recordId}/return/`,
    method: "post",
    data: {
      status: "approval"
    }
  }).then((response) => {
    const data = response?.data || response || {}
    return {
      message: data.message || "Return request submitted, waiting for admin approval",
      status: data.status || "approval",
      status_description: data.status_description || "Return request pending approval",
      book_id: data.book_id,
      book_title: data.book_title,
      success: data.success !== undefined ? data.success : true,
      button_text: data.button_text || "Waiting for Approval"
    } as BorrowResponse
  })
}
