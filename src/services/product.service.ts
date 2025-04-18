
import api from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  ratings: number;
  images: string[];
  category: string;
  stock: number;
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
  // For FormData, we shouldn't set the Content-Type header as the browser will set it correctly with the boundary
  const config = productData instanceof FormData 
    ? { headers: {} } 
    : { headers: { 'Content-Type': 'application/json' } };
  
  console.log('Creating product with data:', 
    productData instanceof FormData 
      ? 'FormData (contents not printable)' 
      : productData
  );
  
  const response = await api.post<ProductResponse>('/products', productData, config);
  return response.data;
};

export const updateProduct = async (id: string, productData: FormData | any) => {
  // For FormData, we shouldn't set the Content-Type header as the browser will set it correctly with the boundary
  const config = productData instanceof FormData 
    ? { headers: {} } 
    : { headers: { 'Content-Type': 'application/json' } };
  
  const response = await api.patch<ProductResponse>(`/products/${id}`, productData, config);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete<{success: boolean}>(`/products/${id}`);
  return response.data;
};
