<script setup lang="ts" name="SystemDic">
import type { TableData } from "@/common/apis/tables/type"
import { useUserStore } from "@/pinia/stores/user"
import { computed, defineAsyncComponent, onMounted, reactive, ref } from "vue"
import { deleteUsersApi, getUserListApi } from "./apis/index"

// User type mapping table
const UserTypeMap: Record<string, string> = {
  0: "Normal User",
  1: "Book Manager",
  2: "System Manager"
}

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
    authorList: [],
    categoryList: []
  },
  searchForm: {
    username: ""
  }
})

// Initialize table data
function getTableData() {
  state.tableData.loading = true
  getUserListApi(
    state.searchForm.username,
    state.tableData.param.pageSize,
    state.tableData.param.pageNum
  )
    .then((response) => {
      // Handle possible different response formats
      const responseData = response || {}
      const data = responseData.data || responseData

      console.log("User API response data:", data)

      if (data) {
        // Handle different return format cases
        if (Array.isArray(data)) {
          // If the array is returned directly
          state.tableData.data = data
          state.tableData.total = data.length
        } else if (data.results && Array.isArray(data.results)) {
          // Return the object with pagination
          state.tableData.data = data.results
          state.tableData.total = data.total_count || data.count || data.results.length
        } else {
          console.error("Unexpected API response format:", data)
          state.tableData.data = []
          state.tableData.total = 0
          ElMessage.error("Data format error, please contact the administrator")
        }
      } else {
        console.error("No data received from API")
        state.tableData.data = []
        state.tableData.total = 0
        ElMessage.error("Failed to get user data")
      }
    })
    .catch((e) => {
      console.error("Error fetching user list:", e)
      state.tableData.data = []
      state.tableData.total = 0
      ElMessage.error("Failed to get user list, please try again later")
    })
    .finally(() => {
      state.tableData.loading = false
    })
}

// Open "Add User" dialog
function onOpenAddDic(type: string) {
  dicDialogRef.value.openDialog(type)
}

// Open "Edit User" dialog
function onOpenEditDic(type: string, row: TableData) {
  dicDialogRef.value.openDialog(type, row, state.tableData)
}

// Delete user
function onRowDel(row: TableData) {
  ElMessageBox.confirm("Are you sure you want to delete this user?", "Tips", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(() => {
      deleteUsersApi((row as TableData & { id: number }).id)
        .then(() => {
          getTableData()
          ElMessage.success("Delete successfully")
        })
        .catch(() => {
          ElMessage.error("Delete failed")
        })
    })
    .catch(() => {
      // User cancelled
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
  state.searchForm.username = ""
  getTableData()
}

// On component mount
onMounted(() => {
  getTableData()
})
</script>

<template>
  <div class="system-dic-container">
    <el-card shadow="hover">
      <div class="system-user-search mb15">
        <el-input
          v-model="state.searchForm.username"
          size="default"
          placeholder="Please enter username"
          style="max-width: 260px"
        />
        <el-button
          size="default"
          type="primary"
          class="ml10"
          @click="getTableData"
        >
          <el-icon><Search /></el-icon>
          Search
        </el-button>

        <el-button
          size="default"
          class="ml10"
          type="info"
          @click="clearData"
        >
          <el-icon><Refresh /></el-icon>
          Reset
        </el-button>

        <el-button
          size="default"
          type="success"
          class="ml10"
          @click="onOpenAddDic('add')"
        >
          <el-icon><FolderAdd /></el-icon>
          Add User
        </el-button>
      </div>

      <el-table
        :data="state.tableData.data"
        v-loading="state.tableData.loading"
        style="width: 100%"
      >
        <el-table-column type="index" label="No." />
        <el-table-column
          prop="username"
          label="Username"
          show-overflow-tooltip
        />
        <el-table-column
          prop="user_type"
          label="User Type"
          show-overflow-tooltip
        >
          <template #default="scope">
            {{ UserTypeMap[scope.row.user_type as keyof typeof UserTypeMap] }}
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="150">
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
