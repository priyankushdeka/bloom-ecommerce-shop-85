
import api from './api';

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  image: string;
  price: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: string;
  isDelivered: boolean;
  deliveredAt: string;
  status: string;
  createdAt: string;
}

export interface OrderResponse {
  success: boolean;
  data: {
    order: Order;
  }
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  data: {
    orders: Order[];
  }
}

export const createOrder = async (orderData: {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}) => {
  const response = await api.post<OrderResponse>('/orders', orderData);
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get<OrderResponse>(`/orders/${id}`);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get<OrdersResponse>('/orders/myorders');
  return response.data;
};

export const updateOrderToPaid = async (orderId: string, paymentResult: any) => {
  const response = await api.put<OrderResponse>(`/orders/${orderId}/pay`, paymentResult);
  return response.data;
};

export const cancelOrder = async (orderId: string, reason: string) => {
  const response = await api.put<OrderResponse>(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};
