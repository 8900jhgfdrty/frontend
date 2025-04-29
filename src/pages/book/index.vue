<script setup lang="ts" name="SystemDic">
import type { BookData } from "@/common/apis/tables/type"
import { request } from "@/http/axios"
import { useUserStore } from "@/pinia/stores/user"
import { FolderAdd, Refresh, Search } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { computed, defineAsyncComponent, onMounted, reactive, ref } from "vue"
import {
  checkBookStatusApi,
  deleteBooksApi,
  getAuthorListApi,
  getBooksApi,
  getCategoryApi
} from "./apis/index"

// Extend BookData interface to ensure it includes id
interface BookDataWithId extends BookData {
  id: number
}

const userStore = useUserStore()

// Lazy‑load the dialog component
const DicDialog = defineAsyncComponent(() => import("./components/dialog.vue"))

// Refs and reactive state
const dicDialogRef = ref()
const state = reactive<any>({
  tableData: {
    data: [] as any[],
    total: 0,
    loading: false,
    param: {
      pageNum: 1,
      pageSize: 10
    },
    authorList: [] as any[],
    categoryList: [] as any[]
  },
  searchForm: {
    title: "",
    author: "",
    category: ""
  }
})
const isAdmin = userStore.roles.includes("admin")
const isUser = userStore.roles.includes("user")

// Initialize table data
function getTableData() {
  const { title, author, category } = state.searchForm
  state.tableData.loading = true
  getBooksApi(
    title,
    author,
    category ? Number(category) : "", // make sure category is a number or empty string
    state.tableData.param.pageSize,
    state.tableData.param.pageNum
  )
    .then((response) => {
      const responseData = response || {}
      const data = responseData.data || responseData

      if (data && data.results && Array.isArray(data.results)) {
        state.tableData.data = data.results
        state.tableData.total = data.total_count || data.count || data.results.length
      } else if (Array.isArray(data)) {
        state.tableData.data = data
        state.tableData.total = data.length
      } else {
        console.error("Unexpected book list format:", data)
        state.tableData.data = []
        state.tableData.total = 0
      }
    })
    .catch((e) => {
      console.error("Error fetching books:", e)
      state.tableData.data = []
      state.tableData.total = 0
      ElMessage.error("Failed to get book list, please try again")
    })
    .finally(() => {
      state.tableData.loading = false
    })
}

// Open "Add Book" or "Edit Book" dialog
function onOpenAddDic(type: string) {
  dicDialogRef.value.openDialog(type, null)
}
function onOpenEditDic(type: string, row: BookDataWithId) {
  dicDialogRef.value.openDialog(type, row, state.tableData)
}

