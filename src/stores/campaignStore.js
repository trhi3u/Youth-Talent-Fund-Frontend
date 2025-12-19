import { defineStore } from 'pinia';
import { getCampaigns, getCampaignDetail } from '@/api/public.api';
import { createCampaign, updateCampaign } from '@/api/management.api';
import { getDevCampaigns, getDevCampaignById } from '@/mocks/scenarios';

export const useCampaignStore = defineStore('campaign', {
  state: () => ({
    campaigns: [],
    current: null,
    loading: false,
    error: ''
  }),
  actions: {
    async fetchAll(params) {
      this.loading = true;
      this.error = '';
      try {
        if (import.meta.env.DEV) {
          this.campaigns = getDevCampaigns();
          return this.campaigns;
        }

        this.campaigns = await getCampaigns(params);
        return this.campaigns;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchOne(id) {
      this.loading = true;
      this.error = '';
      try {
        if (import.meta.env.DEV) {
          this.current = getDevCampaignById(id);
          return this.current;
        }

        this.current = await getCampaignDetail(id);
        return this.current;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async create(payload) {
      const created = await createCampaign(payload);
      this.campaigns.push(created);
      return created;
    },
    async update(id, payload) {
      const updated = await updateCampaign(id, payload);
      this.current = updated;
      const idx = this.campaigns.findIndex(c => c.id === id);
      if (idx !== -1) this.campaigns[idx] = updated;
      return updated;
    }
  }
});
