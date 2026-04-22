import { Trophy, Github, Twitter, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#09090b] pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-600 p-1.5 shadow-sm shadow-indigo-900/20">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Kora<span className="text-indigo-400">Tracker</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
              Your comprehensive platform for global football statistics, live scores, and expert FPL analysis.
            </p>
          </div>
          
          <div>
            <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Features</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors">Live Scores</Link></li>
              <li><Link to="/leagues/PL" className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors">League Tables</Link></li>
              <li><Link to="/fantasy-hub" className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors">FPL Analysis</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-zinc-500 hover:text-zinc-100 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-500 hover:text-zinc-100 transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-500 hover:text-zinc-100 transition-colors"><Globe className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
            &copy; {new Date().getFullYear()} KoraTracker. Data provided by football-data.org.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
            <span>Made with</span>
            <span className="text-indigo-500 animate-pulse">❤</span>
            <span>for the beautiful game.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
