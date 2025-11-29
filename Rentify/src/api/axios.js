import axios from "axios";

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

export default api;