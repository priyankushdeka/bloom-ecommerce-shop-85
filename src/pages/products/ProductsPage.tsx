
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ProductGrid from "@/components/products/ProductGrid";

const ProductsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("query") || "";
  const category = queryParams.get("category") || "";

  const pageTitle = category 
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` 
    : initialQuery 
      ? `Search results for "${initialQuery}"` 
      : "All Products";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProductGrid 
        title={pageTitle}
        initialQuery={initialQuery}
        category={category}
      />
    </div>
  );
};

export default ProductsPage;
