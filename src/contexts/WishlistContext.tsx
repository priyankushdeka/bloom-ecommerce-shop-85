
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as wishlistService from '../services/wishlist.service';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: wishlistService.Wishlist | null;
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<wishlistService.Wishlist | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (productId: string) => {
    try {
      setLoading(true);
      const response = await wishlistService.addToWishlist(productId);
      setWishlist(response.data.wishlist);
      toast.success('Item added to wishlist!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add item to wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      setLoading(true);
      const response = await wishlistService.removeFromWishlist(productId);
      setWishlist(response.data.wishlist);
      toast.success('Item removed from wishlist!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item from wishlist');
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    try {
      setLoading(true);
      await wishlistService.clearWishlist();
      setWishlist(null);
      toast.success('Wishlist cleared!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear wishlist');
    } finally {
      setLoading(false);
    }
  };

  const refreshWishlist = async () => {
    return fetchWishlist();
  };

  const isInWishlist = (productId: string) => {
    if (!wishlist || !wishlist.products) return false;
    
    // Fix the type mismatch issue by checking if products is an array of objects with _id
    return wishlist.products.some(product => 
      typeof product === 'object' && product._id === productId
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
