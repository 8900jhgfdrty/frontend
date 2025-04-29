<script setup lang="ts" name="SystemDicDialog">
import { useUserStore } from "@/pinia/stores/user"
import { reactive, ref } from "vue"
import { borrowBookApi, returnBookApi, submitReturnRequestApi } from "../apis/index" // 添加 submitReturnRequestApi 导入

// Emit refresh event to parent
const emit = defineEmits<{
  refresh: []
}>()
const userStore = useUserStore()

// Form reference and reactive state
const dicDialogFormRef = ref()
const state = reactive({
  ruleForm: {
    book_id: "",
    user_id: "",
    score: 0,
    comment: "",
    return_date: "",
    record_id: 0,
    status: "",
    book: 0,
    user: 0
  },
  dialog: {
    isShowDialog: false,
    type: "",
    title: "",
    submitTxt: ""
  }
})

// Open the dialog in different modes: edit, borrow, return
function openDialog(type: string, row: any) {
  console.log("Dialog opened with row data:", row)
  if (type === "edit") {
    state.ruleForm = {
      book_id: row.book,
      user_id: row.user,
      score: row.score || 0,
      comment: row.comment || "",
      return_date: "",
      record_id: row.id,
      status: row.status,
      book: row.book,
      user: row.user
    }
    state.dialog.title = "Edit"
    state.dialog.submitTxt = "Save"
  } else if (type === "borrow") {
    state.dialog.title = "Borrow Request"
    state.dialog.submitTxt = "Submit Borrow Request"
    // Reset form; date validation applies
    state.ruleForm = {
      book_id: row.book,
      user_id: String(userStore.userId),
      score: 0,
      comment: "",
      return_date: "",
      record_id: row.id || 0,
      status: "pending",
      book: row.book,
      user: Number(userStore.userId)
    }
  } else if (type === "return") {
    state.dialog.title = "Return Request"
    state.dialog.submitTxt = "Submit Return Request"
    state.ruleForm = {
      book_id: row.book,
      user_id: row.user,
      score: 0,
      comment: "",
      return_date: "",
      record_id: row.id,
      status: "approval",
      book: row.book,
      user: row.user
    }
    console.log("Return request form data:", state.ruleForm)
  }
  state.dialog.isShowDialog = true
  state.dialog.type = type
}

// Close the dialog
function closeDialog() {
  state.dialog.isShowDialog = false
}

// Cancel handler
function onCancel() {
  closeDialog()
}

// Submit handler
function onSubmit() {
  if (state.dialog.type === "borrow") {
    // Validate return date
    if (!state.ruleForm.return_date) {
      ElMessage.warning("Please select an estimated return date")
      return
    }

    // Send borrow request (status pending approval)
    borrowBookApi({
      id: 0,
      user: Number(userStore.userId),
      book: state.ruleForm.book,
      return_date: state.ruleForm.return_date,
      status: "pending"
    })
      .then((response) => {
        ElMessage.success(response.message || "Borrow request submitted, waiting for admin approval")
        closeDialog()
        emit("refresh")
      })
      .catch((err) => {
        console.error("Failed to submit borrow request:", err)
        if (err.response?.data?.error) {
          ElMessage.error(err.response.data.error)
        } else {
          ElMessage.error("Failed to submit borrow request, please try again")
        }
      })
  } else if (state.dialog.type === "return") {
    if (!state.ruleForm.record_id) {
      ElMessage.error("Invalid borrow record")
      return
    }

    // Use dedicated return request API to submit return request
    submitReturnRequestApi(state.ruleForm.record_id)
      .then((response) => {
        ElMessage.success(response.message || "Return request submitted, waiting for admin approval")
        closeDialog()
        emit("refresh")
      })
      .catch((err) => {
        console.error("Failed to submit return request:", err)
        if (err.response) {
          console.error("Error response data:", err.response.data)
        }
        const data = err.response?.data
        if (data?.error) {
          ElMessage.error(data.error)
        } else if (data?.detail) {
          ElMessage.error(data.detail)
        } else if (data) {
          const errMsg = Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join("; ")
          ElMessage.error(`Failed to submit return request: ${errMsg}`)
        } else {
          ElMessage.error("Failed to submit return request, please try again")
        }
      })
  }
}

// Disable selecting past dates
function disabledDate(time: Date) {
  return time.getTime() < Date.now()
}

// Expose openDialog to parent
defineExpose({
  openDialog
})
</script>

<template>
  <div class="system-dic-dialog-container">
    <el-dialog
      :title="state.dialog.title"
      v-model="state.dialog.isShowDialog"
      width="769px"
    >
      <el-form
        ref="dicDialogFormRef"
        :model="state.ruleForm"
        size="default"
        label-width="120px"
      >
        <el-row :gutter="35">
          <el-col class="mb4" v-if="state.dialog.type === 'borrow'">
            <el-form-item label="Expected Return Date" required>
              <el-date-picker
                v-model="state.ruleForm.return_date"
                type="date"
                placeholder="Please select expected return date"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </el-form-item>
            <div class="info-message">
              <p>You are requesting to borrow this book. After submission, it will need administrator approval before you can borrow it.</p>
            </div>
          </el-col>
          <el-col class="mb4" v-if="state.dialog.type === 'return'">
            <div class="return-info">
              <p>
                You are requesting to return this book. After submission, it will need administrator approval to complete the return process.
              </p>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCancel" size="default">Cancel</el-button>
          <el-button type="primary" @click="onSubmit" size="default">
            {{ state.dialog.submitTxt }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.return-info {
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-message {
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
  margin-top: 10px;
  color: #67c23a;
}
</style>
