<script setup lang="ts" name="SystemDicDialog">
import type { AnnouncementsTableData } from "@/common/apis/tables/type"
import { nextTick, reactive, ref } from "vue"
import { addAnnouncementsApi, editAnnouncementsApi } from "../../apis/index"

const emit = defineEmits<{
  (e: "refresh"): void
}>()
const dicDialogFormRef = ref()
const state = reactive({
  ruleForm: {
    id: 0,
    title: "", // announcement title
    content: "", // announcement content
    is_visible: true
  },
  dialog: {
    isShowDialog: false,
    type: "",
    title: "",
    submitTxt: "",
    loading: false
  }
})

// Validation rules
const rules = {
  title: [
    { required: true, message: "Please enter a title", trigger: "blur" },
    { min: 1, max: 100, message: "Title length must be between 1 and 100 characters", trigger: "blur" }
  ],
  content: [
    { required: true, message: "Please enter content", trigger: "blur" },
    { min: 1, message: "Content cannot be empty", trigger: "blur" }
  ]
}

function openDialog(type: string, row?: AnnouncementsTableData) {
  if (dicDialogFormRef.value) {
    dicDialogFormRef.value.resetFields()
  }
  if (type === "edit" && row) {
    nextTick(() => {
      state.ruleForm = { ...row }
    })
    state.dialog.title = "Edit announcement"
    state.dialog.submitTxt = "Update"
  } else {
    state.dialog.title = "Add announcement"
    state.dialog.submitTxt = "Add"
    state.ruleForm = {
      id: 0,
      title: "",
      content: "",
      is_visible: true
    }
  }
  state.dialog.isShowDialog = true
  state.dialog.type = type
  state.dialog.loading = false
}
function closeDialog() {
  state.dialog.isShowDialog = false
  state.dialog.loading = false
  if (dicDialogFormRef.value) {
    dicDialogFormRef.value.resetFields()
  }
}
function onCancel() {
  closeDialog()
}
function onSubmit() {
  dicDialogFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      ElMessage.warning("Please complete all required fields")
      return
    }
    state.dialog.loading = true
    try {
      const submitData = {
        title: state.ruleForm.title.trim(),
        content: state.ruleForm.content.trim()
      }
      if (state.dialog.type === "add") {
        const response = await addAnnouncementsApi(submitData.title, submitData.content)
        if (response.data && response.data.error) {
          throw new Error(response.data.error)
        }
        const successMsg = typeof response === "string"
          ? "Add announcement successfully"
          : (response.message || "Add announcement successfully")
        ElMessage.success(successMsg)
      } else {
        const response = await editAnnouncementsApi(state.ruleForm.id, submitData.title, submitData.content)

        if (response.data && response.data.error) {
          throw new Error(response.data.error)
        }
        const successMsg = typeof response === "string"
          ? "Announcement updated successfully"
          : (response.message || "Announcement updated successfully")
        ElMessage.success(successMsg)
      }
      closeDialog()
      emit("refresh")
    } catch (error: any) {
      if (error.message) {
        ElMessage.error(error.message)
      } else if (error.response?.data) {
        const errorData = error.response.data
        if (Array.isArray(errorData.title)) {
          ElMessage.error(errorData.title[0] || "Failed to validate title")
        } else {
          ElMessage.error(errorData.title || "Failed to validate title")
        }
        if (errorData.detail) {
          ElMessage.error(errorData.detail)
        } else if (errorData.message) {
          ElMessage.error(errorData.message)
        } else if (errorData.error) {
          ElMessage.error(errorData.error)
        } else if (typeof errorData === "string") {
          ElMessage.error(errorData)
        } else {
          ElMessage.error("Operation failed, please try again later")
        }
      } else {
        ElMessage.error("Operation failed, please try again later")
      }
    } finally {
      state.dialog.loading = false
    }
  })
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
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="dicDialogFormRef"
        :model="state.ruleForm"
        :rules="rules"
        size="default"
        label-width="90px"
      >
        <el-row :gutter="35">
          <el-col :span="24" class="mb20">
            <el-form-item label="Title" prop="title">
              <el-input
                v-model="state.ruleForm.title"
                placeholder="Please enter the announcement title"
                clearable
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" class="mb20">
            <el-form-item label="Content" prop="content">
              <el-input
                v-model="state.ruleForm.content"
                placeholder="Please enter the announcement content"
                type="textarea"
                :rows="6"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCancel" size="default">Cancel</el-button>
          <el-button
            type="primary"
            @click="onSubmit"
            size="default"
            :loading="state.dialog.loading"
          >
            {{ state.dialog.submitTxt }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mb20 {
  margin-bottom: 20px;
}
</style>
