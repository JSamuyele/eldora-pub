import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { FaChair, FaUser, FaClock } from "react-icons/fa";

const Tables = () => {
  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ["sales"],
    queryFn: () => api.get("/sales/transactions").then((res) => res.data),
  });

  const tableIds = ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10"];

  const getTableStatus = (id) => {
    const txn = transactions.find((t) => t.tableId === id && t.status === "Occupied");
    return txn || null;
  };

  return (
    <div className="bg-[#1f1f1f] min-h-screen text-white p-6 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl font-semibold mb-2">🪑 Table Overview</h1>
      <p className="text-sm text-[#ababab] mb-6">Monitor live table status and occupancy.</p>

      {isLoading && <p className="text-gray-400">Loading table data...</p>}
      {isError && <p className="text-red-400">Failed to load table data.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tableIds.map((id) => {
          const status = getTableStatus(id);
          const isOccupied = Boolean(status);

          return (
            <div
              key={id}
              className={`rounded-xl shadow-md p-4 flex flex-col gap-2 ${
                isOccupied ? "bg-red-600" : "bg-green-600"
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Table {id}</h2>
                <FaChair className="text-white text-xl" />
              </div>

              <div className="text-sm text-white">
                {isOccupied ? (
                  <>
                    <p className="flex items-center gap-2">
                      <FaUser /> {status.name || "Customer"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaClock /> {status.time}
                    </p>
                    <p>Total: ₵{status.total}</p>
                    <p>Chairs: {status.chairs}</p>
                  </>
                ) : (
                  <p className="text-white">Available</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tables;
