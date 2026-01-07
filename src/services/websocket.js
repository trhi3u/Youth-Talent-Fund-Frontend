import SockJS from "sockjs-client";
import Stomp from "stompjs";

let stompClient = null;
let statusClient = null;

/**
 * Kết nối WebSocket donation
 */
function connectDonationSocket(onConnected) {
  const socket = new SockJS("https://ytf-be.halofern.io.vn/api/ws-donation");
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    console.log("[WS] Donation connected");
    if (onConnected) onConnected();
  });
}

/**
 * Kết nối WebSocket theo dõi trạng thái thanh toán (wsToken từ create donation)
 */
function connectDonationStatusSocket(wsToken, onConnected) {
  if (!wsToken) return;
  const socket = new SockJS(`https://ytf-be.halofern.io.vn/api/public/ws-donation-status?wsToken=${encodeURIComponent(wsToken)}`);
  statusClient = Stomp.over(socket);

  statusClient.connect({}, () => {
    console.log("[WS] Donation status connected");
    if (onConnected) onConnected();
  });
}

/**
 * Subscribe realtime donate của TẤT CẢ campaign
 */
function subscribeAllDonations(callback) {
  if (!stompClient) return;

  return stompClient.subscribe(
    "/topic/donations",
    (message) => {
      if (message.body) {
        callback(JSON.parse(message.body));
      }
    }
  );
}

/**
 * Subscribe realtime donate của 1 campaign
 */
function subscribeCampaignDonations(campaignCode, callback) {
  if (!stompClient || !campaignCode) return;

  return stompClient.subscribe(
    `/topic/donations/${campaignCode}`,
    (message) => {
      if (message.body) {
        callback(JSON.parse(message.body));
      }
    }
  );
}

/**
 * Subscribe kết quả thanh toán của user (để redirect sau khi payOS trả về)
 */
function subscribeDonationStatus(callback) {
  if (!statusClient) return;

  return statusClient.subscribe(
    "/user/queue/payment-status",
    (message) => {
      if (message.body) {
        callback(JSON.parse(message.body));
      }
    }
  );
}

/**
 * Ngắt kết nối
 */
function disconnectDonationSocket() {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log("[WS] Donation disconnected");
    });
    stompClient = null;
  }
}

function disconnectDonationStatusSocket() {
  if (statusClient) {
    statusClient.disconnect(() => {
      console.log("[WS] Donation status disconnected");
    });
    statusClient = null;
  }
}

export {
  connectDonationSocket,
  subscribeAllDonations,
  subscribeCampaignDonations,
  connectDonationStatusSocket,
  subscribeDonationStatus,
  disconnectDonationSocket,
  disconnectDonationStatusSocket,
};
