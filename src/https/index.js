// src/https/index.js
import axios from "axios";

// ✅ Axios instance with dynamic backend URL from environment
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Uses Vercel env variable
  withCredentials: true,                     // Ensures cookies/session are sent
});

// =====================
// ✅ Auth Endpoints
// =====================
export const login = (data) => api.post("/user/login", data);
export const register = (data) => api.post("/user/register", data);
export const getUserData = () => api.get("/user");
export const logout = () => api.post("/user/logout");

// =====================
// ✅ Inventory Endpoints
// =====================
export const getInventory = () => api.get("/inventory");
export const createInventoryItem = (data) => api.post("/inventory", data);
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`);

// =====================
// ✅ Sales / Transaction Endpoints
// =====================
export const getSales = () => api.get("/sales");
export const createSale = (data) => api.post("/sales", data);

// =====================
// ✅ Table / Order Endpoints
// =====================
export const getTables = () => api.get("/tables");
export const updateTable = (id, data) => api.put(`/tables/${id}`, data);
export const createOrder = (data) => api.post("/orders", data);
export const getOrders = () => api.get("/orders");

// =====================
// ✅ Payment Endpoints
// =====================
export const processPayment = (data) => api.post("/payments", data);

// ✅ Default export for direct axios usage if needed
export default api;
