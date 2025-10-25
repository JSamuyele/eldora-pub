//src/services/api.ts


const API_URL = import.meta.env.VITE_API_BASE_URL;




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

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        // Mimic Axios error structure for consistent error handling in components
        const error: any = new Error(data.message || 'An error occurred');
        error.response = { data };
        throw error;
    }

    return data;
};


// --- User/Auth ---
export const login = (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const register = (data: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const getUserData = () => apiFetch('/auth/profile');
export const logout = () => {
    // Logout is a client-side action
    localStorage.removeItem('token');
    return Promise.resolve({ message: 'Logged out' });
};
export const updateUserProfile = (data: any) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }).then(res => res.data);
export const changePassword = (data: any) => apiFetch('/auth/profile/password', { method: 'PUT', body: JSON.stringify(data) });

// --- Inventory ---
export const getInventory = () => apiFetch('/inventory').then(res => res.data);
export const addInventoryItem = (item: any) => apiFetch('/inventory', { method: 'POST', body: JSON.stringify(item) });
export const updateInventoryItem = (id: string, updatedItem: any) => apiFetch(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(updatedItem) });
export const deleteInventoryItem = (id: string) => apiFetch(`/inventory/${id}`, { method: 'DELETE' });

// --- Sales/Transactions/Orders ---
export const getSalesTransactions = (params?: { period?: '7d' | '30d' }) => {
    let endpoint = '/transactions';
    if (params?.period) {
        endpoint += `?period=${params.period}`;
    }
    return apiFetch(endpoint).then(res => res.data);
};
export const createSalesTransaction = (txn: any) => apiFetch('/transactions', { method: 'POST', body: JSON.stringify(txn) });
export const updateSalesTransaction = (id: string, updatedTxn: any) => apiFetch(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(updatedTxn) });
export const deleteSalesTransaction = (id: string) => apiFetch(`/transactions/${id}`, { method: 'DELETE' });
export const processOrderPayment = (id: string, paymentData: any) => apiFetch(`/transactions/${id}/pay`, { method: 'POST', body: JSON.stringify(paymentData) });
export const getSalesByDateRange = (dateRange: any) => apiFetch('/transactions/reports', { method: 'POST', body: JSON.stringify(dateRange) }).then(res => res.data);

// --- Dashboard ---
export const fetchDashboardData = (params: any) => apiFetch(`/dashboard/admin?period=${params.period}`).then(res => res.data);
export const fetchSuperAdminDashboardData = () => apiFetch('/dashboard/superadmin').then(res => res.data);

// --- Tables ---
export const getTables = () => apiFetch('/tables').then(res => res.data);
export const clearTable = (data: any) => apiFetch('/tables/clear', { method: 'PUT', body: JSON.stringify(data) });

// --- Payments ---
export const initiateMomoPayment = (paymentData: { amount: number; phone: string; transactionId: string; }) => apiFetch('/payments/initiate-momo', { method: 'POST', body: JSON.stringify(paymentData) });
export const checkPaymentStatus = (transactionId: string) => apiFetch(`/payments/status/${transactionId}`);

// --- Events ---
export const getEvents = () => apiFetch('/events').then(res => res.data);
export const createEvent = (data: any) => apiFetch('/events', { method: 'POST', body: JSON.stringify(data) });
export const updateEvent = (id: string, data: any) => apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEvent = (id: string) => apiFetch(`/events/${id}`, { method: 'DELETE' });
export const getEventTransactions = () => getSalesTransactions().then(txns => txns.filter((t: any) => t.source === 'Event Sales')); // Mocked for now as backend doesn't differentiate yet
// Fix: The mocked function was returning { data: [...] } instead of just [...], causing a type mismatch in useQuery. Added .then(res => res.data) for consistency.
export const getEventRevenue = () => apiFetch('/dashboard/events/revenue').then(res => res.data);

// --- Super Admin ---
export const fetchAllBusinesses = () => apiFetch('/businesses').then(res => res.data);
export const createBusiness = (data: any) => apiFetch('/businesses', { method: 'POST', body: JSON.stringify(data) });
export const updateBusiness = (id: string, data: any) => apiFetch(`/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const suspendBusiness = ({ businessId }: any) => apiFetch(`/businesses/${businessId}/status`, { method: 'PUT' });
export const deleteBusiness = ({ businessId }: any) => apiFetch(`/businesses/${businessId}`, { method: 'DELETE' });
export const fetchAllUsers = ({ page = 1 }: any) => apiFetch(`/users?page=${page}`).then(res => res.data);
export const createUser = (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: string, data: any) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const suspendUser = ({ userId }: any) => apiFetch(`/users/${userId}/status`, { method: 'PUT' });
export const deleteUser = ({ userId }: any) => apiFetch(`/users/${userId}`, { method: 'DELETE' });

// --- Staff ---
export const fetchStaffForBusiness = () => apiFetch('/staff').then(res => res.data);
export const createStaffUser = (data: any) => apiFetch('/staff', { method: 'POST', body: JSON.stringify(data) });

// --- Notifications ---
export const getNotifications = () => apiFetch('/notifications').then(res => res.data.data); // Backend has double `data` nesting for this route
