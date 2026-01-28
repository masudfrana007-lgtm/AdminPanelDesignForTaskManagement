import React from 'react';

import brandOne from '../assets/img/brands/Easyjet-Holidays-Ciyzil3W.webp';
import brandTwo from '../assets/img/brands/arla-logo-black-and-white-CByUCCSa.webp';
import brandThree from '../assets/img/brands/Lumene-Logo-Bo_hRYRn.webp';
import brandFour from '../assets/img/brands/corston_logo_black-b-5-RcG5.webp';
import brandFive from '../assets/img/brands/Passenger-Logo-Rectangle-Outline-Box-V2-Black-CAfMuM_n.webp';
import brandSix from '../assets/img/brands/Premier-Inn-D26Ark0T.webp';
import brandSeven from '../assets/img/brands/UNIQLO_logo-C0xzmNex.webp';

const TrustedBrands = () => {
  const brands = [
    { name: 'UNIQLO', image: brandSeven },
    { name: 'Arla', image: brandTwo },
    { name: 'Corston', image: brandFour },
    { name: 'EasyJet Holidays', image: brandOne },
    { name: 'Lumene', image: brandThree },
    { name: 'Passenger', image: brandFive },
    { name: 'Premier Inn', image: brandSix }
  ];

  return (
    <div className="py-16 px-6 bg-white overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Brands that trust us.</h2>
        <div className="relative">
          <div className="flex animate-marquee gap-12 items-center">
            {/* First set of brands */}
            {brands.map((brand, index) => (
              <img 
                key={`first-${index}`}
                alt={brand.name} 
                loading="lazy" 
                width="120" 
                height="60" 
                decoding="async" 
                data-nimg="1" 
                className="opacity-60 flex-shrink-0 min-w-[120px]" 
                src={brand.image} 
                style={{color: "transparent"}} 
              />
            ))}
            {/* Duplicate set for seamless loop */}
            {brands.map((brand, index) => (
              <img 
                key={`second-${index}`}
                alt={brand.name} 
                loading="lazy" 
                width="120" 
                height="60" 
                decoding="async" 
                data-nimg="1" 
                className="opacity-60 flex-shrink-0 min-w-[120px]" 
                src={brand.image} 
                style={{color: "transparent"}} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedBrands;