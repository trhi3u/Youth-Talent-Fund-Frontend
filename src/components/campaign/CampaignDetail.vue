<template>
  <section class="admin-campaign-detail" v-if="campaign">
    <div class="main-header">
      <div class="cover-col">
        <img v-if="campaign.coverImage" :src="campaign.coverImage" class="cover-img" alt="cover" />
        <div v-else class="cover-img no-img">Không có ảnh</div>
      </div>
      <div class="main-info">
        <h1 class="title">{{ campaign.title }}</h1>
        <div class="meta-row">
          <span class="label">Danh mục:</span>
          <span class="category">{{ categoryLabel }}</span>
        </div>
        <div class="row">
          <span class="label">Trạng thái:</span>
          <span class="value status status-label" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <div class="row">
          <span class="label">Phụ trách:</span>
          <span class="value">{{ campaign.staffName || 'Chưa phân công' }}<span v-if="campaign.staffEmail"> ({{ campaign.staffEmail }})</span></span>
        </div>
        <div class="row">
          <span class="label">Thời gian:</span>
          <span class="value">{{ formatDate(campaign.startDate) }} - {{ formatDate(campaign.endDate) }}</span>
        </div>
        <div class="row">
          <span class="label">Địa điểm:</span>
          <span class="value">{{ campaign.location || '---' }}</span>
        </div>
      </div>
    </div>

    <div class="stats-block">
      <div class="stat">
        <div class="label">Mục tiêu</div>
        <div class="value">{{ formatCurrency(campaign.targetAmount) }} VND</div>
      </div>
      <div class="stat">
        <div class="label">Đã quyên góp</div>
        <div class="value">{{ formatCurrency(campaign.currentAmount) }} VND</div>
      </div>
      <div class="stat">
        <div class="label">% hoàn thành</div>
        <div class="value">{{ percent }}%</div>
      </div>
      <div class="stat">
        <div class="label">Lượt quyên góp</div>
        <div class="value">{{ campaign.totalDonations ?? '---' }}</div>
      </div>
      <div class="stat" v-if="campaign.participantCount">
        <div class="label">Người tham gia</div>
        <div class="value">{{ campaign.participantCount }}</div>
      </div>
    </div>


    <div class="desc-block">
      <div class="desc-section">
        <h2>Mô tả ngắn</h2>
        <div class="desc">{{ campaign.description || '---' }}</div>
      </div>
      <div class="desc-section">
        <h2>Câu chuyện chi tiết</h2>
        <div class="story">{{ campaign.story || '---' }}</div>
      </div>
    </div>


    <div class="history-report-row">
      <div class="history-block">
        <h2>Lịch sử cập nhật</h2>
        <div v-if="pagedHistory.length" class="history-card-list">
          <div v-for="item in pagedHistory" :key="item.id" class="history-card">
            <div class="history-card-row1">
              <span class="history-date">{{ formatDate(item.time) }}</span>
              <span class="history-type" :class="'type-' + item.type">{{ typeLabel(item.type) }}</span>
            </div>
            <div class="history-card-row2">
              <span class="history-user">Người tạo: {{ item.creator }}</span>
            </div>
            <div v-if="item.transactionAmount" class="history-card-row3">
              <span class="history-amount">Số tiền: {{ formatCurrency(item.transactionAmount) }} VND</span>
            </div>
            <div class="history-content"> Nội dung: {{ item.content }}</div>
            <div v-if="item.files && item.files.length" class="history-files">
              <span v-for="(f, idx) in item.files" :key="idx" class="history-file">
                <a href="#" @click.prevent="downloadHistoryFile(f)">{{ f.name }}</a>
              </span>
            </div>
          </div>
          <div class="history-pagination" v-if="historyTotalPages > 1">
            <button
              v-for="n in paginationPages"
              :key="n"
              :class="['page-btn', { active: n === historyPage } ]"
              @click="typeof n === 'number' && fetchHistory(n)"
              :disabled="n === '...'"
            >
              {{ n }}
            </button>
          </div>
        </div>
        <div v-else class="history-empty">Chưa có lịch sử cập nhật nào.</div>
      </div>

      <form class="report-form" @submit.prevent="submitReport">
        <h2>Tạo báo cáo minh chứng</h2>
        <div class="form-group">
          <label>Tiêu đề *</label>
          <input v-model="reportForm.title" required placeholder="Nhập tiêu đề báo cáo" />
        </div>
        <div class="form-group">
          <label>Loại báo cáo *</label>
          <select v-model="reportForm.type" required>
            <option value="" disabled>Chọn loại báo cáo</option>
            <option value="PROGRESS">Tiến độ</option>
            <option value="EXPENSE">Chi tiêu</option>
            <option value="CONTRIBUTION">Đóng góp</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nội dung *</label>
          <textarea v-model="reportForm.content" rows="3" required placeholder="Nhập nội dung báo cáo" />
        </div>
        <div class="form-group">
          <label>Số tiền (nếu có)</label>
          <input v-model="reportForm.transactionAmount" type="number" min="0" placeholder="Nhập số tiền" />
        </div>
        <div class="form-group">
          <label>File minh chứng</label>
          <input type="file" multiple @change="onReportFiles" />
        </div>
        <div v-if="reportErrors.length" class="errors">
          <div v-for="err in reportErrors" :key="err" class="error">{{ err }}</div>
        </div>
        <div class="actions">
          <button class="btn primary" type="submit" :disabled="reportLoading">{{ reportLoading ? 'Đang gửi...' : 'Tạo báo cáo' }}</button>
        </div>
        <div v-if="reportSuccess" class="success-message">{{ reportSuccess }}</div>
      </form>
    </div>

    <div class="actions-block">
      <button
        class="btn primary"
        :class="{ disabled: isEditDisabled }"
        :disabled="isEditDisabled"
        @click="goEdit"
      >
        Chỉnh sửa
      </button>
      <button
        v-if="isAdmin && allowAssign"
        class="btn ghost"
        :class="{ disabled: isActionDisabled }"
        :disabled="isActionDisabled"
        @click="openAssign = true"
      >
        Phân công nhân viên
      </button>
      <button
        v-if="allowStatusChange"
        class="btn ghost"
        :class="{ disabled: isStatusDisabled }"
        :disabled="isStatusDisabled"
        @click="handleStatusChange(statusActions.primary.target)"
      >
        {{ statusActions.primary.label }}
      </button>
      <button
        v-if="allowStatusChange"
        class="btn danger"
        :class="{ disabled: isStatusDisabled }"
        :disabled="isStatusDisabled"
        @click="handleStatusChange(statusActions.secondary.target)"
      >
        {{ statusActions.secondary.label }}
      </button>
    </div>

    <AssignCampaignToStaff
      v-if="isAdmin && allowAssign && openAssign"
      :visible="openAssign"
      :campaign="campaign"
      @close="openAssign = false"
      @assign="handleAssign"
    />
  </section>
  <div v-else class="loading">Đang tải...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCategoryLabel } from '@/utils/category';
