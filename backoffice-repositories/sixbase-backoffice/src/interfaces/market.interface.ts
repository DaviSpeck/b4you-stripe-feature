export interface BannerType {
  id: number;
  name: string;
}

export interface BannerImage {
  uuid: string;
  file: string;
  type: BannerType;
  url: string;
  order: number;
  created_at: string;
}

export interface UploadData {
  url: string;
  key: string;
}

export interface CBannerProps {
  apiEndpoint?: string;
  bannerTypeOptions?: BannerType[];
}

export interface User {
  id: number;
  uuid: string;
  full_name: string;
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
}

export interface Status {
  color: string;
  label: string;
}

export interface MarketFilter {
  calendar: Date[];
  status: string;
}

export interface MarketRecord {
  id: number;
  id_product: number;
  users: User;
  products: Product;
  requested_at: string;
  accepted_at?: string;
  rejected_at?: string;
  status: Status;
}

export interface ProductHistory {
  id: number;
  status: Status;
  created_at: string;
  updated: string;
  reason?: string;
  internal_descriptions?: string;
}

export interface ProductImage {
  file: string;
}

export interface ProductDetail {
  data: ProductHistory[];
  images: ProductImage[];
  cover: ProductImage[];
}

export interface ApiResponse {
  rows: MarketRecord[];
  count: number;
}

export interface Column {
  name: string;
  cell: (row: MarketRecord) => React.ReactNode;
  center?: boolean;
  width?: string;
}

export interface RecommendedProductItem {
  accepted_at: string;
  manager_link?: string;
  position?: number;
  product: {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    cover?: { file: string }[];
    producer?: {
      uuid: string;
    };
  };
}

export interface RecommendedApiResponse {
  count: number;
  rows: RecommendedProductItem[];
  lastPage: number;
  isPrevPage: boolean;
  isNextPage: boolean;
}
