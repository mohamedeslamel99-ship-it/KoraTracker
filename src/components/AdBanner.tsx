import React, { useEffect, useRef, memo } from 'react';
import { cn } from '../lib/utils';

interface AdBannerProps {
  className?: string;
  type?: 'script' | 'affiliate' | 'direct' | 'adsense'; 
  adKey?: string;      
  href?: string;       
  imageUrl?: string;   
  dataAdClient?: string; 
}

// استخدام memo لمنع إعادة الرندر غير الضرورية وتحسين أداء الموبايل
const AdBanner = memo(({ 
  className, 
  type = 'script', 
  adKey, 
  href, 
  imageUrl,
  dataAdClient = 'ca-pub-3938735407425269' 
}: AdBannerProps) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  // 1. Effect الخاص بـ Adsterra
  useEffect(() => {
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

  // 2. Effect الخاص بـ Google AdSense
  useEffect(() => {
    if (type === 'adsense') {
      try {
        // التأكد من أن السكريبت يعمل فقط عند وجود النافذة لتحسين أداء الـ SSR
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [type]);

  return (
    <div className={cn("w-full flex flex-col items-center my-8 px-4", className)}>
      
      {/* 1. حالة الأفلييت أو الإعلان المباشر */}
      {(type === 'affiliate' || type === 'direct') && href ? (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full max-w-[728px] min-h-[90px] group relative overflow-hidden rounded-2xl border border-zinc-800 hover:border-indigo-500/50 transition-all shadow-xl"
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Ad" 
              className="w-full h-[90px] object-cover" 
              loading="lazy"
              decoding="async" // إضافة لتقليل حمل المعالج أثناء فك ضغط الصورة
            />
          ) : (
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
      ) : type === 'adsense' ? (
        
        // 2. حالة Google AdSense
        // تم تثبيت الطول (aspect-ratio) لمنع اهتزاز الصفحة Layout Shift تماماً
        <div className="w-full max-w-[728px] min-h-[90px] md:min-h-[280px] bg-zinc-900/10 rounded-xl border border-zinc-800/50 flex items-center justify-center overflow-hidden relative">
          {adKey ? (
            <ins
              className="adsbygoogle w-full z-10"
              style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
              data-ad-client={dataAdClient}
              data-ad-slot={adKey}
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          ) : (
             <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest z-0">AdSense Missing Key</span>
          )}
          <span className="absolute text-zinc-600/30 text-[10px] font-black uppercase tracking-widest z-0">
            Google AdSpace
          </span>
        </div>

      ) : (
        
        // 3. حالة Adsterra (السكريبت)
        <div 
          ref={bannerRef}
          className="w-full max-w-[728px] min-h-[90px] bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden"
        >
          {!adKey && <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Ads Ready</span>}
        </div>
      )}

      <p className="mt-3 text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em]">
        Inventory Slot: {
          type === 'script' ? 'Network API' : 
          type === 'adsense' ? 'Google AdSense' : 
          type === 'affiliate' ? 'Affiliate Partner' : 'Direct Sponsor'
        }
      </p>
    </div>
  );
});

export default AdBanner;