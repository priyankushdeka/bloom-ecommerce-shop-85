
import Navbar from "@/components/layout/Navbar";
import ProductGrid from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTopProducts } from "@/services/product.service";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Index = () => {
  const { data: topProductsData, isLoading } = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => getTopProducts(4)
  });

  const featuredCategories = [
    { id: 'electronics', name: 'Electronics', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80' },
    { id: 'fashion', name: 'Fashion', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
    { id: 'home', name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80' },
    { id: 'beauty', name: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&q=80' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="bg-blue-600 text-white py-16 md:py-24 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to ShopHub</h1>
            <p className="text-xl md:text-2xl mb-8">Discover amazing products at great prices</p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/products">Shop Now</Link>
            </Button>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCategories.map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`}>
                <div className="relative overflow-hidden rounded-lg group">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-32 md:h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h3 className="text-white font-semibold text-lg md:text-xl">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Top Rated Products</h2>
              <Link to="/products" className="text-blue-600 hover:underline">View All</Link>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topProductsData?.data.products.map((product) => (
                  <Link key={product._id} to={`/products/${product._id}`}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span className="text-sm text-gray-600">{product.ratings.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Browse our full collection of products and find exactly what you're looking for.
            </p>
            <Button asChild size="lg">
              <Link to="/products">Explore All Products</Link>
            </Button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">ShopHub</h3>
              <p className="text-gray-300">Your one-stop shop for all your needs.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link to="/products" className="text-gray-300 hover:text-white">Products</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-300">Email: info@shophub.com</p>
              <p className="text-gray-300">Phone: +1 (123) 456-7890</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p>© {new Date().getFullYear()} ShopHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
