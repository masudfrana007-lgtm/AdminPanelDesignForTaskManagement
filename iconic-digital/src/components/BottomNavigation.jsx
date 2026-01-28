import React, { useState } from 'react';
import homeIcon from '../assets/img/icons8-home.gif';
import servicesIcon from '../assets/img/icons8-services.gif';
import campaignIcon from '../assets/img/icons8-campaign-64.webp';
import historyIcon from '../assets/img/icons8-history-50.png';
import profileIcon from '../assets/img/icons8-profile-64.webp';

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const navigationItems = [
    {
      id: 'Home',
      label: 'Home',
      image: homeIcon,
      href: "/"
    },
    {
      id: 'Services',
      label: 'Services',
      image: servicesIcon,
      href: "/services"
    },
    {
      id: 'Campaign',
      label: 'Campaign',
      image: campaignIcon,
      href: "/campaign"
    },
    {
      id: 'History',
      label: 'History',
      image: historyIcon,
      href: "/history"
    },
    {
      id: 'Account',
      label: 'Account',
      image: profileIcon,
      href: "/account"
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white text-gray-900 py-2 px-4 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navigationItems.map((item) => (
          <a 
            key={item.id}
            className="flex flex-col items-center gap-1 min-w-0 flex-1" 
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              handleTabClick(item.id);
            }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              activeTab === item.id ? 'bg-red-500' : 'bg-transparent'
            }`}>
              <img 
                alt={item.label}
                loading="lazy"
                width="24"
                height="24"
                decoding="async"
                className="w-6 h-6"
                src={item.image}
                style={{ color: 'transparent' }}
              />
            </div>
            <span className={`text-xs font-medium ${
              activeTab === item.id ? 'text-red-500' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;