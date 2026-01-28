import React from 'react';

import awardsImage from '../assets/img/blog_mecca-1-DP2_-W20.webp';

const Awards = () => {
  return (
    <div className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 font-lexend mb-6">A results driven agency</h2>
                    <div className="space-y-4 text-gray-600 font-lexend leading-relaxed mb-8">
                        <p>We know awards aren't the be all and end all.</p>
                        <p>But we're proud of what we've achieved and the quality of work our team produces for our clients.</p>
                        <p>We've won awards across all of our departments, with some key highlights including:</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-lexend">First Large Social Agency (2023, 2024)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-lexend">First Direct Response Campaign</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-lexend">First Integrated Paid Media Campaign</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-lexend">First Use of Facebook &amp; Instagram Ads</span>
                        </div>
                    </div>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-black text-white px-8 py-3 font-lexend mt-8">Learn More
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-5 h-5 ml-2">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
                <div>
                    <img alt="Phone with social media" loading="lazy" width="600" height="400" decoding="async" data-nimg="1" className="rounded-lg" src={awardsImage} style={{color: "transparent"}} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default Awards;