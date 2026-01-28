import React from 'react';
import heroVideo from '../assets/video/herovideo.mp4';

const Hero = () => {
  return (
    <div className="w-full relative h-64 sm:h-80 md:h-96 lg:h-screen">
      <video 
        src={heroVideo} 
        className="w-full h-full object-cover rounded-xl sm:rounded-xl md:rounded-xl lg:rounded-none shadow-lg lg:shadow-none" 
        autoPlay 
        loop 
        muted 
        playsInline 
        style={{objectFit: 'cover'}}
      >
      </video>
      <div className="absolute inset-0 bg-black/20 lg:block hidden"></div>
    </div>
  );
};

export default Hero;