import { getCampaignDetail, getProofReports, downloadAttachment } from '@/api/public.api';
import { createReport, updateCampaignStatus, updateCampaign } from '@/api/management.api';
import { toUtcString } from '@/utils/date';
import AssignCampaignToStaff from '@/pages/Admin/AssignCampaignToStaff.vue';
import fallbackImage from '@/assets/image/background.png';

const props = defineProps({
  role: { type: String, default: 'ADMIN' },
  campaignCode: { type: [String, Number], default: '' },
  allowAssign: { type: Boolean, default: true },
  allowStatusChange: { type: Boolean, default: true }
});

const isAdmin = computed(() => (props.role || '').toUpperCase() === 'ADMIN');

// Form báo cáo minh chứng
const reportForm = ref({
  title: '',
  type: '',
  content: '',
  transactionAmount: '',
});
const reportFiles = ref([]);
const reportErrors = ref([]);
const reportLoading = ref(false);
const reportSuccess = ref('');

const onReportFiles = e => {
  reportFiles.value = Array.from(e.target.files || []);
};

const validateReport = () => {
  reportErrors.value = [];
  const title = (reportForm.value.title || '').trim();
  const content = (reportForm.value.content || '').trim();
  const allowedMime = ['application/pdf', 'image/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (!title || title.length < 10 || title.length > 50) {
    reportErrors.value.push('Tiêu đề phải từ 10 đến 50 ký tự');
  }
  if (!reportForm.value.type) {
    reportErrors.value.push('Vui lòng chọn loại báo cáo');
  }
  if (!content || content.length < 10 || content.length > 2000) {
    reportErrors.value.push('Nội dung phải từ 10 đến 2000 ký tự');
  }

  if (reportFiles.value.length) {
    const invalidFile = reportFiles.value.find(f => {
      const mime = (f.type || '').toLowerCase();
      const ext = (f.name || '').toLowerCase();
      const matchExt = ext.match(/\.(pdf|jpg|jpeg|png)$/);
      return !allowedMime.includes(mime) && !matchExt;
    });
    if (invalidFile) reportErrors.value.push('File chỉ PDF/JPG/PNG');
  }
  return reportErrors.value.length === 0;
};

