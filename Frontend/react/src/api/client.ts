// AxiosHeaders → class to manipulate headers in a type-safe way.
// InternalAxiosRequestConfig → TypeScript type for Axios request configuration.
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token if present (typed)
// interceptor that runs before every request.
client.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (!token) return cfg;

  // Ensure headers is an AxiosHeaders instance (InternalAxiosRequestConfig expects a concrete headers type)
  cfg.headers = new AxiosHeaders(cfg.headers);

  // Use AxiosHeaders API to set Authorization (keeps types correct)
  cfg.headers.set("Authorization", `Bearer ${token}`);

  return cfg;
});

// Optional: handle 401 globally (auto-logout / redirect to login)
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // clear local auth and force login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // optional: navigate to login, e.g. window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
