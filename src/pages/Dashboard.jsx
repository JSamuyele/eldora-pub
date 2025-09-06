import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { FaCashRegister, FaMoneyBillWave, FaChair, FaBoxes } from "react-icons/fa";
import Greetings from "../components/home/Greetings";
import api from "../services/api"; // Make sure this exists

const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  // Fetch stats
const { data: recentSales = [], isLoading: salesRecordsLoading } = useQuery({
  queryKey: ["salesTransactions"],
  queryFn: () => api.get("/sales/transactions").then(res => res.data),
});


  const { data: statsData = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => api.get("/dashboard/stats").then(res => res.data),
  });

  // Fetch sales trend
  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ["salesTrend"],
    queryFn: () => api.get("/dashboard/sales-trend").then(res => res.data),
  });

  // Fetch inventory usage
  const { data: inventoryData = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ["inventoryUsage"],
    queryFn: () => api.get("/dashboard/inventory-usage").then(res => res.data),
  });

  // Fetch recent events/activity
  const { data: recentEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["recentEvents"],
    queryFn: () => api.get("/dashboard/recent-events").then(res => res.data),
  });

  {/* Recent Sales Transactions */}
<div className="bg-[#2a2a2a] p-4 rounded-2xl shadow-md mt-8">
  <h3 className="text-lg font-semibold mb-4">🧾 Recent Sales</h3>
  {salesRecordsLoading ? (
    <div>Loading...</div>
  ) : (
    <ul className="space-y-2 max-h-[300px] overflow-y-auto">
      {recentSales.length === 0 ? (
        <li className="p-2 rounded-lg bg-[#3a3a3a]">No sales recorded.</li>
      ) : (
        recentSales.slice(0, 10).map((txn, index) => (
          <li key={index} className="p-2 rounded-lg bg-[#3a3a3a] flex justify-between items-center">
            <div>
              <p className="font-semibold">{txn.name}</p>
              <p className="text-sm text-gray-400">Table: {txn.tableId} | Time: {txn.time}</p>
            </div>
            <span className="font-bold text-green-400">₵{Number(txn.total).toFixed(2)}</span>
          </li>
        ))
      )}
    </ul>
  )}
</div>


  {/* Recent Sales Transactions */}
<div className="bg-[#2a2a2a] p-4 rounded-2xl shadow-md mt-8">
  <h3 className="text-lg font-semibold mb-4">🧾 Recent Sales</h3>
  {salesRecordsLoading ? (
    <div>Loading...</div>
  ) : (
    <ul className="space-y-2 max-h-[300px] overflow-y-auto">
      {recentSales.length === 0 ? (
        <li className="p-2 rounded-lg bg-[#3a3a3a]">No sales recorded.</li>
      ) : (
        recentSales.slice(0, 10).map((txn, index) => (
          <li key={index} className="p-2 rounded-lg bg-[#3a3a3a] flex justify-between items-center">
            <div>
              <p className="font-semibold">{txn.name}</p>
              <p className="text-sm text-gray-400">Table: {txn.tableId} | Time: {txn.time}</p>
            </div>
            <span className="font-bold text-green-400">₵{Number(txn.total).toFixed(2)}</span>
          </li>
        ))
      )}
    </ul>
  )}
</div>


  // Stats cards config
  const stats = [
    {
      title: "Sales Today",
      value: statsData.salesToday ? `₵${statsData.salesToday}` : "—",
      icon: <FaCashRegister size={24} />,
      color: "bg-blue-500",
    },
    {
      title: "Total Revenue",
      value: statsData.totalRevenue ? `₵${statsData.totalRevenue}` : "—",
      icon: <FaMoneyBillWave size={24} />,
      color: "bg-green-500",
    },
    {
      title: "Active Tables",
      value: statsData.activeTables ? `${statsData.activeTables} / ${statsData.totalTables}` : "—",
      icon: <FaChair size={24} />,
      color: "bg-orange-500",
    },
    {
      title: "Low Stock Items",
      value: statsData.lowStockItems ?? "—",
      icon: <FaBoxes size={24} />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="bg-[#1f1f1f] h-[calc(100vh-7rem)] p-6 overflow-y-auto text-white">
      {/* Greetings Section */}
      <div className="mb-6">
        <Greetings />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl shadow-md flex items-center justify-between ${stat.color}`}
          >
            <div>
              <h3 className="text-lg font-semibold">{stat.title}</h3>
              <p className="text-2xl font-bold">
                {(statsLoading && stat.value === "—") ? "Loading..." : stat.value}
              </p>
            </div>
            <div className="opacity-80">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="bg-[#2a2a2a] p-4 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Sales Trend (Weekly)</h3>
          {salesLoading ? (
            <div>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#4ade80" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Inventory Usage */}
        <div className="bg-[#2a2a2a] p-4 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Inventory Usage</h3>
          {inventoryLoading ? (
            <div>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={inventoryData}>
                <XAxis dataKey="item" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="used" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity / Events */}
      <div className="bg-[#2a2a2a] p-4 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activity & Events</h3>
        {eventsLoading ? (
          <div>Loading...</div>
        ) : (
          <ul className="space-y-2">
            {recentEvents.length === 0 ? (
              <li className="p-2 rounded-lg bg-[#3a3a3a]">No recent activity.</li>
            ) : (
              recentEvents.map((event, index) => (
                <li key={index} className="p-2 rounded-lg bg-[#3a3a3a]">
                  {event}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
