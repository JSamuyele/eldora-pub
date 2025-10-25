
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './shared/Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full flex flex-col h-screen bg-[#1f1f1f] text-white">
        <Header />
        <main className="flex-grow overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
