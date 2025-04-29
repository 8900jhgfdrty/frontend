import { request } from "@/http/axios"
import { checkBookStatusApi } from "@/pages/record/apis/index"
import { useUserStore } from "@/pinia/stores/user"

/** Fetch a list of books */
export function getBooksApi(
  title: string,
  author: string,
  category: number | string,
  page_size: number,
  page: number
) {
  return request<any>({
    url: "books/",
    method: "get",
    params: {
      title,
      author,
      category,
      page_size,
      page
    }
  })
}

/** Create a new book */
export function addBooksApi(
  title: string,
  description: string,
  is_available: boolean,
  author: string,
  category: string
) {
  return request<any>({
    url: "books/",
    method: "post",
    data: {
      title,
      description,
      is_available,
      author,
      category
    }
  })
}

/** Update an existing book */
export function editBooksApi(
  id: number,
  title: string,
  description: string,
  is_available: boolean,
  author: string,
  category: string
) {
  return request<any>({
    url: `books/${id}/`,
    method: "put",
    data: {
      title,
      description,
      is_available,
      author,
      category
    }
  })
}

/** Delete a book */
export function deleteBooksApi(id: number) {
  return request<any>({
    url: `books/${id}/`,
    method: "delete"
  })
}

/** Fetch the list of all authors */
export function getAuthorListApi() {
  return request<any>({
    url: `authors/`,
    method: "get",
    params: {
      page_size: 1000 // ensure all authors are retrieved
    }
  })
}

/** Fetch the list of all categories */
export function getCategoryApi() {
  return request<any>({
    url: `categories/`,
    method: "get",
    params: {
      page_size: 100 // set large enough value to load all categories
    }
  })
}

/** Create a borrow record for a user */
export function borrowBookApi(params: {
  user: number
  book: number
  return_date: string
  status: string
}) {
  const { user, book, return_date, status } = params
  return request<any>({
    url: `borrow-records/`,
    method: "post",
    data: {
      user,
      book,
      return_date,
      status
    }
  })
}

/** Rate a book */
export function rateBookApi(params: {
  book_id: number
  score: number
  comment: string
  user_id: number
}) {
  return request<any>({
    url: "ratings/",
    method: "post",
    data: {
      book: params.book_id,
      score: params.score,
      comment: params.comment,
      user: params.user_id
    }
  }).then((response) => {
    const data = response?.data || response || {}
    return {
      success: data.success !== undefined ? data.success : true,
      message: data.message || "Rating submitted successfully",
      book_id: data.book_id,
      score: data.score,
      comment: data.comment
    }
  }).catch((error) => {
    // Handle errors returned from the backend
    if (error.response?.data?.non_field_errors) {
      return {
        success: false,
        message: error.response.data.non_field_errors[0],
        data: error.response.data
      }
    }
    throw error
  })
}

// Export common function to maintain API compatibility
export { checkBookStatusApi }
