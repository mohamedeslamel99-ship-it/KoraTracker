import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import MatchCard from '../components/MatchCard';
import { Trophy, Calendar, Loader2, AlertCircle, ArrowRight, BrainCircuit, LineChart, ShieldHalf, Flame, Swords, Plus, TrendingUp } from 'lucide-react';import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useMemo } from 'react';

export default function Home() {
  const navigate = useNavigate();

  // 1. سحب المباريات الحية والقادمة
  const { data: liveData, error: liveError, isLoading: liveLoading } = useSWR(endpoints.getLiveMatches(), fetchFootballData, { refreshInterval: 60000 });
  const { data: fixturesData, error: fixturesError, isLoading: fixturesLoading } = useSWR(endpoints.getMatches(), fetchFootballData);
  
  // 👇 2. سحب هدافي الدوري الإنجليزي الحقيقيين للمقارنات 👇
  const { data: plScorers, isLoading: scorersLoading } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData, { revalidateOnFocus: false });

  const liveMatches = liveData?.matches || [];
  const upcomingMatches = fixturesData?.matches?.filter((m: any) => m.status === 'TIMED' || m.status === 'SCHEDULED').slice(0, 8) || [];
  const isRateLimited = liveError?.message?.includes('request limit') || fixturesError?.message?.includes('request limit');

  // معالجة بيانات الهدافين الحقيقية
  const topPlayers = useMemo(() => {
    if (!plScorers?.scorers) return [];
    return plScorers.scorers.map((s: any) => ({
      id: s.player.id,
      name: s.player.name,
      team: s.team,
      goals: s.goals,
      assists: s.assists ?? 0,
      position: s.player.position || 'Forward',
      // السعر متوقع لأن الـ API مفيش فيه سعر الفانتازي، لكن الأهداف والفرق حقيقية 100%
      price: (7 + Math.random() * 5).toFixed(1)
    }));
  }, [plScorers]);

  const debatePlayer1 = topPlayers[0];
  const debatePlayer2 = topPlayers[1];
  const trendingPlayers = topPlayers.slice(2, 6);

  // دالة (Quick Add) عشان لما يدوس إضافة يروح للملعب واللاعب ينزل فيه
  const handleQuickAdd = (player: any) => {
    const currentSquad = JSON.parse(localStorage.getItem('kt_saved_squad') || JSON.stringify(Array(15).fill(null)));
    
    let targetRange: number[] = [];
    const pos = (player.position || '').toLowerCase();
    const name = (player.name || '').toLowerCase();
    const isFplMid = pos.includes('midfield') || pos.includes('wing') || pos === 'mf' || ['salah', 'saka', 'foden', 'gordon', 'palmer', 'son', 'diaz', 'mbeumo', 'bowen', 'sterling', 'eze'].some(n => name.includes(n));
    const isDef = pos.includes('defen') || pos.includes('back') || pos === 'df';
    const isGk = pos.includes('goal') || pos === 'gk';
    
    if (isGk) targetRange = [10]; else if (isDef) targetRange = [6, 7, 8, 9]; else if (isFplMid) targetRange = [2, 3, 4, 5]; else targetRange = [0, 1]; 
    
    let targetIndex = targetRange.find(idx => currentSquad[idx] === null);
    if (targetIndex === undefined) { const benchRange = [11, 12, 13, 14]; targetIndex = benchRange.find(idx => currentSquad[idx] === null); }
    
    if (targetIndex !== undefined) {
      currentSquad[targetIndex] = player;
      localStorage.setItem('kt_saved_squad', JSON.stringify(currentSquad));
      navigate('/fantasy-hub');
    } else {
      alert("تشكيلتك مليانة! روح امسح حد الأول.");
      navigate('/fantasy-hub');
    }
  };

  return (
    <div className="space-y-12 pb-20 overflow-hidden">
      {/* Rate Limit Alert */}
      {isRateLimited && (
        <div className="sticky top-20 z-30 mx-auto max-w-lg">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-[#09090b]/80 p-4 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4">
             <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-400"><Loader2 className="h-4 w-4 animate-spin" /></div>
             <div className="flex-1"><p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Traffic Governor Active</p><p className="mt-1 text-[9px] font-black text-indigo-400/70 uppercase tracking-widest leading-none">Cooling down API clusters... Synchronizing data shortly.</p></div>
          </div>
        </div>
      )}

      {/* 👇 1. شريط قصف جبهة الـ AI (Roast Ticker) 👇 */}
      <div className="w-full bg-red-950/30 border-y border-red-900/50 py-3 relative z-50 flex items-center overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#09090b] to-transparent z-10" />
        <motion.div 
          animate={{ x: [0, -1500] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          className="flex whitespace-nowrap gap-12 text-[10px] md:text-xs font-black text-red-500 uppercase tracking-widest items-center"
        >
          <span className="flex items-center gap-2"><Flame size={12} /> AI: هل دكة البدلاء بتاعتك بتنافس على الدوري؟</span>
          <span className="flex items-center gap-2"><Flame size={12} /> AI: تشكيلة عظيمة، بس ياريت متلعبش بيها!</span>
          <span className="flex items-center gap-2"><Flame size={12} /> AI: سايب فلوس في البنك ليه؟ خايف من التضخم؟</span>
          <span className="flex items-center gap-2"><Flame size={12} /> AI: كابتنة أسطورية.. لو بتنافس على المركز الأخير.</span>
          <span className="flex items-center gap-2 text-white">🔥 DARE TO ROAST YOUR SQUAD? GO TO FANTASY HUB! 🔥</span>
          {/* تكرار الشريط لضمان اللوب */}
          <span className="flex items-center gap-2"><Flame size={12} /> AI: هل دكة البدلاء بتاعتك بتنافس على الدوري؟</span>
          <span className="flex items-center gap-2"><Flame size={12} /> AI: تشكيلة عظيمة، بس ياريت متلعبش بيها!</span>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111113] py-12 md:py-20 text-white rounded-[40px] mt-4 border border-zinc-800 shadow-2xl flex flex-col items-center text-center mx-4 sm:mx-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-4xl px-4 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8 shadow-2xl">
            <BrainCircuit size={14} /> Powered by AI
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-tight">
            Master Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Fantasy Squad</span>
          </h1>

          {/* 👇 2. صراع الكابتنة (بيانات حقيقية من API) 👇 */}
          {debatePlayer1 && debatePlayer2 && (
            <div className="bg-black/40 border border-zinc-800/80 p-6 rounded-3xl backdrop-blur-md max-w-2xl mx-auto my-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-2">
                <Swords size={16} className="text-emerald-400" /> The Captaincy Debate (Live API Data)
              </h3>
              
              <div className="flex items-center justify-between gap-4">
                {/* Player 1 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 border border-zinc-700 rounded-full p-3 mb-3 shadow-xl relative">
                    <img src={debatePlayer1.team.crest} className="w-full h-full object-contain" alt="" />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-900">C</div>
                  </div>
                  <h4 className="font-black text-sm md:text-base uppercase italic truncate w-full text-center">{debatePlayer1.name}</h4>
                  <p className="text-emerald-400 font-black text-lg md:text-xl">{debatePlayer1.goals} <span className="text-[10px] text-zinc-500 uppercase">Goals</span></p>
                </div>

                <div className="flex flex-col items-center justify-center px-4">
                  <span className="text-2xl md:text-4xl font-black italic text-zinc-700">VS</span>
                </div>

                {/* Player 2 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 border border-zinc-700 rounded-full p-3 mb-3 shadow-xl relative">
                    <img src={debatePlayer2.team.crest} className="w-full h-full object-contain" alt="" />
                  </div>
                  <h4 className="font-black text-sm md:text-base uppercase italic truncate w-full text-center">{debatePlayer2.name}</h4>
                  <p className="text-emerald-400 font-black text-lg md:text-xl">{debatePlayer2.goals} <span className="text-[10px] text-zinc-500 uppercase">Goals</span></p>
                </div>
              </div>

              <Link to="/fantasy-hub" className="mt-8 inline-flex items-center justify-center w-full bg-zinc-800 hover:bg-indigo-600 text-white font-black px-6 py-3 rounded-xl transition-colors uppercase tracking-widest text-[10px] md:text-xs">
                See AI Verdict & Compare <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/fantasy-hub" className="inline-flex items-center justify-center gap-3 bg-white text-black font-black px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)] uppercase tracking-widest text-[10px] md:text-[11px]">
              Launch Fantasy Hub <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 👇 3. رادار المواهب (Trending Market) من البيانات الحقيقية 👇 */}
      {trendingPlayers.length > 0 && (
        <section className="mx-4 sm:mx-6">
          <div className="flex items-center gap-3 mb-6 pl-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg md:text-xl font-black tracking-tight text-white uppercase italic">Trending Market</h2>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mt-1 ml-2 border-l border-zinc-700 pl-3">Top API Scorers</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingPlayers.map((p: any) => (
              <div key={p.id} className="bg-[#111113] border border-zinc-800 rounded-2xl p-4 md:p-5 hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><TrendingUp size={40} /></div>
                <div className="flex items-center gap-3 mb-3">
                  <img src={p.team.crest} className="w-6 h-6 md:w-8 md:h-8 object-contain" alt="" />
                  <div>
                    <h4 className="font-black text-white text-xs md:text-sm uppercase truncate">{p.name}</h4>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase">{p.goals} Goals</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickAdd(p)}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-emerald-600 text-zinc-400 hover:text-white font-black py-2 rounded-xl border border-zinc-800 hover:border-emerald-500 transition-all text-[10px] uppercase tracking-widest"
                >
                  <Plus size={12} /> Quick Add
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Live Matches Section (نفس الكود اللي كان موجود بالظبط) */}
      <section className="mx-4 sm:mx-6">
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-4 sm:mx-6">
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

        <div className="bg-zinc-950 rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden border border-zinc-800 ring-1 ring-zinc-800/50">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 pointer-events-none"><Trophy size={160} /></div>
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
                <Link key={league.id} to={`/leagues/${league.id}`} className="group flex items-center justify-between p-3 md:p-4 rounded-xl bg-[#111113] border border-zinc-800 transition-all hover:bg-zinc-900 hover:border-zinc-700">
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
    </div>
  );
}