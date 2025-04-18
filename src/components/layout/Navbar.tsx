
import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ShopHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-blue-600">
              Categories
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-blue-600">
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  0
                </span>
              </div>
            </Link>
            <Link to="/wishlist" className="text-gray-700 hover:text-blue-600">
              <div className="relative">
                <Heart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  0
                </span>
              </div>
            </Link>
            <Button asChild variant="outline">
              <Link to="/login" className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Sign In
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/products"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Products
            </Link>
            <Link
              to="/categories"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Categories
            </Link>
            <Link
              to="/cart"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Cart
            </Link>
            <Link
              to="/wishlist"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Wishlist
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
