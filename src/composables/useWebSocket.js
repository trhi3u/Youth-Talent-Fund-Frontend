import { ref } from 'vue';
import {
  connectDonationSocket,
  subscribeAllDonations,
  subscribeCampaignDonations,
  disconnectDonationSocket
} from '@/services/websocket';

const isConnected = ref(false);
let connecting = false;

const connect = async () => {
  if (isConnected.value || connecting) return;
  connecting = true;
  try {
    await connectDonationSocket();
    isConnected.value = true;
  } finally {
    connecting = false;
  }
};

const listenAllDonations = callback => {
  if (!isConnected.value || typeof callback !== 'function') return null;
  return subscribeAllDonations(callback);
};

const listenCampaignDonations = (campaignCode, callback) => {
  const code = typeof campaignCode === 'string' ? campaignCode.trim() : '';
  if (!isConnected.value || !code || typeof callback !== 'function') return null;
  return subscribeCampaignDonations(code, callback);
};

const disconnect = async () => {
  if (!isConnected.value && !connecting) return;
  try {
    const result = disconnectDonationSocket();
    if (result && typeof result.then === 'function') await result;
  } finally {
    isConnected.value = false;
    connecting = false;
  }
};

export const useWebSocket = () => ({
  isConnected,
  connect,
  listenAllDonations,
  listenCampaignDonations,
  disconnect
});
