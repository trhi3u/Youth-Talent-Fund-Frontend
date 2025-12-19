import http from './http';

export const login = payload => http.post('/auth/login', payload);
export const register = payload => http.post('/auth/register', payload);
export const forgotPassword = payload => http.post('/auth/forgot-password', payload);

export const verifyResetToken = token =>
  http.get('/auth/reset-password', {
    params: { token }
  });

export const resetPassword = payload => http.post('/auth/reset-password', payload);

export const getDonationHistory = payload => http.post('/auth/donation/history', payload);