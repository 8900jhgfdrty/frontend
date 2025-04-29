import type * as Users from "./type"
import { request } from "@/http/axios"

/** get current user details */
export function getCurrentUserApi() {
  return request<Users.CurrentUserResponseData>({
    url: "users/me",
    method: "get"
  })
}
