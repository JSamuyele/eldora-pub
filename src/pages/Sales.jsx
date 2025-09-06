import React, { useEffect, useState } from "react";
import {FaChartLine, FaBeer, FaTrash, FaEdit, FaTable, FaUserPlus,} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "../services/api";
import Modal from "../components/ui/Modal";

          const Sales = () => {
            const queryClient = useQueryClient();
            const [isAddOpen, setIsAddOpen] = useState(false);
            const { register, handleSubmit, reset } = useForm();
            const [orderItems, setOrderItems] = useState([{ item: "", qty: 1, unitPrice: 0 }]);
            useEffect(() => {
              document.title = "POS | Sales";
            }, []);

            const { data: transactions = [] } = useQuery({
              queryKey: ["sales"],
              queryFn: () => api.get("/sales/transactions").then((res) => res.data),
            });

            const { data: inventoryItems = [] } = useQuery({
              queryKey: ["inventory"],
              queryFn: () => api.get("/inventory").then((res) => res.data),
            });

        const addMutation = useMutation({mutationFn: (data) => {console.log("API POST /sales/transactions", data); // Debug log
            return api.post("/sales/transactions", data);},
          onSuccess: (res) => {
            console.log("Mutation success:", res); // Debug log
            queryClient.invalidateQueries(["sales"]);
            reset();
            setOrderItems([{ item: "", qty: 1, unitPrice: 0 }]);
            setIsAddOpen(false);},
          onError: (error) => {
            console.error("Mutation error:", error); // Debug log
            alert("Failed to save transaction: " + (error?.response?.data?.message || error.message));},});

        const deleteMutation = useMutation({
          mutationFn: (id) => api.delete(`/sales/transactions/${id}`),
          onSuccess: () => queryClient.invalidateQueries(["sales"]),}); // FIXED: use array syntax 
            const handleDelete = (id) => {
              if (window.confirm("Delete this transaction?")) {
                deleteMutation.mutate(id);
              }
            };

            const availableTables = ["T01", "T02", "T03", "T04", "T05", "T06"].filter(
              (id) => !transactions.some((txn) => txn.tableId === id && txn.status === "Occupied")
            );

            const addItemRow = () => {
              setOrderItems([...orderItems, { item: "", qty: 1, unitPrice: 0 }]);
            };

            const removeItemRow = (index) => {
              const updated = [...orderItems];
              updated.splice(index, 1);
              setOrderItems(updated);
            };

            const updateItemField = (index, field, value) => {
              const updated = [...orderItems];
              updated[index][field] = field === "qty" || field === "unitPrice" ? Number(value) : value;
              setOrderItems(updated);
            };

            const total = orderItems.reduce((sum, o) => sum + o.qty * o.unitPrice, 0);

            const isOrderValid = orderItems.every(
              (order) => order.item && order.qty > 0 && order.unitPrice > 0
            );

            const handleAddOrder = (data) => {
              // Debug: Log form data and order items
              console.log("Form Data:", data);
              console.log("Order Items:", orderItems);

              if (!isOrderValid) {
                alert("Please fill all order item fields (item, quantity, unit price).");
                return;
              }
              if (!data.name || !data.phone || !data.tableId || !data.chairs || !data.payment) {
                alert("Please fill all customer, table, and payment fields.");
                return;
              }
              if (orderItems.length === 0) {
                alert("Please add at least one order item.");
                return;
              }

              const now = new Date();
              const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const day = now.toLocaleDateString("en-US", { weekday: "short" });

              const payload = {
                ...data,
                orders: orderItems,
                total,
                source: "Bar Sales",
                status: "Occupied",
                time,
                day,
              };

              // Debug: Log payload before mutation
              console.log("Submitting payload:", payload);

              addMutation.mutate(payload);
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#1f1f1f] text-white min-h-screen">
                {/* Left Panel */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">📊 Sales Overview</h2>

                  <div className="bg-[#2a2a2a] p-4 rounded-lg shadow">
                    <h3 className="text-lg mb-2 flex items-center gap-2">
                      <FaChartLine /> Weekly Sales Trend
                    </h3>
                    <div className="text-sm text-gray-400">[Chart goes here]</div>
                  </div>

                  <div className="bg-[#2a2a2a] p-4 rounded-lg shadow">
                    <h3 className="text-lg mb-2 flex items-center gap-2">
                      <FaBeer /> Top Selling Items
                    </h3>
                    <ul className="text-sm text-gray-300 list-disc ml-5">
                      {/* Map top items here */}
                    </ul>
                  </div>

                  <div className="bg-[#2a2a2a] p-4 rounded-lg shadow">
                    <h3 className="text-lg mb-2">🧾 Recent Transactions</h3>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[#f5f5f5] border-b border-[#444]">
                          <th className="py-2 px-3">Customer</th>
                          <th className="py-2 px-3">Table</th>
                          <th className="py-2 px-3">Total</th>
                          <th className="py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn) => (
                          <tr key={txn._id} className="border-b border-[#333]">
                            <td className="py-2 px-3">{txn.name}</td>
                            <td className="py-2 px-3">{txn.tableId}</td>
                            <td className="py-2 px-3">₵{Number(txn.total).toFixed(2)}</td>
                            <td className="py-2 px-3 flex gap-2">
                              <button className="text-blue-400 hover:text-blue-600">
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(txn._id)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">🪑 Table Management</h2>

                  <div className="bg-[#2a2a2a] p-4 rounded-lg shadow">
                    <h3 className="text-lg mb-2 flex items-center gap-2">
                      <FaTable /> Available Tables
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {availableTables.map((id) => (
                        <span key={id} className="bg-green-600 px-3 py-1 rounded-full text-sm">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                  >
                    <FaUserPlus /> Add Order
                  </button>
                </div>

                {/* Add Order Modal */}
                <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Order">
                  <form
                    onSubmit={handleSubmit(handleAddOrder)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Customer Info */}
                    <div className="col-span-2">
                      <h4 className="text-sm text-gray-400 mb-2">👤 Customer Info</h4>
                      <input {...register("name", { required: true })} placeholder="Customer Name" className="input" />
                      <input {...register("phone", { required: true })} placeholder="Phone Number" className="input" />
                    </div>

                    {/* Table Info */}
                    <div>
                      <h4 className="text-sm text-gray-400 mb-2">🪑 Table Info</h4>
                      <select {...register("tableId", { required: true })} className="input">
                        <option value="">Select Table</option>
                        {availableTables.map((id) => (
                          <option key={id} value={id}>{id}</option>
                        ))}
                      </select>
                      <input type="number" {...register("chairs", { required: true })} placeholder="Number of Chairs" className="input" />
                    </div>

          {/* Order Items */}
          <div className="col-span-2">
            <h4 className="text-sm text-gray-400 mb-2">🍻 Order Items</h4>
            {orderItems.map((order, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-center">
                <select
                  value={order.item}
                  onChange={(e) => updateItemField(index, "item", e.target.value)}
                  className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
                >
                  <option value="">Select Item</option>
                  {inventoryItems.map((inv) => (
                    <option key={inv._id} value={inv.name}>
                      {inv.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={order.qty}
                  onChange={(e) => updateItemField(index, "qty", e.target.value)}
                  placeholder="Qty"
                  className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
                />
                <input
                  type="number"
                  value={order.unitPrice}
                  onChange={(e) => updateItemField(index, "unitPrice", e.target.value)}
                  placeholder="Unit Price"
                  className="p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
                />
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="text-red-400 hover:text-red-600 text-sm ml-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItemRow}
              className="bg-gray-700 hover:bg-gray-800 px-3 py-1 rounded text-sm mt-2"
            >
              ➕ Add Another Item
            </button>
          </div>

                    {/* Receipt Preview */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-sm text-gray-400 mb-2">🧾 Receipt Preview</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {orderItems.map((order, i) => (
                          <li key={i}>
                            {order.qty} × {order.item} @ ₵{Number(order.unitPrice).toFixed(2)} = ₵{(order.qty * order.unitPrice).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 font-semibold text-white">
                        Total: ₵{total.toFixed(2)}
                      </p>
                    </div>

                    {/* Payment */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-sm text-gray-400 mb-2">💳 Payment Method</h4>
                      <select
                        {...register("payment", { required: true })}
                        className="w-full p-2 rounded bg-[#1f1f1f] border border-gray-600 text-white"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>

                    {/* Submit */}
                    <div className="col-span-2 flex justify-end mt-6">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white text-sm"
                        disabled={!isOrderValid}
                        title={!isOrderValid ? "Fill all order item fields" : ""}
                      >
                        Save Transaction
                      </button>
                    </div>
                  </form>
                </Modal>
              </div>
            );
          };

          export default Sales;
