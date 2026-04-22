import { cn, formatTime } from '../lib/utils';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface MatchProps {
  match: {
    id: number;
    utcDate: string;
    status: string;
    homeTeam: { name: string; crest: string };
    awayTeam: { name: string; crest: string };
    score: {
      fullTime: { home: number; away: number };
    };
    competition: { name: string; emblem: string };
  };
}

export default function MatchCard({ match }: { match: any }) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const isScheduled = match.status === 'TIMED' || match.status === 'SCHEDULED';

  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-[#18181b] p-4 transition-all hover:bg-zinc-800/50 hover:border-indigo-500/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={match.competition?.emblem} alt={match.competition?.name} className="h-5 w-5 object-contain" referrerPolicy="no-referrer" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">{match.competition?.name}</span>
        </div>
        <div>
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded bg-red-500 px-2 py-0.5 text-[10px] font-black text-white animate-pulse uppercase tracking-wider">
              LIVE
            </span>
          )}
          {isFinished && (
            <span className="pill">
              FT
            </span>
          )}
          {isScheduled && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20 px-2 py-0.5 rounded leading-none">
              {new Date(match.utcDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-800/50 p-1.5 border border-zinc-800">
            <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <span className="text-[11px] font-bold text-zinc-300 line-clamp-1 uppercase tracking-tight">{match.homeTeam.shortName || match.homeTeam.name}</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-1">
          {isScheduled ? (
            <div className="flex flex-col items-center">
              <span className="text-sm font-black tracking-tight text-white">{formatTime(match.utcDate)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={cn("text-xl font-black tabular-nums tracking-tighter", isLive ? "text-red-500" : "text-white")}>
                {match.score.fullTime.home ?? 0}
              </span>
              <span className="text-zinc-700 font-light">-</span>
              <span className={cn("text-xl font-black tabular-nums tracking-tighter", isLive ? "text-red-500" : "text-white")}>
                {match.score.fullTime.away ?? 0}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-800/50 p-1.5 border border-zinc-800">
            <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <span className="text-[11px] font-bold text-zinc-300 line-clamp-1 uppercase tracking-tight">{match.awayTeam.shortName || match.awayTeam.name}</span>
        </div>
      </div>
    </div>
  );
}
