
import Navbar from "@/components/layout/Navbar";
import ProductGrid from "@/components/products/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <div className="bg-blue-600 text-white py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to ShopHub</h1>
          <p className="text-xl">Discover amazing products at great prices</p>
        </div>
        <ProductGrid />
      </main>
    </div>
  );
};

export default Index;
