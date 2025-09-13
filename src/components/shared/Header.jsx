import React, { useEffect, useState } from "react";
import { FaSearch, FaUserCircle, FaBell } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex flex-wrap justify-between items-center py-4 px-6 bg-[#1a1a1a] gap-4">
      {/* LOGO */}
      <div
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img src={logo} className="h-10 w-10 sm:h-12 sm:w-12" alt="eldora logo" />
        <h1 className="text-base sm:text-lg font-semibold text-[#f5f5f5] tracking-wide">
          Eldora Royal Event & Pub
        </h1>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-4 py-2 w-full sm:w-[400px]">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Search"
          className="input bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
        />
      </div>

      {/* DATE + TIME */}
      <div className="flex flex-col items-center text-[#f5f5f5] text-sm sm:text-base">
        <span className="font-medium">{formatDate(dateTime)}</span>
        <span className="text-xs text-[#ababab]">{formatTime(dateTime)}</span>
      </div>

      {/* USER DETAILS */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {userData.role === "Admin" && (
          <div
            onClick={() => navigate("/dashboard")}
            className="bg-[#1f1f1f] rounded-[15px] p-2 sm:p-3 cursor-pointer"
          >
            <MdDashboard className="text-[#f5f5f5] text-xl sm:text-2xl" />
          </div>
        )}
        <div className="bg-[#1f1f1f] rounded-[15px] p-2 sm:p-3 cursor-pointer">
          <FaBell className="text-[#f5f5f5] text-xl sm:text-2xl" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">
          <FaUserCircle className="text-[#f5f5f5] text-3xl sm:text-4xl" />
          <div className="flex flex-col items-start text-sm sm:text-base">
            <h1 className="font-semibold tracking-wide">
              {userData.name || "TEST USER"}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {userData.role || "Role"}
            </p>
          </div>
          <IoLogOut
            onClick={handleLogout}
            className="text-[#f5f5f5] ml-2"
            size={32}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
