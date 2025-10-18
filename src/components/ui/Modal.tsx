// pos-frontend/src/components/ui/Modal.tsx
import React, { ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#2b2b2b] rounded-xl shadow-lg w-full max-w-lg p-6 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-yellow-400">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" title="Close">
            <FaTimes size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
       <style>
        {`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
};

export default Modal;
