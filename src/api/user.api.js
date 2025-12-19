import http from './http';

export const getMe = () => http.get('/users/me');
export const updateProfile = payload => http.put('/users/me', payload);

export const updateAvatar = formData =>
  http.put('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const changePassword = payload => http.put('/users/me/password', payload);

export const getDonationHistory = payload => http.post('/auth/donation/history', payload);
