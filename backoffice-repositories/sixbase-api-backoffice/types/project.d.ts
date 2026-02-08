// Tipos específicos do projeto da API

// Tipos de usuário
export interface User {
  id: string | number;
  name: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  avatar?: string;
  phone?: string;
  documentNumber?: string;
  documentType?: 'cpf' | 'cnpj';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Tipos de autenticação
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  documentNumber?: string;
  documentType?: 'cpf' | 'cnpj';
}

// Tipos de produto
export interface Product {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  categoryId: string | number;
  isActive: boolean;
  isDigital: boolean;
  stock?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string | number;
  name: string;
  description?: string;
  parentId?: string | number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de venda
export interface Sale {
  id: string | number;
  userId: string | number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'processing';
  total: number;
  subtotal: number;
  tax: number;
  discount?: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: SaleItem[];
  customer: {
    name: string;
    email: string;
    documentNumber?: string;
    phone?: string;
  };
  shippingAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  cancelledAt?: Date;
}

export interface SaleItem {
  id: string | number;
  saleId: string | number;
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

// Tipos de pagamento
export interface Payment {
  id: string | number;
  saleId: string | number;
  amount: number;
  method: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  gateway: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

// Tipos de afiliado
export interface Affiliate {
  id: string | number;
  userId: string | number;
  code: string;
  commissionRate: number;
  isActive: boolean;
  totalEarnings: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateCommission {
  id: string | number;
  affiliateId: string | number;
  saleId: string | number;
  amount: number;
  rate: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de saque
export interface Withdrawal {
  id: string | number;
  userId: string | number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  method: 'pix' | 'bank_transfer' | 'paypal';
  accountInfo: {
    type: string;
    number?: string;
    agency?: string;
    bank?: string;
    pixKey?: string;
    paypalEmail?: string;
  };
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de KYC
export interface KYC {
  id: string | number;
  userId: string | number;
  status: 'pending' | 'approved' | 'rejected';
  documentType: 'cpf' | 'cnpj' | 'rg' | 'passport';
  documentNumber: string;
  documentFront?: string;
  documentBack?: string;
  selfie?: string;
  addressProof?: string;
  additionalDocuments?: string[];
  rejectionReason?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de evento
export interface Event {
  id: string | number;
  name: string;
  description?: string;
  type: 'user_action' | 'system' | 'payment' | 'security';
  userId?: string | number;
  data?: any;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

// Tipos de notificação
export interface Notification {
  id: string | number;
  userId: string | number;
  type: 'email' | 'sms' | 'push' | 'in_app';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de relatório
export interface Report {
  id: string | number;
  name: string;
  type: 'sales' | 'users' | 'products' | 'affiliates' | 'custom';
  filters: any;
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Tipos de configuração
export interface AppConfig {
  id: string | number;
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de blacklist
export interface BlacklistEntry {
  id: string | number;
  type: 'email' | 'ip' | 'document' | 'phone';
  value: string;
  reason: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de bloqueio
export interface Block {
  id: string | number;
  userId: string | number;
  type: 'account' | 'payment' | 'withdrawal' | 'login';
  reason: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de métricas
export interface Metric {
  id: string | number;
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

// Tipos de logs
export interface Log {
  id: string | number;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: string;
  userId?: string | number;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  timestamp: Date;
}

// Tipos de fila
export interface Queue {
  id: string | number;
  name: string;
  status: 'active' | 'paused' | 'stopped';
  concurrency: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueJob {
  id: string | number;
  queueId: string | number;
  name: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  delay?: number;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de email
export interface EmailTemplate {
  id: string | number;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string | number;
  templateId?: string | number;
  to: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  sentAt?: Date;
  createdAt: Date;
}

// Tipos de validação
export interface ValidationSchema {
  [field: string]: {
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => boolean;
    message?: string;
  };
}

// Tipos de cache
export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
}

// Tipos de sessão
export interface Session {
  id: string;
  userId: string | number;
  token: string;
  ip?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de permissão
export interface Permission {
  id: string | number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string | number;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
