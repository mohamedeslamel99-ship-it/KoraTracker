import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

export default function AdBanner({ className }: { className?: string }) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // التأكد من عدم تكرار الإعلان عند تحديث الصفحة
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const atOptions = {
        'key' : 'f0d84c54f651cda2fa485c5a49cdb1b9', // الكود الخاص بك من image_9f2ffe.png
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };

      // تعريف الخيارات في نافذة المتصفح لكي يراها الـ Script الخارجي
      (window as any).atOptions = atOptions;

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/${atOptions.key}/invoke.js`;
      
      bannerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={cn("w-full flex flex-col items-center my-8", className)}>
      {/* رسالة توضح للمشتري أن الموقع مفعل عليه الإعلانات */}
      <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[8px] text-emerald-400 uppercase font-black tracking-[0.2em]">
          Live Monetization Active
        </span>
      </div>

      {/* الحاوية التي سيظهر فيها الإعلان */}
      <div 
        ref={bannerRef}
        className="w-full max-w-[728px] min-h-[90px] bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center shadow-2xl transition-all hover:border-zinc-700 relative group"
      >
        {/* تأثير لمعان خفيف ليظهر مكان الإعلان قبل تحميله */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
        
        <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Loading Advertisement...
        </span>
      </div>
    </div>
  );
}