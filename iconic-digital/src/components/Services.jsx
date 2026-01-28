import React from 'react';

const Services = () => {
  return (
    <div className="py-20 px-6 bg-red-600">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-bold text-white font-lexend">Our full-service offering...</h2>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-10 px-4 py-2 border-white text-white hover:bg-white hover:text-red-600 font-lexend">View all services
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-right w-4 h-4 ml-2">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="rounded-lg border text-card-foreground shadow-sm bg-black border-gray-700 p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl">📢</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white font-lexend mb-4">Influencer</h3>
                        <p className="text-white font-lexend mb-6 text-sm">We deliver brand awareness and direct-response Influencer &amp; Creator campaigns.</p>
                        <ul className="text-white font-lexend space-y-2 mb-6 text-sm">
                            <li>• End-to-end Campaign Management</li>
                            <li>• Brand Awareness and Direct Response Objectives</li>
                            <li>• Content Creators for UGC Content</li>
                            <li>• Reports &amp; Analysis</li>
                        </ul>
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 font-lexend">Initiate Campaign</button>
                    </div>
                </div>
                <div className="rounded-lg border text-card-foreground shadow-sm bg-black border-gray-700 p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl">📱</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white font-lexend mb-4">Social</h3>
                        <p className="text-white font-lexend mb-6 text-sm">We grow cult-like social communities with platform-specific social strategies.</p>
                        <ul className="text-white font-lexend space-y-2 mb-6 text-sm">
                            <li>• Social Strategy</li>
                            <li>• Channel and Community Management</li>
                            <li>• Social-first Content Creation</li>
                            <li>• Social Listening &amp; Insights</li>
                        </ul>
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 font-lexend">Initiate Campaign</button>
                    </div>
                </div>
                <div className="rounded-lg border text-card-foreground shadow-sm bg-black border-gray-700 p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl">🛒</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white font-lexend mb-4">Paid</h3>
                        <p className="text-white font-lexend mb-6 text-sm">We deliver performance-driven Paid Social and Paid Search campaigns.</p>
                        <ul className="text-white font-lexend space-y-2 mb-6 text-sm">
                            <li>• Paid Social &amp; Paid Search</li>
                            <li>• Full-Funnel Media Strategy</li>
                            <li>• Planning, Buying, Creative, Analytics, Testing and more</li>
                            <li>• Feed Optimisation &amp; Shopping</li>
                        </ul>
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 font-lexend">Initiate Campaign</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Services;