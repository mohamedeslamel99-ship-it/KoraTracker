import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface AdBannerProps {
  className?: string;
  type?: 'script' | 'affiliate' | 'direct' | 'adsense';
  adKey?: string;      
  href?: string;      
  imageUrl?: string;  
  dataAdClient?: string;
  // إضافة خصائص للتحكم في شكل الـ Mockup
  isMockup?: boolean;
  width?: string;
  height?: string;
  text?: string;
}

export default function AdBanner({
  className,
  type = 'script',
  adKey,
  href,
  imageUrl,
  dataAdClient = 'ca-pub-3938735407425269',
  isMockup = true, // جعلنا الوضع الوهمي هو الافتراضي
  width = '100%',
  height = '90px',
  text = 'Advertisement'
}: AdBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  // 1. Effect الخاص بـ Adsterra
  useEffect(() => {
    if (!isMockup && type === 'script' && adKey && bannerRef.current && !bannerRef.current.firstChild) {
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
  }, [type, adKey, isMockup]);

  // 2. Effect الخاص بـ Google AdSense
  useEffect(() => {
    if (!isMockup && type === 'adsense') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [type, isMockup]);

  // إذا كان وضع الـ Mockup مفعلاً، نعرض التصميم البديل الأنيق
  if (isMockup) {
    return (
      <div 
        className={cn("my-8", className)}
        style={{
          width: width,
          maxWidth: '728px',
          height: height,
          backgroundColor: '#f3f4f6',
          border: '1px dashed #d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: '14px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          margin: '15px auto',
          borderRadius: '8px'
        }}
      >
        {text}
      </div>
    );
  }

  // إذا تم إيقاف الـ Mockup (isMockup={false})، سيعمل المنطق القديم للإعلانات
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
        <div className="w-full max-w-[728px] min-h-[90px] md:min-h-[280px] bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden relative">
          {adKey ? (
            <ins
              className="adsbygoogle w-full z-10"
              style={{ display: 'block', minHeight: '90px' }}
              data-ad-client={dataAdClient}
              data-ad-slot={adKey}
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          ) : (
             <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest z-0">AdSense Missing Key</span>
          )}
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

      {/* بادج توضيحي لنوع الإعلان (يظهر فقط إذا لم يكن Mockup) */}
      <p className="mt-3 text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em]">
        Inventory Slot: {
          type === 'script' ? 'Network API' :
          type === 'adsense' ? 'Google AdSense' :
          type === 'affiliate' ? 'Affiliate Partner' : 'Direct Sponsor'
        }
      </p>
    </div>
  );
}