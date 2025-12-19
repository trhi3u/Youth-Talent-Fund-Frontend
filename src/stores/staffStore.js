import { defineStore } from 'pinia';
import {
  listStaffCampaigns,
  updateCampaignProgress,
  createCampaign as staffCreateCampaign,
  updateCampaign as staffEditCampaign,
  fetchReports,
  fetchTransactions
} from '@/api/management.api';

export const useStaffStore = defineStore('STAFF', {
  state: () => ({
    campaigns: [],
    reports: [],
    transactions: []
  }),
  actions: {
    async fetchCampaigns() {
      this.campaigns = await listStaffCampaigns();
      return this.campaigns;
    },
    async createCampaign(payload) {
      const created = await staffCreateCampaign(payload);
      this.campaigns.push(created);
      return created;
    },
    async editCampaign(id, payload) {
      const updated = await staffEditCampaign(id, payload);
      const idx = this.campaigns.findIndex(c => c.id === id);
      if (idx !== -1) this.campaigns[idx] = updated;
      return updated;
    },
    async updateProgress(id, payload) {
      return updateCampaignProgress(id, payload);
    },
    async loadReports() {
      this.reports = await fetchReports();
      return this.reports;
    },
    async loadTransactions() {
      this.transactions = await fetchTransactions();
      return this.transactions;
    }
  }
});
