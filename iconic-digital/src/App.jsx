import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustedBrands from './components/TrustedBrands';
import About from './components/About';
import Awards from './components/Awards';
import Services from './components/Services';
import Certificate from './components/Certificate';
import Campaign from './components/Campaign';
import Footer from './components/Footer';
import BottomNavigation from './components/BottomNavigation';
import './App.css';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 leading-relaxed">
      <div className="pb-20">
        <Header />
        <Hero />
        <TrustedBrands />
        <About />
        <Awards />
        <Services />
        <Certificate />
        <Campaign />
        <Footer />
      </div>
      <BottomNavigation />
    </div>
  );
}

export default App;