// Delete book
function onRowDel(row: BookDataWithId) {
  ElMessageBox.confirm(`Are you sure you want to delete "${row.title}"?`, "Confirmation", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(() => {
      deleteBooksApi(row.id)
        .then(() => {
          getTableData()
          ElMessage.success("Deletion successful")
        })
        .catch(() => {
          ElMessage.error("Deletion failed")
        })
    })
    .catch(() => {
      // User cancelled deletion
    })
}

// Page size changed
function onHandleSizeChange(val: number) {
  state.tableData.param.pageSize = val
  getTableData()
}

// Page number changed
function onHandleCurrentChange(val: number) {
  state.tableData.param.pageNum = val
  getTableData()
}

// Clear search form and reload
function clearData() {
  state.searchForm = {
    title: "",
    author: "",
    category: ""
  }
  getTableData()
}

// Helper to get author name by ID
const getAuthorName = computed(() => {
  return (id: number) => {
    const author = state.tableData.authorList.find((a: { id: number, name: string }) => a.id === id)
    return author ? author.name : id
  }
})

// Helper to get category name by ID
const getCategoryName = computed(() => {
  return (id: number) =>
    state.tableData.categoryList.find((a: { id: number, name: string }) => a.id === id)
      ?.name ?? id
})

function borrowBook(row: BookDataWithId) {
  const bookId = row.id
  checkBookStatusApi(bookId).then((bookData) => {
    const bookStatus = bookData.status
    if (bookStatus === "pending") {
      ElMessage.info(bookData.status_description || "You have already requested to borrow this book, waiting for admin approval")
    } else if (bookStatus === "borrowed") {
      ElMessage.info(bookData.status_description || "You have already borrowed this book, no need to borrow again")
    } else if (bookStatus === "approval") {
      ElMessage.info(bookData.status_description || "You have already requested to return this book, waiting for admin approval")
    } else if (
      bookStatus === "available"
      || bookStatus === "rejected"
      || bookStatus === "returned"
    ) {
      dicDialogRef.value.openDialog("borrow", row)
    } else {
      ElMessage.warning("Unable to determine the book status, please refresh and try again")
    }
  }).catch(() => {
    ElMessage.error("Failed to get book status, please refresh and try again")
  })
}

// Open "Rate Book" dialog
function rateBook(row: BookDataWithId) {
  if (!dicDialogRef.value) {
    ElMessage.error("Dialog component not loaded")
    return
  }
  dicDialogRef.value.openDialog("rate", row)
}

// On component mount
onMounted(() => {
  getAuthorListApi()
    .then((res) => {
      if (res.data && Array.isArray(res.data.results)) {
        state.tableData.authorList = res.data.results
      } else if (res.data && Array.isArray(res.data)) {
        state.tableData.authorList = res.data
      } else if (Array.isArray(res.results)) {
        state.tableData.authorList = res.results
      } else if (Array.isArray(res)) {
        state.tableData.authorList = res
      } else {
        state.tableData.authorList = []
      }
    })
    .catch((e) => {
      console.error("Cannot load author list:", e)
    })

  getCategoryApi()
    .then((res) => {
      if (res.data && res.data.results) {
        state.tableData.categoryList = res.data.results
        if (res.data.total_count > res.data.results.length) {
          console.warn(
            `Only loaded ${res.data.results.length} categories, total ${res.data.total_count}`
          )
        }
      } else if (res.results) {
        state.tableData.categoryList = res.results
        if (res.total_count > res.results.length) {
          console.warn(
            `Only loaded ${res.results.length} categories, total ${res.total_count}`
          )
        }
      } else if (Array.isArray(res)) {
        state.tableData.categoryList = res
      } else if (Array.isArray(res.data)) {
        state.tableData.categoryList = res.data
      } else {
        console.error("Cannot load category list:", res)
        state.tableData.categoryList = []
      }
    })
    .catch((e) => {
      console.error("Cannot load category list:", e)
    })

  getTableData()
})
</script>

<template>
  <div class="system-dic-container">
    <el-card shadow="hover">
      <div class="system-user-search mb15">
        <el-input
          v-model="state.searchForm.title"
          size="default"
          placeholder="Please enter book title"
          style="max-width: 260px"
        />
        <el-select
          v-model="state.searchForm.category"
          size="default"
          placeholder="Please select category"
          class="ml16"
          style="max-width: 260px"
        >
          <el-option
            v-for="item in state.tableData.categoryList.filter(cat => !cat.is_deleted)"
            :key="item.id"
            :value="item.id"
            :label="item.name"
          />
        </el-select>
        <el-button size="default" type="primary" class="ml10" @click="getTableData">
          <el-icon><Search /></el-icon>
          Search
        </el-button>
        <el-button size="default" type="info" class="ml10" @click="clearData">
          <el-icon><Refresh /></el-icon>
          Reset
        </el-button>
        <el-button
          v-if="isAdmin"
          size="default"
          type="success"
          class="ml10"
          @click="onOpenAddDic('add')"
        >
          <el-icon><FolderAdd /></el-icon>
          Add Book
        </el-button>
      </div>

      <el-table
        :data="state.tableData.data"
        v-loading="state.tableData.loading"
        style="width: 100%"
      >
        <el-table-column type="index" label="Index" width="80" />
        <el-table-column prop="title" label="Title" show-overflow-tooltip />
        <el-table-column prop="description" label="Description" show-overflow-tooltip />
        <el-table-column prop="author" label="Author" show-overflow-tooltip>
          <template #default="scope">
            {{ getAuthorName(scope.row.author) }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="Category" show-overflow-tooltip>
          <template #default="scope">
            {{ getCategoryName(scope.row.category) }}
          </template>
        </el-table-column>

        <el-table-column v-if="isAdmin" label="Actions" width="158">
          <template #default="scope">
            <el-button
              size="small"
              text
              type="primary"
              @click="onOpenEditDic('edit', scope.row)"
            >
              Edit
            </el-button>
            <el-button
              size="small"
              text
              type="primary"
              @click="onRowDel(scope.row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
        <el-table-column v-else-if="isUser" label="Actions" width="150">
          <template #default="scope">
            <el-button size="small" text type="warning" @click="rateBook(scope.row)">
              Rate
            </el-button>
            <el-button size="small" text type="primary" @click="borrowBook(scope.row)">
              Borrow
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="onHandleSizeChange"
        @current-change="onHandleCurrentChange"
        class="mt15"
        :pager-count="5"
        v-model:current-page="state.tableData.param.pageNum"
        background
        v-model:page-size="state.tableData.param.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="state.tableData.total"
      />
    </el-card>

    <DicDialog
      ref="dicDialogRef"
      :author-list="state.tableData.authorList"
      :category-list="state.tableData.categoryList"
      @refresh="getTableData"
    />
  </div>
</template>

<style lang="scss" scoped>
.system-dic-container {
  width: 100%;
  height: 100%;
}
</style>
