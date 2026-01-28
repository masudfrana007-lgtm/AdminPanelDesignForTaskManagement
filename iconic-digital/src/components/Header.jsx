import React from 'react';

import logo from '../assets/img/final-logo.webp';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 max-h-[92px] relative">
      <div className="flex items-center justify-between">
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center">
                  <img alt="ICONIC DIGITAL Logo" width="200" height="60" decoding="async" data-nimg="1" className="h-12 sm:h-16 w-auto" src={logo} style={{color: 'transparent'}} />
              </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <button className="justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-800 h-9 rounded-md px-3 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
                      <path d="M5 21h14"></path>
                  </svg>
                  <span>Member Level</span>
              </button>
              <button className="justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-800 h-9 rounded-md px-3 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <path d="M12 17h.01"></path>
                  </svg>
                  <span>Help</span>
              </button>
              <button className="justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-800 h-9 rounded-md px-3 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span>Support</span>
              </button>
              <button className="justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-800 h-9 rounded-md px-3 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" x2="3" y1="12" y2="12"></line>
                  </svg>
                  <span>Login</span>
              </button>
          </div>
          <div className="md:hidden">
              <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-800 h-9 rounded-md p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <line x1="4" x2="20" y1="12" y2="12"></line>
                      <line x1="4" x2="20" y1="6" y2="6"></line>
                      <line x1="4" x2="20" y1="18" y2="18"></line>
                  </svg>
              </button>
          </div>
      </div>
    </header>
  );
};

export default Header;