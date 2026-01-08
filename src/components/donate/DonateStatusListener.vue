<template></template>

<script>
import {
  connectDonationStatusSocket,
  subscribeDonationStatus,
  disconnectDonationStatusSocket
} from '@/services/websocket';

export default {
  name: 'DonateStatusListener',
  props: {
    wsToken: {
      type: String,
      required: true
    }
  },
  emits: ['success', 'failed'],
  data() {
    return {
      subscription: null
    };
  },
  watch: {
    wsToken: {
      immediate: true,
      handler(newToken) {
        this.setupSocket(newToken);
      }
    }
  },
  methods: {
    setupSocket(token) {
      this.teardown();
      if (!token) return;
      connectDonationStatusSocket(token, () => {
        this.subscription = subscribeDonationStatus((raw) => {
          const payload = raw || {};
          const status = (payload.status || '').toString().toUpperCase();
          if (status === 'SUCCESS') {
            this.$emit('success', payload);
            this.teardown();
          } else if (status === 'FAILED') {
            this.$emit('failed', payload);
            this.teardown();
          }
        });
      });
    },
    teardown() {
      if (this.subscription && typeof this.subscription.unsubscribe === 'function') {
        this.subscription.unsubscribe();
      }
      this.subscription = null;
      disconnectDonationStatusSocket();
    }
  },
  beforeUnmount() {
    this.teardown();
  }
};
</script>
