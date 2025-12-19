<template>
  <section class="page">
    <div class="card box">
      <div class="header">
        <h1>Quản lý Staff</h1>
        <button class="btn primary" @click="openCreate = true">Thêm staff</button>
      </div>
      <div class="grid">
        <article v-for="item in staff" :key="item.id" class="card row">
          <div>
            <h3>{{ item.name }}</h3>
            <p>{{ item.email }} | {{ item.phone }}</p>
          </div>
        </article>
      </div>

      <div v-if="openCreate" class="modal">
        <div class="modal-body card">
          <h3>Tạo tài khoản staff</h3>
          <form class="form" @submit.prevent="create">
            <input v-model="form.name" placeholder="Họ tên" required />
            <input v-model="form.email" placeholder="Email" required />
            <input v-model="form.phone" placeholder="Số điện thoại" />
            <input v-model="form.password" type="password" placeholder="Mật khẩu" required />
            <div class="actions">
              <button class="btn ghost" type="button" @click="openCreate = false">Hủy</button>
              <button class="btn primary" type="submit">Tạo</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useAdminStore } from '@/stores/adminStore';

const adminStore = useAdminStore();
const staff = computed(() => adminStore.staff);
const openCreate = ref(false);
const form = reactive({ name: '', email: '', phone: '', password: '' });

onMounted(() => {
  adminStore.fetchStaff();
});

const create = async () => {
  await adminStore.addStaff({ ...form });
  openCreate.value = false;
};
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; position: relative; }
.header { display: flex; justify-content: space-between; align-items: center; }
.grid { display: grid; gap: 12px; }
.row { padding: 16px; }
.btn { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--primary); font-weight: 600; }
.primary { background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%); color: #fff; }
.ghost { background: transparent; color: var(--primary-strong); }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.25); display: grid; place-items: center; }
.modal-body { padding: 20px; width: 420px; display: grid; gap: 10px; }
.form { display: grid; gap: 8px; }
input { padding: 12px; border-radius: 8px; border: 1px solid rgba(12, 100, 120, 0.2); }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
