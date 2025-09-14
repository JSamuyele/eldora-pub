import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      const { data } = res;
      const { _id, name, email, phone, role } = data.data;
      dispatch(setUser({ _id, name, email, phone, role }));
      navigate("/");
      enqueueSnackbar("Login successful!", { variant: "success" });
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto mt-10 px-4 sm:px-6">
      <div className="bg-[#1f1f1f] p-6 sm:p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#ababab] mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-[#777] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#ababab] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-[#777] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-yellow-400 text-gray-900 font-bold text-base hover:bg-yellow-500 transition-colors"
            disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
