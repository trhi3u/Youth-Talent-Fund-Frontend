<template>
  <section class="page">
    <div class="card box">
      <h1>Dashboard Admin</h1>
      <div class="stats">
        <div class="stat card">
          <div class="label">Tổng chiến dịch</div>
          <div class="value">1000</div>
        </div>
        <div class="stat card">
          <div class="label">Đang hoạt động</div>
          <div class="value">300</div>
        </div>
        <div class="stat card">
          <div class="label">Hoàn thành</div>
          <div class="value">700</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 16px; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.stat { padding: 16px; }
.label { color: #35516d; }
.value { font-size: 32px; font-weight: 700; color: var(--primary-strong); }
</style>
