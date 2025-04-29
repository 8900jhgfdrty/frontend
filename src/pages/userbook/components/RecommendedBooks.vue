<script setup lang="ts">
import { ElMessage } from "element-plus"
import { onMounted, ref } from "vue"
import { getRecommendedBooksApi } from "../apis"

interface Book {
  id: number
  title: string
  author_name: string
  category_name: string
  description: string
  recommendation_type: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    books: Book[]
    total: number
    is_personalized: boolean
  }
}

const books = ref<Book[]>([])
const loading = ref(false)
const isPersonalized = ref(false)
const currentPage = ref(1)

// get recommended books
async function getRecommendedBooks() {
  loading.value = true
  try {
    const response = await getRecommendedBooksApi() as ApiResponse
    console.log("API response:", response)
    if (response.success) {
      books.value = response.data.books
      isPersonalized.value = response.data.is_personalized
    } else {
      ElMessage.error(response.message || "Failed to get recommended books")
    }
  } catch (error) {
    console.error("Failed to get recommended books:", error)
    ElMessage.error("Failed to get recommended books, please try again later")
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
}

onMounted(() => {
  getRecommendedBooks()
})
</script>

<template>
  <div class="recommended-books">
    <el-card shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>Smart Recommendation</span>
          <el-tag :type="isPersonalized ? 'success' : 'info'" size="small">
            {{ isPersonalized ? "Personalized Recommendation" : "Latest Books" }}
          </el-tag>
        </div>
      </template>

      <el-empty v-if="!books.length" description="No recommended books" />

      <div v-else>
        <el-table :data="books" style="width: 100%">
          <el-table-column type="index" label="Index" width="80" />
          <el-table-column prop="title" label="Title" show-overflow-tooltip />
          <el-table-column prop="description" label="Description" show-overflow-tooltip />
          <el-table-column prop="author_name" label="Author" show-overflow-tooltip />
          <el-table-column prop="category_name" label="Category" show-overflow-tooltip />
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="10"
            :total="books.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.recommended-books {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
