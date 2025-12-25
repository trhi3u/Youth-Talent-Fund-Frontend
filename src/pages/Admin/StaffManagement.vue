<template>
  <section class="page">
    <div class="card box">
      <div class="header">
        <h1>Quản lý Nhân viên</h1>
        <div style="display: flex; gap: 12px; align-items: center;">
          <SearchBar :placeholder="'Tìm theo tên nhân viên...'" @search="onSearch" />
          <button class="btn primary" @click="openCreate = true">Nhân viên mới</button>
        </div>
      </div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div class="grid">
        <template v-if="staffList.length">
          <StaffCard
            v-for="item in staffList"
            :key="item.code"
            :staff="item"
            @edit="onEditStaff"
            @lock="onLockStaff"
            @unlock="onUnlockStaff"
            @detail="goToDetail"
          />
        </template>
        <template v-else>
          <div style="padding:32px;text-align:center;color:#888;font-size:18px;">Không có nhân viên phù hợp</div>
        </template>
      </div>
      <StaffEditForm
        v-if="editingStaff"
        :staff="editingStaff"
        @close="editingStaff = null"
        @updated="fetchStaffs(search.value)"
      />

      <div v-if="openCreate" class="modal">
        <div class="modal-body card">
          <h3>Tạo tài khoản nhân viên</h3>
          <form class="form" @submit.prevent="create">
            <div v-if="errors.length" class="errors">
              <div v-for="err in errors" :key="err" class="error">{{ err }}</div>
            </div>
            <input v-model="form.fullName" placeholder="Họ tên" required />
            <input v-model="form.email" placeholder="Email" required />
            <input v-model="form.phoneNumber" placeholder="Số điện thoại" />
            <input v-model="form.address" placeholder="Địa chỉ" />
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
import { ref, reactive, onMounted } from 'vue';
import StaffCard from './StaffCard.vue';
import StaffEditForm from './StaffEditForm.vue';
import SearchBar from '@/components/common/SearchBar.vue';
import { getStaffs, lockStaff, unlockStaff } from '@/api/admin.api';
const onLockStaff = async (staff) => {
  try {
    await lockStaff(staff.email);
    successMessage.value = 'Đã khóa nhân viên thành công';
    fetchStaffs(search.value);
    setTimeout(() => { successMessage.value = ''; }, 2000);
  } catch (err) {
    successMessage.value = '';
    window.alert(err?.message || 'Khóa nhân viên thất bại');
  }
};

const onUnlockStaff = async (staff) => {
  try {
    await unlockStaff(staff.email);
    successMessage.value = 'Đã mở khóa nhân viên thành công';
    fetchStaffs(search.value);
    setTimeout(() => { successMessage.value = ''; }, 2000);
  } catch (err) {
    successMessage.value = '';
    window.alert(err?.message || 'Mở khóa nhân viên thất bại');
  }
};
import { useAdminStore } from '@/stores/adminStore';

const adminStore = useAdminStore();
const staffList = ref([]);
const search = ref('');
const openCreate = ref(false);
const editingStaff = ref(null);
const form = reactive({ fullName: '', email: '', phoneNumber: '', address: '', password: '' });

import { useRouter } from 'vue-router';
const router = useRouter();
const onEditStaff = (staff) => {
  editingStaff.value = { ...staff };
};
const goToDetail = (staff) => {
  if (staff && staff.code) {
    router.push({ name: 'admin-staff-detail', params: { staffCode: staff.code } });
  }
};

const fetchStaffs = async (keyword = '') => {
  const res = await getStaffs({ keyword });

  let list = res?.content || [];
  if (keyword && list.length) {
    const words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter(staff =>
      words.every(word => staff.fullName?.toLowerCase().includes(word))
    );
  }
  staffList.value = list;
};
onMounted(() => {
  fetchStaffs();
});

const onSearch = (keyword) => {
  search.value = keyword;
  fetchStaffs(keyword);
};

const errors = ref([]);
const successMessage = ref("");
const phonePattern = /^(?:\+84|0)[35789][0-9]{8}$/;
const validate = () => {
  errors.value = [];
  if (!form.fullName) errors.value.push('Họ tên không được để trống');
  if (!form.email) {
    errors.value.push('Email không được để trống');
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.value.push('Email không đúng định dạng');
  }
  if (!form.password) {
    errors.value.push('Mật khẩu không được để trống');
  } else if (form.password.length < 6) {
    errors.value.push('Mật khẩu phải có ít nhất 6 ký tự');
  }
  if (form.phoneNumber && !phonePattern.test(form.phoneNumber)) {
    errors.value.push('Số điện thoại không hợp lệ. Vui lòng nhập dạng 0xxxxxxxxx hoặc +84xxxxxxxxx');
  }
  return errors.value.length === 0;
};

const create = async () => {
  if (!validate()) return;
  try {
    await adminStore.addStaff({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      phoneNumber: form.phoneNumber,
      address: form.address || null
    });
    openCreate.value = false;
    Object.assign(form, { fullName: '', email: '', password: '', phoneNumber: '', address: '' });
    successMessage.value = 'Tạo tài khoản thành công';
    setTimeout(() => { successMessage.value = ''; }, 2500);
    fetchStaffs(search.value);
  } catch (err) {
    errors.value = ['Người dùng đã tồn tại' || 'Tạo tài khoản thất bại'];
  }
};
</script>

<style scoped lang="scss">
.success-message {
  background: #e6fff2;
  color: #1a7f37;
  border: 1px solid #b2f2d7;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 600;
}
.page { 
  padding: 32px; 
}

.box { 
  padding: 24px; 
  display: grid; 
  gap: 12px; 
  position: relative; 
}

.header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.grid { 
  display: grid; 
  gap: 12px; 
}

.row { 
  padding: 16px; 
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

.modal { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.25); 
  display: grid; 
  place-items: center; 
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

input { 
  padding: 12px; 
  border-radius: 8px;
   border: 1px solid rgba(12, 100, 120, 0.2);
}

.actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 8px; 
}

  .errors { 
    margin-bottom: 8px; 
  }
  .error { color: #e53935; 
  font-size: 14px; 
  margin-bottom: 2px; 
  }
</style>
