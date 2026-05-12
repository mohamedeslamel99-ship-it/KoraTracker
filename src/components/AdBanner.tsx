import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface AdBannerProps {
  className?: string;
  type?: 'script' | 'affiliate' | 'direct';
  adKey?: string;      // خاص بـ Adsterra
  href?: string;       // رابط الأفلييت أو الإعلان المباشر
  imageUrl?: string;   // صورة المنتج (للأفلييت)
}

export default function AdBanner({ className, type = 'script', adKey, href, imageUrl }: AdBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // تشغيل سكريبت Adsterra فقط لو النوع 'script'
    if (type === 'script' && adKey && bannerRef.current && !bannerRef.current.firstChild) {
      const atOptions = {
        'key': adKey,
        'format': 'iframe',
        'height': 90,
        'width': 728,
        'params': {}
      };
      (window as any).atOptions = atOptions;
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      bannerRef.current.appendChild(script);
    }
  }, [type, adKey]);

  return (
    <div className={cn("w-full flex flex-col items-center my-8 px-4", className)}>
      {/* 1. حالة الأفلييت أو الإعلان المباشر */}
      {(type === 'affiliate' || type === 'direct') && href ? (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full max-w-[728px] group relative overflow-hidden rounded-2xl border border-zinc-800 hover:border-indigo-500/50 transition-all shadow-xl"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Ad" className="w-full h-[90px] object-cover" />
          ) : (
            // شكل الإعلان المباشر (Advertise Here)
            <div className="w-full h-[90px] bg-gradient-to-r from-indigo-900/20 to-zinc-900 flex items-center justify-center text-center p-4">
              <div>
                <p className="text-white font-black uppercase italic text-sm md:text-base tracking-tighter">مساحة إعلانية مميزة لرعاة المنصة</p>
                <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1">أعلن هنا للوصول لجمهور الدوري الإنجليزي</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="absolute top-1 right-2 bg-black/60 text-[7px] text-zinc-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">AD</span>
        </a>
      ) : (
        // 2. حالة Adsterra (السكريبت)
        <div 
          ref={bannerRef}
          className="w-full max-w-[728px] min-h-[90px] bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden"
        >
          {!adKey && <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Ads Ready</span>}
        </div>
      )}

      {/* بادج توضيحي للمشتري */}
      <p className="mt-3 text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em]">
        Inventory Slot: {type === 'script' ? 'Network API' : type === 'affiliate' ? 'Affiliate Partner' : 'Direct Sponsor'}
      </p>
    </div>
  );
}