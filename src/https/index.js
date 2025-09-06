import axios from "axios";

// ✅ Axios instance with correct baseURL and credentials
export const axiosWrapper = axios.create({
  baseURL: "http://localhost:8000/api", // Matches backend port and route prefix
  withCredentials: true,                // Ensures cookies/session are sent
});

// ✅ Auth Endpoints
export const login = (data) => axiosWrapper.post("/user/login", data);
export const register = (data) => axiosWrapper.post("/user/register", data);
export const getUserData = () => axiosWrapper.get("/user");
export const logout = () => axiosWrapper.post("/user/logout");

// Table Endpoints
// export const getTables = () => axiosWrapper.get("/tables");
// export const updateTable = (id, data) => axiosWrapper.put(`/tables/${id}`, data);

// Payment Endpoints
// export const processPayment = (data) => axiosWrapper.post("/payments", data);

// Order Endpoints
// export const createOrder = (data) => axiosWrapper.post("/orders", data);
// export const getOrders = () => axiosWrapper.get("/orders");
