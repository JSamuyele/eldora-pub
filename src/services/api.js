// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://www.desklearn.com/api/user/login", // your backend URL
  withCredentials: true, // include cookies if needed for auth
});

export default api;
