import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#09090b] pt-12 pb-8 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* اللوجو مع أيقونة البرق */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <Zap size={20} className="text-indigo-500" />
          <span className="text-xl font-black text-white uppercase italic tracking-tighter">
            Kora<span className="text-indigo-500">Tracker</span>
          </span>
        </div>

        {/* روابط الصفحات الإضافية - محسنة بصرياً */}
        <div className="flex justify-center items-center gap-6 mb-6">
          <Link 
            to="/about" 
            className="text-[10px] font-black text-zinc-500 uppercase tracking-widest 
                       hover:text-indigo-400 hover:underline underline-offset-4 
                       transition-all duration-300 cursor-pointer"
          >
            About Us
          </Link>

          {/* نقطة فاصلة لتنظيم الشكل */}
          <span className="h-1 w-1 bg-zinc-800 rounded-full" />

          <Link 
            to="/privacy" 
            className="text-[10px] font-black text-zinc-500 uppercase tracking-widest 
                       hover:text-indigo-400 hover:underline underline-offset-4 
                       transition-all duration-300 cursor-pointer"
          >
            Privacy Policy
          </Link>
        </div>

        {/* حقوق النشر والتطوير */}
        <div className="space-y-2">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} KoraTracker. All Rights Reserved.
          </p>
          
          <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest">
            Developed by Mohamed Eslam
          </p>
        </div>
      </div>
    </footer>
  );
}