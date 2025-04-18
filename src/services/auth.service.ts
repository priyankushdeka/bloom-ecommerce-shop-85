
import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    }
  }
}

export const register = async (userData: RegisterData) => {
  const response = await api.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

export const login = async (userData: LoginData) => {
  const response = await api.post<AuthResponse>('/auth/login', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.get('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (userData: Partial<{ name: string; email: string; phone: string; avatar: string }>) => {
  const response = await api.patch('/auth/updateprofile', userData);
  return response.data;
};

export const updatePassword = async (passwordData: { currentPassword: string; newPassword: string; newPasswordConfirm: string }) => {
  const response = await api.patch('/auth/updatepassword', passwordData);
  return response.data;
};
