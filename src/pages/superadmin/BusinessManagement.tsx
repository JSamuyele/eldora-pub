import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import { FaPlus, FaBan, FaTrash, FaArrowLeft, FaEdit } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import { fetchAllBusinesses, createBusiness, updateBusiness, suspendBusiness, deleteBusiness } from "../../services/api";

type Business = { _id: string; name: string; location: string; status: 'Active' | 'Suspended'; createdAt: string; commissionRate: number; };
type FormInputs = { name: string; location: string; commissionRate: number };

const BusinessManagement: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    const { data: businesses = [], isLoading } = useQuery<Business[]>({ 
        queryKey: ['businesses'], 
        queryFn: fetchAllBusinesses
    });
    
    const { register, handleSubmit, reset, setValue } = useForm<FormInputs>();

    const mutationOptions = {
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
            setIsModalOpen(false);
            reset();
            setSelectedBusiness(null);
            enqueueSnackbar(res?.message || "Success!", { variant: 'success' });
        },
        onError: (e: any) => enqueueSnackbar(e?.response?.data?.message || "Action failed", { variant: "error" })
    };

    const createMutation = useMutation({ mutationFn: createBusiness, ...mutationOptions });
    const updateMutation = useMutation({ 
        mutationFn: (data: FormInputs) => updateBusiness(selectedBusiness!._id, data), 
        ...mutationOptions 
    });
    const suspendMutation = useMutation({ mutationFn: suspendBusiness, ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: deleteBusiness, ...mutationOptions });

    const openAddModal = () => {
        setSelectedBusiness(null);
        reset({ name: '', location: '', commissionRate: 1.0 });
        setIsModalOpen(true);
    };
    
    const openEditModal = (business: Business) => {
        setSelectedBusiness(business);
        setValue('name', business.name);
        setValue('location', business.location);
        setValue('commissionRate', business.commissionRate);
        setIsModalOpen(true);
    };

    const onSubmit: SubmitHandler<FormInputs> = data => {
        const payload = { ...data, commissionRate: Number(data.commissionRate) };
        if (selectedBusiness) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const inputClass = "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400";

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                        <FaArrowLeft /> Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold">Business Management</h1>
                        <p className="text-[#ababab]">Register and manage all businesses.</p>
                    </div>
                </div>
                <button onClick={openAddModal} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-300 transition"><FaPlus/> Create Business</button>
            </div>
            
            <div className="bg-[#2b2b2b] rounded-lg shadow p-4 overflow-x-auto">
                {isLoading ? <p>Loading businesses...</p> : (
                    <table className="w-full text-left text-sm">
                        <thead><tr className="border-b border-gray-600 text-gray-300">
                            <th className="p-3">Name</th><th className="p-3">Location</th><th className="p-3">Commission (%)</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3">Actions</th>
                        </tr></thead>
                        <tbody>
                            {businesses.map((b: Business) => (
                                <tr key={b._id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-3 text-gray-200">{b.name}</td>
                                    <td className="p-3 text-gray-200">{b.location}</td>
                                    <td className="p-3 font-semibold text-yellow-300">{b.commissionRate.toFixed(2)}%</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${b.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{b.status}</span></td>
                                    <td className="p-3 text-gray-200">{new Date(b.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 flex gap-4">
                                        <button onClick={() => openEditModal(b)} className="text-blue-400 hover:text-blue-300" title="Edit"><FaEdit /></button>
                                        <button onClick={() => suspendMutation.mutate({ businessId: b._id })} className="text-yellow-400 hover:text-yellow-300" title={b.status === 'Active' ? 'Suspend' : 'Activate'}><FaBan /></button>
                                        <button onClick={() => deleteMutation.mutate({ businessId: b._id })} className="text-red-500 hover:text-red-400" title="Delete"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedBusiness ? 'Edit Business' : 'Create New Business'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input {...register("name", { required: true })} placeholder="Business Name" className={inputClass} />
                    <input {...register("location", { required: true })} placeholder="Location" className={inputClass} />
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Commission Rate (%)</label>
                        <input type="number" step="0.01" {...register("commissionRate", { required: true, valueAsNumber: true })} placeholder="e.g., 1.5" className={inputClass} />
                    </div>
                    <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition">
                        {selectedBusiness ? 'Update Business' : 'Create Business'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default BusinessManagement;
