<template>
  <section class="page">
    <DonateStatusListener
      v-if="wsToken"
      :ws-token="wsToken"
      @success="handleDonationSuccess"
      @failed="handleDonationFailed"
    />
    <div v-if="isDonationMode" class="donation-layout">
      <div class="card hero">
        <div class="hero-cover" :style="coverStyle" />
        <div class="hero-body">
          <p class="eyebrow">Ủng hộ chiến dịch</p>
          <h1>{{ campaign.title || 'Chiến dịch' }}</h1>
          <p class="org" v-if="campaign.organizationName">{{ campaign.organizationName }}</p>
          <p class="desc">{{ campaign.shortDescription || campaign.description || 'Đang cập nhật mô tả ngắn.' }}</p>

          <div class="stats">
            <div class="stat">
              <span class="label">Đã góp</span>
              <strong>{{ formatCurrency(campaign.currentAmount) }}đ</strong>
            </div>
            <div class="stat">
              <span class="label">Mục tiêu</span>
              <strong>{{ formatCurrency(campaign.targetAmount) }}đ</strong>
            </div>
            <div class="stat">
              <span class="label">Tiến độ</span>
              <strong>{{ progress }}%</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="card donate-panel">
        <div class="panel-head">
          <h3 v-if="donationStep === 1">Nhập thông tin quyên góp</h3>
          <h3 v-else-if="donationStep === 2">Quét mã để thanh toán</h3>
          <h3 v-else>Cảm ơn bạn đã ủng hộ chiến dịch❤️</h3>
        </div>

        <div class="panel-body">
          <div v-if="donationStep === 1" class="form-grid">
            <div class="preset-row full">
              <span>Chọn nhanh</span>
              <div class="chip-group">
                <button type="button" class="chip" @click="presetAmount(50000)">50.000đ</button>
                <button type="button" class="chip" @click="presetAmount(100000)">100.000đ</button>
                <button type="button" class="chip" @click="presetAmount(200000)">200.000đ</button>
                <button type="button" class="chip" @click="presetAmount(500000)">500.000đ</button>
              </div>
            </div>

            <label>
              <span>Số tiền *</span>
              <div class="input-affix">
                <input
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  :value="amountDisplay"
                  @input="onAmountInput"
                  placeholder="Nhập số tiền"
                />
                <span class="affix">VND</span>
              </div>
              <span v-if="formErrors.amount" class="form-error">{{ formErrors.amount }}</span>
            </label>
            <label>
              <span>Họ tên</span>
              <input type="text" v-model="donationForm.name" placeholder="Tên của bạn" />
              <span v-if="formErrors.name" class="form-error">{{ formErrors.name }}</span>
            </label>
            <label>
              <span>Email</span>
              <input type="email" v-model="donationForm.email" placeholder="email@example.com" />
              <span v-if="formErrors.email" class="form-error">{{ formErrors.email }}</span>
            </label>
            <label>
              <span>Số điện thoại</span>
              <input type="tel" v-model="donationForm.phoneNumber" placeholder="*********" />
              <span v-if="formErrors.phoneNumber" class="form-error">{{ formErrors.phoneNumber }}</span>
            </label>
            <label class="full">
              <span>Lời nhắn</span>
              <textarea rows="3" v-model="donationForm.message" placeholder="Lời nhắn (tuỳ chọn)" />
            </label>

            <div class="inline vertical-checkboxes">
              <label class="checkbox">
                <input type="checkbox" v-model="donationForm.isAnonymous" />
                <span>Quyên góp ẩn danh</span>
              </label>
              <label class="checkbox">
                <input type="checkbox" v-model="donationForm.sendMail" />
                <span>Gửi về email</span>
              </label>
            </div>
          </div>

          <div v-else-if="donationStep === 2" class="qr-step">
            <p class="muted">Vui lòng quét mã QR để hoàn tất quyên góp</p>
            <DonateQR
              v-if="qrCode"
              :qr-string="qrCode"
              :amount="donationForm.amount"
              :message="donationForm.message"
              :campaign-code="campaignCode"
              bank-name="Ngân hàng TMCP Quân đội"
              account-number="VQRQAGETT7544"
              account-name="VU TUAN NAM"
              @close="handleCloseQR"
              @cancel="handleCloseQR"
            />
            <p v-else class="muted">Đang tạo mã QR...</p>
            <button class="btn ghost" :disabled="!checkoutUrl" @click="openCheckout">Mở trang thanh toán</button>
          </div>

          <div v-else class="success">
            <div class="status-badge" :class="paymentResult.status.toLowerCase() || 'completed'">{{ paymentStatusLabel }}</div>
            <p class="muted">Mã giao dịch: <strong>{{ paymentResult.code || 'Đang cập nhật' }}</strong></p>
            <button class="btn primary" @click="backToCampaign">Quay lại chiến dịch</button>
          </div>
        </div>

        <div class="panel-foot" v-if="donationStep === 1">
          <button class="btn primary" :disabled="isSubmitting || !donationForm.amount || donationForm.amount <= 0" @click="submitDonation">Tiếp tục</button>
        </div>
      </div>
    </div>

    <div v-else class="layout">
      <div class="left">
        <div class="card cover-card">
          <div class="cover" :style="coverStyle" />
          <div class="content">
            <div class="skeleton title" v-if="loading" />
            <h1 v-else>{{ campaign.title || 'Chiến dịch' }}</h1>

            <p class="org" v-if="!loading && campaign.organizationName">{{ campaign.organizationName }}</p>
            <div class="skeleton" v-else-if="loading" />

            <p class="desc" v-if="!loading">{{ campaign.shortDescription || campaign.description || 'Đang cập nhật mô tả ngắn.' }}</p>
            <div class="skeleton" v-else />
          </div>
        </div>

        <div class="card tabs-card">
          <div class="tabs">
            <button :class="{ active: activeTab === 'story' }" @click="activeTab = 'story'">Câu chuyện</button>
            <button :class="{ active: activeTab === 'update' }" @click="activeTab = 'update'">Hoạt động</button>
            <button :class="{ active: activeTab === 'donation' }" @click="activeTab = 'donation'">Danh sách ủng hộ</button>
          </div>

          <div class="tab-content">
            <div v-if="activeTab === 'story'">
              <p v-if="campaign.story || campaign.description">{{ campaign.story || campaign.description }}</p>
              <p v-else class="muted">Chưa có nội dung câu chuyện.</p>
            </div>
            <div v-else-if="activeTab === 'update'">
              <div v-if="historyLoading" class="history-loading">Đang tải cập nhật...</div>
              <div v-else-if="history.length" class="history-list">
                <div v-for="item in history" :key="item.id" class="history-card">
                  <div class="history-head">
                    <div class="history-title">{{ item.title }}</div>
                    <div class="history-tags">
                      <span class="history-type" :class="'type-' + (item.type || '').toLowerCase()">{{ typeLabel(item.type) }}</span>
                      <span v-if="item.transactionAmount" class="history-amount-tag">{{ formatCurrency(item.transactionAmount) }}đ</span>
                    </div>
                  </div>
                  <div class="history-meta">
                    <span>{{ formatDate(item.time) }}</span>
                  </div>
                  <div class="history-content">{{ item.content }}</div>
                  <div v-if="item.files && item.files.length" class="history-files">
                    <span>File:</span>
                    <a
                      v-for="(file, idx) in item.files"
                      :key="idx"
                      href="#"
                      class="history-file"
                      @click.prevent="downloadHistoryFile(file)"
                    >{{ file.name }}</a>
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
              <p v-else class="muted">Chưa có cập nhật</p>
            </div>
            <div v-else-if="activeTab === 'donation'">
              <div v-if="donationLoading" class="donation-loading">Đang tải danh sách ủng hộ...</div>
              <div v-else-if="donations.length" class="donation-table">
                <div class="donation-head">
                  <span>Người ủng hộ</span>
                  <span>Số tiền ủng hộ</span>
                  <span>Thời gian ủng hộ</span>
                </div>
                <div class="donation-body">
                  <div v-for="(donation, idx) in donations" :key="idx" class="donation-row">
                    <span class="donation-col donor-name">{{ donation.donorName || 'Người ủng hộ ẩn danh' }}</span>
                    <span class="donation-col donation-amount">{{ formatCurrency(donation.amount) }}đ</span>
                    <span class="donation-col donation-time">{{ formatDateTime(donation.time) }}</span>
                  </div>
                </div>
                <div class="donation-pagination" v-if="donationTotalPages > 1">
                  <button
                    v-for="p in donationPages"
                    :key="p"
                    :class="['page-btn', { active: p === donationPage } ]"
                    @click="typeof p === 'number' && fetchDonations(p)"
                    :disabled="p === '...'"
                  >
                    {{ p }}
                  </button>
                </div>
              </div>
              <p v-else class="muted">Chưa có lượt ủng hộ.</p>
            </div>
            <div v-else>
              <div class="placeholder-box">(Chuyển sang chế độ quyên góp để hiển thị form)</div>
            </div>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="card side">
          <div class="progress-block" v-if="!loading">
            <div class="row">
              <span>Đã góp</span>
              <strong>{{ formatCurrency(campaign.currentAmount) }}đ</strong>
            </div>
            <div class="row">
              <span>Mục tiêu</span>
              <strong>{{ formatCurrency(campaign.targetAmount) }}đ</strong>
            </div>
            <div class="bar">
              <div class="fill" :style="{ width: progress + '%' }" />
            </div>
            <div class="row foot">
              <span>Tiến độ</span>
              <span>{{ progress }}%</span>
            </div>
          </div>

          <div v-else class="skeleton tall" />

          <button
            class="btn primary"
            :disabled="loading || isCompleted || isOnHold || isPending"
            @click="goDonation"
          >
            {{ donateLabel }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createDonation, downloadAttachment, getCampaignDetail, getProofReports, getDonationList, getDonationStatus } from '@/api/public.api';
