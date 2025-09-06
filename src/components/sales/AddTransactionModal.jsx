import React from "react";
import Modal from "../ui/Modal"; // Make sure this path is correct
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

const AddTransactionModal = ({ isOpen, onClose, inventory }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, reset } = useForm();
  const selectedItem = watch("item");

  if (!Array.isArray(inventory)) {
  return <p className="text-sm text-red-400">Inventory data not available</p>;
}


  const mutation = useMutation({
    mutationFn: (data) => api.post("/sales/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      reset();
      onClose();
    },
    onError: (err) => console.error("Add failed:", err),
  });

  const onSubmit = (data) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const day = now.toLocaleDateString("en-US", { weekday: "short" });

    mutation.mutate({
      ...data,
      qty: Number(data.qty),
      unitPrice: Number(data.unitPrice),
      total: Number(data.qty) * Number(data.unitPrice),
      time,
      day,
    });
  };

const stock = (inventory ?? []).find((i) => i.name === selectedItem)?.stock || 0;


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Sale">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <select
          {...register("item", { required: true })}
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        >
          <option value="">Select Item</option>
          {inventory.map((item) => (
            <option key={item._id} value={item.name}>
              {item.name} — {item.stock} in stock
            </option>
          ))}
        </select>

        <input
          type="number"
          {...register("qty", { required: true })}
          placeholder="Quantity"
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        />

        {selectedItem && (
          <p className="text-sm text-gray-400">
            Available stock: {stock}
          </p>
        )}

        <input
          type="number"
          {...register("unitPrice", { required: true })}
          placeholder="Unit Price"
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        />

        <select
          {...register("payment", { required: true })}
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Mobile">Mobile</option>
        </select>

        <select
          {...register("source", { required: true })}
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        >
          <option value="Bar Sales">Bar Sales</option>
          <option value="Event Sales">Event Sales</option>
        </select>

        <button
          type="submit"
          disabled={selectedItem && watch("qty") > stock}
          className={`px-4 py-2 rounded-lg ${
            selectedItem && watch("qty") > stock
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Save Transaction
        </button>
      </form>
    </Modal>
  );
};

export default AddTransactionModal; // ✅ This line fixes the import error
