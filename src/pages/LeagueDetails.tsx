import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import { Trophy, Users, Star, ArrowLeft, Loader2, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/Skeleton';

export default function LeagueDetails() {
  const { id = 'PL' } = useParams();
  
  const { data: standingsData, isLoading: standingsLoading } = useSWR(
    endpoints.getStandings(id),
    fetchFootballData
  );

  const { data: scorersData, isLoading: scorersLoading } = useSWR(
    endpoints.getTopScorers(id),
    fetchFootballData
  );

  const competition = standingsData?.competition;
  const standings = standingsData?.standings?.[0]?.table || [];
  const scorers = scorersData?.scorers || [];

  if (standingsLoading || scorersLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-10">
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-indigo-500/20 rounded-full" />
            <div className="relative bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-2xl">
              <img src={competition?.emblem} alt={competition?.name} className="h-16 w-16 object-contain" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-indigo-400 mb-4 uppercase tracking-[0.2em] transition-colors leading-none">
              <ArrowLeft size={10} />
              Directory
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-white mb-4 uppercase italic">{competition?.name}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="pill text-zinc-400 bg-zinc-900 border border-zinc-800">
                Season {standingsData?.season?.startDate.split('-')[0]}
              </span>
              <span className="pill text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                Matchday {standingsData?.season?.currentMatchday}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Standings Table */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-black tracking-[0.2em] text-zinc-500 flex items-center gap-2 uppercase">
            <Trophy className="h-4 w-4 text-indigo-500" />
            League Table
          </h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-2xl ring-1 ring-zinc-800/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-zinc-900/50 text-[10px] uppercase font-black tracking-widest text-zinc-500 border-b border-zinc-800">
                    <th className="px-5 py-4 w-12 text-center">Pos</th>
                    <th className="px-4 py-4 min-w-[200px]">Team</th>
                    <th className="px-3 py-4 text-center">P</th>
                    <th className="px-3 py-4 text-center">W</th>
                    <th className="px-3 py-4 text-center">D</th>
                    <th className="px-3 py-4 text-center">L</th>
                    <th className="px-3 py-4 text-center">GD</th>
                    <th className="px-5 py-4 text-right font-black text-zinc-100">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {standingsLoading || standings.length === 0 ? (
                    <>
                      {[...Array(10)].map((_, i) => (
                        <tr key={`skeleton-row-${i}`}>
                          <td className="px-5 py-5 text-center"><Skeleton className="h-3 w-4 mx-auto" /></td>
                          <td className="px-4 py-5"><div className="flex items-center gap-3"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-3 w-32" /></div></td>
                          <td className="px-3 py-5"><Skeleton className="h-3 w-6 mx-auto" /></td>
                          <td className="px-3 py-5"><Skeleton className="h-3 w-4 mx-auto" /></td>
                          <td className="px-3 py-5"><Skeleton className="h-3 w-4 mx-auto" /></td>
                          <td className="px-3 py-5"><Skeleton className="h-3 w-4 mx-auto" /></td>
                          <td className="px-3 py-5"><Skeleton className="h-3 w-6 mx-auto" /></td>
                          <td className="px-5 py-5 text-right"><Skeleton className="h-3 w-8 ml-auto" /></td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    standings.map((row: any) => (
                    <tr key={row.team.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-5 py-4 text-center">
                        <span className={cn(
                          "text-[11px] font-black tabular-nums",
                          row.position <= 4 ? "text-indigo-400" :
                          row.position >= 18 ? "text-red-400" : "text-zinc-500"
                        )}>
                          {row.position}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link to={`/team/${row.team.id}`} className="flex items-center gap-3">
                          <img src={row.team.crest} alt={`${row.team.name} crest`} className="h-5 w-5 object-contain" referrerPolicy="no-referrer" />
                          <span className="text-sm font-bold text-zinc-300 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{row.team.name}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-center text-[11px] font-black text-zinc-600 tabular-nums">{row.playedGames}</td>
                      <td className="px-3 py-4 text-center text-[11px] font-black text-zinc-400 tabular-nums">{row.won}</td>
                      <td className="px-3 py-4 text-center text-[11px] font-black text-zinc-600 tabular-nums">{row.draw}</td>
                      <td className="px-3 py-4 text-center text-[11px] font-black text-zinc-600 tabular-nums">{row.lost}</td>
                      <td className="px-3 py-4 text-center text-[11px] font-black text-zinc-500 tabular-nums">{row.goalDifference}</td>
                      <td className="px-5 py-4 text-right text-sm font-black text-white tabular-nums">{row.points}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
            <div className="bg-zinc-900/30 border-t border-zinc-800 px-5 py-4 flex gap-6 overflow-x-auto whitespace-nowrap">
               <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Champions League</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Relegation</span>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Top Scorers */}
        <div className="space-y-6">
          <h2 className="text-sm font-black tracking-[0.2em] text-zinc-500 flex items-center gap-2 uppercase">
            <Star className="h-4 w-4 text-yellow-500" />
            Top Scorers
          </h2>
          <div className="rounded-2xl border border-zinc-800 bg-[#18181b] p-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-zinc-100">
              <Trophy size={80} />
            </div>
            <div className="space-y-6">
              {scorersLoading || (scorers.length === 0 && standingsLoading) ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div key={`skeleton-scorer-${i}`} className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Skeleton className="h-3 w-4" />
                          <div className="space-y-2">
                             <Skeleton className="h-3 w-28" />
                             <Skeleton className="h-2 w-20" />
                          </div>
                       </div>
                       <div className="space-y-2 text-right">
                          <Skeleton className="h-4 w-6 ml-auto" />
                          <Skeleton className="h-2 w-10 ml-auto" />
                       </div>
                    </div>
                  ))}
                </>
              ) : (
                scorers.map((scorer: any, i: number) => (
                <div key={scorer.player.id || `scorer-${i}`} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <span className="text-[11px] font-black text-zinc-700 italic tabular-nums leading-none">0{i + 1}</span>
                     <div>
                       <p className="text-sm font-black text-zinc-200 group-hover:text-indigo-400 transition-all uppercase tracking-tight">{scorer.player.name}</p>
                       <p className="text-[10px] font-black text-zinc-500 flex items-center gap-1 uppercase tracking-widest mt-0.5">
                         <img src={scorer.team.crest} alt={`${scorer.team.name} team crest`} className="h-3 w-3 object-contain inline grayscale" referrerPolicy="no-referrer" />
                         {scorer.team.shortName || scorer.team.name}
                       </p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white tabular-nums tracking-tighter leading-none">{scorer.goals}</p>
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">Goals</p>
                  </div>
                </div>
              )))}
              {scorers.length === 0 && (
                <div className="text-center py-10">
                   <Info className="h-6 w-6 text-zinc-800 mx-auto mb-2" />
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Data Unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
