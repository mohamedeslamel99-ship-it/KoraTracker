import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import MatchCard from '../components/MatchCard';
import { Trophy, Calendar, Loader2, ArrowRight, BrainCircuit, Flame, Swords, Plus, TrendingUp, X, Activity, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: liveData, error: liveError, isLoading: liveLoading } = useSWR(endpoints.getLiveMatches(), fetchFootballData, { refreshInterval: 15000 });
  const { data: fixturesData, error: fixturesError, isLoading: fixturesLoading } = useSWR(endpoints.getMatches(), fetchFootballData);
  const { data: plScorers, isLoading: scorersLoading } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData, { revalidateOnFocus: false });

  const liveMatches = liveData?.matches || [];
  const upcomingMatches = fixturesData?.matches?.filter((m: any) => m.status === 'TIMED' || m.status === 'SCHEDULED').slice(0, 8) || [];
  const isRateLimited = liveError?.message?.includes('request limit') || fixturesError?.message?.includes('request limit');

  const [selectedLiveMatch, setSelectedLiveMatch] = useState<any>(null);

  const topPlayers = useMemo(() => {
    if (!plScorers?.scorers) return [];
    return plScorers.scorers.map((s: any) => ({
      id: s.player.id,
      name: s.player.name,
      team: s.team,
      goals: s.goals,
      assists: s.assists ?? 0,
      position: s.player.position || 'Forward',
      price: (7 + Math.random() * 5).toFixed(1)
    }));
  }, [plScorers]);

  const debatePlayer1 = topPlayers[0];
  const debatePlayer2 = topPlayers[1];
  const trendingPlayers = topPlayers.slice(2, 6);

  // 🟢 استخراج أخبار حقيقية 100% من الـ API لشريط الـ Marquee
  const liveNewsTicker = useMemo(() => {
    const news = [];
    
    // 1. لو في ماتشات شغالة لايف دلوقتي
    if (liveMatches.length > 0) {
      liveMatches.slice(0, 2).forEach((m: any) => {
        const homeScore = m.score?.fullTime?.home ?? 0;
        const awayScore = m.score?.fullTime?.away ?? 0;
        news.push(`🔴 مباشر الآن: ${m.homeTeam.shortName || m.homeTeam.name} ${homeScore} - ${awayScore} ${m.awayTeam.shortName || m.awayTeam.name}`);
      });
    }

    // 2. أفضل الهدافين من الـ API
    if (topPlayers.length > 0) {
      news.push(`🔥 هداف الدوري: ${topPlayers[0].name.split(' ').pop()} برصيد ${topPlayers[0].goals} أهداف.`);
      if (topPlayers[1]) {
        news.push(`⭐ تألق مستمر: ${topPlayers[1].name.split(' ').pop()} يلاحق الصدارة بـ ${topPlayers[1].goals} أهداف.`);
      }
    }

    // 3. الماتش القادم
    if (upcomingMatches.length > 0) {
      const nextMatch = upcomingMatches[0];
      news.push(`📅 المواجهة القادمة: ${nextMatch.homeTeam.shortName || nextMatch.homeTeam.name} ضد ${nextMatch.awayTeam.shortName || nextMatch.awayTeam.name}`);
    }

    // رسالة افتراضية لو الـ API لسه بيحمل
    if (news.length === 0) {
      news.push("🔄 جاري مزامنة أحدث إحصائيات الدوري الإنجليزي الممتاز...");
    }

    news.push("⚡ BEAT THE DEADLINE. LAUNCH FANTASY HUB NOW! ⚡");
    
    return news;
  }, [liveMatches, topPlayers, upcomingMatches]);

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
      setToastMessage(`✅ ${player.name.split(' ').pop()} Added to Squad!`);
    } else {
      setToastMessage(`❌ Squad is full! Free up a slot.`);
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="space-y-8 md:space-y-12 pb-20 overflow-x-hidden relative">
      
      {/* 🟢 الإشعار المنبثق (Toast) 🟢 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[300] bg-zinc-900 border border-emerald-500/50 shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-3 min-w-[280px]"
          >
            {toastMessage.includes('✅') ? <CheckCircle2 className="text-emerald-500 shrink-0" size={18} /> : <X className="text-red-500 shrink-0" size={18} />}
            <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest">{toastMessage.replace(/✅|❌/, '').trim()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isRateLimited && (
        <div className="sticky top-20 z-30 mx-auto max-w-lg px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-[#09090b]/80 p-4 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4">
             <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-400"><Loader2 className="h-4 w-4 animate-spin" /></div>
             <div className="flex-1"><p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Traffic Governor Active</p><p className="mt-1 text-[9px] font-black text-indigo-400/70 uppercase tracking-widest leading-none">Cooling down API clusters... Synchronizing data shortly.</p></div>
          </div>
        </div>
      )}

      {/* 🔴 Marquee (شريط أخبار حقيقي 100% من الـ API) 🔴 */}
      <div className="w-full bg-red-950/20 border-y border-red-500/20 py-2.5 relative z-0 flex overflow-hidden mt-2 md:mt-4">
        <motion.div
          className="flex whitespace-nowrap w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex whitespace-nowrap gap-8 md:gap-12 items-center px-4 md:px-6">
               {liveNewsTicker.map((newsItem, idx) => (
                 <span key={idx} className="flex items-center gap-2 text-[9px] md:text-xs font-black text-red-400 uppercase tracking-widest">
                   <Flame size={12} className="animate-pulse text-red-500"/> {newsItem}
                 </span>
               ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* 🌟 Hero Section */}
      <section className="relative overflow-hidden bg-[#111113] py-10 md:py-20 text-white rounded-[2rem] md:rounded-[40px] border border-zinc-800 shadow-2xl flex flex-col items-center text-center mx-4 sm:mx-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-4xl px-2 md:px-4 w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-indigo-400 text-[9px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 shadow-2xl">
            <BrainCircuit size={12} className="md:w-3.5 md:h-3.5" /> Powered by API
          </div>
          
          <h1 className="text-[2.5rem] leading-[0.9] sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter mb-4">
            Master Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Fantasy Squad</span>
          </h1>
          
          <p className="text-zinc-400 text-[9px] sm:text-xs md:text-sm font-bold uppercase tracking-widest max-w-xl mb-6 md:mb-8 px-4 leading-relaxed">
            حلل تشكيلتك بالذكاء الاصطناعي، راقب تغيرات الأسعار لحظة بلحظة، وتفوق في دوري الفانتازي الخاص بك.
          </p>

          {/* Captaincy Debate Card */}
          {debatePlayer1 && debatePlayer2 && (
            <div className="bg-black/40 border border-zinc-800/80 p-4 md:p-6 rounded-[2rem] backdrop-blur-md w-full max-w-[95%] md:max-w-2xl mx-auto my-4 md:my-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />
              
              <h3 className="text-[9px] md:text-xs font-black text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4 md:mb-6 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-center">
                <div className="flex items-center gap-1"><Swords size={14} className="text-emerald-400" /> THE CAPTAINCY DEBATE</div>
                <span className="text-indigo-400">(LIVE API DATA)</span>
              </h3>
              
              <div className="flex items-center justify-center gap-2 md:gap-4 w-full mb-2">
                <div className="flex-1 flex flex-col items-center min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 bg-zinc-900 border border-zinc-700 rounded-full p-2 md:p-3 mb-2 md:mb-3 shadow-xl relative">
                    <img src={debatePlayer1.team.crest} className="w-full h-full object-contain" alt="" />
                    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-yellow-500 text-black text-[8px] md:text-[10px] font-black w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-zinc-900">C</div>
                  </div>
                  <h4 className="font-black text-[10px] sm:text-xs md:text-base uppercase italic truncate w-full text-center px-1">{debatePlayer1.name.split(' ').pop()}</h4>
                  <p className="text-emerald-400 font-black text-sm md:text-xl mt-0.5 md:mt-0">{debatePlayer1.goals} <span className="text-[7px] md:text-[10px] text-zinc-500 uppercase">Goals</span></p>
                </div>
                
                <div className="flex flex-col items-center justify-center px-2 shrink-0">
                  <span className="text-xl sm:text-2xl md:text-4xl font-black italic text-zinc-700">VS</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 bg-zinc-900 border border-zinc-700 rounded-full p-2 md:p-3 mb-2 md:mb-3 shadow-xl relative">
                    <img src={debatePlayer2.team.crest} className="w-full h-full object-contain" alt="" />
                  </div>
                  <h4 className="font-black text-[10px] sm:text-xs md:text-base uppercase italic truncate w-full text-center px-1">{debatePlayer2.name.split(' ').pop()}</h4>
                  <p className="text-emerald-400 font-black text-sm md:text-xl mt-0.5 md:mt-0">{debatePlayer2.goals} <span className="text-[7px] md:text-[10px] text-zinc-500 uppercase">Goals</span></p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center w-full gap-4 mt-2">
            <Link to="/fantasy-hub" className="inline-flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-black px-8 md:px-12 py-3.5 md:py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(79,70,229,0.4)] uppercase tracking-[0.2em] text-[9px] md:text-[12px] w-[90%] sm:w-auto">
              Launch Fantasy Hub <ArrowRight size={14} className="md:w-4 md:h-4" />
            </Link>
            
            <Link to="/fantasy-hub" className="inline-flex items-center justify-center w-[90%] sm:w-auto text-zinc-400 hover:text-white font-black transition-colors uppercase tracking-[0.15em] text-[8px] sm:text-[9px] md:text-[10px] border border-transparent hover:border-zinc-700 px-6 py-2.5 rounded-full">
              See AI Verdict & Compare Features
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trending Market */}
      <section className="mx-4 sm:mx-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-5 md:mb-6 pl-1 md:pl-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base md:text-xl font-black tracking-tight text-white uppercase italic">Trending Market</h2>
          </div>
          <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none sm:border-l sm:border-zinc-700 sm:pl-3">Top API Scorers</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {scorersLoading ? (
             Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="h-32 md:h-40 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
             ))
          ) : (
            trendingPlayers.map((p: any) => (
              <div key={p.id} className="bg-[#111113] border border-zinc-800 rounded-2xl p-3 md:p-5 hover:border-emerald-500/50 transition-colors group relative overflow-hidden flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 p-2 md:p-3 opacity-5 pointer-events-none"><TrendingUp size={30} className="md:w-10 md:h-10" /></div>
                <div className="flex items-center gap-2 md:gap-3 mb-3">
                  <img src={p.team.crest} className="w-5 h-5 md:w-8 md:h-8 object-contain shrink-0" alt="" />
                  <div className="min-w-0">
                    <h4 className="font-black text-white text-[10px] md:text-sm uppercase truncate">{p.name.split(' ').pop()}</h4>
                    <p className="text-[8px] md:text-[9px] text-emerald-400 font-bold uppercase">{p.goals} Goals</p>
                  </div>
                </div>
                <button onClick={() => handleQuickAdd(p)} className="w-full mt-2 flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-emerald-600 text-zinc-400 hover:text-white font-black py-2 rounded-xl border border-zinc-800 hover:border-emerald-500 transition-all text-[8px] md:text-[10px] uppercase tracking-widest">
                  <Plus size={10} className="md:w-3 md:h-3" /> Quick Add
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Live Matches Section */}
      <section className="mx-4 sm:mx-6">
        <div className="flex items-center justify-between mb-6 md:mb-8 px-1 md:px-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-xl bg-red-500/10 p-2 md:p-2.5 shrink-0">
              <span className="relative flex h-2 w-2 md:h-3 md:w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-full w-full rounded-full bg-red-500" />
              </span>
            </div>
            <div>
              <h2 className="text-base md:text-2xl font-black tracking-tight text-white uppercase italic leading-none">Live Scores</h2>
              <p className="text-[7px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mt-1.5">Tap match for Live Center</p>
            </div>
          </div>
        </div>

        {liveLoading ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
             {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[140px] md:h-[180px] w-full animate-pulse rounded-3xl bg-zinc-900/50 border border-zinc-800" />
             ))}
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {liveMatches.map((match: any) => (
              <div 
                key={match.id} 
                onClick={() => setSelectedLiveMatch(match)}
                className="cursor-pointer group relative transition-transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] blur-xl z-0 pointer-events-none"></div>
                <div className="relative z-10 pointer-events-none">
                  {/* @ts-ignore */}
                  <MatchCard match={match} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2rem] md:rounded-[32px] bg-[#18181b] border border-zinc-800 py-12 md:py-16 px-4 shadow-sm">
            <div className="rounded-full bg-zinc-800/50 p-4 md:p-6 shadow-sm mb-4 md:mb-6 border border-zinc-700/50">
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-zinc-500" />
            </div>
            <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tight text-center">No matches currently live</h3>
            <p className="mt-2 text-[8px] md:text-[10px] text-zinc-500 text-center max-w-xs leading-relaxed font-bold tracking-widest uppercase">
              Check back during match hours!
            </p>
          </div>
        )}
      </section>

      {/* Featured Leagues & Upcoming */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mx-4 sm:mx-6">
        <div className="bg-[#18181b] rounded-[2rem] md:rounded-[32px] border border-zinc-800 p-5 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 text-zinc-100 mb-6 md:mb-8">
            <div className="rounded-xl bg-indigo-500/10 p-2 md:p-2.5 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Calendar className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <h2 className="text-base md:text-xl font-black tracking-tight uppercase italic leading-none">Upcoming</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {fixturesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 md:h-16 w-full animate-pulse rounded-xl bg-zinc-900/50 border border-zinc-800" />
              ))
            ) : upcomingMatches.length > 0 ? (
              upcomingMatches.map((match: any) => (
                <div key={match.id} className="flex items-center justify-between border-b border-zinc-800 pb-3 md:pb-4 last:border-0 last:pb-0 group">
                  <div className="flex flex-1 items-center gap-2">
                    <img src={match.homeTeam.crest} alt="" className="h-4 w-4 md:h-6 md:w-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                    <span className="text-[9px] md:text-xs font-bold text-zinc-300 truncate uppercase tracking-tight">{match.homeTeam.shortName || match.homeTeam.name.substring(0,3)}</span>
                  </div>
                  <div className="flex flex-col items-center px-2 shrink-0">
                    <span className="pill text-zinc-100 bg-zinc-800 border border-zinc-700 min-w-[40px] md:min-w-[50px] text-center text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1">
                      {new Date(match.utcDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-end gap-2 text-right">
                    <span className="text-[9px] md:text-xs font-bold text-zinc-300 truncate uppercase tracking-tight">{match.awayTeam.shortName || match.awayTeam.name.substring(0,3)}</span>
                    <img src={match.awayTeam.crest} alt="" className="h-4 w-4 md:h-6 md:w-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-6 md:py-8 italic font-bold uppercase tracking-widest text-[9px] md:text-xs">No upcoming matches</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-950 rounded-[2rem] md:rounded-[32px] p-5 md:p-8 text-white relative overflow-hidden border border-zinc-800 ring-1 ring-zinc-800/50">
          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 text-indigo-500 pointer-events-none">
            <Trophy size={100} className="md:w-[160px] md:h-[160px]" />
          </div>
          <div className="relative">
            <h2 className="text-base md:text-xl font-black tracking-tight mb-5 md:mb-8 uppercase italic flex items-center gap-2 leading-none">
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-indigo-500 shrink-0" />
              Major Leagues
            </h2>
            <div className="grid grid-cols-1 gap-2.5 md:gap-3">
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
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors shrink-0", league.id === 'PL' ? league.color : "bg-zinc-700 group-hover:bg-zinc-400")} />
                    <span className="text-[10px] md:text-sm font-bold tracking-tight text-zinc-400 group-hover:text-zinc-100 transition-colors uppercase">{league.name}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 👇 نافذة غرفة المباراة التفاعلية (Live Match Center) 👇 */}
      <AnimatePresence>
        {selectedLiveMatch && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLiveMatch(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-zinc-800 bg-[#09090b] shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] flex flex-col">
              
              <div className="bg-zinc-900/50 border-b border-zinc-800 px-5 py-3 md:px-6 md:py-4 flex justify-between items-center">
                 <div className="flex items-center gap-2.5 md:gap-3">
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest leading-none">Match Center</h3>
                 </div>
                 <button onClick={() => setSelectedLiveMatch(null)} className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-1.5 md:p-2 rounded-full shrink-0"><X size={14} className="md:w-4 md:h-4" /></button>
              </div>

              <div className="p-6 sm:p-8 md:p-12 relative overflow-hidden bg-gradient-to-b from-zinc-900/40 to-transparent">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none flex justify-center items-center"><Activity size={150} className="md:w-[300px] md:h-[300px]" /></div>
                 
                 <div className="flex items-center justify-between relative z-10 gap-2 md:gap-4">
                    <div className="flex-1 flex flex-col items-center text-center min-w-0">
                       <img src={selectedLiveMatch.homeTeam.crest} className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 object-contain mb-3 md:mb-4 drop-shadow-2xl" alt="" />
                       <h2 className="text-[10px] sm:text-xs md:text-xl font-black text-white uppercase tracking-tight truncate w-full px-1">{selectedLiveMatch.homeTeam.shortName || selectedLiveMatch.homeTeam.name.substring(0,3)}</h2>
                    </div>

                    <div className="flex flex-col items-center justify-center shrink-0">
                       <div className="bg-red-500 text-white text-[8px] md:text-xs font-black uppercase tracking-widest px-2.5 py-0.5 md:px-3 md:py-1 rounded-full mb-3 md:mb-4 shadow-[0_0_15px_rgba(239,68,68,0.5)] whitespace-nowrap">
                          {selectedLiveMatch.status === 'PAUSED' ? 'HT' : 'Live'} {selectedLiveMatch.minute ? `${selectedLiveMatch.minute}'` : ''}
                       </div>
                       <div className="flex items-center gap-3 md:gap-6 bg-zinc-950 border border-zinc-800 rounded-2xl md:rounded-3xl px-4 py-3 md:px-8 md:py-6 shadow-xl">
                          <span className="text-2xl sm:text-3xl md:text-6xl font-black text-white tabular-nums leading-none">{selectedLiveMatch.score?.fullTime?.home ?? 0}</span>
                          <span className="text-lg md:text-2xl text-zinc-700 leading-none">-</span>
                          <span className="text-2xl sm:text-3xl md:text-6xl font-black text-white tabular-nums leading-none">{selectedLiveMatch.score?.fullTime?.away ?? 0}</span>
                       </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center text-center min-w-0">
                       <img src={selectedLiveMatch.awayTeam.crest} className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 object-contain mb-3 md:mb-4 drop-shadow-2xl" alt="" />
                       <h2 className="text-[10px] sm:text-xs md:text-xl font-black text-white uppercase tracking-tight truncate w-full px-1">{selectedLiveMatch.awayTeam.shortName || selectedLiveMatch.awayTeam.name.substring(0,3)}</h2>
                    </div>
                 </div>
              </div>

              <div className="bg-[#111113] border-t border-zinc-800 p-4 md:p-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-center text-[9px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest text-center sm:text-left">
                 <div className="flex items-center gap-1.5 md:gap-2">
                    <MapPin size={12} className="text-indigo-400 md:w-3.5 md:h-3.5 shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{selectedLiveMatch.venue ? selectedLiveMatch.venue : 'Stadium TBA'}</span>
                 </div>
                 <div className="flex items-center gap-1.5 md:gap-2">
                    <Activity size={12} className="text-emerald-400 md:w-3.5 md:h-3.5 shrink-0" />
                    Data Synced Live
                 </div>
                 <div className="flex items-center gap-1.5 md:gap-2">
                    <Whistle size={12} className="text-amber-400 md:w-3.5 md:h-3.5 shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{selectedLiveMatch.referees && selectedLiveMatch.referees.length > 0 ? selectedLiveMatch.referees[0].name : 'Referee TBA'}</span>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 📌 أيقونة الصفارة (Whistle)
function Whistle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5"/>
      <path d="M12 2v10"/>
      <path d="M9 5h6"/>
      <path d="M15 15h2.5c1.4 0 2.5-1.1 2.5-2.5v-1c0-1.4-1.1-2.5-2.5-2.5H16"/>
    </svg>
  );
}