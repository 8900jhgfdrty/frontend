import { request } from "@/http/axios"

export function getPopularBooksApi(top_n: number, add_ai_summary: boolean = false) {
  return request<any>({
    url: "recommendations/popular_books_analysis/",
    method: "get",
    params: {
      top_n,
      add_ai_summary
    }
  })
}
export function getPredictiveApi(future_days: number = 30) {
  return request<any>({
    url: "recommendations/predictive_analysis/",
    method: "get",
    params: {
      future_days
    }
  })
}
