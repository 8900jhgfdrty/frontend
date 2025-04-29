import { request } from "@/http/axios"

/** Log in and return a token */
export function loginApi(data: {
  username: string
  password: string
  user_type: number
}) {
  return request<any>({
    url: "login/",
    method: "post",
    data
  })
}

/** Register a new user */
export function registerApi(data: {
  username: string
  password: string
}) {
  return request<any>({
    url: "register/",
    method: "post",
    data
  })
}
