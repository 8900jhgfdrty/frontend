<script lang="ts" setup>
import { useUserStore } from "@/pinia/stores/user"
import Admin from "./components/Admin.vue"

// const userStore = useUserStore()
</script>

<template>
  <component :is="Admin" />
</template>
