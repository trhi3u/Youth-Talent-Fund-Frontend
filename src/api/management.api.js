import http from './http';

export const createCampaign = formData =>
  http.post('/management/campaign', formData);

export const updateCampaign = (code, formData) =>
  http.put(`/management/campaign/${code}`, formData);

export const updateCampaignStatus = (code, payload) =>
  http.patch(`/management/campaign/${code}/status`, payload);

export const createReport = (campaignCode, formData) =>
  http.post(`/management/${campaignCode}/reports`, formData);

export const getTotalDonationStatistic = params =>
  http.get('/management/statistic/total-donation', { params });

export const getStaffCampaigns = staffCode =>
  http.get(`/management/admin/staff/${staffCode}/campaigns`);

export const getMyCampaigns = params =>
  http.get('/management/campaigns', { params });

// Progress update for staff; endpoint may be adjusted to match backend
export const updateCampaignProgress = (code, payload) =>
  http.patch(`/management/campaign/${code}/progress`, payload);

// Reports & transactions (staff analytics). Adjust paths if backend differs
export const fetchReports = params => http.get('/management/reports', { params });
export const fetchTransactions = params => http.get('/management/transactions', { params });

// Legacy list for staff (alias to getMyCampaigns for compatibility)
export const listStaffCampaigns = params => getMyCampaigns(params);

// Donation statistics for admin (filter by userCode, campaignCode)
export const getUserDonationStatisticAdmin = payload => http.post('/management/statistic/donation/user', payload);