import fallbackImage from '@/assets/image/background.png';
import { useAuthStore } from '@/stores/authStore';
import DonateQR from '@/components/donate/DonateQR.vue';
import DonateStatusListener from '@/components/donate/DonateStatusListener.vue';
import { formatLocal } from '@/utils/date';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const campaign = ref({});
const loading = ref(false);
const activeTab = ref('story');
const donationStep = ref(1);
const donationForm = ref({
  name: '',
  email: '',
  phoneNumber: '',
  amount: '',
  message: '',
  isAnonymous: false,
  sendMail: false
});
const amountDisplay = ref('');
const qrCode = ref('');
const checkoutUrl = ref('');
const isSubmitting = ref(false);
const wsToken = ref('');
const paymentResult = ref({ status: '', code: '' });
const formErrors = ref({});
const history = ref([]);
const historyLoading = ref(false);
const historyPage = ref(1);
const historyPerPage = 4;
const historyTotalPages = ref(1);
const donations = ref([]);
const donationLoading = ref(false);
const donationPage = ref(1);
const donationTotalPages = ref(1);

const campaignCode = computed(() => route.params.campaignCode || route.params.id || route.params.code);
const isDonationMode = computed(() => route.query.mode === 'donation');

const coverStyle = computed(() => ({
  background: `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.25) 100%), url(${campaign.value.coverImage || fallbackImage}) center/cover no-repeat`
}));

