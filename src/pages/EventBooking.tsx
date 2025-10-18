import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaMoneyBillWave } from "react-icons/fa";
import Modal from "../components/ui/Modal";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvents, createEvent, updateEvent, deleteEvent, initiateMomoPayment, checkPaymentStatus } from "../services/api";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { UserRole } from "../types";

type Event = {
  _id: string;
  eventName: string;
  eventDate: string;
  clientName: string;
  clientPhone: string;
  status: 'Booked' | 'Completed' | 'Cancelled';
  notes?: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
};

type FormInputs = Omit<Event, '_id' | 'amountPaid' | 'paymentStatus'>;
type PhonePaymentInputs = { phone: string };

const EventBooking: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { role } = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isPhonePaymentModalOpen, setPhonePaymentModalOpen] = useState(false);
  const [isMomoPaymentModalOpen, setMomoPaymentModalOpen] = useState(false);
  const [momoPaymentStatus, setMomoPaymentStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [momoTransactionId, setMomoTransactionId] = useState<string | null>(null);
  
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const { register, handleSubmit, reset, setValue } = useForm<FormInputs>();
  const { register: registerPhone, handleSubmit: handlePhoneSubmit, reset: resetPhone } = useForm<PhonePaymentInputs>();

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      reset();
      setIsModalOpen(false);
      setSelectedEvent(null);
      setPhonePaymentModalOpen(false);
      setMomoPaymentModalOpen(false);
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "An error occurred", { variant: "error" });
    }
  };

  const addMutation = useMutation({ mutationFn: createEvent, ...mutationOptions });
  const editMutation = useMutation({ 
    mutationFn: (updatedEvent: FormInputs) => updateEvent(selectedEvent!._id, updatedEvent),
    ...mutationOptions 
  });
  const deleteMutation = useMutation({ mutationFn: deleteEvent, ...mutationOptions });

  const paymentMutation = useMutation({
    mutationFn: (paymentData: { amount: number }) => updateEvent(selectedEvent!._id, { 
        amountPaid: (selectedEvent?.amountPaid || 0) + paymentData.amount,
        paymentStatus: ((selectedEvent?.amountPaid || 0) + paymentData.amount) >= selectedEvent!.totalAmount ? 'Paid' : 'Partially Paid'
    }),
    ...mutationOptions
  });

  const phonePaymentMutation = useMutation({
    mutationFn: (data: { phone: string }) => {
        const transactionId = selectedEvent!._id;
        setMomoTransactionId(transactionId);
        return initiateMomoPayment({
            amount: selectedEvent!.totalAmount - selectedEvent!.amountPaid,
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

  const { data: paymentData, isError: isPaymentError } = useQuery({
    queryKey: ['paymentStatus', momoTransactionId],
    queryFn: () => checkPaymentStatus(momoTransactionId!),
    enabled: isMomoPaymentModalOpen && momoPaymentStatus === 'PENDING' && !!momoTransactionId,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (isPaymentError) {
        setMomoPaymentStatus('FAILED');
    }
    if (paymentData) {
        if (paymentData.status === 'SUCCESS') {
            setMomoPaymentStatus('SUCCESS');
            paymentMutation.mutate({ amount: selectedEvent!.totalAmount - selectedEvent!.amountPaid });
        } else if (paymentData.status === 'FAILED') {
            setMomoPaymentStatus('FAILED');
        }
    }
  }, [paymentData, isPaymentError, paymentMutation]);
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event booking?")) {
      deleteMutation.mutate(id);
    }
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setValue("eventName", event.eventName);
    setValue("eventDate", new Date(event.eventDate).toISOString().substring(0, 10));
    setValue("clientName", event.clientName);
    setValue("clientPhone", event.clientPhone);
    setValue("status", event.status);
    setValue("notes", event.notes);
    setValue("totalAmount", event.totalAmount);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedEvent(null);
    reset();
    setIsModalOpen(true);
  };

  const openPhonePaymentModal = (event: Event) => {
    setSelectedEvent(event);
    resetPhone();
    setPhonePaymentModalOpen(true);
  };

  const onPhonePaymentSubmit: SubmitHandler<PhonePaymentInputs> = (data) => {
    phonePaymentMutation.mutate(data);
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (selectedEvent) {
      editMutation.mutate(data);
    } else {
      addMutation.mutate(data);
    }
  };

  const inputClass = "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400 border border-transparent focus:border-yellow-400";
  const buttonPrimary = "w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-3 rounded-lg transition";

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'Booked': return 'bg-blue-500';
        case 'Completed': return 'bg-green-500';
        case 'Cancelled': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
        case 'Paid': return 'bg-green-500';
        case 'Partially Paid': return 'bg-yellow-500';
        case 'Unpaid': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <FaArrowLeft /> Back
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Event Booking Management</h1>
            <p className="text-[#ababab]">Schedule and manage all your events.</p>
          </div>
        </div>
        <button onClick={openAddModal} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <FaPlus /> Book New Event
        </button>
      </div>

      <div className="bg-[#2b2b2b] rounded-lg shadow p-4 overflow-x-auto">
        {isLoading ? <p>Loading events...</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-300 border-b border-gray-700">
                <th className="p-3">Event Name</th>
                <th className="p-3">Client</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-3 text-gray-200">{event.eventName}</td>
                  <td className="p-3 text-gray-200">
                    <div>{event.clientName}</div>
                    <div className="text-xs text-gray-400">{event.clientPhone}</div>
                  </td>
                  <td className="p-3 font-medium text-gray-200">{new Date(event.eventDate).toLocaleDateString()}</td>
                  <td className="p-3 font-medium text-gray-200">GHS {event.totalAmount.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs text-white rounded-full ${getPaymentStatusColor(event.paymentStatus)}`}>
                        {event.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-4">
                    <button onClick={() => openEditModal(event)} className="text-blue-400 hover:text-blue-300" title="Edit Event"><FaEdit /></button>
                     {event.paymentStatus !== 'Paid' && (
                        <button onClick={() => openPhonePaymentModal(event)} className="text-green-400 hover:text-green-300" title="Make Payment"><FaMoneyBillWave /></button>
                    )}
                    {role === UserRole.ADMIN && (
                      <button onClick={() => handleDelete(event._id)} className="text-red-500 hover:text-red-400" title="Delete Event"><FaTrash /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEvent ? "Edit Event Booking" : "Book New Event"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input {...register("eventName", { required: true })} placeholder="Event Name" className={inputClass} />
          <input type="date" {...register("eventDate", { required: true })} className={inputClass} />
          <input {...register("clientName", { required: true })} placeholder="Client Name" className={inputClass} />
          <input {...register("clientPhone", { required: true })} placeholder="Client Phone" className={inputClass} />
          <select {...register("status", { required: true })} className={inputClass}>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input type="number" {...register("totalAmount", { required: true, valueAsNumber: true, min: 0 })} placeholder="Total Amount (GHS)" className={inputClass} />
          <textarea {...register("notes")} placeholder="Notes (optional)" className={`${inputClass} h-24`} />
          <button type="submit" className={buttonPrimary}>{selectedEvent ? "Update Booking" : "Save Booking"}</button>
        </form>
      </Modal>

       {/* Pay by Phone Modal */}
      <Modal isOpen={isPhonePaymentModalOpen} onClose={() => setPhonePaymentModalOpen(false)} title={`Request Payment for ${selectedEvent?.eventName}`}>

        {selectedEvent && (
          <form onSubmit={handlePhoneSubmit(onPhonePaymentSubmit)} className="space-y-4">

              <p className="text-gray-300">Enter the customer's mobile money number to send a payment request for the outstanding amount of <span className="font-bold text-yellow-400">GHS {(selectedEvent.totalAmount - selectedEvent.amountPaid).toFixed(2)}</span>.</p>

              <input {...registerPhone("phone", { required: "Phone number is required." })} placeholder="Customer Phone Number" className={inputClass} />

              <button type="submit" disabled={phonePaymentMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-600">

                  {phonePaymentMutation.isPending ? 'Sending...' : 'Send Payment Request'}

              </button>

          </form>

        )}
      </Modal>

      {/* Mobile Money Payment Status Modal */}
      <Modal isOpen={isMomoPaymentModalOpen} onClose={() => setMomoPaymentModalOpen(false)} title="Mobile Money Payment">

        {selectedEvent && (
          <div className="text-center p-4">

              {momoPaymentStatus === 'PENDING' && (

                  <div>

                      <p className="text-lg text-gray-300 mb-4">Awaiting payment approval...</p>

                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>

                      <p className="text-sm text-gray-500 mt-4">Ask customer to enter their PIN to approve the payment of <span className="font-bold text-yellow-400">GHS {(selectedEvent.totalAmount - selectedEvent.amountPaid).toFixed(2)}</span>.</p>

                  </div>

              )}

              {momoPaymentStatus === 'SUCCESS' && (

                  <div>

                      <p className="text-2xl font-bold text-green-400 mb-4">Payment Successful!</p>

                      <p className="text-gray-300">The event has been marked as paid.</p>

                  </div>

              )}

              {momoPaymentStatus === 'FAILED' && (

                  <div>

                      <p className="text-2xl font-bold text-red-500 mb-4">Payment Failed</p>

                      <p className="text-gray-300">The payment was not approved or timed out. Please try again.</p>

                  </div>

              )}

          </div>

        )}
      </Modal>
    </div>
  );
};

export default EventBooking;