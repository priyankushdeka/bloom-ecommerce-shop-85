
import api from './api';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    isAvailable: boolean;
  };
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

// INR conversion rate
const INR_CONVERSION_RATE = 75;

export const getCart = async () => {
  const response = await api.get<CartResponse>('/cart');
  
  // Convert prices to INR
  if (response.data.data.cart) {
    response.data.data.cart.items.forEach(item => {
      if (item.product) {
        item.product.price = item.product.price * INR_CONVERSION_RATE;
      }
      item.price = item.price * INR_CONVERSION_RATE;
    });
    response.data.data.cart.totalPrice = response.data.data.cart.totalPrice * INR_CONVERSION_RATE;
  }
  
  return response.data;
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  const response = await api.post<CartResponse>('/cart', { productId, quantity });
  
  // Convert prices to INR
  if (response.data.data.cart) {
    response.data.data.cart.items.forEach(item => {
      if (item.product) {
        item.product.price = item.product.price * INR_CONVERSION_RATE;
      }
      item.price = item.price * INR_CONVERSION_RATE;
    });
    response.data.data.cart.totalPrice = response.data.data.cart.totalPrice * INR_CONVERSION_RATE;
  }
  
  return response.data;
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const response = await api.patch<CartResponse>(`/cart/${itemId}`, { quantity });
  
  // Convert prices to INR
  if (response.data.data.cart) {
    response.data.data.cart.items.forEach(item => {
      if (item.product) {
        item.product.price = item.product.price * INR_CONVERSION_RATE;
      }
      item.price = item.price * INR_CONVERSION_RATE;
    });
    response.data.data.cart.totalPrice = response.data.data.cart.totalPrice * INR_CONVERSION_RATE;
  }
  
  return response.data;
};

export const removeCartItem = async (itemId: string) => {
  const response = await api.delete<CartResponse>(`/cart/${itemId}`);
  
  // Convert prices to INR
  if (response.data.data.cart) {
    response.data.data.cart.items.forEach(item => {
      if (item.product) {
        item.product.price = item.product.price * INR_CONVERSION_RATE;
      }
      item.price = item.price * INR_CONVERSION_RATE;
    });
    response.data.data.cart.totalPrice = response.data.data.cart.totalPrice * INR_CONVERSION_RATE;
  }
  
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};
