<template>
  <section class="staff-shell">
    <DashboardSidebar role="STAFF" />
    <main class="main">
      <RouterView />
    </main>
  </section>
</template>

<script setup>
import DashboardSidebar from '@/components/common/DashboardSidebar.vue';
</script>

<style scoped lang="scss">
.staff-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: #f6f8fb;
}

.main {
  min-height: 100vh;
}
</style>