const submitReport = async () => {
  if (!validateReport() || !campaignCodeValue.value) return;
  reportLoading.value = true;
  try {
    const data = {
      title: reportForm.value.title,
      type: reportForm.value.type,
      content: reportForm.value.content,
      transactionAmount: reportForm.value.transactionAmount || ''
    };
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    for (const f of reportFiles.value) {
      fd.append('files', f);
    }

    await createReport(campaignCodeValue.value, fd);
    reportSuccess.value = 'Tạo báo cáo thành công!';
    setTimeout(() => { reportSuccess.value = ''; }, 1500);
    reportForm.value = { title: '', type: '', content: '', transactionAmount: '' };
    reportFiles.value = [];
    fetchHistory(1);
  } catch (err) {
    reportErrors.value = [err?.message || 'Gửi báo cáo thất bại'];
  } finally {
    reportLoading.value = false;
  }
};

const route = useRoute();
const router = useRouter();

const effectiveCampaignCode = computed(() => props.campaignCode || route.params.campaignCode);

const campaign = ref(null);
const openAssign = ref(false);
const assignLoading = ref(false);
const isStatusLoading = ref(false);

const campaignCodeValue = computed(() => {
  const data = campaign.value || {};
  return data.campaignCode || data.code || data.id || data.campaignId || effectiveCampaignCode.value;
});

// Reload the page shortly after a status update succeeds to reflect latest data
const reloadPage = () => setTimeout(() => router.go(0), 300);

const fetchDetail = async () => {
  const code = effectiveCampaignCode.value;
  if (!code) return;
  const res = await getCampaignDetail(code);
  campaign.value = {
    ...res,
    coverImage: res.coverImage || res.coverImagePath || res.imageUrl || res.image || res.cover || res.coverUrl || fallbackImage
  };
};

onMounted(() => {
  fetchDetail();
  fetchHistory();
});

const categoryLabel = computed(() => getCategoryLabel(campaign.value?.category));
const statusUpper = computed(() => campaign.value?.status?.toUpperCase() || '');
const formatDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '---';
const formatCurrency = v => v ? v.toLocaleString('vi-VN') : '0';
const percent = computed(() => {
  if (!campaign.value) return 0;
  const { currentAmount, targetAmount } = campaign.value;
  if (!targetAmount) return 0;
  return Math.round((currentAmount / targetAmount) * 100);
});

