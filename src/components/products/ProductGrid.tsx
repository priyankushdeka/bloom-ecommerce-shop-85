
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getAllProducts, searchProducts, Product } from "@/services/product.service";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface ProductGridProps {
  title?: string;
  hideSearch?: boolean;
  initialQuery?: string;
  category?: string;
}

const ProductGrid = ({ title = "Products", hideSearch = false, initialQuery = "", category }: ProductGridProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;
        
        if (searchQuery) {
          response = await searchProducts(searchQuery);
        } else {
          const params: any = {};
          if (category) params.category = category;
          response = await getAllProducts(params);
        }
        
        setProducts(response.data.products);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      
      {!hideSearch && (
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No products found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              name={product.name}
              price={product.price}
              image={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"}
              description={product.description}
              ratings={product.ratings}
              stock={product.stock}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
