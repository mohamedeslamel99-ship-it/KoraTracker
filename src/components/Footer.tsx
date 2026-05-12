import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom'; // 👈 استيراد Link للتنقل السريع

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#09090b] pt-12 pb-8 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* اللوجو */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <Zap size={20} className="text-indigo-500" />
          <span className="text-xl font-black text-white uppercase italic tracking-tighter">
            Kora<span className="text-indigo-500">Tracker</span>
          </span>
        </div>

        {/* 👈 الروابط الجديدة لزوم الاحترافية وقبول جوجل */}
        <div className="flex justify-center items-center gap-6 mb-6">
          <Link 
            to="/about" 
            className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
          >
            About Us
          </Link>
          <Link 
            to="/privacy" 
            className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>

        {/* حقوق النشر */}
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} KoraTracker. All Rights Reserved.
        </p>
        
        {/* جملة إضافية تدي ثقة للمشتري */}
        <p className="mt-2 text-zinc-700 text-[8px] font-black uppercase tracking-widest">
          Developed by Mohamed Eslam
        </p>
      </div>
    </footer>
  );
}