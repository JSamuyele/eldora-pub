
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSalesTransactions } from '../../services/api';
import FullScreenLoader from '../shared/FullScreenLoader';

interface ReportModalProps {
  period: '7d' | '30d';
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ period, onClose }) => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['salesReport', period],
    queryFn: () => getSalesTransactions({ period }),
  });

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div className="bg-[#2b2b2b] p-5 rounded-xl w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Sales Report - Last {period === '7d' ? '7' : '30'} Days
          </h3>
          <button onClick={onClose} className="text-white">
            &times;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#1f1f1f] rounded-lg">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Transaction ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Total</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((txn: any) => (
                <tr key={txn._id} className="border-b border-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-300">{txn._id}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{new Date(txn.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">GHS {txn.total.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{txn.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
