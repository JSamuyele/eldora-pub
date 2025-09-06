import React from "react";
import Modal from "../ui/Modal";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

const WalkInBillingModal = ({ isOpen, onClose, inventory }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, reset } = useForm();
  const selectedItem = watch("item");

  const mutation = useMutation({
    mutationFn: (data) => api.post("/sales/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      reset();
      onClose();
    },
    onError: (err) => console.error("Billing failed:", err),
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
      source: "Bar Sales",
      time,
      day,
    });
  };

  const stock = (inventory ?? []).find((i) => i.name === selectedItem)?.stock || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Walk-In Billing">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input
          type="text"
          {...register("name", { required: true })}
          placeholder="Customer Name"
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        />

        <input
          type="tel"
          {...register("phone", { required: true })}
          placeholder="Phone Number"
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        />

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
          <p className="text-sm text-gray-400">Available stock: {stock}</p>
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

        <button
          type="submit"
          disabled={selectedItem && watch("qty") > stock}
          className={`px-4 py-2 rounded-lg ${
            selectedItem && watch("qty") > stock
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Save Walk-In Sale
        </button>
      </form>
    </Modal>
  );
};

export default WalkInBillingModal;
