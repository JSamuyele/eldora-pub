import React, { useEffect } from "react";
import { FaArrowLeft, FaChair, FaUser } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

// ✅ Small reusable card
const Card = ({ label, value, icon }) => (
  <div className="bg-[#2a2a2a] p-4 rounded-lg shadow flex items-center gap-3">
    <div className="text-xl text-blue-400">{icon}</div>
    <div>
      <h3 className="text-sm text-gray-400">{label}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const Table = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "POS | Table Management";
  }, []);

  // ✅ Pull table data from sales transactions
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["salesTables"],
    queryFn: () => api.get("/sales/transactions").then((res) => res.data),
  });

  // ✅ Group by tableId
  const groupedTables = transactions.reduce((acc, txn) => {
    if (!txn.tableId) return acc;
    if (!acc[txn.tableId]) {
      acc[txn.tableId] = {
        tableId: txn.tableId,
        name: txn.name,
        chairs: txn.chairs || 4,
        status: txn.status || "Occupied",
      };
    }
    return acc;
  }, {});

  const tables = Object.values(groupedTables);
  const totalTables = tables.length;
  const totalChairs = tables.reduce((sum, t) => sum + t.chairs, 0);
  const occupiedTables = tables.filter((t) => t.status === "Occupied").length;
  const availableTables = tables.filter((t) => t.status === "Available").length;

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
            <h1 className="text-2xl font-semibold">🪑 Table Management</h1>
            <p className="text-[#ababab]">Live table status from sales data.</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card label="Total Tables" value={totalTables} icon={<FaChair />} />
        <Card label="Available" value={availableTables} icon={<FaChair />} />
        <Card label="Occupied" value={occupiedTables} icon={<FaUser />} />
        <Card label="Total Chairs" value={totalChairs} icon={<FaChair />} />
      </div>

      {/* Table List */}
      <div className="bg-[#2a2a2a] rounded-lg shadow p-4">
        {isLoading && <p className="text-gray-400">Loading table data...</p>}
        {isError && <p className="text-red-400">Failed to load table data.</p>}

        {!isLoading && !isError && tables.length === 0 && (
          <p className="text-gray-400">No table-linked transactions found.</p>
        )}

        {!isLoading && !isError && tables.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#f5f5f5] border-b border-[#444]">
                <th className="py-2 px-3">Table ID</th>
                <th className="py-2 px-3">Chairs</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Customer</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.tableId} className="border-b border-[#333]">
                  <td className="py-2 px-3">{table.tableId}</td>
                  <td className="py-2 px-3">{table.chairs}</td>
                  <td className="py-2 px-3">
                    {table.status === "Occupied" ? (
                      <span className="text-red-400">Occupied</span>
                    ) : (
                      <span className="text-green-400">Available</span>
                    )}
                  </td>
                  <td className="py-2 px-3">{table.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Table;
