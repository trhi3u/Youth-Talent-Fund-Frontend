import http from './http';

export const getCampaigns = params => http.get('/public/campaigns', { params });

export const getCampaignDetail = value =>
  http.get('/public/campaigns/detail', {
    params: { value }
  });

export const createDonation = payload => http.post('/public/donation/create', payload);

export const getDonationList = params => http.get('/public/donation/list', { params });

export function getProofReports(campaignCode, params = {}) {
  return http.get(`/public/campaigns/${campaignCode}/proof-reports`, { params });
}

export function downloadAttachment(attachmentId) {
  return http.get(`/public/attachments/${attachmentId}/download`);
}

export async function sendChatMessage(message) {
  const text = (message || '').trim();
  if (!text) return { reply: '' };
  try {
    const res = await http.post('/public/chat', { message: text });
    return res;
  } catch (err) {
    throw err;
  }
}

export const getCampaignsTotal = params =>
  http.get('/public/campaign/total', { params });