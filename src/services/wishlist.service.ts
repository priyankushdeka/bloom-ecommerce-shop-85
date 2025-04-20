
import api from './api';

export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  ratings: number;
  stock: number;
  isAvailable?: boolean;
}

export interface Wishlist {
  _id: string;
  user: string;
  products: WishlistProduct[];
}

export interface WishlistResponse {
  success: boolean;
  data: {
    wishlist: Wishlist;
  }
}

export const getWishlist = async () => {
  const response = await api.get<WishlistResponse>('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId: string) => {
  const response = await api.post<WishlistResponse>('/wishlist', { productId });
  return response.data;
};

export const removeFromWishlist = async (productId: string) => {
  const response = await api.delete<WishlistResponse>(`/wishlist/${productId}`);
  return response.data;
};

export const clearWishlist = async () => {
  const response = await api.delete<WishlistResponse>('/wishlist');
  return response.data;
};
