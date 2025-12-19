import { defineStore } from 'pinia';
import { getMe, getDonationHistory } from '@/api/user.api';

export const useUserStore = defineStore('USER', {
  state: () => ({
    profile: null,
    donations: []
  }),
  actions: {
    async loadProfile() {
      this.profile = await getMe();
      return this.profile;
    },
    async loadDonations() {
      this.donations = await getDonationHistory();
      return this.donations;
    }
  }
});
