import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import MatchCard from '../components/MatchCard';
import { Trophy, Calendar, Loader2, AlertCircle, ArrowRight, BrainCircuit, LineChart, ShieldHalf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Home() {
  const { data: liveData, error: liveError, isLoading: liveLoading } = useSWR(
    endpoints.getLiveMatches(),
    fetchFootballData,
    { refreshInterval: 60000 } // Refresh every minute for live scores
  );

  const { data: fixturesData, error: fixturesError, isLoading: fixturesLoading } = useSWR(
    endpoints.getMatches(),
    fetchFootballData
  );

  const liveMatches = liveData?.matches || [];
  const upcomingMatches = fixturesData?.matches?.filter((m: any) => m.status === 'TIMED' || m.status === 'SCHEDULED').slice(0, 8) || [];

  const isRateLimited = liveError?.message?.includes('request limit') || fixturesError?.message?.includes('request limit');

  return (
    <div className="space-y-12 pb-20">
      {/* Rate Limit Alert */}
      {isRateLimited && (
        <div className="sticky top-20 z-30 mx-auto max-w-lg">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-[#09090b]/80 p-4 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4">
             <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-400">
               <Loader2 className="h-4 w-4 animate-spin" />
             </div>
             <div className="flex-1">
               <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Traffic Governor Active</p>
               <p className="mt-1 text-[9px] font-black text-indigo-400/70 uppercase tracking-widest leading-none">Cooling down API clusters... Synchronizing data shortly.</p>
             </div>
          </div>
        </div>
      )}

      {/* 👇 واجهة الموقع الجديدة (Hero Section) المخصصة للفانتازي 👇 */}
      <section className="relative overflow-hidden bg-[#111113] py-20 md:py-28 text-white rounded-[40px] mt-4 border border-zinc-800 shadow-2xl flex flex-col items-center text-center">
        {/* تأثيرات الإضاءة */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl px-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8 shadow-2xl">
            <BrainCircuit size={14} /> Powered by AI
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-tight">
            Master Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Fantasy Squad</span>
          </h1>
          
          <p className="text-zinc-400 text-xs md:text-sm lg:text-base font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            The ultimate FPL companion. Compare players, analyze upcoming fixtures, build your dream team, and get instant AI-driven performance ratings.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/fantasy-hub"
              className="inline-flex items-center justify-center gap-3 bg-white text-black font-black px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)] uppercase tracking-widest text-[10px] md:text-[11px]"
            >
              Launch Fantasy Hub <ArrowRight size={16} />
            </Link>
            <Link 
              to="/leagues/PL" 
              className="inline-flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 text-white font-black px-8 py-4 rounded-full hover:bg-zinc-800 transition-colors uppercase tracking-widest text-[10px] md:text-[11px]"
            >
              Live Scores & Standings
            </Link>
          </div>
        </motion.div>

        {/* مميزات الموقع */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl w-full mt-16 md:mt-24 relative z-10 px-6">
          {[
            { icon: <LineChart />, title: "Precision Analytics", desc: "Head-to-head player comparisons with detailed stats." },
            { icon: <ShieldHalf />, title: "Squad Builder", desc: "Interactive pitch, Captains, and budget tracking." },
            { icon: <BrainCircuit />, title: "AI Ratings", desc: "Smart algorithm to rate your choices and fixtures." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="bg-zinc-950/50 border border-zinc-800/80 p-6 rounded-3xl text-left backdrop-blur-sm"
            >
              <div className="text-indigo-400 mb-4">{feature.icon}</div>
              <h3 className="text-white font-black uppercase tracking-wide mb-2 text-xs md:text-sm">{feature.title}</h3>
              <p className="text-zinc-500 text-[10px] md:text-xs font-bold leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* 👆 نهاية واجهة الموقع الجديدة 👆 */}

      {/* Live Matches Section */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-2.5">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase italic">Live Scores</h2>
              <p className="text-[8px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mt-1">Updated real-time from the pitch</p>
            </div>
          </div>
        </div>

        {liveLoading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {liveMatches.map((match: any) => (
              // @ts-ignore
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[32px] bg-[#18181b] border border-zinc-800 py-16 px-4 shadow-sm">
            <div className="rounded-full bg-zinc-800/50 p-6 shadow-sm mb-6 border border-zinc-700/50">
              <Calendar className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight">No matches currently live</h3>
            <p className="mt-2 text-[10px] md:text-xs text-zinc-500 text-center max-w-xs leading-relaxed font-bold tracking-widest uppercase">
              Check back during match hours!
            </p>
          </div>
        )}
      </section>

      {/* Featured Leagues & Upcoming */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Fixtures */}
        <div className="bg-[#18181b] rounded-[32px] border border-zinc-800 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-zinc-100">
              <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
                <Calendar className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <h2 className="text-lg md:text-xl font-black tracking-tight uppercase italic">Upcoming</h2>
            </div>
          </div>

          <div className="space-y-4">
            {fixturesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
              ))
            ) : upcomingMatches.length > 0 ? (
              upcomingMatches.map((match: any) => (
                <div key={match.id} className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0 group">
                  <div className="flex flex-1 items-center gap-2 md:gap-3">
                    <img src={match.homeTeam.crest} alt={`${match.homeTeam.name} crest`} className="h-5 w-5 md:h-6 md:w-6 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-[10px] md:text-xs font-bold text-zinc-300 truncate uppercase tracking-tight">{match.homeTeam.shortName || match.homeTeam.name}</span>
                  </div>
                  <div className="flex flex-col items-center px-2 md:px-4">
                    <span className="pill text-zinc-100 bg-zinc-800 border border-zinc-700 min-w-[40px] md:min-w-[50px] text-center text-[9px] md:text-[10px]">
                      {new Date(match.utcDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-end gap-2 md:gap-3 text-right">
                    <span className="text-[10px] md:text-xs font-bold text-zinc-300 truncate uppercase tracking-tight">{match.awayTeam.shortName || match.awayTeam.name}</span>
                    <img src={match.awayTeam.crest} alt={`${match.awayTeam.name} crest`} className="h-5 w-5 md:h-6 md:w-6 object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-8 italic font-bold uppercase tracking-widest text-[10px] md:text-xs">No upcoming matches</p>
            )}
          </div>
        </div>

        {/* Quick Links / Top Leagues */}
        <div className="bg-zinc-950 rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden border border-zinc-800 ring-1 ring-zinc-800/50">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 pointer-events-none">
            <Trophy size={160} />
          </div>
          <div className="relative">
            <h2 className="text-lg md:text-xl font-black tracking-tight mb-6 md:mb-8 uppercase italic flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Major Leagues
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'PL', name: 'Premier League', color: 'bg-indigo-600' },
                { id: 'PD', name: 'La Liga', color: 'bg-zinc-600' },
                { id: 'BL1', name: 'Bundesliga', color: 'bg-zinc-600' },
                { id: 'SA', name: 'Serie A', color: 'bg-zinc-600' },
                { id: 'FL1', name: 'Ligue 1', color: 'bg-zinc-600' },
              ].map((league) => (
                <Link
                  key={league.id}
                  to={`/leagues/${league.id}`}
                  className="group flex items-center justify-between p-3 md:p-4 rounded-xl bg-[#111113] border border-zinc-800 transition-all hover:bg-zinc-900 hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", league.id === 'PL' ? league.color : "bg-zinc-700 group-hover:bg-zinc-400")} />
                    <span className="text-xs md:text-sm font-bold tracking-tight text-zinc-400 group-hover:text-zinc-100 transition-colors uppercase">{league.name}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {fixturesError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] md:text-sm font-black text-red-500 uppercase tracking-widest">Connection Error</p>
            <p className="text-[9px] md:text-xs text-zinc-500 mt-1 leading-relaxed font-bold uppercase tracking-widest">Stadium scoreboard unavailable. Please refresh in a moment.</p>
          </div>
        </div>
      )}
    </div>
  );
}