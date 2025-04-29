interface PaginationData {
  total?: number
  currentPage?: number
  pageSizes?: number[]
  pageSize?: number
  layout?: string
}

/** Default pagination parameters */
const DEFAULT_PAGINATION_DATA = {
  total: 0,
  currentPage: 1,
  pageSizes: [10, 20, 50],
  pageSize: 10,
  layout: "total, sizes, prev, pager, next, jumper"
}

/** Pagination Composable */
export function usePagination(initPaginationData: PaginationData = {}) {
  // Merge pagination parameters
  const paginationData = reactive({ ...DEFAULT_PAGINATION_DATA, ...initPaginationData })
  // Change current page number
  const handleCurrentChange = (value: number) => {
    paginationData.currentPage = value
  }
  // Change the number of items per page
  const handleSizeChange = (value: number) => {
    paginationData.pageSize = value
  }

  return { paginationData, handleCurrentChange, handleSizeChange }
}
