<script setup lang="ts" name="SystemDic">
import { formatDateTime } from "@/common/utils/datetime"
import { useUserStore } from "@/pinia/stores/user"
import { defineAsyncComponent, onMounted, reactive, ref } from "vue"
import {
  approveBookApi,
  borrowBookApi,
  checkBookStatusApi,
  getRecordsApi,
  getUserListApi,
  returnBookApi
} from "./apis/index"
import { BorrowStatusMap } from "./constants/index"

const userStore = useUserStore()

// Lazy-load the borrow/return dialog component
const DicDialog = defineAsyncComponent(() => import("./components/dialog.vue"))

// Refs and reactive state
const dicDialogRef = ref()
const state = reactive<any>({
  tableData: {
    data: [],
    total: 0,
    loading: false,
    param: {
      pageNum: 1,
      pageSize: 10
    },
    userList: []
  },
  searchForm: {
    title: "",
    username: "",
    user_id: "",
    status: ""
  }
})

const isAdmin = userStore.roles.includes("admin")
const isUser = userStore.roles.includes("user")

// Fetch table data
function getTableData() {
  state.tableData.loading = true
  const { title, status, user_id, username } = state.searchForm

  console.log("Fetching borrow records with filters:", {
    title,
    status,
    user_id,
    username,
    isAdmin,
    isUser
  })

  getRecordsApi(
    title,
    state.tableData.param.pageSize,
    state.tableData.param.pageNum,
    status,
    isAdmin ? username : undefined
  )
    .then((response) => {
      // Get response data, handle possible different response structures
      const responseData = response || {}
      const data = responseData.data || responseData

      console.log("Records API response:", data)

      if (data && data.results && Array.isArray(data.results)) {
        // If admin is searching by username, filter on frontend
        if (username && isAdmin) {
          state.tableData.data = data.results.filter((record: any) =>
            (record.borrower || record.user_name || "").toLowerCase().includes(username.toLowerCase())
          )
          state.tableData.total = state.tableData.data.length
        } else {
          state.tableData.data = data.results
          state.tableData.total = data.total_count || data.count || data.results.length
        }
      } else if (Array.isArray(data)) {
        state.tableData.data = data
        state.tableData.total = data.length
      } else {
        console.error("Unexpected record list format:", data)
        state.tableData.data = []
        state.tableData.total = 0
      }
    })
    .catch((e) => {
      console.error("Failed to fetch borrow records:", e)
      state.tableData.data = []
      state.tableData.total = 0
      ElMessage.error("Failed to fetch borrow records, please try again")
    })
    .finally(() => {
      state.tableData.loading = false
    })
}

// Handle page size change
function onHandleSizeChange(val: number) {
  state.tableData.param.pageSize = val
  getTableData()
}

// Handle current page change
function onHandleCurrentChange(val: number) {
  state.tableData.param.pageNum = val
  getTableData()
}

// Reset search filters
function clearData() {
  if (isAdmin) {
    state.searchForm = { title: "", username: "", user_id: "", status: "" }
  } else {
    state.searchForm = { title: "", username: "", user_id: userStore.userId, status: "" }
  }
  getTableData()
}

function handleAction(action: "return", row: any) {
  if (action === "return") {
    if (isAdmin) {
      ElMessageBox.confirm(
        `Are you sure you want to return "${row.book_title}"?`,
        "Return Confirmation",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning"
        }
      ).then(() => {
        if (row.status !== "borrowed") {
          ElMessage.error("Only books with 'Borrowed' status can be returned.")
          return
        }
        borrowBookApi({
          id: row.id,
          user: row.user,
          book: row.book,
          status: "approval"
        })
          .then((response) => {
            ElMessage.success(response.message || "Return request submitted, waiting for approval.")
            getTableData()
          })
          .catch((err) => {
            console.error("Failed to submit return request:", err)
            ElMessage.error("Failed to submit return request. Please try again.")
          })
      })
    } else {
      if (row.status !== "borrowed") {
        ElMessage.error("Only books with 'Borrowed' status can be returned.")
        return
      }
      if (Number(userStore.userId) !== row.user) {
        ElMessage.error("You can only return books that you borrowed.")
        return
      }
      dicDialogRef.value.openDialog("return", row)
    }
  }
}

