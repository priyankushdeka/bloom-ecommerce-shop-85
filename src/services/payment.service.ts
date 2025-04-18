
import api from './api';

export interface PaymentOrderResponse {
  success: boolean;
  data: {
    id: string;
    amount: number;
    currency: string;
    key: string;
  }
}

export const createPaymentOrder = async (orderId: string, amount: number) => {
  const response = await api.post<PaymentOrderResponse>('/payments/create', { orderId, amount });
  return response.data;
};

export const verifyPayment = async (paymentData: {
  orderCreationId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
}) => {
  const response = await api.post('/payments/verify', paymentData);
  return response.data;
};
