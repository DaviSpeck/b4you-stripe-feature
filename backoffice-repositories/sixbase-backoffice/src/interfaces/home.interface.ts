export interface ProductRecord {
  product: {
    cover?: string;
    producer?: {
      uuid: string;
    };
    uuid: string;
    name: string;
  };
  total: number;
}

export interface ProducerRecord {
  profile_picture?: string;
  uuid: string;
  full_name: string;
  total: number;
}

export interface RewardRecord {
  user: {
    profile_picture?: string;
    uuid: string;
    full_name: string;
  };
  total: number;
}

export interface FeesData {
  variable: number;
  fixed: number;
}

export interface FilterState {
  calendar: Date[];
}

export interface ApiResponse<T> {
  rows: T[];
  count: number;
}

export interface Column {
  name: string;
  cell: (row: any) => React.ReactNode;
  width?: string;
  minWidth?: string;
  center?: boolean;
  right?: boolean;
}