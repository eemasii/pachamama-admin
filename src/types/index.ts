export interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl: string;
  category: string;
  unit?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}