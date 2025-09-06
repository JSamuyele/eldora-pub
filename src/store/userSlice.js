import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "Jacob", // default fallback, can be replaced on login
  email: "",
  role: "admin",
  isAuthenticated: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.name = "";
      state.email = "";
      state.role = "";
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
