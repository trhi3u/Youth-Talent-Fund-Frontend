import http from './http';

export const getStaffs = params => http.get('/admin/staffs', { params });
export const createStaff = payload => http.post('/admin/create-staff', payload);
export const getStaffDetail = value => http.get('/admin/staff', { params: { value } });
export const updateStaff = payload =>
	http.put('/admin/staff', payload, {
		params: { email: payload?.email }
	});
export const lockStaff = email => http.post(`/admin/staff/lock/${email}`);
export const unlockStaff = email => http.post(`/admin/staff/unlock/${email}`);


