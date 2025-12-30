<template>
  <div class="donate-qr-overlay">
    <div class="donate-qr-modal">
      <button class="close-btn" @click="handleClose" aria-label="Đóng">×</button>
      <div class="modal-title">Thanh toán</div>
      <div class="donate-qr-card">
        <div class="info info-inline">
          <div class="row"><span class="label">Ngân hàng:</span><span class="value">{{ bankName }}</span></div>
          <div class="row"><span class="label">Số tài khoản:</span><span class="value highlight">{{ accountNumber }}</span></div>
          <div class="row"><span class="label">Chủ tài khoản:</span><span class="value highlight">{{ accountName }}</span></div>
          <div class="row"><span class="label">Số tiền:</span><span class="value highlight">{{ formatCurrency(amount) }} VND</span></div>
          <div class="row"><span class="label">Nội dung chuyển khoản:</span><span class="value highlight">{{ message }}</span></div>
        </div>
        <div class="qr-box">
          <img v-if="qrImage" :src="qrImage" alt="QR Code" />
          <div v-else class="qr-loading">Đang tạo mã QR...</div>
          <div class="qr-brand">
            <img src="@/assets/logo/VietQRlogo.png" alt="VietQR" height="22" />
            <img src="@/assets/logo/NapasLogo.png" alt="Napas" height="22" />
          </div>
        </div>
      </div>
      <div class="qr-note">
        <div class="qr-guide">Sử dụng ứng dụng ngân hàng hoặc app thanh toán hỗ trợ QR code để quét mã.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  qrString: { type: String, required: true },
  amount: { type: Number, default: 0 },
  message: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  accountName: { type: String, default: '' },
  campaignCode: { type: String, required: true }
});


const emit = defineEmits(['close', 'cancel']);

function handleClose() {
  emit('close');
  emit('cancel');
  // Nếu cha không tắt popup thì mới điều hướng (dự phòng)
  setTimeout(() => {
    const url = new URL(window.location.href);
    // Nếu vẫn còn popup sau 200ms thì điều hướng về chi tiết
    const popup = document.querySelector('.donate-qr-overlay');
    if (popup && props.campaignCode && url.searchParams.get('mode') === 'donation') {
      window.location.href = `/campaign/${props.campaignCode}`;
    }
  }, 200);
}

const qrImage = ref('');

const generateQR = async () => {
  if (!props.qrString) {
    qrImage.value = '';
    return;
  }
  try {
    qrImage.value = await QRCode.toDataURL(props.qrString, { width: 220, margin: 1 });
  } catch (e) {
    qrImage.value = '';
  }
};

watch(() => props.qrString, generateQR, { immediate: true });
onMounted(generateQR);

function formatCurrency(val) {
  return (val || 0).toLocaleString('vi-VN');
}
</script>

<style scoped lang="scss">
.donate-qr-overlay {
  position: fixed;
  z-index: 1000;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32);
  display: flex;
  align-items: center;
  justify-content: center;
}
.donate-qr-modal {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(12, 100, 120, 0.18);
  padding: 0 0 24px 0;
  min-width: 420px;
  max-width: 720px;
  width: 99vw;
  position: relative;
  animation: popup-in 0.18s cubic-bezier(.4,0,.2,1);
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2.1rem;
  color: #e53935;
  font-weight: 700;
  cursor: pointer;
  z-index: 2;
  line-height: 1;
  transition: color 0.18s;
}
.close-btn:hover { color: #b71c1c; }
.modal-title {
  text-align: center;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0b6c7f;
  padding: 18px 0 8px 0;
  letter-spacing: 0.2px;
}
.donate-qr-card {
  display: flex;
  gap: 28px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #09d1c7;
  padding: 24px 28px 18px 28px;
  align-items: center;
  margin: 0 auto;
  flex-wrap: wrap;
}
// ...existing code...
.info {
  flex: 1 1 180px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-inline {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-start;
}
.info-inline .row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  background: #f7fbfd;
  border-radius: 8px;
  padding: 6px 10px;
  margin-bottom: 0;
  margin-right: 8px;
  margin-top: 0;
  border: 1px solid #e0f7f4;
}
.info-inline .label {
  min-width: unset;
  color: #0b6c7f;
  font-weight: 700;
}
.info-inline .value {
  color: #123047;
  font-weight: 600;
}
.info-inline .highlight {
  color: #e53935;
  font-weight: 800;
}
.label {
  color: #0b6c7f;
  font-weight: 700;
  min-width: 140px;
}
.value {
  color: #123047;
  font-weight: 600;
  word-break: break-all;
}
.highlight {
  color: #e53935;
  font-weight: 800;
}
.qr-box {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.qr-box img {
  width: 220px;
  height: 220px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
}
.qr-loading {
  color: #0b6c7f;
  font-size: 14px;
  text-align: center;
}
.qr-brand {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
}
.qr-brand img {
  height: 40px;
  width: auto;
  max-width: 90px;
  object-fit: contain;
  margin: 0;
}
.qr-note {
  margin: 14px 0 0 0;
  text-align: center;
  color: #0b6c7f;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}
.qr-guide {
  color: #0b6c7f;
  font-size: 13px;
  font-weight: 500;
  margin-top: 4px;
}
@media (max-width: 600px) {
  .donate-qr-modal {
    min-width: 0;
    max-width: 99vw;
    padding: 0 0 10px 0;
  }
  .donate-qr-card {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 14px 8px;
  }
  .qr-box {
    flex: 1 1 100%;
    justify-content: flex-start;
  }
  .qr-box img {
    width: 98vw;
    max-width: 320px;
    height: auto;
    min-width: 180px;
  }
}
@keyframes popup-in {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
