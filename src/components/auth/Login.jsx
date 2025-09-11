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

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Mutation for login
  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      const { data } = res;
      console.log("Login success:", data);
      const { _id, name, email, phone, role } = data.data;
      dispatch(setUser({ _id, name, email, phone, role }));
      navigate("/"); // Redirect after successful login
      enqueueSnackbar("Login successful!", { variant: "success" });
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-[#1f1f1f] rounded-lg shadow-lg">
      <h2 className="text-2xl text-white font-bold mb-6 text-center">Sign In</h2>
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
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

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition-colors"
          disabled={loginMutation.isLoading}
        >
          {loginMutation.isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
