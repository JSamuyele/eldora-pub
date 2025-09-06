import React from "react";
import Modal from "../ui/Modal";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

const AddEventTransactionModal = ({ isOpen, onClose, inventory }) => {
  const queryClient = useQueryClient();
  const { register, control, handleSubmit, watch, reset } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "orders",
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      console.log("Submitting payload:", data);
      return await api.post("/sales/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["eventTxns"]);
      reset();
      onClose();
    },
    onError: (err) => {
      console.error("Add failed:", err);
      alert(`Error: ${err.response?.data?.message || "Failed to add transaction"}`);
    },
  });

  const onSubmit = (formData) => {
    const now = new Date();

    const orders = formData.orders.map((entry) => ({
      item: entry.item?.trim(),
      qty: Number(entry.qty),
      unitPrice: Number(entry.unitPrice),
      total: Number(entry.qty) * Number(entry.unitPrice),
    }));

    const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);

    const payload = {
      eventName: formData.eventName?.trim(),
      eventType: formData.eventType,
      payment: formData.payment?.trim(),
      time: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      day: now.toLocaleDateString("en-US", { weekday: "short" }),
      source: "Event Sales",
      orders,
      total: grandTotal,
    };

    const missing = Object.entries(payload).filter(([k, v]) => v === "" || v === null);
    if (missing.length > 0 || orders.length === 0) {
      alert("Please complete all required fields and add at least one item.");
      return;
    }

    mutation.mutate(payload);
  };

  if (!Array.isArray(inventory)) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Add Event Sale">
        <p className="text-sm text-red-400">Inventory data not available</p>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Event Sale">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Event Type */}
        <select
          {...register("eventType", { required: true })}
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        >
          <option value="">Select Event Type</option>
          <option value="Wedding">Wedding</option>
          <option value="Corporate">Corporate</option>
          <option value="Birthday">Birthday</option>
          <option value="Concert">Concert</option>
          <option value="Other">Other</option>
        </select>

        {/* Event Name */}
        <input
          type="text"
          {...register("eventName", { required: true })}
          placeholder="Event Name (e.g. Eldad & Theo's Wedding)"
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        />

        {/* Inventory Selector */}
        <select
          onChange={(e) => {
            const selectedName = e.target.value;
            const exists = fields.find((f) => f.item === selectedName);
            if (selectedName && !exists) {
              const selectedInventoryItem = inventory.find((i) => i.name === selectedName);
              append({
                item: selectedName,
                qty: 1,
                unitPrice: selectedInventoryItem?.price || 0,
              });
            }
          }}
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        >
          <option value="">Select Item</option>
          {inventory.map((item) => (
            <option key={item._id} value={item.name}>
              {item.name} — {item.stock} in stock
            </option>
          ))}
        </select>

        {/* Dynamic Item Fields */}
        {fields.map((field, index) => {
          const stock = inventory.find((i) => i.name === field.item)?.stock || 0;
          return (
            <div key={field.id} className="border border-gray-700 p-3 rounded">
              <p className="text-white font-semibold">{field.item}</p>
              <p className="text-sm text-gray-400">Available stock: {stock}</p>

              <input
                type="number"
                {...register(`orders.${index}.qty`, { required: true })}
                placeholder="Quantity"
                className="mt-1 p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white w-full"
              />

              <input
                type="number"
                {...register(`orders.${index}.unitPrice`, { required: true })}
                placeholder="Unit Price"
                className="mt-1 p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white w-full"
              />

              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-2 text-red-400 text-sm"
              >
                Remove
              </button>
            </div>
          );
        })}

        {/* Payment Method */}
        <select
          {...register("payment", { required: true })}
          className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
        >
          <option value="">Select Payment Method</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Mobile">Mobile</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Event Sale
        </button>
      </form>
    </Modal>
  );
};

export default AddEventTransactionModal;