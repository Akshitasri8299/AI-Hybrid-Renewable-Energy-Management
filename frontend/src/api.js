const API_BASE = "http://127.0.0.1:8000/api";

export const TOKEN_KEY = "hem_auth_token";
export const USER_KEY = "hem_auth_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuth();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}

export async function apiGet(endpoint) {
  const response = await apiRequest(endpoint, { method: "GET" });
  return response;
}

export async function apiPost(endpoint, body) {
  const response = await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response;
}

export async function login(username, password) {
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.status === 401) {
    throw new Error("Invalid credentials. Please check your email and password.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Login failed. Please try again.");
  }

  const data = await response.json();
  setAuth(data.token, data.user);
  return data;
}

export async function logout() {
  try {
    await apiPost("/auth/logout/", {});
  } catch {
    // ignore network errors on logout
  }
  clearAuth();
}

export { API_BASE };
