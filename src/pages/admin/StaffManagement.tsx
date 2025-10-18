import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { FaPlus, FaBan, FaTrash, FaArrowLeft } from 'react-icons/fa';
import Modal from "../../components/ui/Modal";
import { fetchStaffForBusiness, createStaffUser, suspendUser, deleteUser } from "../../services/api";
import { RootState } from "../../redux/store";

type User = { _id: string; name: string; email: string; role: string; status: string; };
type FormInputs = { name: string; email: string; password: any; role: 'manager' | 'cashier' | 'waitress' };
type UsersQueryResponse = { users: User[], totalPages: number };

const StaffManagement: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { businessId, role } = useSelector((state: RootState) => state.user);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading } = useQuery<UsersQueryResponse>({
        queryKey: ['staff', businessId],
        queryFn: fetchStaffForBusiness,
        enabled: !!businessId,
    });
    
    const { register, handleSubmit, reset } = useForm<FormInputs>();

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            setIsModalOpen(false);
            reset();
            enqueueSnackbar('Action successful!', { variant: 'success' });
        },
        onError: (e: any) => enqueueSnackbar(e?.response?.data?.message || "Action failed", { variant: "error" })
    };

    const createMutation = useMutation({ 
      mutationFn: createStaffUser,
      ...mutationOptions 
    });
    const suspendMutation = useMutation({ mutationFn: suspendUser, ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: deleteUser, ...mutationOptions });

    const onSubmit: SubmitHandler<FormInputs> = data => createMutation.mutate(data);
    
    const staff = data?.users || [];
    const inputClass = "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400";

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    <FaArrowLeft /> Back
                  </button>
                  <div>
                    <h1 className="text-2xl font-semibold">Staff Management</h1>
                    <p className="text-gray-400">Manage your employees for this business.</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-300 transition"><FaPlus/> Add Staff</button>
            </div>
            
            <div className="bg-[#2b2b2b] rounded-lg shadow p-4 overflow-x-auto">
                {isLoading && !data ? <p>Loading staff...</p> : staff.length === 0 ? <p className="text-center text-gray-400 py-4">No staff members found.</p> : (
                    <table className="w-full text-left text-sm">
                        <thead><tr className="border-b border-gray-600 text-gray-300">
                            <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Actions</th>
                        </tr></thead>
                        <tbody>
                            {staff.map((user: User) => (
                                <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-3 text-gray-200">{user.name}</td>
                                    <td className="p-3 text-gray-200">{user.email}</td>
                                    <td className="p-3 capitalize text-gray-200">{user.role}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{user.status}</span></td>
                                    <td className="p-3 flex gap-4">
                                        <button onClick={() => suspendMutation.mutate({ userId: user._id })} className="text-yellow-400 hover:text-yellow-300" title={user.status === 'Active' ? 'Suspend' : 'Activate'}><FaBan /></button>
                                        {role === 'admin' && (
                                            <button onClick={() => deleteMutation.mutate({ userId: user._id })} className="text-red-500 hover:text-red-400" title="Delete"><FaTrash /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Staff Member">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input {...register("name", { required: true })} placeholder="Full Name" className={inputClass} />
                    <input type="email" {...register("email", { required: true })} placeholder="Email Address" className={inputClass} />
                    <input type="password" {...register("password", { required: true })} placeholder="Password" className={inputClass} />
                    <select {...register("role", { required: true })} className={inputClass}>
                      <option value="">Select Role</option>
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                      <option value="waitress">Waitress</option>
                    </select>
                    <button type="submit" disabled={createMutation.isPending} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition">
                      {createMutation.isPending ? 'Creating...' : 'Create Staff Member'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default StaffManagement;
