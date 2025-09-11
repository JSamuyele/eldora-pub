import React, { useState } from "react";
import { register } from "../../https/index";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

const Register = ({ setIsRegister }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle role selection
  const handleRoleSelection = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  // Mutation for registration
  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message || "Registration successful!", {
        variant: "success",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
      });

      // Close registration form after short delay
      setTimeout(() => {
        setIsRegister(false);
      }, 1500);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-[#1f1f1f] rounded-lg shadow-lg">
      <h2 className="text-2xl text-white font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Employee Name
          </label>
          <div className="flex items-center rounded-lg p-3 bg-[#2a2a2a]">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter employee name"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[#ababab] mb-2 mt-4 text-sm font-medium">
            Employee Email
          </label>
          <div className="flex items-center rounded-lg p-3 bg-[#2a2a2a]">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter employee email"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[#ababab] mb-2 mt-4 text-sm font-medium">
            Employee Phone
          </label>
          <div className="flex items-center rounded-lg p-3 bg-[#2a2a2a]">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter employee phone"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[#ababab] mb-2 mt-4 text-sm font-medium">
            Password
          </label>
          <div className="flex items-center rounded-lg p-3 bg-[#2a2a2a]">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-[#ababab] mb-2 mt-4 text-sm font-medium">
            Choose your role
          </label>
          <div className="flex items-center gap-3 mt-2">
            {["Waiter", "Cashier", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelection(role)}
                className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] ${
                  formData.role === role ? "bg-indigo-700 text-white" : ""
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition-colors"
          disabled={registerMutation.isLoading}
        >
          {registerMutation.isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Register;
