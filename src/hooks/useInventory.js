// src/hooks/useInventory.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "http://desklearn.com/api/inventory"; // 👈 adjust to match your backend route

const fetchInventory = async () => {
  const { data } = await axios.get(API_URL);
  return data; // expect an array of items
};

export default function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
    staleTime: 30000,
  });
}
