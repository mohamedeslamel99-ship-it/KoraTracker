import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import MatchCard from '../components/MatchCard';
import { Trophy, Calendar, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111113] py-20 text-white rounded-3xl mt-4 border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#6366f122,transparent_50%)]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            Live Football Hub
          </div>
          <h1 className="mt-8 text-4xl font-black tracking-tight sm:text-6xl text-white">
            Track Every Goal. <br />
            <span className="text-indigo-500">Master Your Fantasy.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed font-medium">
            The ultimate companion for the beautiful game. Real-time scores, deep league analytics, and advanced FPL player insights at your fingertips.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/leagues/PL" className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] text-white transition-all hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-600/20">
              Check Standings
            </Link>
            <Link to="/fantasy-hub" className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-800 bg-white/5 px-8 font-black uppercase tracking-widest text-[11px] text-zinc-300 transition-all hover:bg-white/10 hover:text-white">
              Fantasy Hub
            </Link>
          </div>
        </div>
      </section>

      {/* Live Matches Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-2.5">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Live Scores</h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mt-1">Updated real-time from the pitch</p>
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
          <div className="flex flex-col items-center justify-center rounded-3xl bg-[#18181b] border border-zinc-800 py-16 px-4 shadow-sm">
            <div className="rounded-full bg-zinc-800 p-6 shadow-sm mb-6 border border-zinc-700">
              <Calendar className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">No matches currently live</h3>
            <p className="mt-2 text-sm text-zinc-500 text-center max-w-xs leading-relaxed font-medium">
              It looks like there are no active games at the moment. Check back during match hours!
            </p>
          </div>
        )}
      </section>

      {/* Featured Leagues */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Fixtures */}
        <div className="bg-[#18181b] rounded-3xl border border-zinc-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-zinc-100">
              <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase">Upcoming</h2>
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
                  <div className="flex flex-1 items-center gap-3">
                    <img src={match.homeTeam.crest} alt={`${match.homeTeam.name} crest`} className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-xs font-bold text-zinc-300 truncate uppercase tracking-tight">{match.homeTeam.shortName || match.homeTeam.name}</span>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <span className="pill text-zinc-100 bg-zinc-800 border border-zinc-700 min-w-[50px] text-center">
                      {new Date(match.utcDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-end gap-3 text-right">
                    <span className="text-xs font-bold text-zinc-300 truncate uppercase tracking-tight">{match.awayTeam.shortName || match.awayTeam.name}</span>
                    <img src={match.awayTeam.crest} alt={`${match.awayTeam.name} crest`} className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-8 italic font-bold uppercase tracking-widest text-xs">No upcoming matches</p>
            )}
          </div>
        </div>

        {/* Quick Links / Top Leagues */}
        <div className="bg-zinc-950 rounded-3xl p-8 text-white relative overflow-hidden border border-zinc-800 ring-1 ring-zinc-800/50">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500">
            <Trophy size={160} />
          </div>
          <div className="relative">
            <h2 className="text-xl font-black tracking-tight mb-8 uppercase flex items-center gap-2">
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
                  className="group flex items-center justify-between p-4 rounded-xl bg-[#111113] border border-zinc-800 transition-all hover:bg-zinc-900 hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", league.id === 'PL' ? league.color : "bg-zinc-700 group-hover:bg-zinc-400")} />
                    <span className="text-sm font-bold tracking-tight text-zinc-400 group-hover:text-zinc-100 transition-colors uppercase">{league.name}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {fixturesError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-red-500 uppercase tracking-widest">Connection Error</p>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-bold">Stadium scoreboard unavailable. Please refresh in a moment.</p>
          </div>
        </div>
      )}
    </div>
  );
}