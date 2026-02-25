export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  COLLECTOR = 'collector',
  LAWYER = 'lawyer',
  ACCOUNTANT = 'accountant',
  HR = 'hr',
  INVENTORY = 'inventory',
}

export enum Permission {
  // Customers
  CUSTOMERS_VIEW = 'customers:view',
  CUSTOMERS_CREATE = 'customers:create',
  CUSTOMERS_UPDATE = 'customers:update',
  CUSTOMERS_DELETE = 'customers:delete',
  CUSTOMERS_EXPORT = 'customers:export',

  // Contracts
  CONTRACTS_VIEW = 'contracts:view',
  CONTRACTS_CREATE = 'contracts:create',
  CONTRACTS_UPDATE = 'contracts:update',
  CONTRACTS_DELETE = 'contracts:delete',

  // Financial
  INCOME_VIEW = 'income:view',
  INCOME_CREATE = 'income:create',
  INCOME_UPDATE = 'income:update',
  INCOME_DELETE = 'income:delete',
  EXPENSES_VIEW = 'expenses:view',
  EXPENSES_CREATE = 'expenses:create',
  EXPENSES_UPDATE = 'expenses:update',
  EXPENSES_DELETE = 'expenses:delete',
  FINANCIAL_VIEW = 'financial:view',
  FINANCIAL_CREATE = 'financial:create',
  FINANCIAL_IMPORT = 'financial:import',
  FINANCIAL_TRANSFER = 'financial:transfer',

  // Legal
  JUDICIARY_VIEW = 'judiciary:view',
  JUDICIARY_CREATE = 'judiciary:create',
  JUDICIARY_UPDATE = 'judiciary:update',
  JUDICIARY_DELETE = 'judiciary:delete',

  // Companies
  COMPANIES_VIEW = 'companies:view',
  COMPANIES_CREATE = 'companies:create',
  COMPANIES_UPDATE = 'companies:update',
  COMPANIES_DELETE = 'companies:delete',

  // HR
  HR_VIEW = 'hr:view',
  HR_MANAGE = 'hr:manage',

  // Reports
  REPORTS_VIEW = 'reports:view',

  // Settings
  SETTINGS_MANAGE = 'settings:manage',

  // Dashboard
  DASHBOARD_VIEW = 'dashboard:view',
}
