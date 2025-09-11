import api from './client';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export async function register(payload: RegisterPayload) {
  const res = await api.post('/api/v1/user/register', payload);
  return res.data;
}

export async function login(payload: { email: string; password: string }) {
  const res = await api.post('/api/v1/user/login', payload);
  return res.data;
}

export async function forgotPassword(payload: { email: string }) {
  const res = await api.post('/api/v1/user/password/forgot', payload);
  return res.data;
}

export async function otpPassword(payload: { email: string; otp: string }) {
  const res = await api.post('/api/v1/user/password/otp', payload);
  return res.data;
}

export async function resetPassword(payload: { password: string }) {
  const res = await api.post('/api/v1/user/password/reset', payload);
  return res.data;
}

export async function getProfile() {
  const res = await api.get('/api/v1/profile');
  return res.data;
}

export async function editProfile(formData: FormData) {
  const res = await api.patch('/api/v1/profile/edit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
