<script setup lang="ts" name="SystemDicDialog">
import { formatDateTime } from "@/common/utils/datetime"
import { useUserStore } from "@/pinia/stores/user"
import { reactive, ref } from "vue"
import { borrowBookApi } from "../apis/index"

const props = defineProps<{
  authorList: any[]
  categoryList: any[]
}>()

// Emit refresh event to parent
const emit = defineEmits<{
  refresh: []
}>()
const userStore = useUserStore()

// Form ref and reactive state
const dicDialogFormRef = ref()
const state = reactive({
  ruleForm: {
    id: 0,
    title: "", // dictionary name
    description: "", // field description
    is_available: true,
    author: "",
    category: "",
    return_date: "",
    book_id: "",
    user_id: ""
  },
  dialog: {
    isShowDialog: false,
    type: "",
    title: "",
    submitTxt: "",
    authorList: [],
    categoryList: []
  }
})

// Open dialog in "borrow" mode
function openDialog(type: string, row: any) {
  state.dialog.title = "Borrow Book"
  state.dialog.submitTxt = "Borrow"
  state.ruleForm = {
    id: 0,
    book_id: row.id,
    return_date: "",
    user_id: userStore.userId,
    title: "",
    description: "",
    is_available: true,
    author: "",
    category: ""
  }
  state.dialog.isShowDialog = true
  state.dialog.type = type
}

// Close dialog
function closeDialog() {
  state.dialog.isShowDialog = false
}

// Cancel handler
function onCancel() {
  closeDialog()
}

// Disable past dates in date picker
function disabledDate(time: Date) {
  return time.getTime() < Date.now()
}

// Submit handler
function onSubmit() {
  borrowBookApi({
    user: Number(state.ruleForm.user_id),
    book: Number(state.ruleForm.book_id),
    return_date: state.ruleForm.return_date,
    status: "pending"
  })
    .then(() => {
      ElMessage.success("Borrow request submitted")
      closeDialog()
      emit("refresh")
    })
    .catch(() => {
      ElMessage.error("Borrow request failed")
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
    >
      <el-form
        ref="dicDialogFormRef"
        :model="state.ruleForm"
        size="default"
        label-width="90px"
      >
        <el-row :gutter="35" v-if="state.dialog.type === 'edit'">
          <el-col class="mb4">
            <el-form-item label="Name">
              <el-input
                v-model="state.ruleForm.title"
                placeholder="Please enter title"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col class="mb4">
            <el-form-item label="Description">
              <el-input
                v-model="state.ruleForm.description"
                placeholder="Please enter description"
                type="textarea"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col class="mb4">
            <el-form-item label="Available">
              <el-switch
                v-model="state.ruleForm.is_available"
                inline-prompt
                active-text="Yes"
                inactive-text="No"
              />
            </el-form-item>
          </el-col>
          <el-col class="mb4">
            <el-form-item label="Author">
              <el-select
                v-model="state.ruleForm.author"
                size="default"
                placeholder="Please select author"
              >
                <el-option
                  v-for="item in props.authorList"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="mb4">
            <el-form-item label="Category">
              <el-select
                v-model="state.ruleForm.category"
                size="default"
                placeholder="Please select category"
              >
                <el-option
                  v-for="item in props.categoryList"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-else>
          <el-col class="mb4">
            <el-form-item label="Borrow Date">
              <el-date-picker
                v-model="state.ruleForm.return_date"
                type="date"
                placeholder="Please select borrow date"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                style="width: 100%"
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
          >
            {{ state.dialog.submitTxt }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
