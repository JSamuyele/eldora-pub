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

  #  {/* SEARCH */}
  # <div className="flex items-center gap-3 bg-[#1f1f1f] rounded-[12px] px-3 py-1 sm:px-5 sm:py-2 w-full sm:w-[400px]">
    #  <FaSearch className="text-[#f5f5f5] text-sm sm:text-base" />
    #  <input type="text" placeholder="Search" className="input bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full text-sm sm:text-base" /> </div>

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