const statusMap = {
  PENDING: { label: 'Chưa bắt đầu', class: 'pending' },
  IN_PROGRESS: { label: 'Đang diễn ra', class: 'inprogress' },
  ON_HOLD: { label: 'Tạm dừng', class: 'onhold' },
  COMPLETED: { label: 'Đã hoàn thành', class: 'completed' },
  CANCELLED: { label: 'Hủy', class: 'cancelled' }
};
const statusLabel = computed(() => {
  const s = statusUpper.value;
  return statusMap[s]?.label || s || '';
});
const statusClass = computed(() => {
  const s = statusUpper.value;
  return statusMap[s]?.class || '';
});

const isEditDisabled = computed(() => {
  const s = statusUpper.value;
  return s === 'COMPLETED' || s === 'CANCELLED';
});

const isActionDisabled = computed(() => {
  const s = statusUpper.value;
  return s === 'COMPLETED' || s === 'CANCELLED';
});

const statusActions = computed(() => {
  const s = statusUpper.value;
  if (s === 'PENDING') {
    return {
      primary: { label: 'Bắt đầu', target: 'IN_PROGRESS' },
      secondary: { label: 'Hủy bỏ', target: 'CANCELLED' }
    };
  }
  if (s === 'ON_HOLD') {
    return {
      primary: { label: 'Tiếp tục', target: 'IN_PROGRESS' },
      secondary: { label: 'Kết thúc', target: 'COMPLETED' }
    };
  }
  return {
    primary: { label: 'Tạm dừng', target: 'ON_HOLD' },
    secondary: { label: 'Kết thúc', target: 'COMPLETED' }
  };
});

const isStatusDisabled = computed(() => !props.allowStatusChange || isActionDisabled.value || isStatusLoading.value);

const goEdit = () => {
  if (!campaign.value || isEditDisabled.value) return;
  const code = campaignCodeValue.value;
  if (!code) return;
  if (isAdmin.value) router.push(`/admin/CampaignsEdit/${code}`);
  else router.push(`/staff/CampaignsEdit/${code}`);
};

const handleStatusChange = async target => {
  if (!target || isStatusDisabled.value || !campaignCodeValue.value) return;
  const code = campaignCodeValue.value;
  isStatusLoading.value = true;
  try {
    await updateCampaignStatus(code, { campaignStatus: target });
    await fetchDetail();
    reloadPage();
  } catch (err) {
    console.error('Update campaign status failed', err);
  } finally {
    isStatusLoading.value = false;
  }
};
const downloadHistoryFile = async file => {
  try {
    if (file?.id) {
      const res = await downloadAttachment(file.id);
      const url = res?.url || (typeof res === 'string' ? res : null);
      if (url) {
        window.open(url, '_blank');
        return;
      }
    }
    if (file?.url) {
      window.open(file.url, '_blank');
      return;
    }
    alert('Không tải được file');
  } catch (err) {
    console.error('Download attachment failed', err);
    alert('Không tải được file');
  }
};
const history = ref([]);
const historyPage = ref(1);
const historyPerPage = 2;
const historyTotalPages = ref(1);
const pagedHistory = computed(() => history.value);

const mapHistoryItem = item => {
  const attachments = item.attachments || item.files || [];
  return {
    id: item.id || item.reportId || item.code || item.campaignReportId || Math.random().toString(36).slice(2),
    time: item.time || item.createdAt || item.createdDate || item.created || item.updatedAt || null,
    type: item.type || item.reportType || item.proofReportType || '',
    creator: item.creator || item.createdBy || item.creatorName || item.staffName || '---',
    transactionAmount: item.transactionAmount ?? item.amount ?? item.money ?? null,
    content: item.content || item.description || item.note || '',
    files: attachments.map(f => ({
      id: f.id || f.attachmentId || f.fileId,
      name: f.name || f.fileName || f.originalName || 'file',
      url: f.url || f.link || f.path || f.downloadUrl || (f.id || f.attachmentId ? `/public/attachments/${f.id || f.attachmentId}/download` : '#')
    }))
  };
};

