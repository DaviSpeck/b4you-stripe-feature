export interface Producer {
  uuid: string;
}

export interface Product {
  uuid: string;
  name: string;
  producer: Producer;
}

export interface Student {
  uuid: string;
  full_name: string;
}

export interface Affiliate {
  uuid: string;
  full_name: string;
}

export interface PaymentMethod {
  label: string;
}

export interface Status {
  id: number;
  name: string;
  color: string;
}

export interface SalesRecord {
  uuid: string;
  created_at: string;
  product: Product;
  student: Student;
  affiliate?: Affiliate;
  price: number;
  payment_method: PaymentMethod;
  status: Status;
  paid_at?: string;
}

export interface FilterState {
  calendar: Date[];
}

export interface ApiResponse {
  rows: SalesRecord[];
  total: number;
  count: number;
}

export interface CardApprovalResponse {
  card_approval: number;
}

export interface Column {
  name: string;
  cell: (row: SalesRecord) => React.ReactNode;
  width?: string;
  minWidth?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  gross_amount: number;
  net_amount_student: number;
  fee_total_amount_service: number;
  fee_total_amount_over_psp: number;
  fee_total_amount_psp: number;
  tax_variable_amount: number;
  net_profit: number;
}

export interface SalesRecord {
  created_at: string;
  products: Product[];
}

export interface CreditCard {
  brand: string;
  last_four: string;
}

export interface ProductData {
  id: number;
  product: Product;
  price: number;
  gross_amount: number;
  net_amount_student: number;
  fee_total_amount_service: number;
  fee_total_amount_over_psp: number;
  fee_total_amount_psp: number;
  fee_variable_percentage_service: number;
  fee_fixed_amount_service: number;
  fee_variable_percentage_over_psp: number;
  fee_fixed_amount_over_psp: number;
  fee_variable_percentage_psp: number;
  fee_fixed_amount_psp: number;
  tax_variable_percentage: number;
  tax_variable_amount: number;
  net_profit: number;
  payment_method: string;
  credit_card?: CreditCard;
}

export interface SalesData {
  products: ProductData[];
}

export interface TransactionItem {
  title: string;
  color: string;
  subtitle: string;
  amount: string;
  Icon: React.ComponentType<{ size?: number | string }>;
  neutral?: boolean;
  down?: boolean;
}

export interface Transaction {
  id: number;
  items: TransactionItem[];
}

export interface ExpandedComponentProps {
  data: SalesRecord;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  gross_amount: number;
  net_amount_student: number;
  fee_total_amount_service: number;
  fee_total_amount_over_psp: number;
  fee_total_amount_psp: number;
  tax_variable_amount: number;
  net_profit: number;
}

export interface SalesRecord {
  created_at: string;
  products: Product[];
}

export interface Metrics {
  sales_count: number;
  students_count: number;
  products_count: number;
  gross_amount: number;
}

export interface FilterState {
  page: number;
  size: number;
  totalRows: number;
  calendar: Date[];
}

export interface ApiResponse {
  count: number;
  rows: SalesRecord[];
}

export interface Column {
  name: string;
  cell: (row: SalesRecord) => React.ReactNode;
  center?: boolean;
}

export interface Metrics {
  sales_count: number;
  students_count: number;
  products_count: number;
  gross_amount: number;
}

export interface Cols {
  md: string;
  sm: string;
  xs: string;
}

export interface StatsCardProps {
  cols: Cols;
  metrics: Metrics | null;
}

export interface StatData {
  title: number | string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}