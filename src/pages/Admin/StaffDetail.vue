<template>
  <section class="page">
    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <!-- Thông tin nhân viên -->
      <div class="card staff-info">
        <div class="avatar-block">
          <img :src="avatarUrl" class="avatar" alt="avatar" />
        </div>
        <div class="info-block">
          <h2>{{ staff.fullName }}</h2>
          <p>Email: {{ staff.email }}</p>
          <p>SĐT: {{ staff.phoneNumber || '---' }}</p>
          <p>Địa chỉ: {{ staff.address || '---' }}</p>
          <p>Trạng thái:
            <b :style="{color: staff.status === 'ACTIVE' ? '#1a7f37' : '#e53935'}">
              {{ staff.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'KHÓA' }}
            </b>
          </p>
          <p>Ngày tạo: {{ createdDate }}</p>
          <div class="actions">
            <button class="btn primary" @click="goAssign">Phân công chiến dịch</button>
            <button
              v-if="staff.status === 'ACTIVE'"
              class="btn ghost danger"
              @click="lockStaffAction"
            >Khóa</button>
            <button
              v-else
              class="btn ghost success"
              @click="unlockStaffAction"
            >Mở khóa</button>
            <button class="btn ghost danger" @click="showDeleteConfirm = true">Xóa tài khoản</button>
            <button class="btn ghost" @click="goBack">Quay lại</button>
          </div>
        </div>
      </div>
      <!-- Xác nhận xóa tài khoản -->
      <div v-if="showDeleteConfirm" class="modal">
        <div class="modal-body card">
          <h3>Xóa tài khoản nhân viên</h3>
          <p>Bạn có chắc muốn xóa tài khoản nhân viên này?</p>
          <div class="actions">
            <button class="btn ghost" @click="showDeleteConfirm = false" :disabled="deleting">Hủy</button>
            <button class="btn primary danger" @click="deleteStaffAction" :disabled="deleting">
              <span v-if="deleting" class="spinner"></span>
              <span v-else>Đồng ý</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Overlay loading khi đang xóa -->
      <div v-if="deleting" class="overlay-loading">
        <div class="spinner-large"></div>
        <div style="color:#fff;margin-top:12px;font-weight:600;">Đang xóa tài khoản...</div>
      </div>
      <!-- Danh sách chiến dịch -->
      <div class="card campaign-list">
        <h3>Chiến dịch được phân công</h3>
        <div v-if="campaigns.length === 0" class="empty">Nhân viên này chưa được phân công chiến dịch nào</div>
        <table v-else class="campaign-table">
          <thead>
            <tr>
              <th>Mã chiến dịch</th>
              <th>Tên chiến dịch</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Tiến độ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in campaigns" :key="c.code">
              <td>{{ c.code }}</td>
              <td>{{ c.name }}</td>
              <td>{{ c.status }}</td>
              <td>{{ formatDate(c.startDate) }} - {{ formatDate(c.endDate) }}</td>
              <td>
                <span>{{ formatMoney(c.currentAmount) }}/{{ formatMoney(c.targetAmount) }}</span>
                <span class="percent">({{ percent(c.currentAmount, c.targetAmount) }}%)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStaffDetail, lockStaff, unlockStaff, deleteStaff } from '@/api/admin.api';
import defaultAvatar from '@/assets/image/avatar.png';

const route = useRoute();
const router = useRouter();
const staffCode = route.params.staffCode;

const staff = ref({});
const campaigns = ref([]);
const loading = ref(true);
const error = ref('');
const successMessage = ref("");
const showDeleteConfirm = ref(false);
const deleting = ref(false);

const fetchStaff = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await getStaffDetail(staffCode);
    if (res && res.code) {
      staff.value = res;
      campaigns.value = res.campaigns || [];
    } else {
      throw new Error('Không tìm thấy nhân viên');
    }
  } catch (err) {
    error.value = err?.message || 'Lỗi tải dữ liệu';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStaff);

