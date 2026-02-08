import { FC } from 'react';

export interface OnboardingRecord {
  uuid: string;
  email: string;
  full_name: string;
  instagram?: string;
  tiktok?: string;
  document_number: string;
  onboarding: {
    created_at: string;
    user_type: string;
    signup_reason?: string;
    has_sold?: string;
    revenue?: string;
    [key: string]: any;
  };
  form?: {
    id: number;
    title: string;
    version: number;
    form_type: number;
  } | null;
}

export interface FilterState {
  calendar: Date[];
}

export interface FieldsState {
  signup_reason: string;
  has_sold: string;
  revenue: string;
  user_type: string;
  [key: string]: string;
}

export interface ApiResponse {
  rows: OnboardingRecord[];
  count: number;
}

export interface Column {
  name: string;
  cell: (row: OnboardingRecord) => React.ReactNode;
  center?: boolean;
}

export interface ModalDetailsState {
  showModalDetails: boolean;
  row: OnboardingRecord;
}

export interface OnboardingData {
  user_type: string;
  signup_reason?: string;
  has_sold?: string;
  revenue?: string;
  has_experience_as_creator_or_affiliate?: string;
  nicho?: string;
  nicho_other?: string;
  audience_size?: string;
  origem?: string;
  business_model?: string;
  business_model_other?: string;
  company_size?: string;
  worked_with_affiliates?: string;
  invested_in_affiliates?: string;
  platform?: string;
  [key: string]: string | undefined;
}

export interface UserRecord {
  onboarding: OnboardingData;
  [key: string]: any;
}

export interface ModalDetailsWrapperProps {
  row: OnboardingRecord;
  showModalDetails: boolean;
  setShowModalDetails: (show: boolean) => void;
}

export interface ModalDetailsState {
  showModalDetails: boolean;
  row: OnboardingRecord;
}

export interface UseModalDetailsReturn {
  ModalDetails: FC;
  setModalDetails: (details: ModalDetailsState) => void;
}
