const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '';

// Centralized API fetch function
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}/api/v1${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error: any = new Error(data.message || 'An error occurred');
    error.response = { data };
    throw error;
  }

  return data.data || data;
};

// --- User/Auth ---
export const login = (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const register = (data: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const getUserData = () => apiFetch('/auth/profile');
export const logout = () => {
  localStorage.removeItem('token');
  return Promise.resolve({ message: 'Logged out' });
};
export const updateUserProfile = (data: any) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
export const changePassword = (data: any) => apiFetch('/auth/profile/password', { method: 'PUT', body: JSON.stringify(data) });

// --- Inventory ---
export const getInventory = () => apiFetch('/inventory');
export const addInventoryItem = (item: any) => apiFetch('/inventory', { method: 'POST', body: JSON.stringify(item) });
export const updateInventoryItem = (id: string, updatedItem: any) => apiFetch(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(updatedItem) });
export const deleteInventoryItem = (id: string) => apiFetch(`/inventory/${id}`, { method: 'DELETE' });

// --- Sales/Transactions/Orders ---
export const getSalesTransactions = (params?: { period?: '7d' | '30d' }) => {
  let endpoint = '/transactions';
  if (params?.period) {
    endpoint += `?period=${params.period}`;
  }
  return apiFetch(endpoint);
};
export const createSalesTransaction = (txn: any) => apiFetch('/transactions', { method: 'POST', body: JSON.stringify(txn) });
export const updateSalesTransaction = (id: string, updatedTxn: any) => apiFetch(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(updatedTxn) });
export const deleteSalesTransaction = (id: string) => apiFetch(`/transactions/${id}`, { method: 'DELETE' });
export const processOrderPayment = (id: string, paymentData: any) => apiFetch(`/transactions/${id}/pay`, { method: 'POST', body: JSON.stringify(paymentData) });
export const getSalesByDateRange = (dateRange: any) => apiFetch('/transactions/reports', { method: 'POST', body: JSON.stringify(dateRange) });

// --- Dashboard ---
export const fetchDashboardData = (params: any) => apiFetch(`/dashboard/admin?period=${params.period}`);
export const fetchSuperAdminDashboardData = () => apiFetch('/dashboard/superadmin');

// --- Tables ---
export const getTables = () => apiFetch('/tables');
export const clearTable = (data: any) => apiFetch('/tables/clear', { method: 'PUT', body: JSON.stringify(data) });

// --- Payments ---
export const initiateMomoPayment = (paymentData: { amount: number; phone: string; transactionId: string }) =>
  apiFetch('/payments/initiate-momo', { method: 'POST', body: JSON.stringify(paymentData) });
export const checkPaymentStatus = (transactionId: string) => apiFetch(`/payments/status/${transactionId}`);

// --- Events ---
export const getEvents = () => apiFetch('/events');
export const createEvent = (data: any) => apiFetch('/events', { method: 'POST', body: JSON.stringify(data) });
export const updateEvent = (id: string, data: any) => apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEvent = (id: string) => apiFetch(`/events/${id}`, { method: 'DELETE' });
export const getEventTransactions = () => getSalesTransactions().then(txns => txns.filter((t: any) => t.source === 'Event Sales'));
export const getEventRevenue = () => apiFetch('/dashboard/events/revenue');

// --- Super Admin ---
export const fetchAllBusinesses = () => apiFetch('/businesses');
export const createBusiness = (data: any) => apiFetch('/businesses', { method: 'POST', body: JSON.stringify(data) });
export const updateBusiness = (id: string, data: any) => apiFetch(`/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const suspendBusiness = ({ businessId }: any) => apiFetch(`/businesses/${businessId}/status`, { method: 'PUT' });
export const deleteBusiness = ({ businessId }: any) => apiFetch(`/businesses/${businessId}`, { method: 'DELETE' });
export const fetchAllUsers = ({ page = 1 }: any) => apiFetch(`/users?page=${page}`);
export const createUser = (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: string, data: any) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const suspendUser = ({ userId }: any) => apiFetch(`/users/${userId}/status`, { method: 'PUT' });
export const deleteUser = ({ userId }: any) => apiFetch(`/users/${userId}`, { method: 'DELETE' });

// --- Staff ---
export const fetchStaffForBusiness = () => apiFetch('/staff');
export const createStaffUser = (data: any) => apiFetch('/staff', { method: 'POST', body: JSON.stringify(data) });

// --- Notifications ---
export const getNotifications = () => apiFetch('/notifications');
