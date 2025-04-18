
import api from './api';

export interface DashboardStats {
  counts: {
    users: number;
    products: number;
    orders: number;
  };
  revenue: number;
  revenueByDate: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

export interface UsersResponse {
  success: boolean;
  count: number;
  data: {
    users: any[];
  }
}

export interface UserResponse {
  success: boolean;
  data: {
    user: any;
  }
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  data: {
    orders: any[];
  }
}

export const getDashboardStats = async () => {
  const response = await api.get<DashboardResponse>('/admin/dashboard');
  return response.data;
};

export const getUsers = async (page = 1, limit = 10) => {
  const response = await api.get<UsersResponse>('/admin/users', {
    params: { page, limit }
  });
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get<UserResponse>(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, userData: any) => {
  const response = await api.put<UserResponse>(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getOrders = async (page = 1, limit = 10) => {
  const response = await api.get<OrdersResponse>('/admin/orders', {
    params: { page, limit }
  });
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.put(`/admin/orders/${orderId}/status`, { status });
  return response.data;
};
