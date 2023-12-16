import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'http://localhost:9000',
  // baseURL: 'https://ecommerce-admin-be.onrender.com',
  headers: { "Content-Type": "application/json" },
});

export default axiosClient;
