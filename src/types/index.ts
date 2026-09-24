export interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl: string;
  category: string;
  unit?: string;
  inStock?: boolean;
  createdAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse {
  success: boolean;
  products: Product[];
  pagination: PaginationMeta;
}

export type Category =
  | 'Frutos secos'
  | 'Semillas y Cereales'
  | 'Harinas y Legumbres'
  | 'Suplementos y Té'
  | 'Orgánicos';

export const CATEGORIES: Category[] = [
  'Frutos secos',
  'Semillas y Cereales',
  'Harinas y Legumbres',
  'Suplementos y Té',
  'Orgánicos',
];