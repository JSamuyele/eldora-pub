import { useQuery } from "@tanstack/react-query";
import api from "../services/api"; // ✅ uses secure Axios instance

const fetchInventory = async () => {
  const { data } = await api.get("/inventory"); // ✅ HTTPS via shared baseURL
  return data; // expect an array of items
};

export default function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
    staleTime: 30000,
  });
}
