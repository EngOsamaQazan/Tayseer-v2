const API_BASE = '/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      if (typeof window !== 'undefined') localStorage.setItem('token', token);
    } else {
      if (typeof window !== 'undefined') localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || res.statusText);
    }

    return res.json();
  }

  get<T>(path: string) {
    return this.request<T>('GET', path);
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body);
  }
  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

export const api = new ApiClient();

export interface LoginPayload {
  login: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string | null;
    lastName: string | null;
    role: string;
    avatar: string | null;
    tenantId: string;
    tenantName: string;
  };
}

export interface DashboardSummary {
  counts: { customers: number; companies: number };
  financials: {
    totalIncome: number;
    incomeCount: number;
    totalExpense: number;
    expenseCount: number;
    netBalance: number;
  };
  recentTransactions: Transaction[];
  charts: {
    monthlyIncome: { month: string; total: string; count: number }[];
    monthlyExpense: { month: string; total: string; count: number }[];
  };
}

export interface Transaction {
  id: number;
  type: string;
  status: string;
  amount: number;
  date: string;
  description: string | null;
}

export interface Customer {
  id: number;
  name: string;
  idNumber: string;
  primaryPhoneNumber: string | null;
  email: string | null;
  city: string | null;
  createdAt: string;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
