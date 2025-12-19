import http from './http';

export const createCampaign = formData =>
  http.post('/management/campaign', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateCampaign = (code, formData) =>
  http.put(`/management/campaign/${code}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateCampaignStatus = (code, payload) =>
  http.patch(`/management/campaign/${code}/status`, payload);

export const createReport = (campaignCode, formData) =>
  http.post(`/management/${campaignCode}/reports`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

