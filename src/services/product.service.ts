
import api from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  ratings: number;
  numReviews: number;
  images: string[];
  category: string;
  tags?: string[];
  stock: number;
  isAvailable: boolean;
  featured?: boolean;
  reviews: any[];
  createdAt: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  data: {
    products: Product[];
  }
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
  }
}

export const getAllProducts = async (params?: any) => {
  const response = await api.get<ProductsResponse>('/products', { params });
  return response.data;
};

export const getProduct = async (id: string) => {
  const response = await api.get<ProductResponse>(`/products/${id}`);
  return response.data;
};

export const getTopProducts = async (limit: number = 5) => {
  const response = await api.get<ProductsResponse>('/products/top', { params: { limit } });
  return response.data;
};

export const searchProducts = async (keyword: string) => {
  const response = await api.get<ProductsResponse>('/products/search', { params: { keyword } });
  return response.data;
};

export const createProduct = async (productData: FormData | any) => {
  let config = {};
  
  if (productData instanceof FormData) {
    // Don't set content type for FormData - browser will set it with proper boundary
    config = {};
  } else {
    config = { 
      headers: { 'Content-Type': 'application/json' } 
    };
    
    // Ensure numbers are actually numbers not strings
    if (typeof productData.price === 'string') {
      productData.price = parseFloat(productData.price);
    }
    if (typeof productData.stock === 'string') {
      productData.stock = parseInt(productData.stock, 10);
    }
    
    // Make sure we have required fields
    if (!productData.name || !productData.description || !productData.price || 
        !productData.category || productData.stock === undefined) {
      throw new Error('Missing required product fields');
    }
  }
  
  console.log('Creating product with data:', 
    productData instanceof FormData 
      ? 'FormData (contents not printable)' 
      : productData
  );
  
  try {
    const response = await api.post<ProductResponse>('/products', productData, config);
    return response.data;
  } catch (error: any) {
    console.error('Error response from server:', error.response?.data);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: FormData | any) => {
  let config = {};
  
  if (productData instanceof FormData) {
    // Don't set content type for FormData - browser will set it with proper boundary
    config = {};
  } else {
    config = { 
      headers: { 'Content-Type': 'application/json' } 
    };
    
    // Ensure numbers are actually numbers not strings
    if (typeof productData.price === 'string') {
      productData.price = parseFloat(productData.price);
    }
    if (typeof productData.stock === 'string') {
      productData.stock = parseInt(productData.stock, 10);
    }
  }
  
  try {
    const response = await api.patch<ProductResponse>(`/products/${id}`, productData, config);
    return response.data;
  } catch (error: any) {
    console.error('Error response from server:', error.response?.data);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete<{success: boolean}>(`/products/${id}`);
  return response.data;
};
