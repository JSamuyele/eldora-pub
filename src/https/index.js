// src/https/index.js
import axios from "axios";

// ✅ Axios instance with correct baseURL and credentials
export const axiosWrapper = axios.create({
  baseURL: "https://www.desklearn.com/api", // Production backend domain
  withCredentials: true,                     // Ensures cookies/session are sent
});

// ✅ Auth Endpoints
export const login = (data) => axiosWrapper.post("/user/login", data);
export const register = (data) => axiosWrapper.post("/user/register", data);
export const getUserData = () => axiosWrapper.get("/user");
export const logout = () => axiosWrapper.post("/user/logout");

// ✅ Inventory Endpoints
export const getInventory = () => axiosWrapper.get("/inventory");
export const createInventoryItem = (data) => axiosWrapper.post("/inventory", data);
export const updateInventoryItem = (id, data) => axiosWrapper.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => axiosWrapper.delete(`/inventory/${id}`);

// ✅ Sales / Transaction Endpoints
export const getSales = () => axiosWrapper.get("/sales");
export const createSale = (data) => axiosWrapper.post("/sales", data);

// ✅ Table / Order Endpoints (if you use them)
export const getTables = () => axiosWrapper.get("/tables");
export const updateTable = (id, data) => axiosWrapper.put(`/tables/${id}`, data);

export const createOrder = (data) => axiosWrapper.post("/orders", data);
export const getOrders = () => axiosWrapper.get("/orders");

// ✅ Payment Endpoints
export const processPayment = (data) => axiosWrapper.post("/payments", data);
