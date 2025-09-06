import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaBoxes, FaMoneyBillWave, FaGlassCheers, FaUtensils } from "react-icons/fa";

const Greetings = () => {
  const userData = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  }, []);

  return (
    <div className="flex justify-between items-center px-8 mt-5">
      {/* Left side - Greeting */}
      <div>
        <h1 className="text-[#f5f5f5] text-2xl font-semibold tracking-wide">
          {greeting}, {userData.name || "TEST USER"}
        </h1>
        <p className="text-[#ababab] text-sm">
          Give your best services for customers 😀
        </p>
      </div>

      {/* Right side - Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/inventory")}
          className="flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg hover:bg-[#3a3a3a] transition"
        >
          <FaBoxes /> Inventory
        </button>
        <button
          onClick={() => navigate("/sales")}
          className="flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg hover:bg-[#3a3a3a] transition"
        >
          <FaMoneyBillWave /> Sales
        </button>
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg hover:bg-[#3a3a3a] transition"
        >
          <FaGlassCheers /> Events
        </button>
        <button
          onClick={() => navigate("/tables")}
          className="flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg hover:bg-[#3a3a3a] transition"
        >
          <FaUtensils /> Tables
        </button>
      </div>
    </div>
  );
};

export default Greetings;
