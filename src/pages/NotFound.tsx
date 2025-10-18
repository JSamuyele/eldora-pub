
import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapSigns } from 'react-icons/fa';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#212121] text-white p-6">
      <FaMapSigns className="text-yellow-400 text-6xl mb-4" />
      <h1 className="text-5xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-300 mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-400 mb-6 text-center">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-300 transition-colors">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
