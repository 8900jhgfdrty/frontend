export interface CreateOrUpdateTableRequestData {
  id?: number
  username: string
  password?: string
}

export interface TableRequestData {
  /** current page */
  currentPage: number
  /** query size */
  size: number
  /** query parameter: username */
  username?: string
  /** query parameter: phone */
  phone?: string
}

export interface TableData {
  id: string
  user_type: string
  email: string
  roles: string
  username: string
}
export interface BookData {
  id: number
  title: string
  description?: string
  author: number
  category: number
}
export type TableResponseData = ApiResponseData<{
  list: TableData[]
  total: number
}>
export interface AnnouncementsTableData {
  id: number
  title: string
  content: string
  is_visible: boolean
  created_at: string
  updated_at: string
  published_at: string
}
export interface AnnouncementsResponceItem {
  results: TableData[]
  per_page_size: number
  total_size: number
  links: {
    next: any
    previous: any
  }
}

export type AnnouncementResponce = ApiResponseData<AnnouncementsResponceItem>

export type Authors = {
  id: number
  name: string
  bio: string
}[]

export type AuthorsResponce = ApiResponseData<Authors>
