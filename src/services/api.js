import axios from "axios";

const api = axios.create({
  baseURL: "https://www.desklearn.com/api", // production backend
  withCredentials: true,
});

export default api;
