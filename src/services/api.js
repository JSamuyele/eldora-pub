import axios from "axios";

// Use only the environment variable, no localhost fallback
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // should be https://www.desklearn.com/api in production
  withCredentials: true, // include cookies if your backend uses cookies for auth
});

export default api;