const fetchHistory = async page => {
  const code = campaignCodeValue.value || effectiveCampaignCode.value;
  if (!code) return;
  const currentPage = page || 1;
  try {
    const res = await getProofReports(code, { page: currentPage - 1, size: historyPerPage });
    const content = res?.content || res?.data || res?.items || [];
    history.value = content.map(mapHistoryItem);
    historyTotalPages.value = res?.totalPages || 1;
    historyPage.value = currentPage;
  } catch (err) {
    console.error('Fetch proof reports failed', err);
    history.value = [];
    historyTotalPages.value = 1;
  }
};

const paginationPages = computed(() => {
  const total = historyTotalPages.value;
  const current = historyPage.value;
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
const typeLabel = t => t === 'PROGRESS' ? 'Tiến độ' : t === 'EXPENSE' ? 'Chi tiêu' : t === 'CONTRIBUTION' ? 'Đóng góp' : t;
const handleAssign = async ({ staffId }) => {
  if (!campaignCodeValue.value || !isAdmin.value) return;
  assignLoading.value = true;
  try {
    const detail = await getCampaignDetail(campaignCodeValue.value);
    const data = {
      title: detail.title || detail.name || '',
      description: detail.description || detail.shortDescription || '',
      story: detail.story || detail.description || null,
      targetAmount: detail.targetAmount?.toString() || detail.goal?.toString() || '',
      startDate: detail.startDate ? toUtcString(detail.startDate) : null,
      endDate: detail.endDate ? toUtcString(detail.endDate) : null,
      category: detail.category || detail.categoryName || detail.topic || '',
      assigneeCode: staffId
    };
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    await updateCampaign(detail.campaignCode || detail.code || detail.campaignId, fd);
    await fetchDetail();
    openAssign.value = false;
    window.location.reload();
  } catch (err) {
    console.error('Assign campaign failed', err);
  } finally {
    assignLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.status-chip {
  font-weight: 700;
}
.status-PENDING, .status-ON_HOLD {
  color: #f7b500 !important;
}
.status-IN_PROGRESS {
  color: #1a7f37 !important;
}
.status-COMPLETED {
  color: #e53935 !important;
}
.status-CANCELLED {
  color: #8e24aa !important;
}
.admin-campaign-detail {
  max-width: 980px;
  margin: 0 auto;
  padding: 36px 0 48px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  font-family: 'Inter', 'Roboto', Arial, Helvetica, sans-serif;
}
.main-header {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  background: #fff;
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(12,100,120,0.04);
}
.cover-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.cover-img {
  width: 220px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  border: 1.5px solid #e0e0e0;
  background: #f3f7f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #888;
}
.cover-img.no-img {
  background: #f3f7f9;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-badge {
  margin-top: 8px;
  padding: 6px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(12,100,120,0.06);
  &.pending { color: #f7b500; border: 1.5px solid #f7b500; }
  &.inprogress { color: #1a7f37; border: 1.5px solid #1a7f37; }
  &.onhold { color: #f7b500; border: 1.5px solid #f7b500; }
  &.completed { color: #e53935; border: 1.5px solid #e53935; }
  &.cancelled { color: #8e24aa; border: 1.5px solid #8e24aa; }
}
.main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.title {
  font-size: 2rem;
  font-weight: 800;
  color: #123047;
  margin-bottom: 2px;
}
.meta-row {
  display: flex;
  gap: 18px;
  align-items: center;
  font-size: 15px;
  color: #15919B;
  margin-bottom: 2px;
}
.row {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  color: #35516d;
}
.row .label {
  font-weight: 600;
  color: #5c738a;
}
.status-label.pending { color: #f7b500 !important; }
.status-label.inprogress { color: #1a7f37 !important; }
.status-label.onhold { color: #f7b500 !important; }
.status-label.completed { color: #e53935 !important; }
.status-label.cancelled { color: #8e24aa !important; }
.row .value.status {
  font-weight: 700;
}
.stats-block {
  display: flex;
  gap: 32px;
  background: #fff;
  border-radius: 12px;
  padding: 18px 24px;
  box-shadow: 0 2px 8px rgba(12,100,120,0.04);
  justify-content: flex-start;
}
.stat {
  min-width: 120px;
  text-align: center;
}
.stat .label {
  color: #888;
  font-size: 14px;
}
.stat .value {
  font-size: 18px;
  font-weight: 700;
  color: #123047;
}

.desc-block {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(12,100,120,0.04);
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.history-report-row {
  display: flex;
  gap: 32px;
  align-items: stretch;
  margin-bottom: 24px;
}
.history-block, .report-form {
  flex: 1 1 0;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.report-form {
  flex: 1 1 340px;
  min-width: 340px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(12,100,120,0.04);
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.report-form h2 {
  font-size: 17px;
  color: #15919B;
  margin-bottom: 8px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.report-form input,
.report-form select,
.report-form textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 15px;
  font-family: inherit;
}
.report-form textarea {
  resize: none;
  font-family: inherit;
}
.report-form input[type='number']::-webkit-inner-spin-button,
.report-form input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.report-form input[type='number'] {
  -moz-appearance: textfield;
}

.history-block {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(12,100,120,0.04);
  margin-bottom: 24px;
}
.history-block h2 {
  font-size: 17px;
  color: #15919B;
  margin-bottom: 12px;
}
.history-card-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.history-card {
  background: #f8fafd;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(12,100,120,0.04);
  padding: 18px 20px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 15px;
  color: #35516d;
}
.history-card-row1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #5c738a;
  margin-bottom: 2px;
}
.history-date {
  color: #888;
  min-width: 110px;
}
.history-type {
  font-weight: 700;
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 13px;
  background: #eaf6ff;
  color: #1976d2;
}
.history-type.type-EXPENSE { background: #fff3e0; color: #e65100; }
.history-type.type-PROGRESS { background: #eaf6ff; color: #1976d2; }
.history-type.type-CONTRIBUTION { background: #e8f5e9; color: #388e3c; }
.history-card-row2 {
  font-size: 14px;
  color: #35516d;
  font-weight: 600;
  margin-bottom: 2px;
}
.history-card-row3 {
  font-size: 14px;
  color: #e53935;
  font-weight: 700;
  margin-bottom: 2px;
}
.history-content {
  margin: 4px 0 0 0;
}
.history-files {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}
.history-file a {
  color: #1976d2;
  text-decoration: underline;
  font-size: 14px;
}
.history-pagination {
  display: flex;
  gap: 8px;
  margin: 12px 0 0 0;
  justify-content: center;
}
.page-btn {
  border: none;
  background: #f1f8ff;
  color: #1976d2;
  font-weight: 700;
  border-radius: 6px;
  padding: 4px 14px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.15s;
}
.page-btn.active, .page-btn:hover { background: #1976d2; color: #fff; }
.history-empty {
  color: #aaa;
  font-size: 15px;
  padding: 8px 0;
}
.desc-section {
  flex: 1 1 320px;
  min-width: 320px;
}
.desc-block h2 {
  margin: 12px 0 4px;
  font-size: 17px;
  color: #15919B;
}
.desc, .story {
  color: #35516d;
  font-size: 15px;
  margin-bottom: 8px;
  white-space: pre-line;
}
.actions-block {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}
.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  border: 1px solid #09d1c7;
  background: #f2fbf8;
  color: #15919B;
  cursor: pointer;
  transition: background 0.15s;
}
.btn:disabled,
.btn.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
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
.btn.danger {
  background: #fff0f0;
  color: #e53935;
  border: 1px solid #e53935;
}
.loading {
  text-align: center;
  color: #15919B;
  font-size: 18px;
  padding: 32px 0;
}
</style>
