<template>
  <div class="modal">
    <div class="modal-body card">
      <h3>Chỉnh sửa thông tin nhân viên</h3>
      <form class="form" @submit.prevent="onSubmit">
        <div v-if="errors.length" class="errors">
          <div v-for="err in errors" :key="err" class="error">{{ err }}</div>
        </div>
        <input v-model="form.fullName" placeholder="Họ tên" required />
        <input v-model="form.phoneNumber" placeholder="Số điện thoại" />
        <input v-model="form.address" placeholder="Địa chỉ" />
        <textarea v-model="form.bio" placeholder="Giới thiệu bản thân" rows="5" />
        <div class="actions">
          <button class="btn ghost" type="button" @click="$emit('close')">Hủy</button>
          <button class="btn primary" type="submit">Xác nhận</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, toRefs } from 'vue';
import { updateStaff } from '@/api/admin.api';

const props = defineProps({
  staff: { type: Object, required: true }
});
const emit = defineEmits(['close', 'updated']);

const form = reactive({
  fullName: '',
  address: '',
  phoneNumber: '',
  bio: ''
});
const errors = ref([]);
const loading = ref(false);

watch(
  () => props.staff,
  (staff) => {
    if (staff) {
      form.fullName = staff.fullName || '';
      form.address = staff.address || '';
      form.phoneNumber = staff.phoneNumber || '';
      form.bio = staff.bio || '';
    }
  },
  { immediate: true }
);

const phonePattern = /^(?:\+84|0)[35789][0-9]{8}$/;

const validate = () => {
  errors.value = [];
  if (!form.fullName) errors.value.push('Họ tên không được để trống');
  if (form.phoneNumber && !phonePattern.test(form.phoneNumber)) {
    errors.value.push('Số điện thoại không hợp lệ. Vui lòng nhập dạng 0xxxxxxxxx hoặc +84xxxxxxxxx');
  }
  return errors.value.length === 0;
};

const onSubmit = async () => {
  if (!validate() || loading.value) return;
  loading.value = true;
  try {
    await updateStaff({
      email: props.staff.email,
      fullName: form.fullName,
      address: form.address,
      phoneNumber: form.phoneNumber,
      bio: form.bio
    });
    emit('updated');
    emit('close');
  } catch (err) {
    errors.value = [err?.message || 'Cập nhật thất bại, vui lòng thử lại'];
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal-body {
  padding: 20px;
  width: 420px;
  display: grid;
  gap: 10px;
}
.form {
  display: grid;
  gap: 8px;
}
input, textarea {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(12, 100, 120, 0.2);
}
textarea {
  resize: none;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--primary);
  font-weight: 600;
}
.primary {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
}
.ghost {
  background: transparent;
  color: var(--primary-strong);
}
.errors {
  margin-bottom: 8px;
}
.error {
  color: #e53935;
  font-size: 14px;
  margin-bottom: 2px;
}
</style>
