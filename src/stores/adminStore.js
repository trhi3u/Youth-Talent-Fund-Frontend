import { defineStore } from 'pinia';
import { getStaffs, createStaff } from '@/api/admin.api';
import { getCampaigns } from '@/api/public.api';

export const useAdminStore = defineStore('ADMIN', {
  state: () => ({
    staff: [],
    campaigns: []
  }),
  actions: {
    async fetchStaff() {
      this.staff = await getStaffs();
      return this.staff;
    },
    async addStaff(payload) {
      const created = await createStaff(payload);
      this.staff.push(created);
      return created;
    },
    async fetchCampaigns() {
      const res = await getCampaigns();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.content)
            ? res.content
            : [];

      this.campaigns = list;
      return this.campaigns;
    },
    async assign(payload) {
      // Current API uses create-staff endpoint for assignment
      return createStaff(payload);
    }
  }
});
