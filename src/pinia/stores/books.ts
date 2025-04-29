import { pinia } from "@/pinia"

export const useUserStore = defineStore("user", () => {
  const authorLIst = ref<any[]>([])
  const categoryList = ref<any[]>([])

  const setAuthorList = (list: any[]) => {
    authorLIst.value = list
  }

  const setCategoryList = (list: any[]) => {
    categoryList.value = list
  }

  return { authorLIst, categoryList, setAuthorList, setCategoryList }
})

/**
 * @description In SPA applications, can be used to access the store before the Pinia instance is activated.
 * @description In SSR applications, can be used to access the store outside of setup().
 */
export function useUserStoreOutside() {
  return useUserStore(pinia)
}