// Handle admin approval of borrow/return requests
function approveRequest(decision: "approve" | "reject", row: any) {
  const isBorrowRequest = row.status === "pending"
  const actionText = decision === "approve" ? "approve" : "reject"
  let newStatus = ""
  if (isBorrowRequest) {
    newStatus = decision === "approve" ? "borrowed" : "rejected"
  } else {
    // return approval
    newStatus = "returned"
  }
  ElMessageBox.confirm(
    `Are you sure you want to ${decision === "approve" ? "approve" : "reject"} this ${
      isBorrowRequest ? "borrow" : "return"
    } request?`,
    "Please Confirm",
    {
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      type: "warning"
    }
  ).then(() => {
    approveBookApi(row.id, newStatus)
      .then((response) => {
        ElMessage.success(response.message || `Request ${actionText === "approve" ? "approved" : "rejected"} successfully.`)
        getTableData()
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          ElMessage.error(`Approval API endpoint not found, please check backend configuration.`)
        } else {
          ElMessage.error(`Operation failed: ${err.message || "Unknown error"}`)
        }
      })
  })
}

// On mount, load users and initial data
onMounted(() => {
  getUserListApi()
    .then((response) => {
      // Get response data, handle possible different response structures
      const responseData = response || {}
      const data = responseData.data || responseData

      console.log("User list API response:", data)

      if (data && data.results && Array.isArray(data.results)) {
        state.tableData.userList = data.results
      } else if (Array.isArray(data)) {
        state.tableData.userList = data
      } else {
        console.error("Unexpected user list format:", data)
        state.tableData.userList = []
      }
    })
    .catch((e) => {
      console.error("Failed to load user list:", e)
      state.tableData.userList = []
    })

  getTableData()
})
</script>

<template>
  <div class="system-dic-container">
    <el-card shadow="hover">
      <div class="system-user-search mb15">
        <template v-if="isAdmin">
          <el-input
            v-model="state.searchForm.username"
            size="default"
            placeholder="Search borrower"
            style="max-width: 180px; margin-right: 10px;"
          />
          <el-input
            v-model="state.searchForm.title"
            size="default"
            placeholder="Search book title"
            style="max-width: 180px; margin-right: 10px;"
          />
        </template>

        <!-- Regular user search box -->
        <el-input
          v-if="isUser"
          v-model="state.searchForm.title"
          size="default"
          placeholder="Search book title"
          style="max-width: 180px"
        />

        <!-- Search buttons -->
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
          type="info"
          class="ml10"
          @click="clearData"
        >
          <el-icon><Refresh /></el-icon>
          Reset
        </el-button>
      </div>

      <el-table
        :data="state.tableData.data"
        v-loading="state.tableData.loading"
        style="width: 100%"
      >
        <el-table-column type="index" label="Index" width="50" />
        <el-table-column prop="book_title" label="Book Title" show-overflow-tooltip />

        <el-table-column label="Borrower" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.borrower || scope.row.user_name || 'Unknown' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Status" show-overflow-tooltip>
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'pending' ? 'warning'
                : scope.row.status === 'borrowed' ? 'success'
                  : scope.row.status === 'returned' ? 'info'
                    : scope.row.status === 'rejected' ? 'danger'
                      : scope.row.status === 'approval' ? 'primary'
                        : 'warning'
              "
            >
              {{ BorrowStatusMap[scope.row.status as keyof typeof BorrowStatusMap] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="borrow_date" label="Borrow Date" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDateTime(scope.row.borrow_date) }}
          </template>
        </el-table-column>

        <el-table-column prop="return_date" label="Due Date" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.return_date ? formatDateTime(scope.row.return_date) : 'Not Set' }}
          </template>
        </el-table-column>

        <el-table-column v-if="isAdmin" label="Actions" width="240">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              size="small"
              text
              type="success"
              @click="approveRequest('approve', scope.row)"
            >
              Approve Borrow
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              size="small"
              text
              type="danger"
              @click="approveRequest('reject', scope.row)"
            >
              Reject Borrow
            </el-button>
            <el-button
              v-if="scope.row.status === 'approval'"
              size="small"
              text
              type="primary"
              @click="approveRequest('approve', scope.row)"
            >
              Approve Return
            </el-button>
            <el-button
              v-if="scope.row.status === 'borrowed' && isUser"
              size="small"
              text
              type="warning"
              @click="handleAction('return', scope.row)"
            >
              Request Return
            </el-button>
          </template>
        </el-table-column>

        <el-table-column v-if="isUser" label="Actions" width="160">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'borrowed' && Number(userStore.userId) === scope.row.user"
              size="small"
              text
              type="primary"
              @click="handleAction('return', scope.row)"
            >
              Request Return
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              size="small"
              text
              type="warning"
            >
              Pending Approval
            </el-button>
            <el-button
              v-if="scope.row.status === 'approval'"
              size="small"
              text
              type="warning"
            >
              Return Pending
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

    <DicDialog ref="dicDialogRef" @refresh="getTableData" />
  </div>
</template>

<style lang="scss" scoped>
.system-dic-container {
  width: 100%;
  height: 100%;
}
</style>
