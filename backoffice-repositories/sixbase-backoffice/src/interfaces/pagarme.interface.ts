export interface StatusInfo {
  id: number;
  label: string;
  color: string;
}

export interface PagarmeRecord {
  uuid: string;
  email: string;
  full_name: string;
  document: string;
  is_company: boolean;
  pagarme_id: string;
  status: StatusInfo;
}

export interface PagarmeCountItem {
  status: StatusInfo;
  count: number;
}

export interface PagarmeData {
  filteredCompany: PagarmeCountItem[];
  filteredIndividual: PagarmeCountItem[];
}

export interface ApiResponse {
  rows: PagarmeRecord[];
  count: number;
}

export interface Column {
  name: string;
  cell: (row: PagarmeRecord) => React.ReactNode;
  center?: boolean;
}