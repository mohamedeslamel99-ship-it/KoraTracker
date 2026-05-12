import React from 'react';

const HireMeButton = () => {
  return (
    <a
      href="https://mostaql.com/portfolio/3509834" // حطيتلك لينك معرض أعمالك عشان العميل يشوفه
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-bold"
    >
      <span>🚀</span>
      احصل على نسختك الآن
    </a>
  );
};

export default HireMeButton;