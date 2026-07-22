const API_BASE = "/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data as T;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (name: string, email: string, phone: string, password: string) =>
    apiRequest<{ message: string; token: string; user: User }>("/auth/register", {
      method: "POST",
      body: { name, email, phone, password },
    }),

  verifyOtp: (userId: number, otp: string) =>
    apiRequest<{ token: string; user: User }>("/auth/verify-otp", {
      method: "POST",
      body: { userId, otp },
    }),
  resetPassword: (email: string, newPassword: string) =>
    apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { email, newPassword },
    }),
};


// Users API
export const usersApi = {
  getProfile: () =>
    apiRequest<{ user: User }>("/users/profile"),

  updateProfile: (data: { name?: string; phone?: string; avatar?: string | null }) =>
    apiRequest<{ user: User }>("/users/profile", {
      method: "PUT",
      body: data,
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>("/users/change-password", {
      method: "PUT",
      body: { currentPassword, newPassword },
    }),
};

// Wallets API
export const walletsApi = {
  getAll: () =>
    apiRequest<{ wallets: Wallet[] }>("/wallets"),

  create: (data: { name: string; type?: string; icon?: string; color?: string; balance?: number }) =>
    apiRequest<{ wallet: Wallet }>("/wallets", {
      method: "POST",
      body: data,
    }),

  update: (id: number, data: Partial<Wallet>) =>
    apiRequest<{ wallet: Wallet }>(`/wallets/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/wallets/${id}`, {
      method: "DELETE",
    }),
};

// Transactions API
export const transactionsApi = {
  getAll: (params?: { limit?: number; offset?: number; type?: string; category?: string; wallet_id?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.offset) queryParams.set("offset", String(params.offset));
    if (params?.type) queryParams.set("type", params.type);
    if (params?.category) queryParams.set("category", params.category);
    if (params?.wallet_id) queryParams.set("wallet_id", String(params.wallet_id));
    const qs = queryParams.toString();
    return apiRequest<{ transactions: Transaction[]; summary: { totalIncome: number; totalExpense: number } }>(
      `/transactions${qs ? `?${qs}` : ""}`
    );
  },

  create: (data: { wallet_id: number; type: string; category: string; amount: number; note?: string; date: string }) =>
    apiRequest<{ transaction: Transaction }>("/transactions", {
      method: "POST",
      body: data,
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/transactions/${id}`, {
      method: "DELETE",
    }),
};

// Budgets API
export const budgetsApi = {
  getAll: (period?: string) => {
    const qs = period ? `?period=${period}` : "";
    return apiRequest<{ budgets: Budget[] }>(`/budgets${qs}`);
  },

  create: (data: { category: string; limit_amount: number; period: string; icon?: string; color?: string }) =>
    apiRequest<{ budget: Budget }>("/budgets", {
      method: "POST",
      body: data,
    }),

  update: (id: number, data: Partial<Budget>) =>
    apiRequest<{ budget: Budget }>(`/budgets/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/budgets/${id}`, {
      method: "DELETE",
    }),
};

// Categories API
export const categoriesApi = {
  getAll: (type?: string) => {
    const qs = type ? `?type=${type}` : "";
    return apiRequest<{ categories: Category[] }>(`/categories${qs}`);
  },

  create: (data: { name: string; type: string; icon: string; color: string }) =>
    apiRequest<{ category: Category }>("/categories", {
      method: "POST",
      body: data,
    }),

  update: (id: number, data: Partial<Category>) =>
    apiRequest<{ category: Category }>(`/categories/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/categories/${id}`, {
      method: "DELETE",
    }),
};

// AI API
export const aiApi = {
  chat: (message: string) =>
    apiRequest<{ reply: string }>("/ai/chat", {
      method: "POST",
      body: { message },
    }),

  scanReceipt: (imageBase64: string) =>
    apiRequest<{ data: { merchant: string; amount: number; category: string; date: string; note: string } }>("/ai/scan-receipt", {
      method: "POST",
      body: { imageBase64 },
    }),

  getForecast: () =>
    apiRequest<{ forecast: any }>("/ai/forecast", {
      method: "POST",
    }),
};

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar?: string | null;
  created_at?: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  name: string;
  type: string;
  icon: string;
  color: string;
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  wallet_id: number;
  wallet_name?: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string | null;
  date: string;
  created_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category: string;
  limit_amount: number;
  spent: number;
  period: "daily" | "weekly" | "monthly";
  icon: string;
  color: string;
  created_at: string;
}
