import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash, FaPrint } from "react-icons/fa";
import api from "../services/api";
import AddEventTransactionModal from "../components/events/AddEventTransactionModal";

const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#a78bfa"];

const Events = () => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => { document.title = "POS | Events"; }, []);

  const fetchData = async (url, fallback = []) => {
    try {
      const res = await api.get(url);
      return Array.isArray(res.data) ? res.data : fallback;
    } catch (err) {
      console.error("Fetch error:", err);
      return fallback;
    }
  };

  const { data: eventTxns = [] } = useQuery({
    queryKey: ["eventTxns"],
    queryFn: () => fetchData("/sales/events"),
  });

  const { data: eventRevenue = [] } = useQuery({
    queryKey: ["eventRevenue"],
    queryFn: () => fetchData("/sales/events/revenue"),
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => fetchData("/inventory"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/sales/transactions/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["eventTxns"]),
  });

  const handleDelete = (id) =>
    window.confirm("Delete this transaction?") && deleteMutation.mutate(id);

  const handlePrint = (txn) => {
    const lines = txn.orders?.length
      ? txn.orders
          .map(
            (o) =>
              `${o.qty} × ${o.item} @ ₵${o.unitPrice} = ₵${o.qty * o.unitPrice}`
          )
          .join("\n")
      : `${txn.qty} × ${txn.item} @ ₵${txn.unitPrice} = ₵${txn.total}`;
    const r = `Receipt - ${txn._id}
Event: ${txn.eventType || "—"} | Name: ${txn.eventName || "—"}
${lines}
Total: ₵${txn.total} | Payment: ${txn.payment}
Time: ${txn.time}`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<pre>${r}</pre>`);
      w.document.close();
      setTimeout(() => w.print(), 200);
    }
  };

  // Summary calculations
  const totalRevenue = eventTxns.reduce(
    (s, t) => s + (Number(t.total) || 0),
    0
  );
  const avgSpend = eventTxns.length ? totalRevenue / eventTxns.length : 0;

  const filteredTxns =
    selectedType === "All"
      ? eventTxns
      : eventTxns.filter((t) => t.eventType === selectedType);

  const groupedTxns = filteredTxns.reduce((a, t) => {
    (a[t.eventType || "Other"] ||= []).push(t);
    return a;
  }, {});

  const topItem = (() => {
    const allItems = eventTxns.flatMap(
      (t) => t.orders?.map((o) => o.item) || [t.item]
    );
    const freq = allItems.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  })();

  return (
    <div className="bg-[#1f1f1f] min-h-screen text-white p-6 overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-2">🎉 Event Sales Dashboard</h1>
      <p className="text-[#ababab] mb-4">Track and manage event-driven sales.</p>
      <div className="flex justify-end mb-4">
      <button
        onClick={() => setIsAddOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
      >
        + Add Event Transaction
      </button>
      </div>


      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-400">Total Transactions</h3>
          <p className="text-xl font-semibold">{eventTxns.length}</p>
        </div>
        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-400">Total Revenue</h3>
          <p className="text-xl font-semibold">₵{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-400">Avg Spend / Transaction</h3>
          <p className="text-xl font-semibold">₵{avgSpend.toFixed(2)}</p>
        </div>
        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-400">Top Item</h3>
          <p className="text-xl font-semibold">{topItem}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Revenue by Event</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={eventRevenue}>
              <XAxis dataKey="eventType" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Sales Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={eventRevenue}
                dataKey="revenue"
                nameKey="eventType"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {eventRevenue.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-[#2a2a2a] rounded-xl shadow p-4 overflow-x-auto mb-6">
        <h2 className="text-xl font-semibold mb-3">📑 Event Transactions</h2>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-600 text-gray-300">
              <th className="py-2 px-3">Event Type</th>
              <th className="py-2 px-3">Event Name</th>
              <th className="py-2 px-3">Orders</th>
              <th className="py-2 px-3">Total</th>
              <th className="py-2 px-3">Payment</th>
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxns.length ? (
              filteredTxns.map((t) => (
                <tr key={t._id} className="border-b border-gray-700">
                  <td className="py-2 px-3">{t.eventType || "—"}</td>
                  <td className="py-2 px-3">{t.eventName || "—"}</td>
                  <td className="py-2 px-3">
                    {t.orders?.length ? (
                      <ul className="space-y-1">
                        {t.orders.map((o, i) => (
                          <li key={i}>
                            {o.qty} × {o.item} @ ₵{o.unitPrice} = ₵
                            {o.qty * o.unitPrice}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      `${t.qty} × ${t.item} @ ₵${t.unitPrice}`
                    )}
                  </td>
                  <td className="py-2 px-3">₵{t.total}</td>
                  <td className="py-2 px-3">{t.payment}</td>
                  <td className="py-2 px-3">{t.time}</td>
                  <td className="py-2 px-3 flex gap-2">
                    <button
                      onClick={() => handlePrint(t)}
                      className="text-green-400 hover:text-green-600"
                    >
                      <FaPrint />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-400">
                  No event transactions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}

      {isAddOpen && (
        <AddEventTransactionModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          inventory={inventoryItems}
        />
      )}
    </div>
  );
};

export default Events;
