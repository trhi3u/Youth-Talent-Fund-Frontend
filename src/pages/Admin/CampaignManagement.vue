<template>
  <section class="page">
    <div class="header">
      <div>
        <h1>Quản lý chiến dịch</h1>
      </div>
      <RouterLink class="btn primary" to="/admin/campaigns/create">Tạo chiến dịch</RouterLink>
    </div>

    <div class="filters">
      <label class="search-bar">
        <span class="icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="6" />
            <path d="M15.5 15.5 21 21" stroke-linecap="round" />
          </svg>
        </span>
        <input
          type="search"
          v-model="keyword"
          placeholder="Tìm kiếm chiến dịch..."
          @keyup.enter="onSearch"
        />
      </label>

      <div class="filter-right">
        <div class="status-group">
          <button
            v-for="item in statusOptions"
            :key="item.value || 'all'"
            type="button"
            :class="['status-btn', { active: item.value === status } ]"
            @click="onStatus(item.value)"
          >
            {{ item.label }}
          </button>
        </div>

        <select class="category-select" v-model="category" @change="onCategory">
          <option value="">Tất cả danh mục</option>
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="grid">
      <CampaignCardFull v-for="n in 4" :key="n" :loading="true" role="ADMIN" />
    </div>

    <div v-else class="grid">
      <CampaignCardFull
        v-for="item in campaigns"
        :key="item.campaignCode || item.id"
        :campaign="item"
        role="ADMIN"
        @assign="openAssignModal(item)"
        @status-updated="fetchCampaigns"
      />
      <div v-if="!campaigns.length" class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Không có chiến dịch phù hợp</p>
      </div>
    </div>
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page === 0" @click="onPrev">◀ Prev</button>
      <button
        v-for="n in paginationPages"
        :key="n"
        :class="['page-btn', { active: n === page + 1 }]"
        @click="typeof n === 'number' && onPage(n - 1)"
        :disabled="n === '...'"
      >
        {{ n }}
      </button>
      <button :disabled="page === totalPages - 1" @click="onNext">Next ▶</button>
    </div>

    <AssignCampaignToStaff
      v-if="showAssignModal"
      :visible="showAssignModal"
      :campaign="assignCampaign"
      @close="closeAssignModal"
      @assign="handleAssign"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import CampaignCardFull from '@/components/campaign/CampaignCardFull.vue';
import AssignCampaignToStaff from '@/pages/Admin/AssignCampaignToStaff.vue';
import { getCategoryOptions } from '@/utils/category';
import { getCampaigns } from '@/api/public.api';
import { getCampaignDetail } from '@/api/public.api';
import { updateCampaign } from '@/api/management.api';
import { toUtcString } from '@/utils/date';

const showAssignModal = ref(false);
const assignCampaign = ref(null);
const openAssignModal = campaign => {
  assignCampaign.value = campaign;
  showAssignModal.value = true;
};
const closeAssignModal = () => {
  showAssignModal.value = false;
  assignCampaign.value = null;
};
const assignLoading = ref(false);

const handleAssign = async ({ staffId, campaignId }) => {
  if (assignLoading.value || !staffId) return;
  const code = campaignId || assignCampaign.value?.campaignCode || assignCampaign.value?.code || assignCampaign.value?.campaignId || assignCampaign.value?.id;
  if (!code) return;
  assignLoading.value = true;
  try {
    const detail = await getCampaignDetail(code);
    const data = {
      title: detail.title || detail.name || 'Chiến dịch',
      description: detail.description || detail.story || '',
      location: detail.location || null,
      story: detail.story || detail.description || null,
      targetAmount: detail.targetAmount?.toString() || detail.goal?.toString() || '',
      startDate: detail.startDate ? toUtcString(detail.startDate) : null,
      endDate: detail.endDate ? toUtcString(detail.endDate) : null,
      category: detail.category || detail.categoryName || detail.topic || '',
      assigneeCode: staffId
    };
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    await updateCampaign(code, fd);
    await fetchCampaigns();
    closeAssignModal();
    window.location.reload();
  } catch (err) {
    console.error('Assign campaign failed', err);
  } finally {
    assignLoading.value = false;
  }
};

