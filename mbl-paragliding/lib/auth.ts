// lib/auth.ts
export const TOKEN_KEY = "mbl_token";

export const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

export const setToken = (t: string) => {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t);
};

export const clearToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
};

// ✅ Trả về kiểu Record<string, string> để hợp lệ với HeadersInit
export const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
