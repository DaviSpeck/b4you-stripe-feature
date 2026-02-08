// Tipos globais para o projeto da API

// Extensões do Express
declare namespace Express {
  interface Request {
    user?: any;
    userId?: string | number;
    userRole?: string;
    ip?: string;
    userAgent?: string;
  }

  interface Response {
    // Adicione propriedades customizadas se necessário
  }
}

// Tipos para JWT
declare module 'jsonwebtoken' {
  interface JwtPayload {
    userId?: string | number;
    email?: string;
    role?: string;
    [key: string]: any;
  }
}

// Tipos para Sequelize
declare module 'sequelize' {
  interface ModelAttributes {
    [key: string]: any;
  }
}

// Tipos para Redis
declare module 'redis' {
  interface RedisClientType {
    // Adicione tipos específicos se necessário
  }
}

// Tipos para AWS SDK
declare module '@aws-sdk/client-s3' {
  interface S3ClientConfig {
    // Configurações específicas do S3
  }
}

// Tipos para Multer
declare module 'multer' {
  interface Multer {
    // Tipos específicos do Multer
  }
}

// Tipos para Winston
declare module 'winston' {
  interface Logger {
    // Tipos específicos do Winston
  }
}

// Tipos para Node-Cron
declare module 'node-cron' {
  interface CronJob {
    // Tipos específicos do CronJob
  }
}

// Tipos para Nodemailer
declare module 'nodemailer' {
  interface Transporter {
    // Tipos específicos do Transporter
  }
}

// Tipos para Yup
declare module 'yup' {
  interface Schema {
    // Tipos específicos do Yup
  }
}

// Tipos utilitários para o projeto
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret?: string;
  refreshExpiresIn?: string;
}

export interface CorsConfig {
  origin: string | string[] | boolean;
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
}

export interface LogConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  filename?: string;
  maxSize?: string;
  maxFiles?: string;
}

// Tipos para middleware
export interface AuthMiddleware {
  verifyToken: (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction,
  ) => void;
  verifyRole: (
    roles: string[],
  ) => (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction,
  ) => void;
}

// Tipos para controllers
export interface BaseController {
  index?: (req: Express.Request, res: Express.Response) => Promise<void>;
  show?: (req: Express.Request, res: Express.Response) => Promise<void>;
  store?: (req: Express.Request, res: Express.Response) => Promise<void>;
  update?: (req: Express.Request, res: Express.Response) => Promise<void>;
  destroy?: (req: Express.Request, res: Express.Response) => Promise<void>;
}

// Tipos para services
export interface BaseService<T = any> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string | number): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  update(id: string | number, data: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}

// Tipos para repositories
export interface BaseRepository<T = any> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string | number): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  update(id: string | number, data: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}

// Tipos para use cases
export interface BaseUseCase<TInput = any, TOutput = any> {
  execute(input: TInput): Promise<TOutput>;
}

// Tipos para DTOs
export interface BaseDTO {
  validate(data: any): Promise<boolean>;
  sanitize(data: any): any;
}

// Tipos para validação
export interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Tipos para logs
export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  metadata?: any;
}

// Tipos para cache
export interface CacheConfig {
  ttl: number;
  prefix?: string;
}

export interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Tipos para filas
export interface QueueConfig {
  name: string;
  concurrency?: number;
  retries?: number;
  backoff?: number;
}

export interface QueueJob {
  id: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  delay?: number;
}

// Tipos para eventos
export interface EventEmitter {
  emit(event: string, data: any): void;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
}

// Tipos para métricas
export interface MetricConfig {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help?: string;
  labelNames?: string[];
}

export interface MetricService {
  increment(name: string, labels?: Record<string, string>): void;
  gauge(name: string, value: number, labels?: Record<string, string>): void;
  histogram(name: string, value: number, labels?: Record<string, string>): void;
  summary(name: string, value: number, labels?: Record<string, string>): void;
}

export {};
