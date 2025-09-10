import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { FaCashRegister, FaMoneyBillWave, FaChair, FaBoxes } from "react-icons/fa";
import Greetings from "../components/home/Greetings"; // 👈 import Greetings

const buttons = [];

const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  // Dummy stats
  const stats = [
    { title: "Sales Today", value: "₵1,250", icon: <FaCashRegister size={24} />, color: "bg-blue-500" },
    { title: "Total Revenue", value: "₵35,600", icon: <FaMoneyBillWave size={24} />, color: "bg-green-500" },
    { title: "Active Tables", value: "12 / 20", icon: <FaChair size={24} />, color: "bg-orange-500" },
    { title: "Low Stock Items", value: "5", icon: <FaBoxes size={24} />, color: "bg-red-500" },
  ];

  // Dummy sales trend data
  const salesData = [
    { day: "Mon", sales: 400 },
    { day: "Tue", sales: 300 },
    { day: "Wed", sales: 500 },
    { day: "Thu", sales: 700 },
    { day: "Fri", sales: 600 },
    { day: "Sat", sales: 800 },
    { day: "Sun", sales: 650 },
  ];

  // Dummy inventory usage
  const inventoryData = [
    { item: "Beer", used: 120 },
    { item: "Whiskey", used: 80 },
    { item: "Wine", used: 60 },
    { item: "Vodka", used: 40 },
  ];

  // Dummy recent activity/events
  const recentEvents = [
    "Table 5 - Order #123 completed",
    "Inventory: Beer restocked (50 units)",
    "Event: Friday Night Live scheduled",
    "Low stock alert: Vodka (5 left)",
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
              <p className="text-2xl font-bold">{stat.value}</p>
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
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <XAxis dataKey="day" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#4ade80" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Usage */}
        <div className="bg-[#2a2a2a] p-4 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Inventory Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={inventoryData}>
              <XAxis dataKey="item" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="used" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity / Events */}
      <div className="bg-[#2a2a2a] p-4 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activity & Events</h3>
        <ul className="space-y-2">
          {recentEvents.map((event, index) => (
            <li key={index} className="p-2 rounded-lg bg-[#3a3a3a]">
              {event}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
