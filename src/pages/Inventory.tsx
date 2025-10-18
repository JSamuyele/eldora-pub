import React, { useEffect, useState, useMemo } from "react";
import { FaPlus, FaTrash, FaEdit, FaArrowLeft } from "react-icons/fa";
import Modal from "../components/ui/Modal";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

type InventoryItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reorderLevel: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  createdAt: string;
};

type FormInputs = Omit<InventoryItem, "_id" | "status" | "createdAt">;

const Inventory: React.FC = () => {
  const { role } = useSelector((state: RootState) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery<InventoryItem[], Error>({
    queryKey: ["inventory"],
    queryFn: getInventory,
    staleTime: 1000 * 60,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [filterCategory, setFilterCategory] = useState(() => searchParams.get("category") || "All");
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");

  const { register, handleSubmit, reset, setValue } = useForm<FormInputs>();

  useEffect(() => {
    document.title = "POS | Inventory";
  }, []);

  useEffect(() => {
    const params: { [key: string]: string } = {};
    if (filterCategory !== "All") params.category = filterCategory;
    if (searchTerm) params.search = searchTerm;
    setSearchParams(params, { replace: true });
  }, [filterCategory, searchTerm, setSearchParams]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      reset();
      setIsModalOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "An error occurred", { variant: "error" });
    },
  };

  const addMutation = useMutation({
    mutationFn: addInventoryItem,
    ...mutationOptions,
  });

  const editMutation = useMutation({
    mutationFn: (updatedItem: FormInputs) => {
      if (!selectedItem) {
        return Promise.reject(new Error("No item selected for update"));
      }
      return updateInventoryItem(selectedItem._id, updatedItem);
    },
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    ...mutationOptions,
  });

  const handleDelete = (id: string) => {
    if (role !== "admin") {
      enqueueSnackbar("You are not authorized to perform this action.", { variant: "error" });
      return;
    }
    if (window.confirm("Are you sure you want to delete this item? This action is irreversible.")) {
      deleteMutation.mutate(id);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setValue("name", item.name);
    setValue("category", item.category);
    setValue("stock", item.stock);
    setValue("price", item.price);
    setValue("reorderLevel", item.reorderLevel);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedItem(null);
    reset();
    setIsModalOpen(true);
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const payload: FormInputs = {
      name: data.name,
      category: data.category,
      price: Number(data.price),
      stock: Number(data.stock),
      reorderLevel: data.reorderLevel ?? 10,
    };

    if (selectedItem) {
      editMutation.mutate(payload);
    } else {
      addMutation.mutate(payload);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = filterCategory === "All" || item.category === filterCategory;
      const matchesSearch = searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, filterCategory, searchTerm]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
    return cats;
  }, [items]);

  const inputClass =
    "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400 border border-transparent focus:border-yellow-400";
  const buttonPrimary = "w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-3 rounded-lg transition";

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <FaArrowLeft /> Back
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Inventory Management</h1>
            <p className="text-[#ababab]">Track and manage your stock.</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2b2b2b] text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#2b2b2b] text-white border-gray-600 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button onClick={openAddModal} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition">
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-[#2b2b2b] rounded-lg shadow p-4 overflow-x-auto">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading inventory.</p>}
        {!isLoading && !isError && (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-300 border-b border-gray-700">
                <th className="p-3">Item Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price (GHS)</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date Added</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-3 text-gray-200">{item.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-600 text-white">{item.category}</span>
                  </td>
                  <td className="p-3 font-medium text-gray-200">{Number(item.price).toFixed(2)}</td>
                  <td className="p-3 font-medium text-gray-200">{item.stock}</td>
                  <td className={`p-3 font-semibold ${item.status === "In Stock" ? "text-green-400" : item.status === "Low Stock" ? "text-yellow-400" : "text-red-400"}`}>
                    {item.status}
                  </td>
                  <td className="p-3 text-gray-200">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="p-3 flex gap-4">
                    <button onClick={() => openEditModal(item)} className="text-blue-400 hover:text-blue-300">
                      <FaEdit />
                    </button>
                    {role === "admin" && (
                      <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-400">
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Item" : "Add New Item"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input {...register("name", { required: true })} placeholder="Item Name" className={inputClass} />
          <input {...register("category", { required: true })} placeholder="Category" className={inputClass} />
          <input type="number" step="0.01" {...register("price", { required: true, valueAsNumber: true })} placeholder="Price" className={inputClass} />
          <input type="number" {...register("stock", { required: true, valueAsNumber: true })} placeholder="Stock Quantity" className={inputClass} />
          <input type="number" {...register("reorderLevel", { valueAsNumber: true })} placeholder="Reorder Level (e.g., 10)" className={inputClass} />
          <button type="submit" className={buttonPrimary}>
            {selectedItem ? "Update Item" : "Save Item"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