const campaigns = ref([]);
const page = ref(0);
const size = ref(10);
const totalPages = ref(0);
const keyword = ref('');
const status = ref('');
const category = ref('');
const loading = ref(false);

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Đang diễn ra', value: 'IN_PROGRESS' },
  { label: 'Đã hoàn thành', value: 'COMPLETED' }
];
const categoryOptions = getCategoryOptions();

async function fetchCampaigns() {
  loading.value = true;
  try {
    const params = {
      keyword: keyword.value || undefined,
      status: status.value || undefined,
      category: category.value || undefined,
      page: page.value,
      size: size.value
    };
    const res = await getCampaigns(params);
    campaigns.value = res?.content || [];
    totalPages.value = res?.totalPages || 0;
  } catch (e) {
    campaigns.value = [];
    totalPages.value = 0;
  }
  loading.value = false;
}

function onSearch() {
  page.value = 0;
  fetchCampaigns();
}
function onStatus(val) {
  status.value = val;
  page.value = 0;
  fetchCampaigns();
}
function onCategory() {
  page.value = 0;
  fetchCampaigns();
}
function onPrev() {
  if (page.value > 0) {
    page.value--;
    fetchCampaigns();
  }
}
function onNext() {
  if (page.value < totalPages.value - 1) {
    page.value++;
    fetchCampaigns();
  }
}
function onPage(p) {
  if (p !== page.value) {
    page.value = p;
    fetchCampaigns();
  }
}

const paginationPages = computed(() => {
  const total = totalPages.value;
  const current = page.value + 1;
  if (total <= 4) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
});

onMounted(fetchCampaigns);
</script>

<style scoped lang="scss">
.page {
  padding: 28px;
  background: #f6f8fb;
  display: grid;
  gap: 18px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

h1 { margin: 0; }
.hint { margin: 4px 0 0; color: #5d7588; }

.filters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-bar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(12, 100, 120, 0.12);
  box-shadow: 0 6px 18px rgba(12, 100, 120, 0.08);
  width: 100%;
}

.search-bar input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  color: #0b6c7f;
  font-weight: 500;
  font-size: 14px;
}

.icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  color: #0b6c7f;
  opacity: 0.8;
}

.status-group {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.18);
  background: #f4fbf8;
  color: #0b6c7f;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn.active {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(9, 209, 199, 0.35);
}

.status-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.category-select {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.18);
  background: #ffffff;
  color: #0b6c7f;
  font-weight: 600;
  min-width: 200px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.empty {
  padding: 18px;
  border: 1px dashed rgba(12, 100, 120, 0.25);
  border-radius: 12px;
  text-align: center;
  color: rgba(12, 100, 120, 0.8);
  display: grid;
  gap: 6px;
  place-items: center;
}

.empty-icon { font-size: 20px; }

.btn {
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(12, 100, 120, 0.18);
  background: #f2fbf8;
  color: #0b6c7f;
}

.btn.primary {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  border-color: rgba(9, 209, 199, 0.35);
}

@media (min-width: 768px) {
  .filters {
    grid-template-columns: minmax(420px, 1.3fr) auto;
  }
}

@media (max-width: 640px) {
  .filter-right { justify-content: flex-start; }
}
// ...existing code...
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 24px 0 0 0;

  button {
    min-width: 38px;
    height: 38px;
    padding: 0 14px;
    border: none;
    border-radius: 50%;
    background: #f4fbf8;
    color: #0b6c7f;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 2px 8px rgba(9, 209, 199, 0.08);
    outline: none;
    position: relative;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #e9ecef;
    color: #b0b8c1;
    box-shadow: none;
  }
  .page-btn.active {
    background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(9, 209, 199, 0.18);
    font-weight: 800;
    border: none;
    z-index: 1;
  }
  button:not(:disabled):hover {
    background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
    color: #fff;
    box-shadow: 0 6px 18px rgba(9, 209, 199, 0.22);
    transform: translateY(-2px) scale(1.07);
  }
}
</style>
