<template>
  <section class="page">
    <div class="card box">
      <h1>Đổi mật khẩu</h1>
      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>Mật khẩu hiện tại</span>
          <input type="password" v-model="current" required />
        </label>
        <label class="field">
          <span>Mật khẩu mới</span>
          <input type="password" v-model="next" required />
        </label>
        <label class="field">
          <span>Nhập lại</span>
          <input type="password" v-model="confirm" required />
        </label>
        <button class="btn primary" type="submit">Cập nhật</button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const current = ref('');
const next = ref('');
const confirm = ref('');

const submit = () => {
  if (next.value !== confirm.value) {
    alert('Mật khẩu không khớp');
    return;
  }
  alert('Đã gửi yêu cầu đổi mật khẩu (mock)');
};
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
.form { display: grid; gap: 10px; }
.field { display: grid; gap: 6px; }
input { padding: 12px; border: 1px solid rgba(12, 100, 120, 0.2); border-radius: 8px; }
.btn { padding: 12px; border-radius: 8px; border: 1px solid var(--primary); background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%); color: #fff; font-weight: 600; }
</style>
