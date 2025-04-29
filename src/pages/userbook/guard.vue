<script setup lang="ts" name="systemDic">
import { ElMessage } from "element-plus"
import { defineAsyncComponent, onMounted, reactive, ref } from "vue"
import { getAuthorListApi, getCategoryApi } from "./apis/index"
import RecommendedBooks from "./components/RecommendedBooks.vue"

const state = reactive<any>({
  authorList: [],
  categoryList: [],
  loading: false
})

// Load author and category data
async function loadData() {
  state.loading = true
  try {
    // Get author list
    const authorResponse = await getAuthorListApi()
    if (authorResponse.data && Array.isArray(authorResponse.data.results)) {
      state.authorList = authorResponse.data.results
    } else if (authorResponse.data && Array.isArray(authorResponse.data)) {
      state.authorList = authorResponse.data
    } else if (Array.isArray(authorResponse.results)) {
      state.authorList = authorResponse.results
    } else if (Array.isArray(authorResponse)) {
      state.authorList = authorResponse
    } else {
      console.error("Failed to load author list:", authorResponse)
      state.authorList = []
    }

    // Get category list
    const categoryResponse = await getCategoryApi()
    if (categoryResponse.data && Array.isArray(categoryResponse.data.results)) {
      state.categoryList = categoryResponse.data.results
    } else if (categoryResponse.data && Array.isArray(categoryResponse.data)) {
      state.categoryList = categoryResponse.data
    } else if (Array.isArray(categoryResponse.results)) {
      state.categoryList = categoryResponse.results
    } else if (Array.isArray(categoryResponse)) {
      state.categoryList = categoryResponse
    } else {
      console.error("Failed to load category list:", categoryResponse)
      state.categoryList = []
    }
  } catch (error) {
    console.error("Failed to load data:", error)
    ElMessage.error("Failed to load data, please refresh and try again")
  } finally {
    state.loading = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="system-dic-container">
    <el-card v-loading="state.loading" shadow="hover" class="recommendation-card">
      <template #header>
        <div class="card-header">
          <h3>Recommended Books</h3>
        </div>
      </template>
      <RecommendedBooks />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.system-dic-container {
  width: 100%;
  height: 100%;

  .recommendation-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: #303133;
      }
    }
  }
}
</style>
