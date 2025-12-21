import { defineStore } from 'pinia';
import { getMe, getDonationHistory } from '@/api/user.api';

export const useUserStore = defineStore('USER', {
  state: () => ({
    profile: null,
    donations: [],
    donationPage: null,
    loadingDonations: false,
    donationError: ''
  }),
  actions: {
    async loadProfile() {
      this.profile = await getMe();
      return this.profile;
    },
    async fetchDonationHistory(payload = {}) {
      this.loadingDonations = true;
      this.donationError = '';
      try {
        const res = await getDonationHistory(payload);
        const page = res?.content ? res : { content: res || [], totalElements: (res || []).length, totalPages: 1 };
        this.donationPage = page;
        this.donations = page.content || [];
        return page;
      } catch (err) {
        this.donationError = err.message;
        throw err;
      } finally {
        this.loadingDonations = false;
      }
    },
    async loadDonations() {
      // backward compatibility
      return this.fetchDonationHistory();
    }
  }
});
