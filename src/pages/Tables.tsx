import React, { useState } from "react";
import { FaChair, FaUser, FaArrowLeft } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, clearTable } from "../services/api";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Modal from "../components/ui/Modal";

// --- TYPE DEFINITIONS ---
type OpenOrder = {
    _id: string;
    tableId?: string;
    name?: string;
    chairs?: number;
    createdAt: string;
};

type TableData = {
    tableId: string;
    name: string;
    chairs: number;
    status: 'Occupied' | 'Available';
    orderId: string | null;
    createdAt?: string;
};

// --- UI COMPONENTS ---
const Card: React.FC<{ label: string; value: string | number; icon: React.ReactElement }> = ({ label, value, icon }) => (
  <div className="bg-[#2b2b2b] p-4 rounded-lg shadow flex items-center gap-4">
    <div className="text-2xl text-yellow-400">{icon}</div>
    <div>
      <h3 className="text-sm text-gray-400">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const TableCard: React.FC<{ table: TableData, onClear: (table: TableData) => void, userRole: string }> = ({ table, onClear, userRole }) => {
    const isOccupied = table.status === 'Occupied';
    const canManage = userRole === 'admin' || userRole === 'manager';

    return (
        <div className={`p-4 rounded-lg shadow-lg border-2 flex flex-col justify-between min-h-[160px] transition-all duration-300 ${
            isOccupied 
            ? 'bg-red-900/50 border-red-600' 
            : 'bg-green-900/50 border-green-600'
        }`}>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-bold flex items-center gap-2"><FaChair /> Table {table.tableId.slice(1)}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isOccupied ? 'bg-red-500' : 'bg-green-500'}`}>
                        {table.status}
                    </span>
                </div>
                {isOccupied && (
                    <div className="text-sm text-gray-300">
                        <p><span className="font-semibold">Customer:</span> {table.name}</p>
                        <p><span className="font-semibold">Chairs:</span> {table.chairs}</p>
                        {table.createdAt && <p><span className="font-semibold">Time:</span> {new Date(table.createdAt).toLocaleString()}</p>}
                    </div>
                )}
            </div>
            {isOccupied && canManage && (
                <button 
                    onClick={() => onClear(table)}
                    className="mt-4 w-full bg-yellow-400 text-black font-bold py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors"
                >
                    Clear Table
                </button>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
const Tables: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useSelector((state: RootState) => state.user);
  const [isClearModalOpen, setClearModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  const { data: openOrders = [], isLoading, isError } = useQuery<OpenOrder[]>({
    queryKey: ["tables"],
    queryFn: getTables,
    refetchInterval: 5000,
  });

  if (isError) {
    enqueueSnackbar("Failed to load table data", { variant: "error" });
  }
  
  const clearTableMutation = useMutation({
    mutationFn: clearTable,
    onSuccess: (response: any) => {
        enqueueSnackbar(response.data.message || 'Table cleared!', { variant: 'success' });
        queryClient.invalidateQueries({ queryKey: ['tables', 'sales'] });
        setClearModalOpen(false);
        setSelectedTable(null);
    },
    onError: (error: any) => {
        enqueueSnackbar(error?.response?.data?.message || 'Failed to clear table', { variant: 'error' });
    }
  });

  const handleOpenClearModal = (table: TableData) => {
    setSelectedTable(table);
    setClearModalOpen(true);
  };

  const handleConfirmClear = () => {
    if (selectedTable) {
      clearTableMutation.mutate({ tableId: selectedTable.tableId });
    }
  };

  const tablesMap = new Map<string, TableData>();
  for (const order of openOrders) {
      if (order.tableId) {
          tablesMap.set(order.tableId, {
              tableId: order.tableId,
              name: order.name || "Unknown",
              chairs: order.chairs || 4,
              status: "Occupied",
              orderId: order._id,
              createdAt: order.createdAt,
          });
      }
  }
  
  for (let i = 1; i <= 12; i++) {
    const tableId = `T${i}`;
    if (!tablesMap.has(tableId)) {
        tablesMap.set(tableId, { tableId, name: '---', chairs: 4, status: 'Available', orderId: null });
    }
  }

  const tables = Array.from(tablesMap.values()).sort((a,b) => parseInt(a.tableId.slice(1)) - parseInt(b.tableId.slice(1)));
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'Occupied').length;
  const availableTables = totalTables - occupiedTables;
  const totalChairs = tables.reduce((sum, t) => sum + t.chairs, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <FaArrowLeft /> Back
              </button>
              <div>
                  <h1 className="text-2xl font-semibold">Table Management</h1>
                  <p className="text-[#ababab]">Live view of table statuses.</p>
              </div>
          </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card label="Total Tables" value={totalTables} icon={<FaChair />} />
          <Card label="Available" value={availableTables} icon={<FaChair />} />
          <Card label="Occupied" value={occupiedTables} icon={<FaUser />} />
          <Card label="Total Chairs" value={totalChairs} icon={<FaChair />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading && openOrders.length === 0 ? <p>Loading tables...</p> : 
            tables.map(table => (
              <TableCard key={table.tableId} table={table} onClear={handleOpenClearModal} userRole={role}/>
            ))
        }
      </div>

      <Modal isOpen={isClearModalOpen} onClose={() => setClearModalOpen(false)} title="Confirm Action">
        <div className="text-center">
            <p className="text-lg mb-6">Are you sure you want to clear table <span className="font-bold text-yellow-400">{selectedTable && `Table ${selectedTable.tableId.slice(1)}`}</span>? This will complete the current order.</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => setClearModalOpen(false)} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition">Cancel</button>
                <button onClick={handleConfirmClear} disabled={clearTableMutation.isPending} className="px-6 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-semibold transition disabled:bg-gray-500">
                    {clearTableMutation.isPending ? 'Clearing...' : 'Yes, Clear Table'}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tables;
