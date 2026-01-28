import React from 'react';

import backgroundImage from '../assets/img/group_of_people-CZccBVdx.webp';
import phoneImage from '../assets/img/blog_mecca-1-DP2_-W20.webp';

export const Campaign = () => {
  return (
<div className="py-20 px-6 relative">
    <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${backgroundImage})`}}>
        <div className="absolute inset-0 bg-black/50"></div>
    </div>
    <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="bg-blue-600 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-white font-lexend mb-6">We are here to make a difference</h2>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-white text-blue-600 px-8 py-3 font-lexend">Launch Campaign
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-5 h-5 ml-2">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                </svg>
            </button>
        </div>
        <div>
            <img alt="Phone with social media" loading="lazy" width="600" height="400" decoding="async" data-nimg="1" className="rounded-lg" src={phoneImage} style={{color: "transparent"}} />
        </div>
    </div>
</div>
    );
};

export default Campaign;