const progress = computed(() => {
  const target = Number(campaign.value.targetAmount || 0);
  const current = Number(campaign.value.currentAmount || 0);
  if (!target) return current > 0 ? 1 : 0; // hiển thị tối thiểu 1% nếu có quyên góp nhưng chưa có mục tiêu
  const pct = Math.round((current / target) * 100);
  if (pct === 0 && current > 0) return 1; // ensure tiny progress still shows
  return Math.min(100, pct);
});

const paymentStatusLabel = computed(() => {
  const s = (paymentResult.value.status || '').toUpperCase();
  if (['COMPLETED', 'SUCCESS', 'DONE', 'PAID'].includes(s)) return 'Thanh toán thành công';
  if (s === 'PENDING') return 'Đang xử lý';
  if (s === 'FAILED') return 'Thất bại';
  return s || 'Đang cập nhật';
});

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

const donationPages = computed(() => {
  const total = donationTotalPages.value;
  const current = donationPage.value;
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

const statusUpper = computed(() => (campaign.value.status || '').toUpperCase());

const isCompleted = computed(() => {
  if (!campaign.value.endDate) return statusUpper.value === 'COMPLETED';
  const end = new Date(campaign.value.endDate);
  const today = new Date();
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff <= 0 || statusUpper.value === 'COMPLETED';
});

const isOnHold = computed(() => statusUpper.value === 'ON_HOLD');
const isPending = computed(() => statusUpper.value === 'PENDING');

const donateLabel = computed(() => {
  if (isPending.value) return 'Chưa bắt đầu';
  if (isOnHold.value) return 'Tạm dừng';
  if (isCompleted.value) return 'Đã hoàn thành';
  return 'Ủng hộ';
});

const formatCurrency = value => (Number(value) || 0).toLocaleString('vi-VN');
const formatDate = d => d ? formatLocal(d, 'DD/MM/YYYY') : '---';
const formatDateTime = d => (d ? formatLocal(d, 'DD/MM/YYYY HH:mm') : '---');

const normalizeCampaign = data => {
  if (!data) return {};
  return {
    ...data,
    targetAmount: data.targetAmount ?? data.goal ?? 0,
    currentAmount: data.currentAmount ?? data.raised ?? 0,
    coverImage: data.coverImage || data.coverImagePath || data.thumbnail
  };
};

const fetchDetail = async code => {
  if (!code) return;
  loading.value = true;
  try {
    const res = await getCampaignDetail(code);
    campaign.value = normalizeCampaign(res || {});
  } catch (err) {
    campaign.value = {};
    // Có thể log lỗi nếu cần
  } finally {
    loading.value = false;
  }
};

const typeLabel = t => t === 'PROGRESS' ? 'Tiến độ' : t === 'EXPENSE' ? 'Chi tiêu' : t === 'CONTRIBUTION' ? 'Đóng góp' : t;

const mapHistoryItem = item => {
  const attachments = item.attachments || item.files || [];
  return {
    id: item.id || item.reportId || item.code || item.campaignReportId || Math.random().toString(36).slice(2),
    title: item.title || item.name || 'Báo cáo',
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

const fetchHistory = async (page = 1, codeParam) => {
  const code = codeParam || campaignCode.value;
  if (!code) return;
  historyLoading.value = true;
  try {
    const res = await getProofReports(code, { page: page - 1, size: historyPerPage });
    const content = res?.content || res?.data || res?.items || [];
    history.value = content.map(mapHistoryItem);
    historyTotalPages.value = res?.totalPages || 1;
    historyPage.value = page;
  } catch (err) {
    history.value = [];
    historyTotalPages.value = 1;
  } finally {
    historyLoading.value = false;
  }
};

const fetchDonations = async (page = 1, codeParam) => {
  const code = codeParam || campaignCode.value;
  if (!code) return;
  donationLoading.value = true;
  try {
    const res = await getDonationList({ campaignCode: code, page: page - 1 });
    const content = res?.content || res?.data || res?.items || [];
    donations.value = content.map(item => ({
      amount: item.amount || 0,
      donorName: item.donorName || 'Ẩn danh',
      time: item.time || item.createdAt || item.createdDate || item.created || null
    }));
    donationTotalPages.value = res?.totalPages || 1;
    donationPage.value = page;
  } catch (err) {
    donations.value = [];
    donationTotalPages.value = 1;
  } finally {
    donationLoading.value = false;
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
    alert('Không tải được file');
  }
};

const syncTabFromQuery = () => {
  const mode = route.query.mode;
  if (mode === 'donation') activeTab.value = 'donation';
  if (route.query.donate === 'success') {
    activeTab.value = 'donation';
    donationStep.value = 3;
  } else if (route.query.donate === 'cancel') {
    activeTab.value = 'donation';
    donationStep.value = 1;
  }
};

const presetAmount = value => {
  donationForm.value.amount = value;
  amountDisplay.value = value ? value.toLocaleString('vi-VN') : '';
};

const prefillFromAuth = () => {
  const info = authStore.userInfo || {};
  if (!info) return;
  if (!donationForm.value.name) donationForm.value.name = info.fullName || info.name || '';
  if (!donationForm.value.email) donationForm.value.email = info.email || '';
  if (!donationForm.value.phoneNumber) donationForm.value.phoneNumber = info.phoneNumber || info.phone || '';
};

const onAmountInput = event => {
  const raw = (event?.target?.value || '').replace(/\D/g, '');
  const num = raw ? Number(raw) : 0;
  donationForm.value.amount = num;
  amountDisplay.value = raw ? num.toLocaleString('vi-VN') : '';
};

const goDonation = () => {
  const code = campaignCode.value;
  if (!code) return;
  router.push(`/campaign/${code}?mode=donation`);
};

const submitDonation = async () => {
  if (!isDonationMode.value) return;
  formErrors.value = {};
  const amount = Number(donationForm.value.amount || 0);
  if (!amount || amount < 2000) {
    formErrors.value.amount = 'Số tiền phải từ 2.000 VND';
  }
  if (!donationForm.value.name || !donationForm.value.name.trim()) {
    formErrors.value.name = 'Họ tên không được để trống';
  }
  if (!donationForm.value.email || !donationForm.value.email.trim()) {
    formErrors.value.email = 'Email không được để trống';
  }
  if (!donationForm.value.phoneNumber || !donationForm.value.phoneNumber.trim()) {
    formErrors.value.phoneNumber = 'Số điện thoại không được để trống';
  }
  if (Object.keys(formErrors.value).length > 0) return;
  const code = campaignCode.value;
  if (!code) return;

  isSubmitting.value = true;
  try {
    const payload = {
      name: donationForm.value.name,
      email: donationForm.value.email,
      phoneNumber: donationForm.value.phoneNumber,
      amount,
      message: donationForm.value.message,
      isAnonymous: donationForm.value.isAnonymous,
      sendMail: donationForm.value.sendMail,
      campaignCode: code,
      returnUrl: `${window.location.origin}/campaign/${code}?mode=donation&donate=success`,
      cancelUrl: `${window.location.origin}/campaign/${code}?mode=donation&donate=cancel`
    };

    const res = await createDonation(payload);
    qrCode.value = res?.qrCode || res?.qrCodeUrl || '';
    checkoutUrl.value = res?.checkoutUrl || res?.url || '';
    wsToken.value = res?.wsToken || '';
    paymentResult.value = { status: '', code: '' };
    donationStep.value = 2;
  } catch (err) {
    // Có thể log lỗi nếu cần
  } finally {
    isSubmitting.value = false;
  }
};


function handleCloseQR() {
  donationStep.value = 1;
  qrCode.value = '';
  checkoutUrl.value = '';
  wsToken.value = '';
  paymentResult.value = { status: '', code: '' };
}

const openCheckout = () => {
  if (!checkoutUrl.value) return;
  window.open(checkoutUrl.value, '_blank');
};

const backToCampaign = () => {
  const code = campaignCode.value;
  if (!code) return;
  router.replace(`/campaign/${code}`);
};

const handleDonationSuccess = payload => {
  // WS trả về orderCode/transactionCode; gọi API để xác nhận trạng thái và mã giao dịch
  const useStatus = async payload => {
    const orderCode = payload?.orderCode || payload?.transactionCode || payload?.code || payload?.message || '';
    if (!orderCode) {
      paymentResult.value = { status: 'COMPLETED', code: '' };
      donationStep.value = 3;
      wsToken.value = '';
      return;
    }
    try {
      const res = await getDonationStatus(orderCode);
      paymentResult.value = {
        status: res?.status || 'COMPLETED',
        code: res?.transactionCode || res?.code || orderCode
      };
    } catch (err) {
      paymentResult.value = { status: 'COMPLETED', code: orderCode };
    } finally {
      donationStep.value = 3;
      wsToken.value = '';
    }
  };

  return useStatus(payload);
};

const handleDonationFailed = () => {
  // Trả về bước nhập hoặc QR khi thất bại; không dùng alert để tránh chặn UI
  donationStep.value = 1;
  qrCode.value = '';
  checkoutUrl.value = '';
  wsToken.value = '';
  paymentResult.value = { status: 'FAILED', code: '' };
};


onMounted(() => {
  syncTabFromQuery();
  fetchDetail(campaignCode.value);
  fetchHistory(1, campaignCode.value);
  prefillFromAuth();
});

watch(
  () => route.params.campaignCode || route.params.id,
  newCode => {
    fetchDetail(newCode);
    fetchHistory(1, newCode);
    donations.value = [];
    donationTotalPages.value = 1;
  }
);
watch(
  () => route.query.mode,
  () => syncTabFromQuery()
);
watch(
  () => route.query.donate,
  () => syncTabFromQuery()
);

watch(
  () => activeTab.value,
  tab => {
    if (tab === 'donation') fetchDonations(1);
  }
);
</script>

<style scoped lang="scss">
.page {
  padding: 32px 40px;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
}

.donation-layout {
  display: grid;
  grid-template-columns: 1.5fr 0.95fr;
  gap: 16px;
  align-items: start;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  padding: 0;
  overflow: hidden;
}

.hero-cover {
  min-height: 280px;
  background-size: cover;
  background-position: center;
}

.hero-body {
  padding: 20px;
  display: grid;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  color: rgba(12, 100, 120, 0.8);
  font-weight: 700;
}

.hero-body h1 {
  margin: 0;
  font-size: 26px;
  color: var(--primary-strong);
}


.form-grid label.checkbox {
  margin-top: 10px;
  margin-left: 10px;
  display: flex !important;
  align-items: center;
  gap: 8px;
}

.form-grid label.checkbox input {
  flex-shrink: 0;
}

.form-grid label.checkbox span {
  line-height: 1.4;
}



.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 6px;
}

.stat {
  background: rgba(9, 209, 199, 0.06);
  border: 1px solid rgba(9, 209, 199, 0.12);
  border-radius: 12px;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
}

.stat .label {
  color: #6b7a8d;
  font-size: 12px;
}



.donate-panel {
  display: grid;
  gap: 12px;
  max-width: 440px;
  width: 100%;
  justify-self: end;
}

.panel-head h3 {
  margin: 0;
  color: var(--primary-strong);
}

.panel-body {
  display: grid;
  gap: 12px;
}

.form-error {
  color: #e53935;
  font-size: 13px;
  margin-top: 2px;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.form-grid label {
  display: grid;
  gap: 6px;
  color: #35516d;
}

.form-grid input,
.form-grid textarea {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.16);
  font: inherit;
}

.input-affix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-affix input {
  width: 100%;
  padding-right: 56px;
}

.affix {
  position: absolute;
  right: 12px;
  color: rgba(12, 100, 120, 0.8);
  font-weight: 700;
}

/* Hide number input spinners for amount field */
.form-grid input[type='number']::-webkit-outer-spin-button,
.form-grid input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-grid input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.form-grid textarea {
  resize: none;
}

.preset-row {
  display: grid;
  gap: 6px;
  color: #35516d;
}

.chip-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: hidden;
}

.chip {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(12, 100, 120, 0.2);
  background: #f7fbfd;
  cursor: pointer;
  font-weight: 700;
  color: #0c6478;
  font-size: 15px;
  white-space: nowrap;
}

.full {
  grid-column: 1 / -1;
}

.inline {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #35516d;
  flex-wrap: wrap;
}
.vertical-checkboxes {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-direction: row;
}

.checkbox input {
  margin: 0;
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
}

.checkbox span {
  line-height: 1.2;
}

.panel-foot {
  display: flex;
  justify-content: flex-end;
}

.qr-step {
  display: grid;
  gap: 10px;
  text-align: center;
}

.qr-box {
  display: grid;
  place-items: center;
  padding: 12px;
  border: 1px dashed rgba(12, 100, 120, 0.25);
  border-radius: 14px;
  background: #f7fbfd;
}

.qr-box img {
  max-width: 260px;
}

.success {
  text-align: center;
  display: grid;
  gap: 12px;
}

.status-badge {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700;
  margin: 0 auto;
  text-transform: uppercase;
}

.status-badge.completed { background: #ecfdf3; color: #15803d; }
.status-badge.success { background: #ecfdf3; color: #15803d; }
.status-badge.pending { background: #fff7ed; color: #c2410c; }
.status-badge.failed { background: #fef2f2; color: #b91c1c; }

.layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  align-items: start;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(12, 100, 120, 0.1);
}

.cover-card {
  padding: 0;
  overflow: hidden;
}

.cover {
  height: 280px;
  width: 100%;
}

.content {
  padding: 16px;
  display: grid;
  gap: 10px;
}

h1 {
  margin: 0;
  font-size: 26px;
  color: var(--primary-strong);
}

.org {
  margin: 0;
  color: #0c6478;
  font-weight: 700;
}

.desc {
  margin: 0;
  color: #35516d;
  line-height: 1.5;
}

.tabs-card {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.tabs button {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.16);
  background: #f7fbfd;
  cursor: pointer;
  font-weight: 700;
  color: #0c6478;
}

.tabs button.active {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  border-color: rgba(9, 209, 199, 0.3);
}

.tab-content {
  padding: 10px 2px 2px;
  color: #35516d;
  line-height: 1.6;
}

.history-loading {
  padding: 12px;
  color: #35516d;
  background: #f7fbfd;
  border-radius: 12px;
  border: 1px dashed rgba(12, 100, 120, 0.18);
}

.history-list {
  display: grid;
  gap: 12px;
}

.history-card {
  border: 1px solid rgba(12, 100, 120, 0.12);
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
  display: grid;
  gap: 6px;
}

.history-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.history-tags {
  display: flex;
  gap: 6px;
  align-items: center;
}

.history-title {
  font-weight: 700;
  color: #0c6478;
  font-size: 16px;
}

.history-type {
  padding: 4px 8px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
  background: rgba(12, 100, 120, 0.08);
  color: #0c6478;
  text-transform: capitalize;
}

.history-amount-tag {
  padding: 4px 8px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
  background: rgba(9, 209, 199, 0.14);
  color: #0b6c7f;
}

.history-type.type-progress { background: rgba(9, 209, 199, 0.12); color: #0b7e7b; }
.history-type.type-expense { background: rgba(255, 193, 7, 0.15); color: #b36b00; }
.history-type.type-contribution { background: rgba(76, 175, 80, 0.16); color: #1b7f2a; }

.history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #6b7a8d;
  font-size: 13px;
}

.history-content {
  color: #35516d;
}

.history-amount {
  font-weight: 700;
  color: #0b6c7f;
}

.history-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: #35516d;
}

.history-file {
  color: #0c6478;
  text-decoration: underline;
}

.history-pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  justify-content: center;
}

.page-btn {
  border: 1px solid rgba(12, 100, 120, 0.16);
  background: #f7fbfd;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 700;
  color: #0c6478;
}

.page-btn.active {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  border-color: rgba(9, 209, 199, 0.25);
}

.donation-loading {
  padding: 12px;
  color: #35516d;
  background: #f7fbfd;
  border-radius: 12px;
  border: 1px dashed rgba(12, 100, 120, 0.18);
}

.donation-table {
  border: 1px solid rgba(12, 100, 120, 0.12);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.donation-head, .donation-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1.2fr;
  align-items: center;
  gap: 8px;
}

.donation-head {
  padding: 12px;
  background: #f7fbfd;
  font-weight: 700;
  color: #0c6478;
  border-bottom: 1px solid rgba(12, 100, 120, 0.12);
}

.donation-body {
  display: grid;
}

.donation-row {
  padding: 12px;
  border-bottom: 1px solid rgba(12, 100, 120, 0.08);
}

.donation-row:last-child {
  border-bottom: none;
}

.donation-col {
  color: #35516d;
}

.donor-name {
  font-weight: 700;
  color: #0c6478;
}

.donation-amount {
  font-weight: 700;
  color: #0b6c7f;
}

.donation-time {
  color: #6b7a8d;
  font-size: 13px;
}

.donation-pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px auto 0;
  justify-content: center;
  padding: 0 12px 12px;
}

.muted {
  color: rgba(12, 100, 120, 0.7);
}

.placeholder-box {
  padding: 16px;
  border: 1px dashed rgba(12, 100, 120, 0.3);
  border-radius: 12px;
  text-align: center;
  color: rgba(12, 100, 120, 0.8);
}

.side {
  display: grid;
  gap: 14px;
}

.progress-block {
  display: grid;
  gap: 8px;
}

.row {
  display: flex;
  justify-content: space-between;
  color: #35516d;
}

.row strong {
  color: #0b6c7f;
}

.bar {
  width: 100%;
  height: 10px;
  background: rgba(9, 209, 199, 0.14);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
}

.foot {
  font-weight: 700;
}

.btn {
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
}

.skeleton {
  width: 100%;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(9, 209, 199, 0.1) 0%, rgba(70, 223, 177, 0.15) 100%);
  animation: pulse 1.2s ease-in-out infinite;
}

.skeleton.title {
  height: 28px;
  width: 70%;
}

.skeleton.tall {
  height: 80px;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 900px) {
  .donation-layout {
    grid-template-columns: 1fr;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
