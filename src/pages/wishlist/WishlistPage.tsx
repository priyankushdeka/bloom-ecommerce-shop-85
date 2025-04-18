
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingCart, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import * as productService from "@/services/product.service";

const WishlistPage = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();
  const [movingToCart, setMovingToCart] = useState<Record<string, boolean>>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["wishlistProducts", wishlist?.products],
    queryFn: async () => {
      if (!wishlist?.products || wishlist.products.length === 0) {
        return { data: { products: [] } };
      }
      
      // Get product details for each product in the wishlist
      const productsPromises = wishlist.products.map(id => 
        productService.getProduct(id)
          .then(result => result.data.product)
          .catch(() => null)
      );
      
      const products = (await Promise.all(productsPromises)).filter(product => product !== null);
      return { data: { products } };
    },
    enabled: !!wishlist && wishlist.products && wishlist.products.length > 0,
  });

  // Refetch when wishlist changes
  useEffect(() => {
    if (wishlist) {
      refetch();
    }
  }, [wishlist, refetch]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your wishlist</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || wishlistLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const products = data?.data?.products || [];

  const handleMoveToCart = async (productId: string) => {
    try {
      setMovingToCart(prev => ({ ...prev, [productId]: true }));
      await addToCart(productId, 1);
      await removeFromWishlist(productId);
      toast({
        title: "Success",
        description: "Item moved to cart",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move item to cart",
        variant: "destructive"
      });
    } finally {
      setMovingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast({
        title: "Success",
        description: "Item removed from wishlist",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from wishlist",
        variant: "destructive"
      });
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      toast({
        title: "Success",
        description: "Wishlist cleared",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear wishlist",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold flex items-center">
            <Heart className="h-6 w-6 text-blue-600 mr-3" />
            My Wishlist
          </h1>
          
          {products.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearWishlist}>
              <Trash className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love to your wishlist</p>
            <Button asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link to={`/products/${product._id}`}>
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleRemoveFromWishlist(product._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleMoveToCart(product._id)}
                        disabled={movingToCart[product._id] || cartLoading || product.stock < 1}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Add to Cart</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
