export interface Producer {
  uuid: string;
  full_name: string;
}

export interface Product {
  uuid: string;
  name: string;
  producer: Producer;
  payment_type: string;
  type: string;
  support_email?: string;
  support_whatsapp?: string;
  warranty: string;
}

export interface ProductsMetrics {
  totalProductsAll: number;
  productsCreatedInPeriod: number;
  productsWithSalesLast30Days: number;
}

export interface PaginationInfo {
  page: number;
  size: number;
  total: number;
}

export interface ProductsInfo {
  rows: Product[];
  metrics: ProductsMetrics;
  pagination: PaginationInfo;
}

export interface ApiResponse {
  info: ProductsInfo;
}

export interface Column {
  name: string;
  cell: (row: Product) => React.ReactNode;
  center?: boolean;
  width?: string;
}