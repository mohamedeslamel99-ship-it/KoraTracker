import React from 'react';
import { cn } from '../lib/utils';

interface AdBannerProps {
  className?: string;
  href?: string;      // رابط الإعلان (أفلييت أو موقع الراعي)
  imageUrl?: string;  // صورة الإعلان الحقيقية
}

export default function AdBanner({ className, href, imageUrl }: AdBannerProps) {
  // المكون الأساسي للإعلان
  const AdContent = (
    <div className={cn(
      "w-full max-w-4xl mx-auto my-8 p-1 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-lg flex items-center justify-center min-h-[90px] transition-all duration-300 overflow-hidden relative group",
      !imageUrl && "opacity-70 hover:opacity-100 cursor-pointer", // لو مفيش صورة يفضل شفاف شوية
      className
    )}>
      
      {/* تأثير اللمعان */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

      {imageUrl ? (
        /* الحالة الأولى: لو فيه صورة إعلان حقيقية */
        <>
          <img 
            src={imageUrl} 
            alt="Sponsored Ad" 
            className="w-full h-full object-cover rounded-xl"
          />
          {/* علامة AD صغيرة فوق الإعلان عشان المصداقية */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[8px] text-zinc-300 px-2 py-0.5 rounded-full border border-white/10 font-black tracking-widest z-20">
            AD
          </div>
        </>
      ) : (
        /* الحالة الثانية: الـ Placeholder القديم بتاعك زي ما هو */
        <div className="text-center relative z-10">
          <span className="block text-[9px] text-zinc-500 mb-1 uppercase tracking-[0.3em] font-black">Advertisement</span>
          <p className="text-sm md:text-base font-black text-zinc-400">
            مساحة إعلانية مميزة لرعاة المنصة
          </p>
          <p className="text-[10px] text-zinc-600 mt-1 font-bold">728 × 90</p>
        </div>
      )}
    </div>
  );

  // لو فيه رابط، بنلف المكون بـ <a> tag عشان يفتح الإعلان
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">
        {AdContent}
      </a>
    );
  }

  return AdContent;
}