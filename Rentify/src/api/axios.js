import axios from "axios";

// Fired when the backend rejects our token (401); AuthContext listens and logs out.
export const AUTH_LOGOUT_EVENT = "auth:logout";

const api = axios.create({
  baseURL: "http://localhost:2005/api", // Make sure this matches your backend server.port
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.startsWith("/v1/auth/");
    if (error.response?.status === 401 && !isAuthCall && localStorage.getItem("token")) {
      // Token expired or invalid: clear the session and send the user to log in again.
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
