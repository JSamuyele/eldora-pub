import React, { useState, useMemo, useRef } from 'react';
import { FaArrowLeft, FaPrint, FaFileInvoiceDollar, FaReceipt, FaCalculator } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSalesByDateRange } from '../services/api';

type Transaction = {
    _id: string;
    name: string;
    total: number;
    orders: { item: string; qty: number; unitPrice: number }[];
    payment?: string;
    status: string;
    createdAt: string;
};

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-[#2b2b2b] p-5 rounded-xl flex items-center gap-4">
        <div className="text-3xl text-yellow-400 p-3 bg-gray-800 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const Reports: React.FC = () => {
    const navigate = useNavigate();
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const setPresetRange = (preset: 'today' | '7d' | '30d') => {
        const to = new Date();
        const from = new Date();
        if (preset === '7d') {
            from.setDate(to.getDate() - 6);
        } else if (preset === '30d') {
            from.setDate(to.getDate() - 29);
        }
        setDateRange({
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0],
        });
        setIsModalOpen(false); // Close modal after selection
    };

    const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
        queryKey: ['salesReport', dateRange],
        queryFn: () => getSalesByDateRange({ startDate: dateRange.from, endDate: dateRange.to }),
        enabled: !!dateRange.from && !!dateRange.to,
    });

    const kpis = useMemo(() => {
        const totalRevenue = transactions.reduce((acc, txn) => acc + txn.total, 0);
        const totalTransactions = transactions.length;
        const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        return { totalRevenue, totalTransactions, avgTransaction };
    }, [transactions]);
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6">
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-section, #print-section * {
                        visibility: visible;
                    }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                        background-color: white;
                        color: black;
                    }
                    .no-print {
                        display: none;
                    }
                    .print-header {
                        display: block !important;
                    }
                    #print-section .bg-\\[\\#2b2b2b\\] {
                        background-color: #f8f9fa !important;
                        color: black !important;
                        border: 1px solid #dee2e6;
                    }
                     #print-section .text-white, #print-section .text-gray-300, #print-section .text-gray-400, #print-section .text-yellow-400 {
                        color: black !important;
                    }
                    #print-section table, #print-section th, #print-section td {
                        border-color: #dee2e6 !important;
                    }
                }
                `}
            </style>
            <div className="no-print flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                        <FaArrowLeft /> Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold">Sales Reports</h1>
                        <p className="text-[#ababab]">Analyze sales performance over time.</p>
                    </div>
                </div>
                <button onClick={handlePrint} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-300 transition">
                    <FaPrint /> Print Report
                </button>
            </div>

            <div className="no-print bg-[#2b2b2b] p-4 rounded-lg mb-6 flex items-center gap-4 flex-wrap">
                <span className="font-semibold">Date Range:</span>
                <button onClick={() => setIsModalOpen(true)} className="px-3 py-1 text-sm rounded-full bg-gray-700 hover:bg-yellow-400 hover:text-black transition">Select Period</button>
                <div className="flex items-center gap-2">
                    <input type="date" value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} className="bg-[#1f1f1f] p-1 rounded-md text-sm" />
                    <span>to</span>
                    <input type="date" value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} className="bg-[#1f1f1f] p-1 rounded-md text-sm" />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
                    <div className="bg-[#2b2b2b] p-5 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4">Select a Period</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPresetRange('today')} className="px-3 py-1 text-sm rounded-full bg-gray-700 hover:bg-yellow-400 hover:text-black transition">Today</button>
                            <button onClick={() => setPresetRange('7d')} className="px-3 py-1 text-sm rounded-full bg-gray-700 hover:bg-yellow-400 hover:text-black transition">Last 7 Days</button>
                            <button onClick={() => setPresetRange('30d')} className="px-3 py-1 text-sm rounded-full bg-gray-700 hover:bg-yellow-400 hover:text-black transition">Last 30 Days</button>
                        </div>
                    </div>
                </div>
            )}

            <div id="print-section" ref={reportContentRef}>
                <div className="print-header hidden p-4 border-b border-gray-600 mb-4">
                    <h1 className="text-2xl font-bold">Sales Report</h1>
                    <p>For period: {new Date(dateRange.from).toLocaleDateString()} to {new Date(dateRange.to).toLocaleDateString()}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <KPICard title="Total Revenue" value={`GHS ${kpis.totalRevenue.toFixed(2)}`} icon={<FaFileInvoiceDollar />}/>
                    <KPICard title="Total Transactions" value={kpis.totalTransactions} icon={<FaReceipt />}/>
                    <KPICard title="Avg. Transaction Value" value={`GHS ${kpis.avgTransaction.toFixed(2)}`} icon={<FaCalculator />}/>
                </div>

                <div className="bg-[#2b2b2b] rounded-lg shadow p-4 overflow-x-auto">
                    <h3 className="text-lg font-semibold mb-4 text-white">Transactions Details</h3>
                    {isLoading ? <p>Loading report data...</p> : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-300 border-b border-gray-700">
                                    <th className="p-3">Date/Time</th>
                                    <th className="p-3">Customer Name</th>
                                    <th className="p-3">Items</th>
                                    <th className="p-3">Payment</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Total (GHS)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(txn => (
                                    <tr key={txn._id} className="border-b border-gray-700 hover:bg-gray-800">
                                        <td className="p-3 text-gray-200">{new Date(txn.createdAt).toLocaleString()}</td>
                                        <td className="p-3 text-gray-200">{txn.name}</td>
                                        <td className="p-3 text-gray-200">{txn.orders.map(o => `${o.qty}x ${o.item}`).join(', ')}</td>
                                        <td className="p-3 text-gray-200">{txn.payment || 'N/A'}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${txn.status === 'Paid' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>{txn.status}</span></td>
                                        <td className="p-3 text-right font-medium text-gray-200">{txn.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center p-6 text-gray-500">No transactions found for the selected period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
