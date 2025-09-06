// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import {
  FaPlus, FaFilter, FaDownload, FaCog, FaTrash, FaEdit, FaArrowLeft,
} from "react-icons/fa";
import useInventory from "../hooks/useInventory";
import Modal from "../components/ui/Modal";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: items = [], isLoading, isError } = useInventory();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    document.title = "POS | Inventory";
  }, []);

  // Add item
  const addMutation = useMutation({
    mutationFn: (newItem) =>
      api.post("/inventory", { ...newItem, stock: Number(newItem.stock) }),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory"]);
      reset();
      setIsAddOpen(false);
    },
  });

  // Edit item
  const editMutation = useMutation({
    mutationFn: (updatedItem) =>
      api.put(`/inventory/${selectedItem._id}`, {
        ...updatedItem,
        stock: Number(updatedItem.stock),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory"]);
      reset();
      setIsEditOpen(false);
    },
  });

  // Delete item
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/inventory/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["inventory"]),
  });

  const handleDelete = (id) => {
    if (window.confirm("Delete this item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setValue("name", item.name);
    setValue("category", item.category);
    setValue("stock", item.stock);
    setValue("status", item.status);
    setIsEditOpen(true);
  };

  const filteredItems =
    filterCategory === "All"
      ? items
      : items.filter((item) => item.category === filterCategory);

  const CategoryBadge = ({ label, color }) => (
    <span
      className="px-2 py-1 text-xs rounded-full font-medium"
      style={{ backgroundColor: color || "#2563eb", color: "#fff" }}
    >
      {label}
    </span>
  );

  // 🔹 Shared input + button styles
  const inputClass =
    "p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none";
  const buttonPrimary =
    "bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm";

  return (
    <div className="bg-[#1f1f1f] min-h-screen text-white p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-700 hover:bg-gray-800 px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </button>
          <div>
            <h1 className="text-2xl font-semibold">📦 Inventory</h1>
            <p className="text-[#ababab]">Track and manage your stock in real time.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className={`${buttonPrimary} flex items-center gap-2`}
          >
            <FaPlus /> Add Item
          </button>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded-lg text-sm"
          >
            <option value="All">All Categories</option>
            {[...new Set(items.map((i) => i.category))].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm">
            <FaDownload /> Export
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm"
          >
            <FaCog /> Settings
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#2a2a2a] rounded-lg shadow p-4">
        {isLoading && <p className="text-gray-400">Loading inventory...</p>}
        {isError && <p className="text-red-400">Failed to load inventory.</p>}

        {!isLoading && !isError && filteredItems.length === 0 && (
          <p className="text-gray-400">No items match this filter.</p>
        )}

        {!isLoading && !isError && filteredItems.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#f5f5f5] border-b border-[#444]">
                <th className="py-2 px-3">Item</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Stock</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} className="border-b border-[#333]">
                  <td className="py-2 px-3">{item.name}</td>
                  <td className="py-2 px-3">
                    <CategoryBadge label={item.category} color={item.color} />
                  </td>
                  <td className="py-2 px-3">{item.stock}</td>
                  <td
                    className={`py-2 px-3 ${
                      item.status === "In Stock"
                        ? "text-green-400"
                        : item.status === "Low Stock"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {item.status}
                  </td>
                  <td className="py-2 px-3 flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Item">
        <form
          onSubmit={handleSubmit((data) => addMutation.mutate(data))}
          className="flex flex-col gap-3"
        >
          <input {...register("name", { required: true })} placeholder="Item Name" className={inputClass} />
          <input {...register("category", { required: true })} placeholder="Category" className={inputClass} />
          <input type="number" {...register("stock", { required: true })} placeholder="Stock Quantity" className={inputClass} />
          <select {...register("status", { required: true })} className={inputClass}>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button type="submit" className={buttonPrimary}>Save Item</button>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Item">
        <form
          onSubmit={handleSubmit((data) => editMutation.mutate(data))}
          className="flex flex-col gap-3"
        >
          <input {...register("name", { required: true })} placeholder="Item Name" className={inputClass} />
          <input {...register("category", { required: true })} placeholder="Category" className={inputClass} />
          <input type="number" {...register("stock", { required: true })} placeholder="Stock Quantity" className={inputClass} />
          <select {...register("status", { required: true })} className={inputClass}>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button type="submit" className={buttonPrimary}>Update Item</button>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Inventory Settings">
        <div className="text-sm text-gray-300">
          <p>🔧 Settings panel coming soon. You can configure inventory thresholds, alerts, and categories here.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
