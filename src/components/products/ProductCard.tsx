
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  ratings?: number;
  stock?: number;
}

const ProductCard = ({ id, name, price, image, description, ratings = 0, stock = 0 }: ProductCardProps) => {
  const { addToCart, loading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }
    
    if (stock < 1) {
      toast.error("Product is out of stock");
      return;
    }
    
    await addToCart(id, 1);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    
    if (isInWishlist(id)) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  };

  const inWishlist = isAuthenticated && isInWishlist(id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {stock < 1 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs">
              Out of Stock
            </div>
          )}
          {ratings > 0 && (
            <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs flex items-center">
              <span className="mr-1">★</span>
              <span>{ratings.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">{name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">${price.toFixed(2)}</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={inWishlist ? "text-red-500 hover:text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
            </Button>
            <Button 
              onClick={handleAddToCart} 
              disabled={cartLoading || stock < 1}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
