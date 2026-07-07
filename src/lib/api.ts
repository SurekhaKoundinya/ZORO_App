/**
 * ZORO Admin — API Client
 * Base URL: https://calculate-gurgling-passport.ngrok-free.dev
 * All requests after login send: Authorization: Bearer <token>
 */

// ponytail: ngrok free-tier URLs rotate — override via NEXT_PUBLIC_API_BASE_URL
// (e.g. in .env.local) instead of editing this file when the backend team shares a new one.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://calculate-gurgling-passport.ngrok-free.dev";

const TOKEN_KEY = "zoro_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    // Required for ngrok free tier — without this ngrok returns an HTML
    // warning page instead of JSON, silently breaking every API call.
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  _retry = true,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers ?? {}),
    },
  });

  // Auto-refresh on 401 — simplejwt access tokens expire after 15 min
  if (res.status === 401 && _retry && typeof window !== "undefined") {
    const refresh = localStorage.getItem("zoro_refresh_token");
    if (refresh) {
      try {
        const refreshRes = await fetch(`${API_BASE}/api/v1/auth/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ refresh }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setToken(data.access);
          // Retry original request once with new token
          return request<T>(path, options, false);
        }
      } catch { /* refresh failed — fall through to throw */ }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg = err?.message ?? err?.detail ?? `API error ${res.status}`;
    // Always log API errors to browser console so they're never invisible
    console.error(`[ZORO API] ${options.method ?? "GET"} ${path} → ${res.status}:`, msg);

    // Reaching here on a 401 means refresh already failed above (or there was
    // no refresh token to try) — the session is dead. Doc's own contract:
    // "force logout if refresh also fails." Clear everything and bounce to
    // /login so the app doesn't sit there silently re-401'ing forever.
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("zoro_refresh_token");
      localStorage.removeItem("zoro_auth_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error(msg);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string;
    kyc_level: number;
  };
}

export const authApi = {
  // Docs say every response is enveloped as { success, data, message }, but
  // this endpoint has been observed returning the tokens flat instead
  // ({ access, refresh, user } with no envelope). Handle both so a backend
  // fix (or lack thereof) either way doesn't silently break login again.
  login: (email: string, password: string) =>
    request<any>("/api/v1/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((r) => (r?.data?.access ? r.data : r) as LoginResponse),

  logout: (refresh: string) =>
    request("/api/v1/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    }),

  me: () => request<{ data: any }>("/api/v1/auth/me/"),

  apiKeys: {
    list: () => request<{ data: any[] }>("/api/v1/auth/api-keys/"),
    create: (name: string, permissions = "read") =>
      request<{ data: any }>("/api/v1/auth/api-keys/", {
        method: "POST",
        body: JSON.stringify({ name, permissions }),
      }),
    delete: (id: string) =>
      request(`/api/v1/auth/api-keys/${id}/`, { method: "DELETE" }),
  },

  changePassword: (current_password: string, new_password: string, confirm_password: string) =>
    request("/api/v1/auth/change-password/", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    }),
};

// ─── Dashboard ─────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () => request<{ data: any }>("/api/v1/dashboard/stats/"),
  charts: () => request<{ data: any }>("/api/v1/dashboard/charts/"),
};

// ─── Users ─────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ data: any[]; meta?: any }>(`/api/v1/users/${qs}`);
  },
  get: (id: string) => request<{ data: any }>(`/api/v1/users/${id}/`),
  stats: () => request<{ data: any }>("/api/v1/users/stats/"),
  suspend: (id: string) =>
    request(`/api/v1/users/${id}/suspend/`, { method: "PATCH" }),
  reactivate: (id: string) =>
    request(`/api/v1/users/${id}/reactivate/`, { method: "PATCH" }),
  approveKyc: (id: string, level?: number) =>
    request(`/api/v1/users/${id}/approve_kyc/`, {
      method: "PATCH",
      body: JSON.stringify(level !== undefined ? { level } : {}),
    }),
  freezeWallet: (id: string) =>
    request(`/api/v1/users/${id}/freeze_wallet/`, { method: "PATCH" }),
};

// ─── KYC ───────────────────────────────────────────────────────────

export const kycApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ data: any[]; meta?: any }>(`/api/v1/kyc/${qs}`);
  },
  get: (id: string) => request<{ data: any }>(`/api/v1/kyc/${id}/`),
  stats: () => request<{ data: any }>("/api/v1/kyc/stats/"),
  approve: (id: string) =>
    request(`/api/v1/kyc/${id}/approve/`, { method: "PATCH" }),
  reject: (id: string, reason: string) =>
    request(`/api/v1/kyc/${id}/reject/`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
  resubmit: (id: string, notes: string) =>
    request(`/api/v1/kyc/${id}/resubmit/`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }),
};

// ─── Wallets ───────────────────────────────────────────────────────

export const walletsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ data: any[]; meta?: any }>(`/api/v1/wallets/${qs}`);
  },
  get: (id: string) => request<{ data: any }>(`/api/v1/wallets/${id}/`),
  stats: () => request<{ data: any }>("/api/v1/wallets/stats/"),
  freeze: (id: string, reason?: string) =>
    request(`/api/v1/wallets/${id}/freeze/`, {
      method: "PATCH",
      body: JSON.stringify({ reason: reason ?? "Admin action" }),
    }),
  unfreeze: (id: string) =>
    request(`/api/v1/wallets/${id}/unfreeze/`, { method: "PATCH" }),
  riskReview: (id: string, risk_level: string, risk_score: number) =>
    request(`/api/v1/wallets/${id}/risk_review/`, {
      method: "PATCH",
      body: JSON.stringify({ risk_level, risk_score }),
    }),
};

// ─── Transactions ──────────────────────────────────────────────────

export const transactionsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ data: any[]; meta?: any }>(`/api/v1/transactions/${qs}`);
  },
  stats: () => request<{ data: any }>("/api/v1/transactions/stats/"),
  flag: (id: string, reason: string) =>
    request(`/api/v1/transactions/${id}/flag/`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
  unflag: (id: string) =>
    request(`/api/v1/transactions/${id}/unflag/`, { method: "PATCH" }),
};

// ─── Rewards ───────────────────────────────────────────────────────

export const rewardsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ data: any[]; meta?: any }>(`/api/v1/rewards/${qs}`);
  },
  approve: (id: string) =>
    request(`/api/v1/rewards/${id}/approve/`, { method: "PATCH" }),
  reject: (id: string) =>
    request(`/api/v1/rewards/${id}/reject/`, { method: "PATCH" }),
  pay: (id: string) =>
    request(`/api/v1/rewards/${id}/pay/`, { method: "PATCH" }),
  approveAll: () =>
    request("/api/v1/rewards/approve_all/", { method: "PATCH" }),
};

// ─── Referrals ─────────────────────────────────────────────────────

export const referralsApi = {
  list: () => request<{ data: any[]; meta?: any }>("/api/v1/referrals/"),
  leaderboard: () => request<{ data: any[] }>("/api/v1/referrals/leaderboard/"),
};

// ─── Reports ───────────────────────────────────────────────────────

export const reportsApi = {
  list: () => request<{ data: any[] }>("/api/v1/reports/"),
  generate: (report_type: string, format = "csv", period = "") =>
    request<{ data: any }>("/api/v1/reports/generate/", {
      method: "POST",
      body: JSON.stringify({ report_type, format, period }),
    }),
  downloadUrl: (id: string) =>
    `${API_BASE}/api/v1/reports/${id}/download/`,
};

// ─── System Logs ───────────────────────────────────────────────────

export const systemLogsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ data: any[]; meta?: any }>(`/api/v1/system-logs/${qs}`);
  },
};

// ─── Notifications ─────────────────────────────────────────────────

export const notificationsApi = {
  list: () => request<{ data: any[] }>("/api/v1/notifications/"),
  markRead: (id: string) =>
    request(`/api/v1/notifications/${id}/mark_read/`, { method: "PATCH" }),
  markAllRead: () =>
    request("/api/v1/notifications/mark_all_read/", { method: "PATCH" }),
};

// ─── Settings ──────────────────────────────────────────────────────

export const settingsApi = {
  profile: () => request<{ data: any }>("/api/v1/settings/profile/"),
  updateProfile: (data: Record<string, string>) =>
    request("/api/v1/settings/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  roles: () => request<{ data: any[] }>("/api/v1/settings/roles/"),
  addRole: (email: string, role: string, name: string) =>
    request("/api/v1/settings/roles/", {
      method: "POST",
      body: JSON.stringify({ email, role, name }),
    }),
  updateRole: (id: string, role: string) =>
    request(`/api/v1/settings/roles/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeRole: (id: string) =>
    request(`/api/v1/settings/roles/${id}/`, { method: "DELETE" }),
};
