import React from 'react';

const Certificate = () => {
  return (
    <div className="py-20 px-6 bg-yellow-50">
        <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-xl">📄</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 font-lexend">Certificate of Incorporation</h2>
            </div>
            <p className="text-gray-600 font-lexend mb-8 max-w-3xl mx-auto leading-relaxed">View our official Certificate of Incorporation issued by Companies House. This document verifies our status as a registered private limited company in accordance with the Companies Act 2006.</p>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-red-500 hover:bg-red-600 text-white px-8 py-3 font-lexend">View Document
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-right w-5 h-5 ml-2">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                </svg>
            </button>
        </div>
    </div>
  );
};

export default Certificate;