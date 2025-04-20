
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
  paymentResult?: {
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
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: string;
  cancellationReason?: string;
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

// INR conversion rate
const INR_CONVERSION_RATE = 75;

// Function to convert USD to INR for order data
const convertOrderPricesToINR = (order: Order): Order => {
  const updatedOrder = { ...order };
  
  // Convert all monetary values to INR
  updatedOrder.itemsPrice *= INR_CONVERSION_RATE;
  updatedOrder.taxPrice *= INR_CONVERSION_RATE;
  updatedOrder.shippingPrice *= INR_CONVERSION_RATE;
  updatedOrder.totalPrice *= INR_CONVERSION_RATE;
  
  // Convert prices in order items
  updatedOrder.orderItems = updatedOrder.orderItems.map(item => ({
    ...item,
    price: item.price * INR_CONVERSION_RATE
  }));
  
  return updatedOrder;
};

export const createOrder = async (orderData: {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}) => {
  // Convert the input prices back to USD for the API
  const usdOrderData = {
    ...orderData,
    itemsPrice: orderData.itemsPrice / INR_CONVERSION_RATE,
    taxPrice: orderData.taxPrice / INR_CONVERSION_RATE,
    shippingPrice: orderData.shippingPrice / INR_CONVERSION_RATE,
    totalPrice: orderData.totalPrice / INR_CONVERSION_RATE,
    orderItems: orderData.orderItems.map(item => ({
      ...item,
      price: item.price / INR_CONVERSION_RATE
    }))
  };

  const response = await api.post<OrderResponse>('/orders', usdOrderData);
  
  // Convert the response order to INR
  if (response.data.data.order) {
    response.data.data.order = convertOrderPricesToINR(response.data.data.order);
  }
  
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get<OrderResponse>(`/orders/${id}`);
  
  // Convert the response order to INR
  if (response.data.data.order) {
    response.data.data.order = convertOrderPricesToINR(response.data.data.order);
  }
  
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get<OrdersResponse>('/orders/myorders');
  
  // Convert all orders to INR
  if (response.data.data.orders) {
    response.data.data.orders = response.data.data.orders.map(order => 
      convertOrderPricesToINR(order)
    );
  }
  
  return response.data;
};

export const updateOrderToPaid = async (orderId: string, paymentResult: any) => {
  const response = await api.put<OrderResponse>(`/orders/${orderId}/pay`, paymentResult);
  
  // Convert the response order to INR
  if (response.data.data.order) {
    response.data.data.order = convertOrderPricesToINR(response.data.data.order);
  }
  
  return response.data;
};

export const cancelOrder = async (orderId: string, reason: string) => {
  const response = await api.put<OrderResponse>(`/orders/${orderId}/cancel`, { reason });
  
  // Convert the response order to INR
  if (response.data.data.order) {
    response.data.data.order = convertOrderPricesToINR(response.data.data.order);
  }
  
  return response.data;
};
