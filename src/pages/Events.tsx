import React, { useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "../components/ui/Modal";
import { getEventTransactions, getEventRevenue, deleteSalesTransaction, createSalesTransaction, getInventory } from "../services/api";
import { useForm, SubmitHandler } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import { RootState } from "../redux/store";

const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#a78bfa"];

type EventTransaction = {
  _id: string;
  eventType: string;
  eventName: string;
  item: string;
  qty: number;
  unitPrice: number;
  total: number;
  payment: string;
  time: string;
  createdAt: string;
};
type EventRevenue = { name: string; value: number };
type InventoryItem = { _id: string; name: string };
type FormInputs = { eventType: string; eventName: string; item: string; qty: number; unitPrice: number; payment: string };

const Events: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useSelector((state: RootState) => state.user);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormInputs>();

  const { data: eventTxns = [] } = useQuery<EventTransaction[]>({ 
      queryKey: ["eventTxns"], 
      queryFn: getEventTransactions 
  });
  
  const { data: eventRevenue = [] } = useQuery<EventRevenue[]>({ 
      queryKey: ["eventRevenue"], 
      queryFn: getEventRevenue 
  });
  
  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({ 
      queryKey: ["inventory"], 
      queryFn: getInventory 
  });

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventTxns', 'eventRevenue', 'sales'] }),
    onError: (e: any) => enqueueSnackbar(e?.response?.data?.message || "Action failed", { variant: "error" })
  };

  const deleteMutation = useMutation({ mutationFn: deleteSalesTransaction, ...mutationOptions });

  const handleDeleteEventTransaction = (id: string) => {
    if (role !== 'admin') {
        enqueueSnackbar("You are not authorized to perform this action.", { variant: "error" });
        return;
    }
    if (window.confirm("Are you sure you want to delete this event transaction? This action is irreversible.")) {
        deleteMutation.mutate(id);
    }
  };

  const addMutation = useMutation({ mutationFn: createSalesTransaction, ...mutationOptions, 
    onSuccess: () => {
      mutationOptions.onSuccess();
      setIsAddOpen(false);
      reset();
      enqueueSnackbar("Transaction added!", { variant: "success" });
    }
  });
  
  const handleAddSubmit: SubmitHandler<FormInputs> = (data) => {
    const payload = {
        ...data,
        total: data.qty * data.unitPrice,
        source: "Event Sales",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    addMutation.mutate(payload);
  };
  
  const totalRevenue = eventTxns.reduce((s, t) => s + t.total, 0);
  const totalTransactions = eventTxns.length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <FaArrowLeft /> Back
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Event Sales Dashboard</h1>
            <p className="text-[#ababab]">Track sales and revenue from events.</p>
          </div>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-300 transition"><FaPlus /> Add Transaction</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2b2b2b] p-4 rounded-xl"><h3 className="text-gray-400">Total Transactions</h3><p className="text-2xl font-semibold">{totalTransactions}</p></div>
        <div className="bg-[#2b2b2b] p-4 rounded-xl"><h3 className="text-gray-400">Total Revenue</h3><p className="text-2xl font-semibold">GHS {totalRevenue.toFixed(2)}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#2b2b2b] p-4 rounded-xl"><h2 className="font-semibold mb-3">Revenue by Event Type</h2><ResponsiveContainer width="100%" height={250}><BarChart data={eventRevenue}><XAxis dataKey="name" stroke="#ccc" /><YAxis stroke="#ccc" /><Tooltip /><Legend /><Bar dataKey="value" fill="#60a5fa" name="Revenue"/></BarChart></ResponsiveContainer></div>
        <div className="bg-[#2b2b2b] p-4 rounded-xl"><h2 className="font-semibold mb-3">Sales Breakdown</h2><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={eventRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>{eventRevenue.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>

      <div className="bg-[#2b2b2b] rounded-xl p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-3">Event Transactions</h2>
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-gray-600 text-gray-300"><th className="p-2">Event</th><th className="p-2">Item</th><th className="p-2">Total</th><th className="p-2">Payment</th><th className="p-2">Date & Time</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {eventTxns.map((t) => <tr key={t._id} className="border-b border-gray-700 hover:bg-gray-800"><td className="p-2 text-gray-200">{t.eventName || t.eventType}</td><td className="p-2 text-gray-200">{t.qty}x {t.item}</td><td className="p-2 text-gray-200">GHS {t.total.toFixed(2)}</td><td className="p-2 text-gray-200">{t.payment}</td><td className="p-2 text-gray-200">{new Date(t.createdAt).toLocaleString()}</td><td className="p-2">{role === 'admin' && (<button onClick={() => handleDeleteEventTransaction(t._id)} className="text-red-400 hover:text-red-300"><FaTrash /></button>)}</td></tr>)}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Event Transaction">
        <form onSubmit={handleSubmit(handleAddSubmit)} className="space-y-4">
            <select {...register("eventType", { required: true })} className="w-full p-3 bg-[#1f1f1f] rounded-lg text-white"><option value="">Event Type</option><option>Wedding</option><option>Corporate</option><option>Birthday</option><option>Other</option></select>
            <input {...register("eventName")} placeholder="Event Name (Optional)" className="w-full p-3 bg-[#1f1f1f] rounded-lg text-white"/>
            <select {...register("item", { required: true })} className="w-full p-3 bg-[#1f1f1f] rounded-lg text-white"><option value="">Select Item</option>{inventoryItems.map(i => <option key={i._id} value={i.name}>{i.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" {...register("qty", { required: true, valueAsNumber: true, min: 1 })} placeholder="Quantity" className="w-full p-3 bg-[#1f1f1f] rounded-lg text-white" />
              <input type="number" {...register("unitPrice", { required: true, valueAsNumber: true, min: 0 })} placeholder="Unit Price" step="0.01" className="w-full p-3 bg-[#1f1f1f] rounded-lg text-white" />
            </div>
            <select {...register("payment", { required: true })} className="w-full p-3 bg-[#1f1f1f] rounded-lg text-white"><option value="">Payment Method</option><option>Cash</option><option>Mobile</option></select>
            <button type="submit" disabled={addMutation.isPending} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition">Add Transaction</button>
        </form>
      </Modal>
    </div>
  );
};

export default Events;
