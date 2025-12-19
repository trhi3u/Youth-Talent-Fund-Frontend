import http from './http';

export const getCampaigns = params => http.get('/public/campaigns', { params });

export const getCampaignDetail = value =>
  http.get('/public/campaigns/detail', {
    params: { value }
  });

export const createDonation = payload => http.post('/public/donation/create', payload);
