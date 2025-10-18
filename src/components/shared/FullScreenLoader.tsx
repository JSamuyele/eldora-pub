
import React from 'react';

const FullScreenLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#212121] flex items-center justify-center z-50">
      <style>
        {`
          .spinner {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            padding: 6px;
            background: conic-gradient(from 180deg at 50% 50%, #1f1f1f 0deg, #1f1f1f 180deg, #FFD700 360deg) 
                          0 0 / 100% 100%, 
                        radial-gradient(farthest-side at 50% 50%, #0000 0%, #0000 0%) 
                          0 0 / 100% 100%;
            animation: spin 1s infinite linear;
          }

          @keyframes spin {
            100% {
              transform: rotate(1turn);
            }
          }
        `}
      </style>
      <div className="spinner"></div>
    </div>
  );
};

export default FullScreenLoader;
