
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, User, UserRole } from '../types';

const initialState: UserState = {
  _id: '',
  name: '',
  email: '',
  phone: '',
  role: '' as UserRole,
  token: '',
  tenantId: '',
  businessId: '',
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state._id = action.payload._id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.tenantId = action.payload.tenantId;
      state.businessId = action.payload.businessId;
      state.isAuthenticated = true;
      if(action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    },
    removeUser: (state) => {
      state._id = '';
      state.name = '';
      state.email = '';
      state.phone = '';
      state.role = '' as UserRole;
      state.token = '';
      state.tenantId = '';
      state.businessId = '';
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