const avatarUrl = computed(() => staff.value.avatarPath || staff.value.avatarPaths?.originalPath || defaultAvatar);
const createdDate = computed(() => {
  if (!staff.value.createdAt) return '---';
  const d = new Date(staff.value.createdAt);
  return d.toLocaleDateString('vi-VN');
});

const formatDate = (d) => {
  if (!d) return '---';
  const date = new Date(d);
  return date.toLocaleDateString('vi-VN');
};
const formatMoney = (v) => v ? v.toLocaleString('vi-VN') + '₫' : '0₫';
const percent = (a, b) => b ? Math.round((a / b) * 100) : 0;

const goAssign = () => {
  router.push({ name: 'admin-assign', query: { staffCode: staff.value.code } });
};
const goBack = () => {
  router.push('/admin/staff');
};
const lockStaffAction = async () => {
  try {
    await lockStaff(staff.value.email);
    await fetchStaff();
    successMessage.value = 'Đã khóa nhân viên';
    setTimeout(() => { successMessage.value = ''; }, 2000);
  } catch (err) {
    successMessage.value = err?.message || 'Khóa nhân viên thất bại';
    setTimeout(() => { successMessage.value = ''; }, 2000);
  }
};
const unlockStaffAction = async () => {
  try {
    await unlockStaff(staff.value.email);
    await fetchStaff();
    successMessage.value = 'Đã mở khóa nhân viên';
    setTimeout(() => { successMessage.value = ''; }, 2000);
  } catch (err) {
    successMessage.value = err?.message || 'Mở khóa nhân viên thất bại';
    setTimeout(() => { successMessage.value = ''; }, 2000);
  }
};
const deleteStaffAction = async () => {
  if (deleting.value) return;
  deleting.value = true;
  try {
    await deleteStaff(staff.value.email);
    showDeleteConfirm.value = false;
    successMessage.value = 'Đã xóa tài khoản';
    setTimeout(() => {
      successMessage.value = '';
      goBack();
    }, 1200);
  } catch (err) {
    successMessage.value = err?.message || 'Xóa tài khoản thất bại';
    setTimeout(() => { successMessage.value = ''; }, 2000);
  } finally {
    deleting.value = false;
  }
};
</script>
<style>
.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid #fff;
  border-top: 3px solid #09d1c7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}
.spinner-large {
  width: 38px;
  height: 38px;
  border: 5px solid #fff;
  border-top: 5px solid #09d1c7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.overlay-loading {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.page {
  padding: 32px;
  display: grid;
  gap: 24px;
}
.staff-info {
  display: flex;
  gap: 32px;
  align-items: center;
  padding: 24px;
}
.avatar-block {
  flex-shrink: 0;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  background: #f3f7f9;
  border: 2px solid #e6e6e6;
}
.info-block {
  display: grid;
  gap: 8px;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.campaign-list {
  padding: 24px;
}
.campaign-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}
.campaign-table th, .campaign-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}
.campaign-table th {
  background: #f3f7f9;
}
.percent {
  color: #15919B;
  font-weight: 600;
  margin-left: 6px;
}
.empty {
  color: #888;
  padding: 24px 0;
  text-align: center;
}
.loading {
  text-align: center;
  color: #15919B;
  font-size: 18px;
  padding: 32px 0;
}
.error {
  color: #e53935;
  text-align: center;
  font-size: 18px;
  padding: 32px 0;
}
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }
  .btn {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--primary);
    font-weight: 600;
    background: transparent;
    color: var(--primary-strong);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn.primary {
    background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
    color: #fff;
    border: none;
  }
  .btn.ghost {
    background: transparent;
    color: var(--primary-strong);
    border: 1px solid var(--primary);
  }
  .btn.ghost.danger {
    color: #e53935;
    border-color: #e53935;
  }
  .btn.ghost.success {
    color: #1a7f37;
    border-color: #1a7f37;
  }
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
</style>
