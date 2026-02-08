export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  active: boolean;
  created_at: string;
  id_role: number;
  role?: {
    id: number;
    name: string;
    description: string;
  };
}

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: number;
  key: string;
  route: string;
}

export interface Menu {
  id: number;
  name: string;
  key: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Log {
  id: number;
  id_user_backoffice: number;
  id_user?: number | null;
  id_event: number;
  params: Record<string, any>;
  ip_address: string;
  created_at: string;
  event_key?: string;
  event_label?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  event?: {
    id: number;
    name: string;
    description: string;
  };
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  id_role: number;
  is_admin?: boolean;
}

export interface UpdateUserRoleRequest {
  role_id: number;
}

export interface UpdateUserStatusRequest {
  active: boolean;
}

export interface UserFilters {
  search?: string;
  role_id?: number;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface DefaultPasswordResponse {
  default_password: string;
  year: number;
}
