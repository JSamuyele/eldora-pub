import React from "react"; 
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import logo from "../../assets/logo.png"; // adjust path if needed
import { formatDate, formatTime } from "../../utils/dateUtils"; // adjust path if needed
import { useSelector } from "react-redux";

const Header = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.user);
  const dateTime = new Date();

  const handleLogout = () => {
    // your logout logic here
  };

  return (
    <header className="flex flex-wrap justify-between items-center py-3 px-4 sm:px-6 bg-[#1a1a1a] gap-4">
      {/* LOGO */}
      <div
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img src={logo} className="h-9 w-9 sm:h-12 sm:w-12" alt="eldora logo" />
        <h1 className="text-sm sm:text-lg font-semibold text-[#f5f5f5] tracking-wide">
          Eldora Royal Event & Pub
        </h1>
      </div>

      {/* DATE + TIME */}
      <div className="flex flex-col items-center text-[#f5f5f5] text-xs sm:text-sm">
        <span className="font-medium">{formatDate(dateTime)}</span>
        <span className="text-[10px] text-[#ababab]">{formatTime(dateTime)}</span>
      </div>

      {/* USER DETAILS */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
        {userData.role === "Admin" && (
          <div
            onClick={() => navigate("/dashboard")}
            className="bg-[#1f1f1f] rounded-[12px] p-2 sm:p-3 cursor-pointer"
          >
            <MdDashboard className="text-[#f5f5f5] text-lg sm:text-2xl" />
          </div>
        )}
        <div className="bg-[#1f1f1f] rounded-[12px] p-2 sm:p-3 cursor-pointer">
          <FaBell className="text-[#f5f5f5] text-lg sm:text-2xl" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">
          <FaUserCircle className="text-[#f5f5f5] text-2xl sm:text-4xl" />
          <div className="flex flex-col items-start text-xs sm:text-sm">
            <h1 className="font-semibold tracking-wide">
              {userData.name || "TEST USER"}
            </h1>
            <p className="text-[10px] text-[#ababab] font-medium">
              {userData.role || "Role"}
            </p>
          </div>
          <IoLogOut
            onClick={handleLogout}
            className="text-[#f5f5f5] ml-1 sm:ml-2"
            size={28}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
