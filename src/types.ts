
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  WAITRESS = 'waitress',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  token: string;
  tenantId?: string;
  businessId?: string;
}

export interface UserState extends User {
  isAuthenticated: boolean;
}
