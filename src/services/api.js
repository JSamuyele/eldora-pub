// src/services/api.js
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  withCredentials: true, // include cookies if needed for auth
});

export default api;
