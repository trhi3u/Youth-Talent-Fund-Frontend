import { defineStore } from 'pinia';
import { listStaff, createStaff, assignStaff, listAdminCampaigns } from '@/api/admin.api';

export const useAdminStore = defineStore('ADMIN', {
  state: () => ({
    staff: [],
    campaigns: []
  }),
  actions: {
    async fetchStaff() {
      this.staff = await listStaff();
      return this.staff;
    },
    async addStaff(payload) {
      const created = await createStaff(payload);
      this.staff.push(created);
      return created;
    },
    async fetchCampaigns() {
      this.campaigns = await listAdminCampaigns();
      return this.campaigns;
    },
    async assign(payload) {
      return assignStaff(payload);
    }
  }
});
