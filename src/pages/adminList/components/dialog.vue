<script setup lang="ts" name="systemDicDialog">
import { onMounted, reactive, ref } from "vue"
import { addUsersApi, checkUsernameExistsApi, editUsersApi, getUserListApi, getUserTypesApi } from "../apis/index"

// Define user type interface
interface UserType {
  value: string | number
  label: string
}

const emit = defineEmits(["refresh"])

const dicDialogFormRef = ref()
const state = reactive({
  ruleForm: {
    id: "",
    username: "",
    password: "",
    user_type: "0"
  },
  dialog: {
    isShowDialog: false,
    type: "",
    title: "",
    submitTxt: "",
    authorList: [],
    categoryList: []
  },
  userTypes: [] as UserType[]
})

function getUserTypes() {
  // Use default user types directly
  setDefaultUserTypes()

  // Record API call attempts
  getUserTypesApi().then((response) => {
    console.log("User types API response (not used):", response)
  }).catch((error) => {
    console.error("Failed to fetch user types (using defaults instead):", error)
  })
}

function setDefaultUserTypes() {
  state.userTypes = [
    { value: "0", label: "Normal User" },
    { value: "1", label: "Book Manager" },
    { value: "2", label: "System Manager" }
  ]
}

function openDialog(type: string, row?: any) {
  // Ensure user types are loaded
  if (state.userTypes.length === 0) {
    getUserTypes()
  }

  if (type === "edit") {
    state.ruleForm = {
      id: row.id,
      username: row.username,
      password: "",
      user_type: row.user_type?.toString() || "0"
    }
    state.dialog.title = "Edit User"
    state.dialog.submitTxt = "Save Changes"
  } else {
    state.dialog.title = "Add User"
    state.dialog.submitTxt = "Add"
    state.ruleForm = {
      id: "",
      username: "",
      password: "",
      user_type: "0"
    }
  }
  state.dialog.isShowDialog = true
  state.dialog.type = type
}

function closeDialog() {
  state.dialog.isShowDialog = false
}

function onCancel() {
  closeDialog()
}

function onSubmit() {
  // Form validation
  if (!state.ruleForm.username.trim()) {
    ElMessage.warning("Username cannot be empty")
    return
  }

  // When adding a user, password is required
  if (state.dialog.type === "add" && !state.ruleForm.password) {
    ElMessage.warning("Password cannot be empty")
    return
  }

  if (state.dialog.type === "edit") {
    const { username, password, id, user_type } = state.ruleForm

    // Check if the edited username conflicts with other users
    checkUsernameExistsApi(username).then((response) => {
      const responseData = response || {}
      const data = responseData.data || responseData

      // Check if there is an error mark (use optional chaining to avoid type errors)
      if (data?.error) {
        ElMessage.warning("Username check service temporarily unavailable, continue operation")
        performEdit(id, username, password, user_type)
        return
      }

      if (data && data.exists) {
        // Check if it is the current user himself
        getUserListApi(username, 10, 1).then((userResponse) => {
          // Handle possible different response formats
          const userData = userResponse.data || userResponse

          try {
            const isOwnUsername = userData
              && userData.results
              && Array.isArray(userData.results)
              && userData.results.some((user: any) => user.id === Number(id) && user.username === username)

            if (!isOwnUsername) {
              ElMessage.error("Username already exists")
              return
            }

            performEdit(id, username, password, user_type)
          } catch (error) {
            console.error("Error checking username ownership:", error)
            ElMessage.warning("Unable to confirm username ownership, continue operation")
            performEdit(id, username, password, user_type)
          }
        }).catch((error) => {
          console.error("Failed to get user list:", error)
          ElMessage.warning("Unable to confirm username ownership, continue operation")
          performEdit(id, username, password, user_type)
        })
      } else {
        performEdit(id, username, password, user_type)
      }
    }).catch((error) => {
      console.error("Username check failed:", error)
      ElMessage.warning("Username check service temporarily unavailable, continue operation")
      performEdit(id, username, password, user_type)
    })
  }

  if (state.dialog.type === "add") {
    const { username, password, user_type } = state.ruleForm

    checkUsernameExistsApi(username).then((response) => {
      const responseData = response || {}
      const data = responseData.data || responseData

      // Check if there is an error mark (use optional chaining to avoid type errors)
      if (data?.error) {
        ElMessage.warning("Username check service temporarily unavailable, continue operation")
        addNewUser(username, password, user_type)
        return
      }

      if (data && data.exists) {
        ElMessage.error("Username already exists")
        return
      }

      addNewUser(username, password, user_type)
    }).catch((error) => {
      console.error("Username check failed:", error)
      ElMessage.warning("Username check service temporarily unavailable, continue operation")
      addNewUser(username, password, user_type)
    })
  }
}

// Extract the add user method as a standalone function for easier error handling
function addNewUser(username: string, password: string, user_type: string) {
  addUsersApi(
    username,
    password,
    user_type
  ).then(() => {
    ElMessage.success("Add successfully")
    closeDialog()
    emit("refresh")
  }).catch((error) => {
    console.error("Failed to add user:", error)
    ElMessage.error("Add failed")
  })
}

function performEdit(id: string | number, username: string, password: string, user_type: string) {
  // Build request data, do not send password if it is empty
  const requestData: any = {
    id: Number(id),
    username,
    user_type
  }

  // Only include the password field if it is not empty
  if (password) {
    requestData.password = password
  }

  editUsersApi(
    Number(id),
    username,
    password,
    user_type
  ).then(() => {
    ElMessage.success("Edit successfully")
    closeDialog()
    emit("refresh")
  }).catch((error) => {
    console.error("Failed to edit user:", error)
    ElMessage.error("Edit failed")
  })
}

onMounted(() => {
  getUserTypes()
})

defineExpose({
  openDialog
})
</script>

<template>
  <div class="system-dic-dialog-container">
    <el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
      <el-form ref="dicDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
        <el-row :gutter="35">
          <el-col class="mb4">
            <el-form-item label="Username">
              <el-input v-model="state.ruleForm.username" placeholder="Please enter username" clearable />
            </el-form-item>
          </el-col>
          <el-col class="mb4">
            <el-form-item label="Password" :class="{ required: state.dialog.type === 'add' }">
              <el-input
                v-model="state.ruleForm.password"
                type="password"
                clearable
                show-password
                :placeholder="state.dialog.type === 'edit' ? 'Please enter password' : 'Please enter password'"
              />
            </el-form-item>
          </el-col>
          <el-col class="mb4">
            <el-form-item label="User Type">
              <el-select v-model="state.ruleForm.user_type" placeholder="Please select user type" style="width: 100%">
                <el-option
                  v-for="item in state.userTypes"
                  :key="typeof item.value === 'string' || typeof item.value === 'number' ? item.value.toString() : ''"
                  :label="typeof item.label === 'string' ? item.label : 'Unknown type'"
                  :value="typeof item.value === 'string' || typeof item.value === 'number' ? item.value.toString() : ''"
                />
                <template v-if="!state.userTypes || state.userTypes.length === 0">
                  <el-option :key="0" label="Normal User" value="0" />
                  <el-option :key="1" label="Book Manager" value="1" />
                  <el-option :key="2" label="System Manager" value="2" />
                </template>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCancel" size="default">Cancel</el-button>
          <el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.required::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}
</style>
