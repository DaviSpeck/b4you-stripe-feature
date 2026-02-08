import { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';

export interface OnboardingQueryParams {
  input?: string;
  has_sold?: string;
  revenue?: string;
  signup_reason?: string;
  user_type?: string;
  page?: number;
  size?: number;
  start_date?: string;
  end_date?: string;
  creator_version?: number;
  marca_version?: number;
  [key: string]: any;
}

export interface OnboardingDailyCountsQueryParams {
  start_date?: string;
  end_date?: string;
  user_type?: string;
  creator_version?: number;
  marca_version?: number;
  [key: string]: any;
}

export interface OnboardingRequest extends Request {
  query: OnboardingQueryParams;
}

export interface OnboardingDailyCountsRequest extends Request {
  query: OnboardingDailyCountsQueryParams;
}

export interface OnboardingUserData {
  uuid: string;
  full_name: string;
  email: string;
  instagram?: string;
  tiktok?: string;
  document_number: string;
}

export interface OnboardingFormData {
  id: number;
  title: string;
  version: number;
  form_type: number;
}

export interface OnboardingFormAnswers {
  [key: string]: any;
}

export interface OnboardingData {
  created_at: string;
  user_type: string;
  form_answers?: OnboardingFormAnswers;
  form?: OnboardingFormData;
  user?: OnboardingUserData;
  [key: string]: any;
}

export interface OnboardingRecord {
  uuid: string;
  full_name: string;
  email: string;
  instagram?: string;
  tiktok?: string;
  document_number: string;
  onboarding: {
    created_at: string;
    user_type: string;
    date?: string;
    time?: string;
    [key: string]: any;
  };
  form?: OnboardingFormData | null;
  marca?: any;
}

export interface OnboardingDailyCount {
  date: string;
  count?: number;
  creator?: number;
  marca?: number;
  total?: number;
  user_type?: string;
}

export interface FindOnboardingPaginatedParams {
  input?: string;
  has_sold?: string;
  revenue?: string;
  signup_reason?: string;
  user_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
}

export interface FindOnboardingDailyCountsParams {
  start_date?: string;
  end_date?: string;
  user_type?: string;
  creator_version?: number;
  marca_version?: number;
}

export interface FindOnboardingPaginatedInput {
  input?: string;
  has_sold?: string;
  revenue?: string;
  signup_reason?: string;
  user_type?: string;
  start_date?: string;
  end_date?: string;
  page: number;
  size: number;
  creator_version?: number;
  marca_version?: number;
}

export interface FindOnboardingForExportInput {
  input?: string;
  has_sold?: string;
  revenue?: string;
  signup_reason?: string;
  user_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface FindOnboardingDailyCountsInput {
  start_date?: string;
  end_date?: string;
  user_type?: string;
  creator_version?: number;
  marca_version?: number;
}

export interface OnboardingPaginatedResponse {
  count: number;
  rows: OnboardingRecord[];
}

export interface OnboardingDailyCountsResponse {
  rows: OnboardingDailyCount[];
}

export interface OnboardingExportResponse {
  stream: Readable;
}

export interface FindOnboardingPaginatedResult {
  count: number;
  rows: OnboardingData[];
}

export interface FindOnboardingForExportResult {
  rows: OnboardingData[];
}

