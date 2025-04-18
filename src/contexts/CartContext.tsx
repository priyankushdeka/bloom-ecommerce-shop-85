
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as cartService from '../services/cart.service';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: cartService.Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<cartService.Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      const response = await cartService.addToCart(productId, quantity);
      setCart(response.data.cart);
      toast.success('Item added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      const response = await cartService.updateCartItem(itemId, quantity);
      setCart(response.data.cart);
      toast.success('Cart updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await cartService.removeCartItem(itemId);
      setCart(response.data.cart);
      toast.success('Item removed from cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      setCart(null);
      toast.success('Cart cleared!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    return fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
