
<template>
  <div class="staff-card card row">
    <div style="display: flex; flex-direction: column; gap: 4px; color:black;">
      <h3>{{ staff.fullName }}</h3>
      <p>Email: {{ staff.email }}</p>
      <p>SĐT: {{ staff.phoneNumber }}</p>
      <div class="staff-stats-row">
        <span>Trạng thái:
          <b :style="{color: staff.status === 'ACTIVE' ? '#1a7f37' : '#e53935'}">
            {{ staff.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'KHÓA' }}
          </b>
        </span>
        <span style="color:#15919B;">Đang thực hiện: <b>{{ staff.totalInProgress ?? 0 }}</b></span>
        <span style="color:#15919B;">Đã hoàn thành: <b>{{ staff.totalCompleted ?? 0 }}</b></span>
        <span style="color:#15919B;">Tổng quyên góp: <b>{{ staff.totalDonations ?? 0 }}</b></span>
      </div>
    
    </div>
    <div class="actions" style="margin-top: 8px; gap: 8px;">
      <button class="btn" @click="$emit('detail', staff)">Chi tiết</button>
      <button class="btn" @click="$emit('edit', staff)">Chỉnh sửa</button>
      <button
        v-if="staff.status === 'ACTIVE'"
        class="btn ghost"
        style="color: #e53935; border-color: #e53935;"
        @click="$emit('lock', staff)"
      >Khóa</button>
      <button
        v-else
        class="btn ghost"
        style="color: #1a7f37; border-color: #1a7f37;"
        @click="$emit('unlock', staff)"
      >Mở khóa</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ staff: Object });
</script>

<style scoped lang="scss">
  .actions {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
    align-items: stretch;
  }

  .staff-stats-row {
        display: flex;
        align-items: center;
        gap: 36px;
        margin: 6px 0;
    }

  .btn {
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid rgba(12, 100, 120, 0.18);
    transition: transform 0.12s ease, box-shadow 0.15s ease;
    background: #f2fbf8;
    color: var(--primary-strong);
  }
  .btn.ghost {
    background: #f2fbf8;
    color: var(--primary-strong);
    border-color: rgba(12, 100, 120, 0.18);
  }
  .btn:hover { transform: translateY(-1px); }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
</style>