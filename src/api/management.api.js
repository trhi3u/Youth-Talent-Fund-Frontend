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