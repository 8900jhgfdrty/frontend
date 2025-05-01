<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus"
import { usePermissionStore } from "@/pinia/stores/permission"
import { useSettingsStore } from "@/pinia/stores/settings"
import { useUserStore } from "@/pinia/stores/user"
import ThemeSwitch from "@@/components/ThemeSwitch/index.vue"
import { Key, Loading, Lock, Picture, User } from "@element-plus/icons-vue"
import { useRouter } from "vue-router"
import { loginApi, registerApi } from "./apis/index"
import Owl from "./components/Owl.vue"
import { useFocus } from "./composables/useFocus"

const userStore = useUserStore()
const permissionStore = usePermissionStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const { isFocus, handleBlur, handleFocus } = useFocus()

/** Reference to the login form */
const loginFormRef = ref<FormInstance | null>(null)
/** Loading state for login button */
const loading = ref(false)
/** Toggle between login and registration */
const isLogin = ref(true)

/** Data model for the login form */
const loginFormData = reactive({
  username: "",
  password: "",
  userType: "0",
  confirm: ""
})

/** Validation rules for the login form */
const loginFormRules: FormRules = {
  username: [
    { required: true, message: "Please enter username", trigger: "blur" }
  ],
  password: [
    { required: true, message: "Please enter password", trigger: "blur" }
  ],
  confirm: [
    { required: !isLogin.value, message: "Please confirm password", trigger: "blur" }
  ]
}

/** Switch between login and registration modes */
function switchStatus() {
  isLogin.value = !isLogin.value
  loginFormData.username = ""
  loginFormData.password = ""
  loginFormData.confirm = ""
  loginFormData.userType = "0"
}

/** Handle login or registration submission */
async function handleLogin() {
  // Use await to validate the form
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.error("Form validation failed")
    return
  }
  if (!isLogin.value && loginFormData.password !== loginFormData.confirm) {
    ElMessage.error("Passwords do not match")
    return
  }
  loading.value = true

  try {
    if (isLogin.value) {
      const res = await loginApi({
        username: loginFormData.username,
        password: loginFormData.password,
        user_type: Number.parseInt(loginFormData.userType, 10)
      })

      const { data, code } = res
      if (code === 2001) {
        loginFormData.password = ""
        ElMessage.error("Invalid username or password")
        loading.value = false
        return
      }
      if (!data || typeof data !== "object") {
        console.error("Invalid response format:", data)
        ElMessage.error("Login response format error")
        loading.value = false
        return
      }

      if (data.token) {
        userStore.setToken(data.token)
      } else {
        console.warn("Token missing in login response")
      }

      const userInfo = {
        username: String(data.username || ""),
        user_id: String(data.user_id || ""),
        user_type: data.user_type
      }
      console.log("Setting user info:", userInfo)
      await userStore.getInfo(userInfo)

      let roles = []
      switch (String(data.user_type)) {
        case "0":
          roles = ["user"]
          break
        case "1":
          roles = ["admin"]
          break
        case "2":
          roles = ["root"]
          break
        default:
          roles = ["user"]
      }

      userStore.setRoles(roles)

      await permissionStore.setRoutes(roles)
      permissionStore.addRoutes.forEach((route) => {
        router.addRoute(route)
      })

      ElMessage.success("Login successful")
      console.log("Login successful, user type:", data.user_type)

      const userType = String(data.user_type || "0")
      if (userType === "2") {
        console.log("Redirecting to admin dashboard")
        await router.push("/dashboard/index")
      } else {
        await router.push("/")
      }

      loading.value = false
    } else {
      const res = await registerApi({
        username: loginFormData.username,
        password: loginFormData.password
      })

      if (res.data && res.data.success === false) {
        if (res.data.errors && res.data.errors.username) {
          ElMessage.error(res.data.errors.username[0] || "Username error")
        } else {
          ElMessage.error(res.data.message || "Registration failed")
        }
        loading.value = false
        return
      }

      ElMessage.success("Registration successful, please log in")
      isLogin.value = true
      loading.value = false
    }
  } catch (error) {
    console.error(isLogin.value ? "Login failed:" : "Registration failed:", error)
    loginFormData.password = ""
    loading.value = false
    ElMessage.error(isLogin.value ? "Login failed, please try again" : "Registration failed, please try again")
  }
}
</script>

<template>
  <div class="login-container">
    <ThemeSwitch v-if="settingsStore.showThemeSwitch" class="theme-switch" />
    <Owl :close-eyes="isFocus" />
    <div class="login-card">
      <div class="title">
        <img src="@@/assets/images/layouts/logo-text-2.png" alt="Logo">
      </div>
      <div class="content">
        <el-form
          ref="loginFormRef"
          :model="loginFormData"
          :rules="loginFormRules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model.trim="loginFormData.username"
              placeholder="Username"
              type="text"
              tabindex="1"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password"
              placeholder="Password"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
              @blur="handleBlur"
              @focus="handleFocus"
            />
          </el-form-item>
          <el-form-item prop="confirm" v-show="!isLogin">
            <el-input
              v-model.trim="loginFormData.confirm"
              placeholder="Confirm Password"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
              @blur="handleBlur"
              @focus="handleFocus"
            />
          </el-form-item>
          <el-form-item class="less-margin" prop="userType" v-show="isLogin">
            <el-radio-group v-model="loginFormData.userType">
              <el-radio value="0">
                Reader
              </el-radio>
              <el-radio value="1">
                Librarian
              </el-radio>
              <el-radio value="2">
                System Administrator
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-row justify="start">
            <el-col>
              <el-button size="small" link type="primary" @click="switchStatus">
                {{ isLogin ? "Register" : "Login" }}
              </el-button>
            </el-col>
          </el-row>
          <el-button
            class="w-100"
            :loading="loading"
            type="primary"
            size="large"
            @click.prevent="handleLogin"
          >
            {{ isLogin ? "Login" : "Register" }}
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100%;

  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
  }

  .login-card {
    width: 480px;
    max-width: 90%;
    border-radius: 20px;
    box-shadow: 0 0 10px #dcdfe6;
    background-color: var(--el-bg-color);
    overflow: hidden;

    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 150px;
      img {
        height: 100%;
      }
    }

    .content {
      padding: 20px 50px 50px;

      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;

        .el-image {
          width: 100px;
          height: 40px;
          border-left: 0;
          user-select: none;
          cursor: pointer;
          text-align: center;
        }
      }

      .less-margin {
        margin-bottom: 10px;
      }

      .w-100 {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
}
</style>
