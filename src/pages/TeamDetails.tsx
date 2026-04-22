import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import { ArrowLeft, Loader2, MapPin, Globe, Shield, Calendar, Users, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import MatchCard from '../components/MatchCard';

export default function TeamDetails() {
  const { id } = useParams();

  const { data: team, isLoading: teamLoading } = useSWR(
    id ? endpoints.getTeam(id) : null,
    fetchFootballData
  );

  const { data: matchesData, isLoading: matchesLoading } = useSWR(
    id ? endpoints.getTeamMatches(id) : null,
    fetchFootballData
  );

  const squad = team?.squad || [];
  const recentMatches = matchesData?.matches
    ?.filter((m: any) => m.status === 'FINISHED')
    ?.sort((a: any, b: any) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    ?.slice(0, 5) || [];

  const upcomingMatches = matchesData?.matches
    ?.filter((m: any) => m.status !== 'FINISHED')
    ?.slice(0, 3) || [];

  if (teamLoading || matchesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Calculate form based on recent matches
  const form = recentMatches.map((m: any) => {
    const isHome = m.homeTeam.id === parseInt(id!);
    const score = m.score.fullTime;
    if (!score.home || !score.away) return 'D';
    if (score.home === score.away) return 'D';
    if (isHome) return score.home > score.away ? 'W' : 'L';
    return score.away > score.home ? 'W' : 'L';
  }).reverse();

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="mt-8 bg-[#111113] rounded-3xl p-8 relative overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent" />
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl bg-zinc-900 p-6 border border-zinc-800 shadow-xl">
              <img src={team?.crest} alt={team?.name} className="h-20 w-20 object-contain" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-indigo-400 mb-4 uppercase tracking-[0.2em] transition-colors leading-none">
              <ArrowLeft size={10} />
              Home
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">{team?.name}</h1>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-black uppercase tracking-widest bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <MapPin size={14} className="text-indigo-500" />
                {team?.venue}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-black uppercase tracking-widest bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <Globe size={14} className="text-indigo-500" />
                {team?.area?.name}
              </div>
              <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Form:</span>
                <div className="flex gap-1.5 flex-wrap justify-center md:justify-start">
                  {form.map((res: string, i: number) => (
                    <span key={`${id}-form-${i}`} className={cn(
                      "h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black leading-none",
                      res === 'W' ? "bg-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]" :
                      res === 'L' ? "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    )}>
                      {res}
                    </span>
                  ))}
                  {form.length === 0 && <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">No Data</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Squad */}
          <section>
            <h2 className="text-sm font-black tracking-[0.2em] text-zinc-500 flex items-center gap-2 uppercase border-b border-zinc-800 pb-4">
              <Users className="h-4 w-4 text-indigo-500" />
              Squad Roster
            </h2>
            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-2xl">
               <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[600px]">
                   <thead>
                     <tr className="bg-zinc-900/50 text-[10px] uppercase font-black text-zinc-500 tracking-widest border-b border-zinc-800">
                       <th className="px-6 py-4">Player Details</th>
                       <th className="px-6 py-4">Position</th>
                       <th className="px-6 py-4">Origin</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800/50">
                     {squad.map((player: any) => (
                       <tr key={player.id} className="hover:bg-zinc-800/30 transition-colors">
                         <td className="px-6 py-4">
                            <p className="text-sm font-bold text-zinc-200 uppercase tracking-tight">{player.name}</p>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em] mt-1">
                              {player.role === 'COACH' ? 'HEAD COACH' : `AGE: ${player.dateOfBirth ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear() : 'N/A'}`}
                            </p>
                         </td>
                         <td className="px-6 py-4">
                            <span className={cn(
                              "pill uppercase tracking-widest",
                              player.position === 'Goalkeeper' ? "text-yellow-400 bg-yellow-400/5 border border-yellow-400/10" :
                              player.position === 'Defence' ? "text-indigo-400 bg-indigo-400/5 border border-indigo-400/10" :
                              player.position === 'Midfield' ? "text-indigo-400 bg-indigo-400/5 border border-indigo-400/10" :
                              "text-red-400 bg-red-400/5 border border-red-400/10"
                            )}>
                              {player.position || player.role}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-xs font-black text-zinc-600 uppercase tracking-widest">{player.nationality}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </section>
        </div>

        {/* Sidebar: Upcoming & Info */}
        <div className="space-y-8">
          <section className="bg-[#18181b] rounded-3xl border border-zinc-800 p-8 shadow-2xl">
             <h3 className="text-sm font-black tracking-[0.2em] mb-8 flex items-center gap-2 uppercase text-zinc-200">
               <Calendar size={16} className="text-indigo-500" />
               Scheduling
             </h3>
             <div className="space-y-4">
               {upcomingMatches.map((match: any) => (
                 <div key={match.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-800/50 hover:border-zinc-700 group">
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex-1 flex flex-col items-center text-center gap-2">
                          <img src={match.homeTeam.crest} alt={`${match.homeTeam.name} crest`} className="h-6 w-6 object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase leading-tight line-clamp-1">{match.homeTeam.shortName || match.homeTeam.name}</span>
                       </div>
                       <div className="flex flex-col items-center flex-none">
                          <span className="text-xs font-black text-white tabular-nums tracking-tighter">{new Date(match.utcDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">{new Date(match.utcDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                       </div>
                       <div className="flex-1 flex flex-col items-center text-center gap-2">
                          <img src={match.awayTeam.crest} alt={`${match.awayTeam.name} crest`} className="h-6 w-6 object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase leading-tight line-clamp-1">{match.awayTeam.shortName || match.awayTeam.name}</span>
                       </div>
                    </div>
                 </div>
               ))}
               {upcomingMatches.length === 0 && <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] py-8 text-center bg-zinc-900/20 rounded-2xl">Offline</p>}
             </div>
          </section>

          <section className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-2xl shadow-indigo-600/30">
             <div className="absolute -bottom-4 -right-4 opacity-10 blur-sm transform group-hover:rotate-12 transition-transform">
                <Shield size={140} />
             </div>
             <h3 className="text-lg font-black tracking-tight mb-4 uppercase italic">Official Access</h3>
             <p className="text-sm text-indigo-100 mb-8 leading-relaxed font-medium">Access official club news, insider reports, and the complete archive.</p>
             <a href={team?.website} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:bg-zinc-100 transition-all shadow-lg active:scale-95">
                Visit Club Hub
             </a>
          </section>
        </div>
      </div>
    </div>
  );
}
