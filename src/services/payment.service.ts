
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

// INR conversion rate
const INR_CONVERSION_RATE = 75;

export const createPaymentOrder = async (orderId: string, amount: number) => {
  // Convert amount to Indian Rupees for Razorpay (which requires INR)
  // We assume the amount is in USD from the backend
  const inrAmount = amount * INR_CONVERSION_RATE;
  
  const response = await api.post<PaymentOrderResponse>('/payments/create', { 
    orderId, 
    amount: inrAmount,
    currency: "INR" 
  });
  
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
