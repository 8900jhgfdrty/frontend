<script lang="ts" setup>
import SvgDashboard from "../images/dashboard.svg?component" // vite-svg-loader
</script>

<template>
  <div class="app-container center">
    <SvgDashboard class="svg" />
  </div>
</template>

<style lang="scss" scoped>
.center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .svg {
    width: 600px;
    max-width: 100%;
  }
}
</style>
