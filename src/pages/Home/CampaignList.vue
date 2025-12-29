<template>
  <section class="page">
    <div class="header">
      <div>
        <h1 class="title">Tất cả chiến dịch</h1>
        <p class="eyebrow">Cùng nhau chung tay giúp đỡ những hoàn cảnh khó khăn, lan tỏa yêu thương đến mọi miền đất nước</p>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Tổng cộng:</span>
            <span class="stat-value">{{ totalElements }} Chiến dịch</span>
          </div>
        </div>
        <div class="filter-bar">
          <div class="filter-left">
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
          </div>
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
      </div>
    </div>
    <div class="grid" v-if="!loading">
      <CampaignCard v-for="item in campaigns" :key="item.code" :campaign="item" />
      <div v-if="!campaigns.length" class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Không có chiến dịch phù hợp</p>
      </div>
    </div>
    <div class="grid" v-else>
      <CampaignCard v-for="n in 6" :key="n" :loading="true" />
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
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import CampaignCard from '@/components/campaign/CampaignCard.vue';
import { getCategoryOptions } from '@/utils/category';
import { getCampaigns } from '@/api/public.api';

const campaigns = ref([]);
const page = ref(0);
const size = ref(10);
const totalPages = ref(0);
const totalElements = ref(0);
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
    totalElements.value = res?.totalElements || 0;
  } catch (e) {
    campaigns.value = [];
    totalPages.value = 0;
    totalElements.value = 0;
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
  padding: 32px;
  display: grid;
  gap: 18px;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  margin-bottom: 12px;
}

.eyebrow {
  color: rgba(12, 100, 120, 0.7);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.3px;
  margin: 0 0 16px 0;
  max-width: 1200px;
  line-height: 1.5;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid rgba(12, 100, 120, 0.15);
}

.filter-bar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px 16px;
  align-items: center;
  margin-top: 16px;
}

.filter-left {
  width: 100%;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.search-bar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(9, 209, 199, 0.08), rgba(70, 223, 177, 0.08));
  border: 1px solid rgba(12, 100, 120, 0.12);
  box-shadow: 0 6px 18px rgba(12, 100, 120, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  width: 100%;

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: var(--primary-strong);
    font-weight: 500;
    font-size: 14px;
    caret-color: var(--primary);
  }

  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 8px 24px rgba(9, 209, 199, 0.25);
    background: #ffffff;
  }
}

.icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  color: var(--primary-strong);
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
  border: 1px solid rgba(12, 100, 120, 0.12);
  background: #f4fbf8;
  color: var(--primary-strong);
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
  color: var(--primary-strong);
  font-weight: 600;
  min-width: 200px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  color: rgba(12, 100, 120, 0.7);
  font-weight: 600;
  font-size: 14px;
}

.stat-value {
  color: var(--primary-strong);
  font-weight: 800;
  font-size: 15px;
}

.title {
  color: var(--primary-strong);
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
}

.hint {
  color: rgba(12, 100, 120, 0.75);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 340px));
  gap: 20px;
}

.empty {
  grid-column: 1 / -1;
  padding: 18px;
  border: 1px dashed rgba(12, 100, 120, 0.25);
  border-radius: 12px;
  text-align: center;
  color: rgba(12, 100, 120, 0.8);
  display: grid;
  gap: 6px;
  place-items: center;
}

.empty-icon {
  font-size: 20px;
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-bar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .filter-right {
    justify-content: flex-start;
  }
}

@media (min-width: 768px) {
  .filter-bar {
    grid-template-columns: minmax(480px, 1.4fr) auto;
    align-items: center;
  }

  .filter-right {
    flex-wrap: nowrap;
    justify-content: flex-end;
    gap: 8px;
  }
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
    color: var(--primary-strong);
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
