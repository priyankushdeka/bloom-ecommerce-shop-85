
import api from './api';

export interface CartItem {
  _id: string;
  product: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    cart: Cart;
  }
}

export const getCart = async () => {
  const response = await api.get<CartResponse>('/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  const response = await api.post<CartResponse>('/cart', { productId, quantity });
  return response.data;
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const response = await api.patch<CartResponse>(`/cart/${itemId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId: string) => {
  const response = await api.delete<CartResponse>(`/cart/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};
