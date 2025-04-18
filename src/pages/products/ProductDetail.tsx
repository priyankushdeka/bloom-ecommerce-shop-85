
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { getProduct } from "@/services/product.service";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { addToCart, loading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? getProduct(id) : Promise.reject('No product ID'),
    enabled: !!id
  });

  const product = data?.data.product;
  const inWishlist = isAuthenticated && id && isInWishlist(id);

  const handleIncreaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      toast.error("Cannot exceed available stock");
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }
    
    if (!product || product.stock < 1) {
      toast.error("Product is out of stock");
      return;
    }
    
    if (id) {
      await addToCart(id, quantity);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    
    if (!id) return;
    
    if (inWishlist) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link to="/products" className="text-blue-600 hover:underline flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[selectedImage] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-md overflow-hidden cursor-pointer ${
                        selectedImage === index ? "ring-2 ring-blue-600" : ""
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-400 mr-2">
                  <span>★</span>
                  <span className="ml-1 text-gray-600">{product.ratings.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({product.reviews.length} reviews)</span>
              </div>
              
              <div className="text-2xl font-bold text-blue-600 mb-4">${product.price.toFixed(2)}</div>
              
              <div className="border-t border-b py-4 my-4">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Availability:</div>
                {product.stock > 0 ? (
                  <div className="text-green-600 font-medium">In Stock ({product.stock} available)</div>
                ) : (
                  <div className="text-red-600 font-medium">Out of Stock</div>
                )}
              </div>
              
              {product.stock > 0 && (
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">Quantity:</div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-4 font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleIncreaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock < 1}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={inWishlist ? "text-red-500 hover:text-red-500" : ""}
                >
                  <Heart className={`h-5 w-5 mr-2 ${inWishlist ? "fill-current" : ""}`} />
                  {inWishlist ? "Added to Wishlist" : "Add to Wishlist"}
                </Button>
              </div>
              
              <div className="mt-8 text-sm text-gray-500">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-700 mr-2">Category:</span>
                  <span>{product.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
