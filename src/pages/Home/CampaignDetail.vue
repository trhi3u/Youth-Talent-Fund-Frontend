<template>
  <section class="page">
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
          <h3 v-else>Cảm ơn bạn</h3>
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
            <h4>Cảm ơn bạn đã quyên góp cho chiến dịch</h4>
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
              <p class="muted">Chưa có cập nhật</p>
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
import { createDonation, getCampaignDetail } from '@/api/public.api';
import fallbackImage from '@/assets/image/background.png';
import { useAuthStore } from '@/stores/authStore';
import DonateQR from '@/components/donate/DonateQR.vue';

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
const formErrors = ref({});

const campaignCode = computed(() => route.params.campaignCode || route.params.id || route.params.code);
const isDonationMode = computed(() => route.query.mode === 'donation');

const coverStyle = computed(() => ({
  background: `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.25) 100%), url(${campaign.value.coverImage || fallbackImage}) center/cover no-repeat`
}));

const progress = computed(() => {
  const target = Number(campaign.value.targetAmount || 0);
  const current = Number(campaign.value.currentAmount || 0);
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
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


onMounted(() => {
  syncTabFromQuery();
  fetchDetail(campaignCode.value);
  prefillFromAuth();
});

watch(
  () => route.params.campaignCode || route.params.id,
  newCode => fetchDetail(newCode)
);
watch(
  () => route.query.mode,
  () => syncTabFromQuery()
);
watch(
  () => route.query.donate,
  () => syncTabFromQuery()
);
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
}

.donation-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
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
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.2);
  background: #f7fbfd;
  cursor: pointer;
  font-weight: 700;
  color: #0c6478;
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
