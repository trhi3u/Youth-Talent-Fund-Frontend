import http from './http';

export async function sendChatMessage(message) {
  const text = (message || '').trim();
  if (!text) return { reply: '' };
  try {
    const res = await http.post('/public/chat', { message: text });
    return res;
  } catch (err) {
    throw err;
  }
}
