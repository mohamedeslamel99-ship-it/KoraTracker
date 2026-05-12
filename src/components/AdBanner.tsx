import React from 'react';
import { cn } from '../lib/utils';

export default function AdBanner({ className }: { className?: string }) {
  return (
    <div className={cn("w-full max-w-4xl mx-auto my-8 p-1 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-lg flex items-center justify-center min-h-[90px] opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer overflow-hidden relative group", className)}>
      {/* تأثير اللمعان وقت المرور بالماوس */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
      
      <div className="text-center relative z-10">
        <span className="block text-[9px] text-zinc-500 mb-1 uppercase tracking-[0.3em] font-black">Advertisement</span>
        <p className="text-sm md:text-base font-black text-zinc-400">
          مساحة إعلانية مميزة لرعاة المنصة
        </p>
        <p className="text-[10px] text-zinc-600 mt-1 font-bold">728 × 90</p>
      </div>
    </div>
  );
}