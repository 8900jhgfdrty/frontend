// import type * as Announcements from "./type"
import { request } from "@/http/axios"
import { useUserStore } from "@/pinia/stores/user"

export function getAnnouncementsApi(query: string) {
  return request<any>({
    url: "/books/top-rated/",
    method: "get",
    params: {
      query
    }
  })
}

/**     get author list */
export function getAuthorListApi() {
  return request<any>({
    url: `/authors/`,
    method: "get"
  })
}

/** get category list */
export function getCategoryApi() {
  return request<any>({
    url: `/categories/`,
    method: "get"
  })
}

/** borrow book */
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

/** get recommended books list */
export function getRecommendedBooksApi() {
  return request({
    url: "/ratings/recommended_books/",
    method: "get"
  })
}
