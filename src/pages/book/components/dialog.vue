<script setup lang="ts" name="SystemDicDialog">
import { useUserStore } from "@/pinia/stores/user"
import { defineComponent, reactive, ref } from "vue"
import { addBooksApi, borrowBookApi, editBooksApi, rateBookApi } from "../apis/index"

const props = defineProps<{
  authorList: any[]
  categoryList: any[]
}>()

// Define event emitter for parent refresh
const emit = defineEmits<{
  refresh: []
}>()

// Needed to properly type template refs
defineComponent({})

const userStore = useUserStore()

// Form ref and reactive state
const dicDialogFormRef = ref()
const state = reactive({
  ruleForm: {
    id: 0,
    title: "",
    description: "",
    is_available: true,
    author: "",
    category: "",
    return_date: "",
    book_id: "",
    user_id: "",
    score: 5,
    comment: ""
  },
  dialog: {
    isShowDialog: false,
    type: "",
    title: "",
    submitTxt: ""
  }
})

// Open dialog in either "add", "edit" or "borrow" mode
function openDialog(type: string, row?: any) {
  if (type === "edit") {
    state.ruleForm = { ...row }
    state.dialog.title = "Edit"
    state.dialog.submitTxt = "Edit"
  } else if (type === "add") {
    state.ruleForm = {
      id: 0,
      title: "",
      description: "",
      is_available: true,
      author: "",
      category: "",
      return_date: "",
      book_id: "",
      user_id: "",
      score: 5,
      comment: ""
    }
    state.dialog.title = "Add Book"
    state.dialog.submitTxt = "Add"
  } else if (type === "rate") {
    state.ruleForm = {
      id: 0,
      book_id: row.id,
      user_id: userStore.userId,
      title: "",
      description: "",
      is_available: true,
      author: "",
      category: "",
      return_date: "",
      score: 5,
      comment: ""
    }
    state.dialog.title = "Rate"
    state.dialog.submitTxt = "Submit Rating"
  } else {
    state.ruleForm = {
      id: 0,
      book_id: row.id,
      return_date: "",
      user_id: userStore.userId,
      title: "",
      description: "",
      is_available: true,
      author: "",
      category: "",
      score: 5,
      comment: ""
    }
    state.dialog.title = "Borrow"
    state.dialog.submitTxt = "Borrow"
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

// Submit handler
function onSubmit() {
  // Form validation
  if (state.dialog.type === "add") {
    // Check if title is empty
    if (!state.ruleForm.title || state.ruleForm.title.trim() === "") {
      ElMessage.error("Book title cannot be empty")
      return
    }

    // Check if author is empty
    if (!state.ruleForm.author || state.ruleForm.author.toString().trim() === "") {
      ElMessage.error("Author cannot be empty")
      return
    }

    // Check if category is empty
    if (!state.ruleForm.category || state.ruleForm.category.toString().trim() === "") {
      ElMessage.error("Category cannot be empty")
      return
    }
  }
  if (state.dialog.type === "edit") {
    // Check if title is empty
    if (!state.ruleForm.title || state.ruleForm.title.trim() === "") {
      ElMessage.error("Book title cannot be empty")
      return
    }
    // Check if category is empty
    if (!state.ruleForm.category || state.ruleForm.category.toString().trim() === "") {
      ElMessage.error("Category cannot be empty")
      return
    }
  }

  if (state.dialog.type === "edit") {
    const { id, title, description, is_available, author, category } = state.ruleForm
    editBooksApi(id, title, description, is_available, author, category)
      .then(() => {
        ElMessage.success("Edit successful")
        closeDialog()
        emit("refresh")
      })
      .catch((error) => {
        // Handle duplicate title error
        if (error.response && error.response.data && error.response.data.title) {
          ElMessage.error(error.response.data.title[0])
        } else {
          ElMessage.error("Edit failed")
        }
      })
  } else if (state.dialog.type === "add") {
    const { title, description, is_available, author, category } = state.ruleForm
    addBooksApi(title, description, is_available, author, category)
      .then(() => {
        ElMessage.success("Book added successfully")
        closeDialog()
        emit("refresh")
      })
      .catch((error) => {
        // Handle duplicate title error
        if (error.response && error.response.data && error.response.data.title) {
          ElMessage.error(error.response.data.title[0])
        } else {
          ElMessage.error("Failed to add book")
        }
      })
  } else if (state.dialog.type === "borrow") {
    borrowBookApi({
      user: Number(state.ruleForm.user_id),
      book: Number(state.ruleForm.book_id),
      return_date: state.ruleForm.return_date,
      status: "pending"
    })
      .then(() => {
        ElMessage.success("Borrow request submitted; awaiting approval")
        closeDialog()
        emit("refresh")
      })
      .catch(() => {
        ElMessage.error("Borrow request submission failed")
      })
  } else if (state.dialog.type === "rate") {
    if (!state.ruleForm.score || state.ruleForm.score < 1 || state.ruleForm.score > 5) {
      ElMessage.error("Rating must be between 1 and 5")
      return
    }

    rateBookApi({
      book_id: Number(state.ruleForm.book_id),
      score: state.ruleForm.score,
      comment: state.ruleForm.comment,
      user_id: Number(userStore.userId)
    })
      .then((response: any) => {
        if (response.success) {
          ElMessage.success(response.message)
          closeDialog()
          emit("refresh")
        }
      })
      .catch(() => {
      })
  }
}

// Disable past dates in the date picker
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
        label-width="90px"
      >
        <el-row v-if="state.dialog.type === 'edit' || state.dialog.type === 'add'" :gutter="35">
          <el-col class="mb4">
            <el-form-item label="Title">
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
              <el-input
                v-if="state.dialog.type === 'add'"
                v-model="state.ruleForm.author"
                placeholder="Enter author name (new authors will be created automatically)"
                clearable
              />
              <el-select
                v-else
                v-model="state.ruleForm.author"
                placeholder="Please select author"
                style="width: 100%"
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
              <el-input
                v-if="state.dialog.type === 'add'"
                v-model="state.ruleForm.category"
                placeholder="Enter category name (new categories will be created automatically)"
                clearable
              />
              <el-select
                v-else
                v-model="state.ruleForm.category"
                placeholder="Please select category"
                style="width: 100%"
              >
                <el-option
                  v-for="item in props.categoryList.filter(cat => !cat.is_deleted)"

                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-else-if="state.dialog.type === 'borrow'">
          <el-col class="mb4">
            <el-date-picker
              v-model="state.ruleForm.return_date"
              type="date"
              placeholder="Please select return date"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
            />
          </el-col>
        </el-row>
        <el-row v-else-if="state.dialog.type === 'rate'">
          <el-col class="mb4">
            <el-form-item label="Rating">
              <el-rate
                v-model="state.ruleForm.score"
                :max="5"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                show-text
              />
            </el-form-item>
          </el-col>
          <el-col class="mb4">
            <el-form-item label="Comment">
              <el-input
                v-model="state.ruleForm.comment"
                type="textarea"
                :rows="3"
                placeholder="Please enter your comment (optional)"
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
