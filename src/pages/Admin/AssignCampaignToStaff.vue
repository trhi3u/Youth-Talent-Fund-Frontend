<template>
  <teleport to="body">
    <div v-if="visible" class="overlay" role="dialog" aria-modal="true">
      <div class="modal">
        <header class="modal__head">
          <h2>Phân công chiến dịch</h2>
          <button class="icon-btn" @click="emit('close')" aria-label="Đóng">✕</button>
        </header>

        <div class="modal__body">
          <div class="field" v-if="lockedCampaign">
            <span class="label">Chiến dịch</span>
            <div class="pill">{{ lockedCampaign.title || lockedCampaign.name || 'Chiến dịch' }}</div>
          </div>
          <div class="field" v-else>
            <label class="label" for="campaign">Chọn chiến dịch</label>
            <select id="campaign" v-model="selection.campaignId" required>
              <option value="" disabled>-- Chọn chiến dịch --</option>
              <option
                v-for="c in campaignOptions"
                :key="c.id || c.campaignCode || c.code || c.campaignId"
                :value="c.id || c.campaignCode || c.code || c.campaignId"
              >
                {{ c.title || c.name }}
              </option>
            </select>
          </div>

          <div class="field" v-if="lockedStaff">
            <span class="label">Nhân viên</span>
            <div class="pill">{{ lockedStaff.fullName || lockedStaff.name || lockedStaff.email }}</div>
          </div>
          <div class="field" v-else>
            <label class="label" for="staff">Chọn nhân viên</label>
            <select id="staff" v-model="selection.staffId" required>
              <option value="" disabled>-- Chọn nhân viên --</option>
              <option
                v-for="s in staffOptions"
                :key="s.id || s.code || s.staffCode"
                :value="s.id || s.code || s.staffCode"
              >
                {{ s.fullName || s.name }}
              </option>
            </select>
          </div>
        </div>

        <footer class="modal__foot">
          <button class="btn ghost" @click="emit('close')">Hủy</button>
          <button class="btn primary" @click="onSubmit">Phân công</button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from 'vue';
import { useAdminStore } from '@/stores/adminStore';

const props = defineProps({
  visible: { type: Boolean, default: false },
  campaign: { type: Object, default: null }, // nếu truyền vào => khóa chọn campaign
  staff: { type: Object, default: null } // nếu truyền vào => khóa chọn staff
});

const emit = defineEmits(['close', 'assign']);

const adminStore = useAdminStore();
const staffOptions = computed(() => adminStore.staff || []);
const campaignOptions = computed(() => {
  const list = adminStore.campaigns || [];
  // Khi khóa staff (mở từ StaffDetail) thì ẩn CANCELLED/COMPLETED
  if (props.staff) return list.filter(c => !['CANCELLED', 'COMPLETED'].includes((c.status || '').toUpperCase()));
  return list;
});

const selection = reactive({
  staffId: '',
  campaignId: ''
});

const lockedCampaign = computed(() => props.campaign);
const lockedStaff = computed(() => props.staff);

const preloadSelection = () => {
  selection.campaignId = lockedCampaign.value?.id
    || lockedCampaign.value?.campaignCode
    || lockedCampaign.value?.code
    || lockedCampaign.value?.campaignId
    || '';
  selection.staffId = lockedStaff.value?.id
    || lockedStaff.value?.code
    || lockedStaff.value?.staffCode
    || '';
};

watch(
  () => props.visible,
  v => { if (v) preloadSelection(); }
);

onMounted(async () => {
  await Promise.all([adminStore.fetchStaff(), adminStore.fetchCampaigns()]);
  preloadSelection();
});

const onSubmit = () => {
  if (!selection.staffId || !selection.campaignId) return;
  emit('assign', { staffId: selection.staffId, campaignId: selection.campaignId });
};
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: grid;
  place-items: center;
  z-index: 2000;
}
.modal {
  width: min(480px, 92vw);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}
.modal__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #e6eef3;
}
.modal__head h2 {
  margin: 0;
  font-size: 17px;
  color: #123047;
}
.icon-btn {
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  color: #5c738a;
}
.modal__body {
  padding: 14px 16px 4px;
  display: grid;
  gap: 12px;
}
.field {
  display: grid;
  gap: 6px;
}
.label {
  font-weight: 600;
  color: #35516d;
  font-size: 14px;
}
select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(12, 100, 120, 0.2);
  font-size: 15px;
}
.pill {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafd;
  border: 1px solid rgba(12, 100, 120, 0.16);
  color: #123047;
  font-weight: 700;
}
.modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px 14px;
  border-top: 1px solid #e6eef3;
}
.btn {
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
  border: 1px solid #09d1c7;
  background: #f2fbf8;
  color: #15919B;
  cursor: pointer;
}
.btn.primary {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  border: none;
}
.btn.ghost {
  background: transparent;
  color: #15919B;
  border: 1px solid #09d1c7;
}
</style>
