import React from 'react';

const AdBanner = () => {
  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-1 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 shadow-lg flex items-center justify-center min-h-[100px] opacity-80 hover:opacity-100 transition-opacity duration-300">
      <div className="text-center">
        <span className="block text-xs text-slate-400 mb-1 uppercase tracking-widest">Advertisement</span>
        <p className="text-lg font-semibold text-slate-300">
          مساحة إعلانية مميزة لرعاة المنصة
        </p>
        <p className="text-sm text-slate-500">728 × 90</p>
      </div>
    </div>
  );
};

export default AdBanner;