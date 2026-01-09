<template>
	<section class="analyst">
		<header class="hero">
			<div>
				<p class="eyebrow">Thống kê chiến dịch</p>
				<h1>{{ campaignTitle }}</h1>
				<p class="muted">Mã chiến dịch: {{ campaignCode }}</p>
			</div>
			<button class="btn ghost" @click="goBack">Quay lại</button>
		</header>

		<section class="summary-grid">
			<article class="card metric">
				<p class="label">Đã gây quỹ</p>
				<p class="value">{{ formatCurrency(raisedAmount) }}</p>
				<p class="hint">{{ progress }}% mục tiêu</p>
			</article>
			<article class="card metric">
				<p class="label">Mục tiêu</p>
				<p class="value">{{ formatCurrency(targetAmount) }}</p>
				<p class="hint">Thời gian: {{ dateRange }}</p>
			</article>
			<article class="card metric">
				<p class="label">Số giao dịch</p>
				<p class="value">{{ totalTransactions }}</p>
				<p class="hint">Tổng lượt quyên góp</p>
			</article>
			<article class="card metric">
				<p class="label">Người ủng hộ</p>
				<p class="value">{{ totalDonors }}</p>
				<p class="hint">Bao gồm khách vãng lai</p>
			</article>
		</section>

		<section class="panel">
			<div class="panel-head">
				<div>
					<h3>Thông tin chiến dịch</h3>
					<p class="hint">Tóm tắt trạng thái và ngân sách</p>
				</div>
			</div>
			<div class="info-grid">
				<div class="info-item">
					<p class="label">Trạng thái</p>
					<p class="value">
						<span v-if="statusLabel" class="chip" :class="statusClass">{{ statusLabel }}</span>
						<span v-else class="muted">Chưa cập nhật</span>
					</p>
				</div>
				<div class="info-item">
					<p class="label">Thời gian</p>
					<p class="value">{{ dateRange }}</p>
				</div>
				<div class="info-item">
					<p class="label">Phụ trách</p>
					<p class="value">{{ staffName || 'Đang cập nhật' }}</p>
				</div>
				<div class="info-item">
					<p class="label">Danh mục</p>
					<p class="value">{{ categoryLabel || 'Chưa gắn' }}</p>
				</div>
			</div>
			<p class="description" v-if="campaignDescription">{{ campaignDescription }}</p>
			<p class="muted" v-else>Chưa có mô tả cho chiến dịch này.</p>
		</section>

		<section class="panel">
			<div class="panel-head">
				<div>
					<h3>Danh sách ủng hộ</h3>
					<p class="hint">Hiển thị tối đa 10 giao dịch gần nhất</p>
				</div>
				<button class="btn ghost" :disabled="loadingDonations" @click="fetchDonations">Làm mới</button>
			</div>

			<div v-if="loadingDonations" class="skeleton-list">
				<div v-for="n in 5" :key="n" class="skeleton-row" />
			</div>
			<div v-else-if="!donations.length" class="empty">
				<span class="empty-icon" aria-hidden="true">📭</span>
				<p>Chưa có giao dịch</p>
			</div>
			<div v-else class="table">
				<div class="table-row head">
					<span>Người ủng hộ</span>
					<span>Số tiền</span>
					<span>Thời gian</span>
				</div>
				<div class="table-row" v-for="item in donations" :key="item.id || item.code">
					<span>{{ item.fullName || item.donorName || item.name || 'Ẩn danh' }}</span>
					<span>{{ formatCurrency(item.amount || item.total || 0) }}</span>
					<span>{{ formatDateTime(item.date || item.createdAt || item.time || item.transactionDate) }}</span>
				</div>
			</div>
		</section>
	</section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCampaignDetail, getDonationList } from '@/api/public.api';
import { getCategoryLabel } from '@/utils/category';
import { formatLocal } from '@/utils/date';

const route = useRoute();
const router = useRouter();

const campaign = ref(null);
const loadingDetail = ref(false);

const donations = ref([]);
const loadingDonations = ref(false);
const totalDonors = ref(0);
const totalTransactions = ref(0);

const campaignCode = computed(() => route.params.campaignCode || route.query.campaign || route.params.id || '');

const statusLabel = computed(() => {
	const s = (campaign.value?.status || '').toString().toUpperCase().replace(/[-\s]/g, '_');
	if (['PENDING', 'CREATED'].includes(s)) return 'Chưa bắt đầu';
	if (['IN_PROGRESS', 'ACTIVE', 'RUNNING', 'ONGOING', 'PROCESSING'].includes(s)) return 'Đang diễn ra';
	if (['ON_HOLD', 'PAUSED', 'HOLD'].includes(s)) return 'Tạm dừng';
	if (['COMPLETED', 'SUCCESS', 'DONE', 'FINISHED', 'EARLY_FINISHED'].includes(s)) return 'Hoàn thành';
	if (['CANCELLED', 'CANCEL', 'CANCELED', 'REJECTED'].includes(s)) return 'Hủy';
	return '';
});
const statusClass = computed(() => {
	const s = (campaign.value?.status || '').toString().toUpperCase().replace(/[-\s]/g, '_');
	if (['PENDING', 'CREATED'].includes(s)) return 'pending';
	if (['IN_PROGRESS', 'ACTIVE', 'RUNNING', 'ONGOING', 'PROCESSING'].includes(s)) return 'in-progress';
	if (['ON_HOLD', 'PAUSED', 'HOLD'].includes(s)) return 'on-hold';
	if (['COMPLETED', 'SUCCESS', 'DONE', 'FINISHED', 'EARLY_FINISHED'].includes(s)) return 'completed';
	if (['CANCELLED', 'CANCEL', 'CANCELED', 'REJECTED'].includes(s)) return 'cancelled';
	return 'info';
});

