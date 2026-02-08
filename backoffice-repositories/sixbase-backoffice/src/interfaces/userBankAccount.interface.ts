export interface UserBankAccount {
  id: number;
  id_user: number;
  first_name: string;
  last_name: string;
  email?: string | null; 
  document_number: string | null;
  cnpj: string | null;
  is_company: 0 | 1;
  pending_approval: number;
  approved : number;
  rejected: number;

  bank_code: string | null;
  agency: string | null;
  account_number: string | null;
  account_type: string | null;

  bank_code_old: string | null;
  agency_old: string | null;
  account_number_old: string | null;
  account_type_old: string | null;

  company_bank_code?: string | null;
  company_agency?: string | null;
  company_account_number?: string | null;
  company_account_type?: string | null;

  company_bank_code_old?: string | null;
  company_agency_old?: string | null;
  company_account_number_old?: string | null;
  company_account_type_old?: string | null;

  created_at: string;
}

export interface UserBankAccountResponse {
  success: boolean;
  message: string;
  status: number;
  info: {
    count: number;
    rows: UserBankAccount[];
  };
}
