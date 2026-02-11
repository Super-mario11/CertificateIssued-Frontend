import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    const url = String(error?.config?.url || "");
    const isLoginRequest = url.includes("/api/auth/login");
    const isTokenError =
      status === 401 &&
      (message === "Invalid token" || message === "Missing auth token");

    if (isTokenError && !isLoginRequest) {
      localStorage.removeItem("token");
      const from = `${window.location.pathname}${window.location.search}`;
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?reason=session-expired&from=${encodeURIComponent(from)}`;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
