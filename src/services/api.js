// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // your backend URL
  withCredentials: true, // include cookies if needed for auth
});

export default api;
