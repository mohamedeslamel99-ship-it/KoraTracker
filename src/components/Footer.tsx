import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#09090b] pt-12 pb-8 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Zap size={20} className="text-indigo-500" />
          <span className="text-xl font-black text-white uppercase italic tracking-tighter">
            Kora<span className="text-indigo-500">Tracker</span>
          </span>
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} KoraTracker. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}