const raisedAmount = computed(
	() => Number(campaign.value?.currentAmount ?? campaign.value?.raised ?? campaign.value?.totalRaised ?? 0)
);
const targetAmount = computed(() => Number(campaign.value?.targetAmount ?? campaign.value?.goal ?? 0));
const progress = computed(() => {
	if (!targetAmount.value) return 0;
	return Math.min(100, Math.round((raisedAmount.value / targetAmount.value) * 100));
});

const campaignTitle = computed(() => campaign.value?.title || campaign.value?.name || 'Chiến dịch');
const campaignDescription = computed(() => campaign.value?.description || campaign.value?.story || '');
const staffName = computed(() => campaign.value?.staffName || campaign.value?.staffname || campaign.value?.assignee || '');
const categoryLabel = computed(() => getCategoryLabel(campaign.value?.category || campaign.value?.categoryName || campaign.value?.topic));

const dateRange = computed(() => {
	const start = campaign.value?.startDate || campaign.value?.beginDate || campaign.value?.createdAt;
	const end = campaign.value?.endDate || campaign.value?.closedAt;
	const startText = start ? formatDate(start) : 'Đang cập nhật';
	const endText = end ? formatDate(end) : 'Đang cập nhật';
	return `${startText} - ${endText}`;
});

const formatCurrency = value => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`;
const formatDate = value => (value ? formatLocal(value, 'DD/MM/YYYY') : '—');
const formatDateTime = value => (value ? formatLocal(value, 'DD/MM/YYYY HH:mm') : '—');

const fetchDetail = async () => {
	if (!campaignCode.value) return;
	loadingDetail.value = true;
	try {
		const res = await getCampaignDetail(campaignCode.value);
		campaign.value = res || {};
	} catch (err) {
		campaign.value = {};
	}
	loadingDetail.value = false;
};

const fetchDonations = async () => {
	if (!campaignCode.value) return;
	loadingDonations.value = true;
	try {
		const res = await getDonationList({ campaignCode: campaignCode.value, page: 0, size: 10 });
		donations.value = res?.content || res?.data || res || [];
		const totalFromRes =
			res?.totalDonors ??
			res?.donorCount ??
			res?.uniqueDonors ??
			res?.totalDonation ??
			res?.totalElements ??
			res?.total ??
			donations.value.length;
		totalDonors.value = Number(totalFromRes || 0);
		totalTransactions.value = Number(
			res?.totalTransactions ?? res?.transactionCount ?? res?.totalDonation ?? res?.totalElements ?? donations.value.length
		);
	} catch (err) {
		donations.value = [];
		totalDonors.value = 0;
		totalTransactions.value = 0;
	}
	loadingDonations.value = false;
};

const goBack = () => {
	const fallback = route.path.includes('/staff') ? '/staff/dashboard' : '/admin/analytics';
	if (window.history.length > 1) router.back();
	else router.push(fallback);
};

onMounted(() => {
	fetchDetail();
	fetchDonations();
});
</script>

<style scoped lang="scss">
.analyst {
	padding: 24px;
	display: grid;
	gap: 16px;
	background: #f6f8fb;
}

.hero {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12px;
	flex-wrap: wrap;
}

.eyebrow { margin: 0; font-size: 12px; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: 0.4px; }
h1 { margin: 4px 0 2px; }
.muted { color: #64748b; margin: 0; }

.chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.chip { padding: 6px 10px; border-radius: 999px; background: #e9f5ff; color: #0b6c7f; font-weight: 700; font-size: 12px; }
.chip.subtle { background: #edf2f7; color: #334155; }

.chip.pending { background: #fff8e1; color: #f7b500; }
.chip.in-progress { background: #e6f4ea; color: #1a7f37; }
.chip.on-hold { background: #fff8e1; color: #f7b500; }
.chip.completed { background: #fdeaea; color: #e53935; }
.chip.cancelled { background: #f6e9fb; color: #8e24aa; }
.chip.info { background: #eff6ff; color: #1d4ed8; }

.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.card { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
.metric { display: grid; gap: 6px; }
.metric .label { margin: 0; color: #0f172a; font-weight: 600; }
.metric .value { margin: 0; font-size: 22px; font-weight: 800; color: #0f766e; }
.metric .hint { margin: 0; color: #5b7083; }

.panel { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: grid; gap: 12px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.hint { margin: 2px 0 0; color: #5b7083; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.info-item { background: #f8fafc; border-radius: 10px; padding: 10px 12px; display: grid; gap: 4px; }
.info-item .label { margin: 0; color: #475569; font-weight: 600; font-size: 13px; }
.info-item .value { margin: 0; color: #0f172a; font-weight: 700; }

.description { margin: 0; color: #334155; line-height: 1.55; }

.skeleton-list { display: grid; gap: 8px; }
.skeleton-row { height: 44px; background: linear-gradient(90deg, #edf2f7 0%, #f6f8fb 50%, #edf2f7 100%); border-radius: 10px; animation: shimmer 1.3s infinite; }
@keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }

.table { display: grid; gap: 6px; }
.table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; align-items: center; gap: 8px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; }
.table-row.head { background: transparent; color: #475569; font-weight: 700; }

.empty { text-align: center; color: #64748b; display: grid; place-items: center; gap: 4px; padding: 16px; }
.empty-icon { font-size: 26px; }

.btn { border: none; cursor: pointer; padding: 10px 14px; border-radius: 10px; font-weight: 700; }
.btn.ghost { background: #e2e8f0; color: #0f172a; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
	.table-row { grid-template-columns: 1.4fr 1fr 1fr; }
	.table-row.head span:last-child { display: none; }
	.table-row span:last-child { display: none; }
}
</style>
