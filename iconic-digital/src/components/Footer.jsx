import React from 'react';

import logoImage from '../assets/img/final-logo.webp';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <img alt="Iconic Digital Logo" loading="lazy" width="120" height="40" decoding="async" data-nimg="1" className="h-8 w-auto" src={logoImage} />
                    </div>
                    <p className="text-gray-400 font-lexend text-sm">©2024 Iconic Digital. All rights reserved.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold font-lexend mb-4">Our Services</h3>
                    <ul className="space-y-2 font-lexend">
                        <li>
                            <a className="text-gray-300 hover:text-white" href="/services">Social</a>
                        </li>
                        <li>
                            <a className="text-gray-300 hover:text-white" href="/services">Paid</a>
                        </li>
                        <li>
                            <a className="text-gray-300 hover:text-white" href="/services">Creative</a>
                        </li>
                        <li>
                            <a className="text-gray-300 hover:text-white" href="/services">Influencer</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold font-lexend mb-4">Company</h3>
                    <ul className="space-y-2 font-lexend">
                        <li>
                            <a className="text-gray-300 hover:text-white" href="/services">Services</a>
                        </li>
                        <li>
                            <a className="text-gray-300 hover:text-white" href="/campaign">Start Campaign</a>
                        </li>
                        <li>
                            <a className="text-gray-300 hover:text-white" href="/account">Account</a>
                        </li>
                        <li>
                            <a className="text-gray-300 hover:text-white" href="/certification">Certification</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold font-lexend mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className ="text-white text-sm">f</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">i</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">in</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">t</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;