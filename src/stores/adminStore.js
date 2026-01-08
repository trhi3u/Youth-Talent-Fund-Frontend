import { defineStore } from 'pinia';
import { getStaffs, createStaff } from '@/api/admin.api';
import { getCampaigns } from '@/api/public.api';

export const useAdminStore = defineStore('ADMIN', {
  state: () => ({
    staff: [],
    campaigns: [],
    totalCampaigns: 0,
    totalCompleted: 0
  }),
  actions: {
    async fetchStaff() {
      const res = await getStaffs();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.content)
            ? res.content
            : [];
      this.staff = list;
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

      const total = Number(res?.totalElements ?? res?.total ?? res?.totalItems ?? list.length);
      this.campaigns = list;
      this.totalCampaigns = Number.isFinite(total) ? total : list.length;
      return this.campaigns;
    },
    async fetchCompletedCampaigns() {
      const res = await getCampaigns({ status: 'COMPLETED' });
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.content)
            ? res.content
            : [];
      const total = Number(res?.totalElements ?? res?.total ?? res?.totalItems ?? list.length);
      this.totalCompleted = Number.isFinite(total) ? total : list.length;
      return this.totalCompleted;
    },
    async assign(payload) {
      // Current API uses create-staff endpoint for assignment
      return createStaff(payload);
    }
  }
});
