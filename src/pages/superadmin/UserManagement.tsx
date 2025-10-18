import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import { FaPlus, FaBan, FaTrash, FaArrowLeft, FaEdit } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import { fetchAllUsers, createUser, updateUser, suspendUser, deleteUser, fetchAllBusinesses } from "../../services/api";

type User = { _id: string; name: string; email: string; role: string; status: string; tenantId?: { name: string, _id: string } };
type Business = { _id: string; name: string; location: string };
type FormInputs = { name: string; email: string; password?: string; role: string; tenantId: string };
type UsersQueryResponse = { users: User[], totalPages: number };

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { data, isLoading } = useQuery<UsersQueryResponse>({
        queryKey: ['users', page],
        queryFn: () => fetchAllUsers({ page }),
        placeholderData: (previousData) => previousData,
    });
    const { data: businesses = [] } = useQuery<Business[]>({ 
        queryKey: ['businesses'], 
        queryFn: fetchAllBusinesses 
    });
    
    const { register, handleSubmit, reset, setValue } = useForm<FormInputs>();

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsModalOpen(false);
            reset();
            setSelectedUser(null);
            enqueueSnackbar("Action successful!", { variant: "success" });
        },
        onError: (e: any) => enqueueSnackbar(e?.response?.data?.message || "Action failed", { variant: "error" })
    };

    const createMutation = useMutation({ mutationFn: createUser, ...mutationOptions });
    const updateMutation = useMutation({
      mutationFn: (data: FormInputs) => updateUser(selectedUser!._id, data),
      ...mutationOptions,
    });
    const suspendMutation = useMutation({ mutationFn: suspendUser, ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: deleteUser, ...mutationOptions });

    const openAddModal = () => {
        setSelectedUser(null);
        reset({ name: '', email: '', password: '', role: 'admin', tenantId: '' });
        setIsModalOpen(true);
    };
    
    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setValue('name', user.name);
        setValue('email', user.email);
        setValue('role', user.role);
        setValue('tenantId', user.tenantId?._id || '');
        setIsModalOpen(true);
    };

    const onSubmit: SubmitHandler<FormInputs> = data => {
        if (selectedUser) {
            const payload = { ...data };
            if (!payload.password) {
                delete payload.password;
            }
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(data);
        }
    };
    
    const users = data?.users || [];
    const totalPages = data?.totalPages || 1;
    const inputClass = "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400";

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                        <FaArrowLeft /> Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold">User Management</h1>
                        <p className="text-[#ababab]">Create and manage all system users.</p>
                    </div>
                </div>
                <button onClick={openAddModal} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-300 transition"><FaPlus/> Create User</button>
            </div>
            
            <div className="bg-[#2b2b2b] rounded-lg shadow p-4 overflow-x-auto">
                {isLoading && !data ? <p>Loading users...</p> : (
                    <table className="w-full text-left text-sm">
                        <thead><tr className="border-b border-gray-600 text-gray-300">
                            <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Business</th><th className="p-3">Status</th><th className="p-3">Actions</th>
                        </tr></thead>
                        <tbody>
                            {users.map((user: User) => (
                                <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-3 text-gray-200">{user.name}</td>
                                    <td className="p-3 text-gray-200">{user.email}</td>
                                    <td className="p-3 capitalize text-gray-200">{user.role}</td>
                                    <td className="p-3 text-gray-200">{user.tenantId?.name || 'N/A'}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{user.status}</span></td>
                                    <td className="p-3 flex gap-4">
                                        <button onClick={() => openEditModal(user)} className="text-blue-400 hover:text-blue-300" title="Edit"><FaEdit/></button>
                                        <button onClick={() => suspendMutation.mutate({ userId: user._id })} className="text-yellow-400 hover:text-yellow-300" title={user.status === 'Active' ? 'Suspend' : 'Activate'}><FaBan /></button>
                                        <button onClick={() => deleteMutation.mutate({ userId: user._id })} className="text-red-500 hover:text-red-400" title="Delete"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex justify-center mt-4 gap-2">
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-50">Prev</button>
                <span className="p-2">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-50">Next</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedUser ? `Edit ${selectedUser.name}` : "Create New User"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input {...register("name", { required: true })} placeholder="Full Name" className={inputClass} />
                    <input type="email" {...register("email", { required: true })} placeholder="Email Address" className={inputClass} />
                    <input type="password" {...register("password", { required: !selectedUser })} placeholder={selectedUser ? "Leave blank to keep same" : "Password"} className={inputClass} />
                    <select {...register("role", { required: true })} className={inputClass}><option value="admin">Admin</option><option value="manager">Manager</option><option value="cashier">Cashier</option><option value="waitress">Waitress</option></select>
                    <select {...register("tenantId", { required: true })} className={inputClass}><option value="">Assign to Business</option>{businesses.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</select>
                    <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition">
                        {selectedUser ? "Update User" : "Create User"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
