import React, { useState, useMemo } from "react";
import { FaPlus, FaEdit, FaArrowLeft, FaMoneyBillWave, FaTrash, FaMobileAlt } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "../components/ui/Modal";
import { getInventory, createSalesTransaction, updateSalesTransaction, getSalesTransactions, deleteSalesTransaction, processOrderPayment, initiateMomoPayment, checkPaymentStatus } from "../services/api";
import { enqueueSnackbar } from "notistack";
import { RootState } from "../redux/store";
import { UserRole } from "../types";

type Order = {
    _id: string;
    name: string;
    tableId: string;
    total: number;
    orders: OrderItem[];
    status: 'Open' | 'Paid' | 'Cancelled' | 'Pending Payment';
    createdAt: string;
};

type InventoryItem = { _id: string; name: string; price: number; stock: number };
type OrderItem = { item: string; qty: number; unitPrice: number };
type FormInputs = { name: string; tableId: string; orders: OrderItem[] };
type PhonePaymentInputs = { phone: string };
type PaymentInputs = { paymentMethod: 'Cash' | 'Card' | 'Mobile' };

const OrderCard: React.FC<{ order: Order; onEdit: (order: Order) => void; onPay: (order: Order) => void; onPayByPhone: (order: Order) => void; canPay: boolean; }> = ({ order, onEdit, onPay, onPayByPhone, canPay }) => (
    <div className="bg-[#2b2b2b] p-4 rounded-lg shadow flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-yellow-400">{order.tableId || 'Takeaway'}</h3>
                    <p className="text-sm text-gray-300">{order.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${
                    order.status === 'Open' ? 'bg-blue-500' :
                    order.status === 'Pending Payment' ? 'bg-orange-500' :
                    'bg-gray-500'
                }`}>{order.status}</span>
            </div>
            <ul className="text-sm text-gray-400 space-y-1 mb-3 max-h-24 overflow-y-auto">
                {order.orders && order.orders.map((item, i) => <li key={i}>{item.qty}x {item.item}</li>)}
            </ul>
        </div>
        <div>
            <p className="text-xl font-bold text-right mb-3">GHS {order.total.toFixed(2)}</p>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onEdit(order)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm" title="Edit Order">
                    <FaEdit />
                </button> 
                {canPay && (
                    <button onClick={() => onPayByPhone(order)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm" title="Pay by Phone">
                        <FaMobileAlt />
                    </button>
                )}
            </div>
            <div className="mt-2">
                {canPay && (
                    <button onClick={() => onPay(order)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                        <FaMoneyBillWave /> Settle Payment
                    </button>
                )}
            </div>
        </div>
    </div>
);


const Orders: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useSelector((state: RootState) => state.user);

    const [isOrderModalOpen, setOrderModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isPhonePaymentModalOpen, setPhonePaymentModalOpen] = useState(false);
    const [isConfirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
    const [isMomoPaymentModalOpen, setMomoPaymentModalOpen] = useState(false);
    const [momoPaymentStatus, setMomoPaymentStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED'>('IDLE');
    const [momoTransactionId, setMomoTransactionId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([{ item: '', qty: 1, unitPrice: 0 }]);
    
    const { register, handleSubmit, reset, setValue } = useForm<FormInputs>();
    const { register: registerPhonePayment, handleSubmit: handlePhonePaymentSubmit, reset: resetPhonePayment } = useForm<PhonePaymentInputs>();
    const { register: registerPayment, handleSubmit: handlePaymentSubmit } = useForm<PaymentInputs>();

    // --- DATA FETCHING ---
    const { data: allOrders = [] } = useQuery<Order[]>({
        queryKey: ["sales"],
        queryFn: getSalesTransactions,
    });
    const openOrders = allOrders.filter((o: Order) => o.status === 'Open');

    const availableTables = useMemo(() => {
        const occupiedTableIds = new Set(
            allOrders
                .filter(o => o.status === 'Open' && o.tableId && !o.tableId.toLowerCase().includes('takeaway'))
                .map(o => o.tableId)
        );
        const allTableIds = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
        
        // An order being edited should have its own table considered "available" in the dropdown
        const currentOrderTableId = selectedOrder?.tableId;
        return allTableIds.filter(id => !occupiedTableIds.has(id) || id === currentOrderTableId);
    }, [allOrders, selectedOrder]);

    const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({ queryKey: ["inventory"], queryFn: getInventory });
    
    // --- MUTATIONS ---
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales", "inventory", "tables"] });
            setOrderModalOpen(false);
            setPaymentModalOpen(false);
            setPhonePaymentModalOpen(false);
            setConfirmPaymentOpen(false);
            setSelectedOrder(null);
        },
        onError: (err: any) => enqueueSnackbar(err?.response?.data?.message || "An error occurred", { variant: 'error' }),
    };

    const paymentMutation = useMutation({ mutationFn: (data: PaymentInputs) => processOrderPayment(selectedOrder!._id, data), ...mutationOptions });

    const phonePaymentMutation = useMutation({
        mutationFn: (data: { phone: string }) => {
            const transactionId = selectedOrder!._id;
            setMomoTransactionId(transactionId);
            return initiateMomoPayment({
                amount: selectedOrder!.total,
                phone: data.phone,
                transactionId,
            });
        },
        onSuccess: () => {
            setPhonePaymentModalOpen(false);
            setMomoPaymentModalOpen(true);
            setMomoPaymentStatus('PENDING');
        },
        onError: (err: any) => enqueueSnackbar(err?.response?.data?.message || "Failed to initiate payment", { variant: 'error' }),
    });

    const addMutation = useMutation({ mutationFn: createSalesTransaction, ...mutationOptions });
    const editMutation = useMutation({ mutationFn: (data: any) => updateSalesTransaction(selectedOrder!._id, data), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: deleteSalesTransaction, ...mutationOptions });

    // --- POLLING FOR MOMO PAYMENT STATUS ---
    const { data: paymentData, isError: isPaymentError } = useQuery({
        queryKey: ['paymentStatus', momoTransactionId],
        queryFn: () => checkPaymentStatus(momoTransactionId!),
        enabled: isMomoPaymentModalOpen && momoPaymentStatus === 'PENDING' && !!momoTransactionId,
        refetchInterval: 3000, // Poll every 3 seconds
    });

    useEffect(() => {
        if (isPaymentError) {
            setMomoPaymentStatus('FAILED');
        }
        if (paymentData) {
            if (paymentData.status === 'SUCCESS') {
                setMomoPaymentStatus('SUCCESS');
                paymentMutation.mutate({ paymentMethod: 'Mobile' });
            } else if (paymentData.status === 'FAILED') {
                setMomoPaymentStatus('FAILED');
            }
        }
    }, [paymentData, isPaymentError, paymentMutation]);

    // --- MODAL & FORM HANDLERS ---
    const openAddModal = () => {
        setSelectedOrder(null);
        reset({ name: '', tableId: '' });
        setOrderItems([{ item: '', qty: 1, unitPrice: 0 }]);
        setOrderModalOpen(true);
    };

    const openEditModal = (order: Order) => {
        setSelectedOrder(order);
        setValue('name', order.name);
        setValue('tableId', order.tableId);
        setOrderItems(order.orders && order.orders.length ? order.orders : [{ item: '', qty: 1, unitPrice: 0 }]);
        setOrderModalOpen(true);
    };

    const handlePaymentConfirmation = (order: Order) => {
        setSelectedOrder(order);
        setConfirmPaymentOpen(true);
    };
    
    const openPhonePaymentModal = (order: Order) => {
        setSelectedOrder(order);
        resetPhonePayment({ phone: '' });
        setPhonePaymentModalOpen(true);
    };

    const proceedToPayment = () => {
        setConfirmPaymentOpen(false);
        setPaymentModalOpen(true);
    };

const onOrderSubmit: SubmitHandler<FormInputs> = (data) => {
    // Filter out invalid items
    const filteredOrders = orderItems
        .filter(o => o.item && o.qty > 0);

    // If no valid items, show error and abort
    if (filteredOrders.length === 0) {
        enqueueSnackbar("Please add at least one valid order item.", { variant: "error" });
        return;
    }
    
    const payload = {
        ...data,
        orders: filteredOrders.map(o => ({ item: o.item, qty: o.qty, unitPrice: o.unitPrice })),
        total,
        source: "Bar Sales",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // Add status when creating a new order
        ...(!selectedOrder && { status: 'Open' }),
    };

    if (selectedOrder) {
        editMutation.mutate(payload);
    } else {
        addMutation.mutate(payload);
    }
};
    
    const onPaymentSubmit: SubmitHandler<PaymentInputs> = (data) => {
        paymentMutation.mutate(data);
    };

    const onPhonePaymentSubmit: SubmitHandler<PhonePaymentInputs> = (data) => {
        phonePaymentMutation.mutate(data);
    };

    // --- ORDER ITEM MANAGEMENT ---
    const addItemRow = () => setOrderItems([...orderItems, { item: "", qty: 1, unitPrice: 0 }]);
    const removeItemRow = (index: number) => setOrderItems(orderItems.filter((_, i) => i !== index));
    const updateItemField = (index: number, field: keyof OrderItem, value: any) => {
        setOrderItems(currentItems => {
            const newItems = [...currentItems];
            newItems[index] = { ...newItems[index], [field]: value };
            return newItems;
        });
    };
    const handleItemChange = (index: number, itemName: string) => {
        const selectedItem = inventoryItems.find(inv => inv.name === itemName);
        setOrderItems(currentItems => {
            const newItems = [...currentItems];
            newItems[index] = { ...newItems[index], item: itemName, unitPrice: selectedItem?.price ?? 0 };
            return newItems;
        });
    };

    const total = useMemo(() => orderItems.reduce((sum, o) => sum + (o.qty || 0) * (o.unitPrice || 0), 0), [orderItems]);
    const canProcessPayment = role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.CASHIER;
    const inputClass = "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400";
    
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                 <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"><FaArrowLeft /> Back</button>
                  <div>
                    <h1 className="text-2xl font-semibold">Order Management</h1>
                    <p className="text-[#ababab]">Manage all active customer orders.</p>
                  </div>
                </div>
                <button onClick={openAddModal} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-300 transition"><FaPlus /> Create Order</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {openOrders.length > 0 ? openOrders.map((order) => (
                    <OrderCard key={order._id} order={order} onEdit={openEditModal} onPay={handlePaymentConfirmation} onPayByPhone={openPhonePaymentModal} canPay={canProcessPayment}/>
                )) : <p className="text-gray-400 col-span-full text-center py-8">No open orders.</p>}
            </div>

            {/* Create/Edit Order Modal */}
            <Modal isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} title={selectedOrder ? `Edit Order: ${selectedOrder.tableId}` : "Create New Order"}>
                <form onSubmit={handleSubmit(onOrderSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register("name", { required: "Customer Name is required." })} placeholder="Customer Name" className={inputClass} />
                        <select {...register("tableId", { required: "Table ID is required." })} className={inputClass}>
                            <option value="">Select Table...</option>
                            <option value="Takeaway">Takeaway</option>
                            {availableTables.map(tableId => (
                                <option key={tableId} value={tableId}>{tableId}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        <h4 className="text-gray-300 font-semibold sticky top-0 bg-[#2b2b2b] py-1">Order Items</h4>
                        {orderItems.map((_, index) => (
                           <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <select value={orderItems[index].item} onChange={(e) => handleItemChange(index, e.target.value)} className={`${inputClass} !p-2 text-sm col-span-5`}>
                                    <option value="">Select Item</option>
                                    {inventoryItems.map((inv) => <option key={inv._id} value={inv.name} disabled={inv.stock <= 0}>{inv.name} ({inv.stock} left)</option>)}
                                </select>
                                <input type="number" min="1" value={orderItems[index].qty} onChange={(e) => updateItemField(index, "qty", Number(e.target.value))} className={`${inputClass} !p-2 text-sm col-span-2 text-center`} />
                                <input type="number" min="0" step="0.01" value={orderItems[index].unitPrice} onChange={(e) => updateItemField(index, "unitPrice", Number(e.target.value))} className={`${inputClass} !p-2 text-sm col-span-3`} />
                                <button type="button" onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-400 h-10 w-full flex items-center justify-center bg-[#1f1f1f] rounded-md col-span-2"><FaTrash/></button>
                           </div>
                        ))}
                         <button type="button" onClick={addItemRow} className="text-yellow-400 text-sm font-semibold mt-2">+ Add Item</button>
                    </div>
                    <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
                        {selectedOrder && (
                             <button type="button" onClick={() => deleteMutation.mutate(selectedOrder._id)} className="text-red-500 font-semibold">Cancel Order</button>
                        )}
                        <h3 className="text-lg font-bold text-right ml-auto">Total: GHS {total.toFixed(2)}</h3>
                    </div>
                    <button type="submit" disabled={addMutation.isPending || editMutation.isPending} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg transition disabled:bg-gray-600">
                        {selectedOrder ? 'Update Order' : 'Place Order'}
                    </button>
                </form>
            </Modal>

            {/* Payment Confirmation Modal */}
            <Modal isOpen={isConfirmPaymentOpen} onClose={() => setConfirmPaymentOpen(false)} title="Confirm Payment">
                <div className="text-center">
                    <p className="text-lg text-gray-300 mb-6">
                        Are you sure you want to process the payment for{' '}
                        <span className="font-bold text-yellow-400">{selectedOrder?.tableId || selectedOrder?.name}</span>?
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setConfirmPaymentOpen(false)}
                            className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={proceedToPayment}
                            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Pay by Phone Modal */}
            <Modal isOpen={isPhonePaymentModalOpen} onClose={() => setPhonePaymentModalOpen(false)} title={`Request Payment for ${selectedOrder?.tableId}`}>
                <form onSubmit={handlePhonePaymentSubmit(onPhonePaymentSubmit)} className="space-y-4">
                    <p className="text-gray-300">Enter the customer's mobile money number to send a payment request.</p>
                    <input {...registerPhonePayment("phone", { required: "Phone number is required." })} placeholder="Customer Phone Number" className={inputClass} />
                    <button type="submit" disabled={phonePaymentMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-600">
                        {phonePaymentMutation.isPending ? 'Sending...' : 'Send Payment Request'}
                    </button>
                </form>
            </Modal>


            {/* Payment Modal */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} title={`Process Payment for ${selectedOrder?.tableId}`}>
                <form onSubmit={handlePaymentSubmit(onPaymentSubmit)}>
                    <div className="text-center my-4">
                        <p className="text-gray-400">Total Amount</p>
                        <p className="text-4xl font-bold text-yellow-400">GHS {selectedOrder?.total.toFixed(2)}</p>
                    </div>
                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                        <select id="paymentMethod" {...registerPayment("paymentMethod", { required: true })} className={inputClass}>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Mobile">Mobile Money</option>
                        </select>
                    </div>
                    <button type="submit" disabled={paymentMutation.isPending} className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-600">
                        {paymentMutation.isPending ? 'Processing...' : 'Confirm Payment'}
                    </button>
                </form>
            </Modal>

            {/* Mobile Money Payment Status Modal */}
            <Modal isOpen={isMomoPaymentModalOpen} onClose={() => setMomoPaymentModalOpen(false)} title="Mobile Money Payment">
                <div className="text-center p-4">
                    {momoPaymentStatus === 'PENDING' && (
                        <div>
                            <p className="text-lg text-gray-300 mb-4">Awaiting payment approval from customer...</p>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-4">Please ask the customer to enter their PIN on the prompt sent to their phone.</p>
                        </div>
                    )}
                    {momoPaymentStatus === 'SUCCESS' && (
                        <div>
                            <p className="text-2xl font-bold text-green-400 mb-4">Payment Successful!</p>
                            <p className="text-gray-300">The order has been marked as paid.</p>
                        </div>
                    )}
                    {momoPaymentStatus === 'FAILED' && (
                        <div>
                            <p className="text-2xl font-bold text-red-500 mb-4">Payment Failed</p>
                            <p className="text-gray-300">The payment was not approved or timed out. Please try again.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Orders;
