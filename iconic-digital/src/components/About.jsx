import React from 'react';

import phoneInHands from '../assets/img/group_of_people-CZccBVdx.webp';

const About = () => {
  return (
    <div className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 font-lexend mb-16 text-center">We are Iconic Digital. Award-winning creative &amp; performance marketing agency.</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <img alt="Phone in hands" loading="lazy" width="600" height="400" decoding="async" data-nimg="1" className="rounded-lg" src={phoneInHands} style={{color: "transparent"}} />
                </div>
                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 font-lexend mb-6">We blend creative and performance</h3>
                    <div className="space-y-4 text-gray-600 font-lexend leading-relaxed">
                        <p>There aren't many creative agencies that understand performance and performance agencies that understand creative.</p>
                        <p>This is where we're different.</p>
                        <p>Whether we're helping to grow your Social communities, deliver performance-driven Paid Media, produce social-first Creative or Influencer campaigns - we craft strategies based on your brand, business and goals all backed by data and insight.</p>
                    </div>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-black text-white px-8 py-3 font-lexend mt-8">See Our Services
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-5 h-5 ml-2"><path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default About;