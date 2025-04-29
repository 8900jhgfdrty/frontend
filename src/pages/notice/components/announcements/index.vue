<script setup lang="ts" name="SystemDic">
import type { AnnouncementsTableData } from "@/common/apis/tables/type"
import { formatDateTime } from "@/common/utils/datetime"
import { useUserStore } from "@/pinia/stores/user"
import { defineAsyncComponent, onMounted, reactive, ref } from "vue"
import {
  deleteAnnouncementsApi,
  getAnnouncementsApi,
  updateAnnouncementStatusApi
} from "../../apis/index"

const userStore = useUserStore()
const DicDialog = defineAsyncComponent(() => import("./dialog.vue"))

const dicDialogRef = ref()
const state = reactive<{
  tableData: {
    data: AnnouncementsTableData[]
    total: number
    loading: boolean
    param: {
      pageNum: number
      pageSize: number
    }
  }
}>({
  tableData: {
    data: [],
    total: 0,
    loading: false,
    param: {
      pageNum: 1,
      pageSize: 10
    }
  }
})
const searchKey = ref("")
const isAdmin = userStore.roles.includes("admin") || userStore.roles.includes("root")

function getTableData(force = false) {
  state.tableData.loading = true

  // If forcing refresh, reset to first page
  if (force) {
    state.tableData.param.pageNum = 1
  }

  getAnnouncementsApi(
    searchKey.value,
    state.tableData.param.pageSize,
    state.tableData.param.pageNum
  )
    .then((response) => {
      // Get response data, handle possible different response structures
      const responseData = response || {}
      const data = responseData.data || responseData

      console.log("Announcements API response:", data)

      if (data && data.results && Array.isArray(data.results)) {
        state.tableData.data = data.results
        state.tableData.total = data.total_count || data.count || data.results.length
      } else if (Array.isArray(data)) {
        state.tableData.data = data
        state.tableData.total = data.length
      } else {
        console.error("Unrecognized response format:", data)
        state.tableData.data = []
        state.tableData.total = 0
      }
    })
    .catch((e) => {
      console.error("Failed to fetch announcements:", e)
      state.tableData.data = []
      state.tableData.total = 0
      ElMessage.error("Failed to get announcements, please try again")
    })
    .finally(() => {
      state.tableData.loading = false
    })
}

function onOpenAddDic(type: string) {
  dicDialogRef.value.openDialog(type)
}
function onOpenEditDic(type: string, row: AnnouncementsTableData) {
  dicDialogRef.value.openDialog(type, row)
}

function onRowDel(row: AnnouncementsTableData) {
  ElMessageBox.confirm(
    `Are you sure you want to delete "${row.title}"?`,
    "Confirm",
    {
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      type: "warning"
    }
  )
    .then(() => {
      deleteAnnouncementsApi(row.id)
        .then((response) => {
          getTableData(true) // Force refresh after deletion
          ElMessage.success(response.message || "Deleted successfully")
        })
        .catch(() => {
          ElMessage.error("Delete failed")
        })
    })
    .catch(() => {
      // Cancel operation
    })
}

// Handle page size change
function onHandleSizeChange(val: number) {
  state.tableData.param.pageSize = val
  getTableData()
}

// Handle page number change
function onHandleCurrentChange(val: number) {
  state.tableData.param.pageNum = val
  getTableData()
}

// Clear search and force-refresh list
function clearData() {
  searchKey.value = ""
  getTableData(true)
}

// Toggle announcement visibility status
function toggleStatus(row: AnnouncementsTableData) {
  const confirmationMessage = row.is_visible
    ? "Are you sure you want to hide this announcement? Readers will not see it."
    : "Are you sure you want to make this announcement public? Readers will be able to see it."

  ElMessageBox.confirm(confirmationMessage, "Confirm", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(() => {
      state.tableData.loading = true
      updateAnnouncementStatusApi(row.id)
        .then((response) => {
          // Process response data, ensure type safety
          const newStatus = response?.is_visible !== undefined ? response.is_visible : !row.is_visible
          const idx = state.tableData.data.findIndex(item => item.id === row.id)
          if (idx !== -1) {
            state.tableData.data[idx].is_visible = newStatus
          }
          ElMessage.success(response?.message || `Announcement has been ${newStatus ? "published" : "hidden"}`)
        })
        .catch((error: any) => {
          console.error("Status toggle failed:", error)
          ElMessage.error(error?.response?.data?.error || "Operation failed")
          getTableData()
        })
        .finally(() => {
          state.tableData.loading = false
        })
    })
    .catch(() => {
      // Cancel operation
    })
}

// Initial data load
onMounted(() => {
  getTableData()
})

// Handler to pass into dialog refresh event
function handleRefresh() {
  getTableData(true)
}
</script>

<template>
  <div class="system-dic-container">
    <el-card shadow="hover">
      <div class="system-user-search mb15">
        <el-input
          v-model="searchKey"
          size="default"
          placeholder="Enter title to search"
          style="max-width: 180px"
        />
        <el-button size="default" type="primary" class="ml10" @click="getTableData(true)">
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
          Add Announcement
        </el-button>
      </div>

      <el-table
        :data="state.tableData.data"
        v-loading="state.tableData.loading"
        style="width: 100%"
      >
        <el-table-column type="index" label="No." width="60" />
        <el-table-column prop="title" label="Title" show-overflow-tooltip />
        <el-table-column prop="content" label="Content" show-overflow-tooltip />
        <el-table-column v-if="isAdmin" prop="is_visible" label="Visibility" show-overflow-tooltip>
          <template #default="scope">
            <el-tag
              v-if="isAdmin"
              :type="scope.row.is_visible ? 'success' : 'info'"
              class="cursor-pointer"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.is_visible ? "Visible" : "Hidden" }}
            </el-tag>
            <el-tag v-else :type="scope.row.is_visible ? 'success' : 'info'">
              {{ scope.row.is_visible ? "Visible" : "Hidden" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="isAdmin"
          prop="created_at"
          label="Created At"
          show-overflow-tooltip
        />
        <el-table-column
          v-if="isAdmin"
          prop="updated_at"
          label="Updated At"
          show-overflow-tooltip
        />
        <el-table-column prop="published_at" label="Published At" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDateTime(scope.row.published_at, "YYYY-MM-DD") }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="isAdmin"
          label="Actions"
          width="150"
        >
          <template #default="scope">
            <el-button size="small" text type="primary" @click="onOpenEditDic('edit', scope.row)">
              Edit
            </el-button>
            <el-button size="small" text type="primary" @click="onRowDel(scope.row)">
              Delete
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

    <DicDialog ref="dicDialogRef" @refresh="handleRefresh" />
  </div>
</template>

<style lang="scss" scoped>
.system-dic-container {
  width: 100%;
  height: 100%;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
