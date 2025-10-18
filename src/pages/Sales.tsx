import React, { useEffect, useState, useMemo } from "react";
import { FaEdit, FaTrash, FaUserPlus, FaArrowLeft, FaPrint } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "../components/ui/Modal";
import { getSalesTransactions, createSalesTransaction, updateSalesTransaction, deleteSalesTransaction, getInventory } from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { RootState } from "../redux/store";

type Transaction = {
    _id: string;
    name: string;
    tableId: string;
    total: number;
    orders: OrderItem[];
    phone?: string;
    chairs?: number;
    payment?: 'Cash' | 'Card' | 'Mobile';
    createdAt: string; 
    status: 'Open' | 'Paid' | 'Cancelled' | 'Pending Payment';
};

type InventoryItem = {
    _id: string;
    name: string;
    price: number;
};

type OrderItem = {
    item: string;
    qty: number;
    unitPrice: number;
};

type FormInputs = {
    name: string;
    phone: string;
    tableId: string;
    chairs: number;
    payment: 'Cash' | 'Card' | 'Mobile';
    orders: OrderItem[];
};

const Sales: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useSelector((state: RootState) => state.user);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const { register, handleSubmit, reset } = useForm<FormInputs>();
    const [orderItems, setOrderItems] = useState<OrderItem[]>([{ item: '', qty: 1, unitPrice: 0 }]);

    useEffect(() => {
        document.title = "POS | Sales";
    }, []);

    const { data: transactions = [] } = useQuery<Transaction[]>({
        queryKey: ["sales"],
        queryFn: getSalesTransactions,
    });
    
    const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
        queryKey: ["inventory"],
        queryFn: getInventory,
    });

    const salesChartData = useMemo(() => {
        const dailySales: { [key: string]: number } = {};
        transactions.forEach(txn => {
            const date = new Date(txn.createdAt).toISOString().split('T')[0];
            dailySales[date] = (dailySales[date] || 0) + txn.total;
        });

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
    
        return last7Days.map(dateStr => ({
            name: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sales: dailySales[dateStr] || 0,
        }));
    }, [transactions]);

    const topItemsChartData = useMemo(() => {
        const itemCounts: { [key: string]: number } = {};
        transactions.forEach(txn => {
            if (txn.orders) {
                txn.orders.forEach(order => {
                    itemCounts[order.item] = (itemCounts[order.item] || 0) + order.qty;
                });
            }
        });

        return Object.entries(itemCounts)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    }, [transactions]);

    const handleCloseModal = () => {
        setIsAddOpen(false);
        setSelectedTransaction(null);
        reset();
        setOrderItems([{ item: '', qty: 1, unitPrice: 0 }]);
    };
    
    const printReceipt = (txn: Transaction) => {
        const receiptContent = `
            <html>
                <head>
                    <title>Receipt - ${txn._id}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; color: #000; background-color: #fff; }
                        .container { width: 300px; margin: auto; }
                        h2 { text-align: center; margin: 0; font-size: 16px; }
                        p { margin: 2px 0; font-size: 12px; }
                        hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th, td { text-align: left; padding: 2px 0; }
                        .total { font-weight: bold; font-size: 14px; text-align: right; }
                        .text-center { text-align: center; }
                        .item-col { width: 150px; }
                        .qty-col, .price-col, .sub-col { width: 50px; text-align: right; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Eldora Royal Pub & Events</h2>
                        <p class="text-center">Accra, Ghana</p>
                        <hr />
                        <p><strong>Receipt ID:</strong> ${txn._id.slice(-6).toUpperCase()}</p>
                        <p><strong>Date:</strong> ${new Date(txn.createdAt).toLocaleString()}</p>
                        <p><strong>Customer:</strong> ${txn.name}</p>
                        ${txn.tableId ? `<p><strong>Table:</strong> ${txn.tableId}</p>` : ''}
                        <hr />
                        <table>
                            <thead>
                                <tr>
                                    <th class="item-col">Item</th>
                                    <th class="qty-col">Qty</th>
                                    <th class="price-col">Price</th>
                                    <th class="sub-col">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${txn.orders.map(order => `
                                    <tr>
                                        <td class="item-col">${order.item}</td>
                                        <td class="qty-col">${order.qty}</td>
                                        <td class="price-col">${order.unitPrice.toFixed(2)}</td>
                                        <td class="sub-col">${(order.qty * order.unitPrice).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <hr />
                        <p class="total">TOTAL: GHS ${txn.total.toFixed(2)}</p>
                        <p>Payment: ${txn.payment || 'N/A'}</p>
                        <hr />
                        <p class="text-center">Thank you for your patronage!</p>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=320,height=500');
        if (printWindow) {
            printWindow.document.write(receiptContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };


    const addMutation = useMutation({
        mutationFn: createSalesTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            handleCloseModal();
            enqueueSnackbar("Transaction created successfully!", { variant: "success" });
        },
        onError: (error: any) => {
            enqueueSnackbar(error?.response?.data?.message || "Failed to create transaction", { variant: "error" });
        },
    });

    const editMutation = useMutation({
        mutationFn: (updatedTxn: any) => updateSalesTransaction(selectedTransaction!._id, updatedTxn),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            handleCloseModal();
            enqueueSnackbar("Transaction updated successfully!", { variant: "success" });
        },
        onError: (error: any) => {
            enqueueSnackbar(error?.response?.data?.message || "Failed to update transaction", { variant: "error" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSalesTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            enqueueSnackbar("Transaction deleted.", { variant: "info" });
        }
    });

    const handleDeleteTransaction = (id: string) => {
        if (role !== 'admin') {
            enqueueSnackbar("You are not authorized to perform this action.", { variant: "error" });
            return;
        }
        if (window.confirm("Are you sure you want to delete this transaction? This action is irreversible.")) {
            deleteMutation.mutate(id);
        }
    };

    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        const total = orderItems.reduce((sum, o) => sum + o.qty * o.unitPrice, 0);
        const now = new Date();
        const payload = {
            ...data,
            orders: orderItems.filter(o => o.item && o.qty > 0),
            total,
            source: "Bar Sales",
            status: "Open",
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            day: now.toLocaleDateString('en-US', { weekday: 'short' }),
        };

        if (selectedTransaction) {
            editMutation.mutate(payload);
        } else {
            addMutation.mutate(payload);
        }
    };

    const openAddModal = () => {
        setSelectedTransaction(null);
        reset({ name: '', phone: '', tableId: '', chairs: 0, payment: 'Cash' });
        setOrderItems([{ item: '', qty: 1, unitPrice: 0 }]);
        setIsAddOpen(true);
    };

    const openEditModal = (txn: Transaction) => {
        setSelectedTransaction(txn);
        reset({
            name: txn.name,
            phone: txn.phone || '',
            tableId: txn.tableId,
            chairs: txn.chairs || 0,
            payment: txn.payment || 'Cash',
        });
        setOrderItems(txn.orders.length > 0 ? txn.orders : [{ item: '', qty: 1, unitPrice: 0 }]);
        setIsAddOpen(true);
    };
    
    const inputClass = "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400 border border-transparent focus:border-yellow-400";

    const addItemRow = () => setOrderItems([...orderItems, { item: "", qty: 1, unitPrice: 0 }]);
    const removeItemRow = (index: number) => setOrderItems(orderItems.filter((_, i) => i !== index));
    const updateItemField = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...orderItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setOrderItems(newItems);
    };

    const handleItemChange = (index: number, itemName: string) => {
        const selectedItem = inventoryItems.find(inv => inv.name === itemName);
        const newItems = [...orderItems];
        newItems[index] = {
            ...newItems[index],
            item: itemName,
            unitPrice: selectedItem ? selectedItem.price : 0,
        };
        setOrderItems(newItems);
    };
    
    const total = orderItems.reduce((sum, o) => sum + (o.qty || 0) * (o.unitPrice || 0), 0);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    <FaArrowLeft /> Back
                  </button>
                  <div>
                    <h1 className="text-2xl font-semibold">Sales Dashboard</h1>
                    <p className="text-[#ababab]">Review sales transactions and performance.</p>
                  </div>
                </div>
                <button onClick={openAddModal} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-300 transition">
                    <FaUserPlus /> Add Order
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#2b2b2b] p-4 rounded-lg">
                    <h3 className="mb-2 font-semibold">Last 7 Days Sales</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={salesChartData}>
                            <XAxis dataKey="name" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #4a4a4a' }} />
                            <Legend />
                            <Line type="monotone" dataKey="sales" stroke="#FFD700" name="Sales (GHS)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-[#2b2b2b] p-4 rounded-lg">
                    <h3 className="mb-2 font-semibold">Top Selling Items (Units)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={topItemsChartData}>
                            <XAxis dataKey="name" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #4a4a4a' }} />
                            <Legend />
                            <Bar dataKey="sales" fill="#FFD700" name="Units Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-[#2b2b2b] rounded-lg shadow p-4 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-300 border-b border-gray-700">
                            <th className="p-3">Customer Name</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Table</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Total (GHS)</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((txn) => (
                            <tr key={txn._id} className="border-b border-gray-700 hover:bg-gray-800">
                                <td className="p-3 text-gray-200">{txn.name}</td>
                                <td className="p-3 text-gray-200">{new Date(txn.createdAt).toLocaleString()}</td>
                                <td className="p-3 text-gray-200">{txn.tableId || 'N/A'}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    txn.status === 'Paid' ? 'bg-green-600 text-white' : 
                                    txn.status === 'Pending Payment' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}>
                                    {txn.status}
                                  </span>
                                </td>
                                <td className="p-3 font-medium text-gray-200">{txn.total.toFixed(2)}</td>
                                <td className="p-3 flex gap-4 items-center">
                                    <button onClick={() => openEditModal(txn)} className="text-blue-400 hover:text-blue-300" title="Edit"><FaEdit /></button>
                                    <button onClick={() => printReceipt(txn)} title="Print Receipt" className="text-green-400 hover:text-green-300"><FaPrint /></button>
                                    {role === 'admin' && (
                                        <button onClick={() => handleDeleteTransaction(txn._id)} className="text-red-500 hover:text-red-400" title="Delete"><FaTrash /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Modal isOpen={isAddOpen} onClose={handleCloseModal} title={selectedTransaction ? `Editing Order for ${selectedTransaction.name}` : "Add New Order"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register("name", { required: true })} placeholder="Customer Name" className={inputClass} />
                        <input {...register("phone")} placeholder="Phone Number" className={inputClass} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input {...register("tableId")} placeholder="Table ID" className={inputClass} />
                        <input type="number" {...register("chairs", {valueAsNumber: true})} placeholder="Chairs" className={inputClass} />
                    </div>
                     <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        <h4 className="text-gray-300 font-semibold sticky top-0 bg-[#2b2b2b] py-1">Order Items</h4>
                        {orderItems.map((order, index) => {
                          const subtotal = (order.qty || 0) * (order.unitPrice || 0);
                          return (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-[#1f1f1f] p-2 rounded-lg">
                                  <div className="col-span-4">
                                      <label className="text-xs text-gray-400">Item</label>
                                      <select value={order.item} onChange={(e) => handleItemChange(index, e.target.value)} className={`${inputClass} !p-2 text-sm`}>
                                          <option value="">Select Item</option>
                                          {inventoryItems.map((inv) => <option key={inv._id} value={inv.name}>{inv.name}</option>)}
                                      </select>
                                  </div>
                                  <div className="col-span-2">
                                      <label className="text-xs text-gray-400">Qty</label>
                                      <input type="number" min="1" value={order.qty} onChange={(e) => updateItemField(index, "qty", Number(e.target.value))} placeholder="Qty" className={`${inputClass} !p-2 text-sm text-center`} />
                                  </div>
                                  <div className="col-span-2">
                                      <label className="text-xs text-gray-400">Price</label>
                                      <input type="number" min="0" step="0.01" value={order.unitPrice} onChange={(e) => updateItemField(index, "unitPrice", Number(e.target.value))} placeholder="Price" className={`${inputClass} !p-2 text-sm`} />
                                  </div>
                                  <div className="col-span-3">
                                      <label className="text-xs text-gray-400">Subtotal</label>
                                      <div className="h-10 flex items-center justify-end pr-2 text-white font-medium">
                                          {subtotal.toFixed(2)}
                                      </div>
                                  </div>
                                  <div className="col-span-1 flex items-end h-full">
                                      <button type="button" onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-400 h-10 w-full flex items-center justify-center bg-[#2b2b2b] rounded-md"><FaTrash/></button>
                                  </div>
                            </div>
                          );
                        })}
                         <button type="button" onClick={addItemRow} className="text-yellow-400 text-sm font-semibold mt-2">+ Add Item</button>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                        <h3 className="text-lg font-bold text-right">Total: GHS {total.toFixed(2)}</h3>
                    </div>
                    <select {...register("payment", { required: true })} className={inputClass}>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Mobile">Mobile Money</option>
                    </select>
                    <button type="submit" disabled={addMutation.isPending || editMutation.isPending} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-lg transition disabled:bg-gray-600">
                        {addMutation.isPending || editMutation.isPending ? "Saving..." : "Save Transaction"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Sales;
