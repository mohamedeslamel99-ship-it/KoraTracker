import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import { Users, Search, Scale, Shield, Zap, TrendingUp, Info, X, ChevronRight, Loader2, Star, Ghost, Clock, BarChart3, Trash2, Crown, Share2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '../components/Skeleton';
import SquadBuilder from '../components/SquadBuilder';

export default function FantasyHub() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  
  // 👇 State الملعب 👇
  const [squad, setSquad] = useState<any[]>(Array(15).fill(null));

  // 👇 العقل الذكي الجديد لتوزيع اللعيبة حسب المراكز 👇
  const addToSquad = (player: any) => {
    if (squad.some(p => p?.id === player.id)) {
      alert("اللاعب ده موجود في التشكيلة فعلاً!");
      return;
    }

    let targetRange: number[] = [];
    const pos = player.position?.toLowerCase() || '';

    // تحديد أماكن الملعب حسب المركز
    if (pos.includes('goal') || pos === 'gk') {
      targetRange = [10]; // مكان الحارس
    } else if (pos.includes('defen') || pos.includes('back') || pos === 'df') {
      targetRange = [6, 7, 8, 9]; // أماكن الدفاع
    } else if (pos.includes('midfield') || pos === 'mf') {
      targetRange = [2, 3, 4, 5]; // أماكن الوسط
    } else if (pos.includes('forward') || pos.includes('attack') || pos.includes('offen') || pos.includes('wing') || pos === 'fw') {
      targetRange = [0, 1]; // أماكن الهجوم
    } else {
      // لو المركز مش معروف، خليه يدور في الملعب الأساسي كله
      targetRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    // دور على أول مكان فاضي في مركزه
    let targetIndex = targetRange.find(idx => squad[idx] === null);

    // لو مركزه الأساسي مليان، دور في دكة البدلاء
    if (targetIndex === undefined) {
      const benchRange = [11, 12, 13, 14];
      targetIndex = benchRange.find(idx => squad[idx] === null);
    }

    // لو الدكة كمان مليانة
    if (targetIndex === undefined) {
      alert(`مفيش مكان فاضي لـ ${player.name} في مركزه ولا على الدكة!`);
      return;
    }

    // إضافة اللاعب للمكان اللي تم اختياره
    const newSquad = [...squad];
    newSquad[targetIndex] = player;
    setSquad(newSquad);
    alert(`تم إضافة ${player.name} للتشكيلة بنجاح! ⚽`);
  };

  const removeFromSquad = (index: number) => {
    const newSquad = [...squad];
    newSquad[index] = null;
    setSquad(newSquad);
  };
  // 👆 نهاية لوجيك الملعب الذكي 👆

  const handleShare = () => {
    if (selectedPlayers.length !== 2) return;
    const [p1, p2] = selectedPlayers;
    const text = `📊 KoraTracker Audit:\n\n${p1.name} VS ${p2.name}\n\nGoals: ${p1.goals} - ${p2.goals}\nPoints: ${p1.points} - ${p2.points}\nValue: £${p1.price}m - £${p2.price}m\n\nAnalyze world-class stats on KoraTracker!`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const { data: teamsData } = useSWR(endpoints.getTeams('PL'), fetchFootballData, { 
    revalidateOnFocus: false,
    revalidateIfStale: false 
  });
  const teams = teamsData?.teams || [];

  const [leaguePlayers, setLeaguePlayers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kt_players_db');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [syncedTeams, setSyncedTeams] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kt_sync_progress');
      return saved ? parseInt(saved, 10) : 0;
    } catch { return 0; }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'cooling' | 'staggering' | 'synced'>('idle');

  const { data: plScorers, error: plError } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData, { revalidateOnFocus: false });
  const { data: llScorers } = useSWR(endpoints.getTopScorers('PD'), fetchFootballData, { revalidateOnFocus: false });
  const { data: saScorers } = useSWR(endpoints.getTopScorers('SA'), fetchFootballData, { revalidateOnFocus: false });
  const { data: blScorers } = useSWR(endpoints.getTopScorers('BL1'), fetchFootballData, { revalidateOnFocus: false });

  const allPlayers = useMemo(() => {
    try {
      const uniqueMap = new Map();
      
      leaguePlayers.forEach(p => {
        if (p?.id) {
          uniqueMap.set(p.id, {
            ...p,
            goals: p.goals || 0,
            assists: p.assists ?? 0,
            appearances: p.appearances ?? 0,
            yellowCards: p.yellowCards ?? 0,
            price: p.price ?? '5.0',
            form: p.form ?? '0.0',
            points: p.points ?? 0,
            cleanSheets: p.cleanSheets ?? 0
          });
        }
      });

      const combined = [
        ...(plScorers?.scorers || []),
        ...(llScorers?.scorers || []),
        ...(saScorers?.scorers || []),
        ...(blScorers?.scorers || [])
      ];
      
      combined.forEach(s => {
        if (s?.player?.id) {
          uniqueMap.set(s.player.id, {
            ...s.player,
            team: s.team || { name: 'Unknown' },
            goals: s.goals || 0,
            assists: s.assists ?? Math.floor(Math.random() * 5),
            cleanSheets: Math.floor(Math.random() * 8),
            price: (5 + Math.random() * 7).toFixed(1),
            form: (2 + Math.random() * 6).toFixed(1),
            points: Math.floor(Math.random() * 120) + 40,
            appearances: Math.floor(Math.random() * 25) + 5,
            yellowCards: Math.floor(Math.random() * 6),
            position: s.player.position || 'Forward'
          });
        }
      });

      return Array.from(uniqueMap.values());
    } catch (err) {
      console.error("[FantasyHub] Error parsing players:", err);
      return [];
    }
  }, [plScorers, llScorers, saScorers, blScorers, leaguePlayers]);

  const handleSearch = (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = allPlayers.filter(p => 
      p.name?.toLowerCase().includes(term.toLowerCase()) ||
      p.team?.name?.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 8);
    setSearchResults(results);
  };

  useEffect(() => {
    const isRecentlySynced = localStorage.getItem('kt_last_sync') && 
                            (Date.now() - parseInt(localStorage.getItem('kt_last_sync')!, 10)) < 12 * 60 * 60 * 1000;
                            
    if (teams.length > 0 && !isSyncing && (leaguePlayers.length === 0 || !isRecentlySynced)) {
      const syncLeague = async () => {
        setIsSyncing(true);
        setSyncStatus('staggering');
        
        if (syncedTeams === 0) {
          await new Promise(r => setTimeout(r, 10000));
        }
        
        setSyncStatus('running');
        
        let i = syncedTeams;
        while (i < teams.length) {
          const team = teams[i];
          try {
            const data = await fetchFootballData(endpoints.getTeam(team.id.toString()));
            if (data?.squad) {
              const teamSquad = data.squad.map((p: any) => ({
                ...p,
                team: { id: team.id, name: team.name, crest: team.crest, shortName: team.shortName },
                goals: Math.floor(Math.random() * 5),
                assists: Math.floor(Math.random() * 5),
                cleanSheets: Math.floor(Math.random() * 8),
                price: (4.5 + Math.random() * 8).toFixed(1),
                form: (1 + Math.random() * 5).toFixed(1),
                points: Math.floor(Math.random() * 100) + 20,
                position: p.position || 'Unknown'
              }));
              
              setLeaguePlayers(prev => {
                const unique = new Map();
                [...prev, ...teamSquad].forEach(item => unique.set(item.id, item));
                const next = Array.from(unique.values());
                localStorage.setItem('kt_players_db', JSON.stringify(next));
                return next;
              });
              
              const nextSyncCount = i + 1;
              setSyncedTeams(nextSyncCount);
              localStorage.setItem('kt_sync_progress', nextSyncCount.toString());
              
              i++; 
            }
            await new Promise(r => setTimeout(r, 9000));
          } catch (err: any) {
            const isRateLimit = err.message?.includes('limit') || err.message?.includes('Wait');
            if (isRateLimit) {
              setSyncStatus('cooling');
              const waitMatch = err.message.match(/Wait (\d+) seconds/i);
              const waitTime = waitMatch ? parseInt(waitMatch[1]) : 45;
              await new Promise(r => setTimeout(r, (waitTime + 10) * 1000));
              setSyncStatus('running');
            } else {
              i++; 
              await new Promise(r => setTimeout(r, 3000));
            }
          }
        }
        
        setIsSyncing(false);
        setSyncStatus('synced');
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 5000);
        localStorage.setItem('kt_last_sync', Date.now().toString());
      };
      syncLeague();
    } else if (isRecentlySynced && leaguePlayers.length > 0) {
      setSyncStatus('synced');
    }
  }, [teams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      handleSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, allPlayers]);

  const handleSelectForPreview = (player: any) => {
    setActivePlayer(player);
    setSearch('');
    setSearchResults([]);
  };

  const addToComparison = (player: any) => {
    if (selectedPlayers.find(p => p.id === player.id)) return;
    if (selectedPlayers.length >= 2) {
      setSelectedPlayers([selectedPlayers[1], player]);
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const removePlayer = (id: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== id));
    if (selectedPlayers.length <= 1) setIsComparisonOpen(false);
  };

  const clearComparison = () => {
    setSelectedPlayers([]);
    setIsComparisonOpen(false);
  };

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      <header className="pt-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
          <Zap size={14} className="fill-indigo-500/20" />
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white uppercase italic">
          Fantasy <span className="text-indigo-500">Hub</span>
        </h1>
        <p className="mt-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
          Global Player Intelligence & Precision Analytics
        </p>
      </header>

      <section className="relative z-40 max-w-2xl mx-auto px-4">
        {(plError || plScorers?.message?.includes('limit')) && !isSyncing && (
          <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
            <Info size={12} />
            Data Governor Active: Limited Player Pool
          </div>
        )}
        
        {isSyncing && (
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
               {syncStatus === 'cooling' ? (
                 <span className="text-amber-500 animate-pulse flex items-center gap-2">
                   <Zap size={10} /> Traffic Governance: Cooling Off ({syncedTeams}/{teams.length})
                 </span>
               ) : syncStatus === 'staggering' ? (
                 <span className="text-zinc-500 flex items-center gap-2">
                   <Clock size={10} strokeWidth={3} />
                   Request Staggering: Buffering Budget...
                 </span>
               ) : (
                 <span className="text-indigo-400 flex items-center gap-2">
                   <Loader2 size={10} className="animate-spin" />
                   Broadcasting league Frequencies: {syncedTeams}/{teams.length} Teams Synced
                 </span>
               )}
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
               <motion.div 
                 className={cn("h-full transition-colors duration-500", syncStatus === 'cooling' ? "bg-amber-500" : "bg-indigo-500")}
                 initial={{ width: 0 }}
                 animate={{ width: `${(syncedTeams / teams.length) * 100}%` }}
               />
            </div>
          </div>
        )}

        <AnimatePresence>
          {showSyncSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl bg-emerald-600 text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-4 border border-emerald-400/30 backdrop-blur-md"
            >
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Star size={18} fill="white" className="text-white" />
              </div>
              <div className="pr-4 border-r border-white/10">
                <p className="text-xs font-black uppercase tracking-widest leading-none">Intelligence Sync Complete</p>
                <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-wider">Scout Pool Updated: 20/20 Teams Cached</p>
              </div>
              <button 
                onClick={() => setShowSyncSuccess(false)}
                className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn(
          "relative group transition-all duration-300",
          search && "scale-[1.02]"
        )}>
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search Player Pool: Haaland, Salah, Vinícius..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-6 rounded-2xl border border-zinc-800 bg-[#111113]/80 backdrop-blur-xl shadow-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-sm text-white placeholder:text-zinc-600 uppercase tracking-tight"
          />
          
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#18181b] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]"
              >
                <div className="p-2 grid grid-cols-1 gap-1">
                  {searchResults.map((player, idx) => (
                    <div
                      key={player.id || `search-${idx}`}
                      onClick={() => handleSelectForPreview(player)}
                      className="flex items-center gap-4 px-4 py-3 text-left hover:bg-zinc-800/80 rounded-xl transition-all group cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center shrink-0">
                         <img src={player.team.crest} alt={`${player.team.name} crest`} className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white uppercase tracking-tight">{player.name}</p>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">
                          {player.team.shortName || player.team.name} <span className="mx-1 text-zinc-800">|</span> <span className="text-zinc-500 italic">£{player.price}m</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToSquad(player);
                          }}
                          className="p-2 rounded-lg bg-emerald-900/30 border border-emerald-800 text-emerald-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-lg"
                          title="Add to Squad"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToComparison(player);
                          }}
                          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all shadow-lg"
                          title="Add to Comparison"
                        >
                          <Scale size={14} />
                        </button>
                        <ChevronRight size={14} className="text-zinc-800 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
           <AnimatePresence mode="wait">
             {activePlayer ? (
               <motion.div
                 key="active-card"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="rounded-3xl border border-indigo-500/30 bg-[#111113] p-8 shadow-2xl relative overflow-hidden ring-1 ring-indigo-500/20"
               >
                 <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Star size={120} className="text-indigo-500 fill-indigo-500" />
                 </div>
                 
                 <div className="relative">
                   <div className="flex justify-between items-start mb-8">
                     <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 shadow-xl">
                       <img src={activePlayer.team.crest} alt={`${activePlayer.team.name} crest`} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                     </div>
                     <button onClick={() => setActivePlayer(null)} className="h-8 w-8 rounded-full bg-zinc-900 text-zinc-500 flex items-center justify-center hover:bg-zinc-800">
                        <X size={14} />
                     </button>
                   </div>

                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{activePlayer.name}</h3>
                   <div className="flex items-center justify-between mt-1 mb-8">
                     <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">{activePlayer.team.name}</p>
                     <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                       {activePlayer.position}
                     </span>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                         <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-2">Goals</p>
                         <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{activePlayer.goals}</p>
                      </div>
                      <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                         <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-2">Assists</p>
                         <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{activePlayer.assists}</p>
                      </div>
                      <div className="col-span-2 bg-indigo-600/10 rounded-2xl p-4 border border-indigo-500/20">
                         <div className="flex justify-between items-center text-indigo-400">
                            <span className="text-[10px] font-black uppercase tracking-widest">Clean Sheets</span>
                            <span className="text-xl font-black tabular-nums">{activePlayer.cleanSheets}</span>
                         </div>
                      </div>
                   </div>
                    
                   <div className="flex gap-2 w-full">
                     <button
                       onClick={() => addToComparison(activePlayer)}
                       className="flex-1 h-12 rounded-xl bg-indigo-600 flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-[0.2em] text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                     >
                       <Scale size={14} />
                       Compare
                     </button>
                     <button
                       onClick={() => addToSquad(activePlayer)}
                       className="flex-1 h-12 rounded-xl bg-emerald-600 flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-[0.2em] text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                     >
                       <Plus size={14} />
                       Add to Squad
                     </button>
                   </div>

                 </div>
               </motion.div>
             ) : (
               <motion.div
                 key="empty-card"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="rounded-3xl border border-dashed border-zinc-800 p-8 text-center bg-[#09090b]/50 py-20"
               >
                 <div className="h-12 w-12 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center mx-auto mb-6 text-zinc-700">
                    <Ghost size={20} />
                 </div>
                 <h4 className="text-xs font-black text-zinc-600 uppercase tracking-widest">Awaiting Input</h4>
                 <p className="mt-4 text-[10px] text-zinc-800 uppercase tracking-[0.15em] leading-relaxed px-4 font-black">
                   Search for a player above to unlock detailed stats and <span className="text-zinc-600 italic">comparison metrics</span>.
                 </p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
           {selectedPlayers.length === 0 ? (
             <div className="flex flex-col items-center justify-center rounded-[32px] border border-zinc-800 bg-[#111113] p-12 py-32 text-center shadow-inner group">
                <div className="h-24 w-24 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center mb-10 text-zinc-800 group-hover:border-zinc-700 transition-colors">
                   <TrendingUp size={40} className="opacity-20 translate-y-1" />
                </div>
                <h2 className="text-lg font-black text-zinc-700 uppercase tracking-[0.3em] italic mb-4">Comparison Labs</h2>
                <p className="max-w-xs text-[10px] font-black text-zinc-800 uppercase tracking-widest leading-loose">
                  Select up to <span className="text-zinc-600">two player profiles</span> to launch the side-by-side performance audit.
                </p>
             </div>
           ) : (
             <div className="rounded-[40px] border border-zinc-800 bg-[#18181b] p-2 overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#6366f111,transparent_70%)]" />
                
                <div className="bg-[#111113] rounded-[38px] p-10 relative z-10">
                   <div className="grid grid-cols-2 gap-10 mb-16 relative">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center text-[10px] font-black text-zinc-700 shadow-xl italic tracking-widest">
                         VS
                      </div>
                      
                      {selectedPlayers.map((player, idx) => (
                        <div key={player.id || `selected-${idx}`} className={cn("relative flex flex-col items-center group", idx === 0 ? "items-start text-left" : "items-end text-right")}>
                           <button
                             onClick={() => removePlayer(player.id)}
                             className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all z-20"
                           >
                             <X size={12} />
                           </button>
                           <div className="h-24 w-24 rounded-3xl bg-zinc-900 border-2 border-zinc-800 p-5 mb-6 group-hover:border-indigo-500/40 transition-all shadow-2xl overflow-hidden relative">
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <img src={player.team.crest} alt={`${player.team.name} crest`} className="h-full w-full object-contain group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                           </div>
                           <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{player.name}</h3>
                           <p className="mt-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{player.team.shortName || player.team.name}</p>
                        </div>
                      ))}

                      {selectedPlayers.length === 1 && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-[32px] p-8 opacity-20">
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-black italic">Awaiting Delta</span>
                        </div>
                      )}
                   </div>

                   {selectedPlayers.length === 2 && (
                     <div className="space-y-10">
                        <PlayerStatRow label="FPL Price" val1={`£${selectedPlayers[0].price}m`} val2={`£${selectedPlayers[1].price}m`} />
                        <PlayerStatRow label="Recent Form" val1={selectedPlayers[0].form} val2={selectedPlayers[1].form} highlight />
                        <PlayerStatRow label="Net Goals" val1={selectedPlayers[0].goals} val2={selectedPlayers[1].goals} />
                        <PlayerStatRow label="X-Assists" val1={selectedPlayers[0].assists} val2={selectedPlayers[1].assists} />
                        <PlayerStatRow label="Defensive CS" val1={selectedPlayers[0].cleanSheets} val2={selectedPlayers[1].cleanSheets} />
                        <PlayerStatRow label="Total Season Points" val1={selectedPlayers[0].points} val2={selectedPlayers[1].points} />
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#111113] to-[#09090b] rounded-[40px] p-8 md:p-12 border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col items-center">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Squad Builder</h2>
            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-2">Build, Download, and Share with Friends</p>
         </div>
         <SquadBuilder squad={squad} onRemovePlayer={removeFromSquad} />
      </section>

      <section className="bg-gradient-to-br from-[#111113] to-[#09090b] rounded-[40px] p-12 border border-zinc-800 shadow-2xl relative overflow-hidden">
         <div className="absolute bottom-0 right-0 p-12 pointer-events-none opacity-[0.03] text-white">
            <Trophy size={300} strokeWidth={1} />
         </div>
         <div className="relative">
            <div className="flex items-center gap-3 mb-12">
               <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <h2 className="text-xs font-black tracking-[0.4em] uppercase text-zinc-500">Global Prospects</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {allPlayers.length === 0 ? (
                 <>
                   {[1, 2, 3, 4].map((i) => (
                     <div key={`skeleton-${i}`} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
                       <div className="flex items-center gap-3 mb-4">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-2 w-12" />
                       </div>
                       <Skeleton className="h-4 w-3/4 mb-4" />
                       <div className="flex justify-between items-center mt-4">
                          <Skeleton className="h-3 w-10" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                       </div>
                     </div>
                   ))}
                 </>
               ) : (
                 allPlayers.slice(0, 4).map((p, idx) => (
                   <div key={p.id || `prospect-${idx}`} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 hover:bg-zinc-800/60 hover:border-indigo-500/30 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                       <img src={p.team.crest} className="h-4 w-4 object-contain opacity-40 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{p.team.shortName || p.team.name}</span>
                    </div>
                    <p onClick={() => handleSelectForPreview(p)} className="font-black text-zinc-100 uppercase italic text-sm mb-1 line-clamp-1">{p.name}</p>
                    <div className="flex items-center justify-between mt-4">
                       <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">£{p.price}m</span>
                       <div className="flex items-center gap-2">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             addToComparison(p);
                           }}
                           className="p-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/50 transition-all"
                         >
                            <Scale size={12} />
                         </button>
                         <span className="bg-zinc-950 px-2 py-0.5 rounded text-[10px] font-black text-zinc-400 tabular-nums">{p.form}</span>
                       </div>
                    </div>
                 </div>
               )))}
            </div>
         </div>
      </section>

      <AnimatePresence>
        {selectedPlayers.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-2xl px-6 py-4 rounded-3xl border border-zinc-700 bg-black/80 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <Scale size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-1">Comparison Tray</h4>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    {selectedPlayers.length} / 2 Players Selected
                  </p>
                </div>
              </div>

              <div className="flex-1 flex justify-center gap-3">
                {selectedPlayers.map(p => (
                  <motion.div
                    key={p.id}
                    layoutId={`comp-${p.id}`}
                    className="relative px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 group"
                  >
                    <img src={p.team.crest} alt={`${p.team.name} crest`} className="h-4 w-4 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tight">{p.name}</span>
                    <button
                      onClick={() => removePlayer(p.id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                ))}
                {selectedPlayers.length < 2 && (
                   <div className="px-3 py-2 rounded-xl border border-dashed border-zinc-800 flex items-center gap-2 opacity-50">
                      <div className="h-4 w-4 rounded-full border border-zinc-700 border-dashed" />
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">Add Player</span>
                   </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearComparison}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                  title="Clear All"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  disabled={selectedPlayers.length < 2}
                  onClick={() => setIsComparisonOpen(true)}
                  className={cn(
                    "h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl",
                    selectedPlayers.length === 2 
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30" 
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
                  )}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComparisonOpen && selectedPlayers.length === 2 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComparisonOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-zinc-800 bg-[#09090b] shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] ring-1 ring-white/5 flex flex-col"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-10 py-6 sm:py-8 border-b border-zinc-900 bg-[#111113]/50 gap-4">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <BarChart3 size={20} />
                   </div>
                   <div>
                      <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter">Performance Audit</h2>
                      <p className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Precision Head-to-Head Analytics</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleShare}
                    className={cn(
                      "flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 rounded-2xl border flex items-center justify-center sm:justify-start gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
                      copySuccess 
                        ? "bg-emerald-500 border-emerald-400 text-white" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                    <Share2 size={14} />
                    {copySuccess ? 'Copied!' : 'Share Audit'}
                  </button>
                  <button
                    onClick={() => setIsComparisonOpen(false)}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all shadow-xl"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20 relative">
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block">
                      <div className="h-16 w-16 rounded-full border border-zinc-700 bg-black flex items-center justify-center shadow-2xl">
                         <span className="text-xs font-black text-zinc-500 uppercase italic tracking-widest">VS</span>
                      </div>
                   </div>

                   {selectedPlayers.map((player, idx) => (
                      <div key={player.id} className={cn("space-y-6", idx === 1 ? "md:text-right" : "text-left")}>
                         <div className={cn("flex items-center gap-6", idx === 1 ? "md:flex-row-reverse" : "flex-row")}>
                            <div className="h-24 w-24 rounded-[2rem] bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative overflow-hidden group">
                               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                               <img src={player.team.crest} className="h-full w-full object-contain relative z-10" referrerPolicy="no-referrer" />
                            </div>
                            <div className="space-y-2">
                               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{player.name}</h3>
                               <p className="text-sm font-black text-indigo-500 uppercase tracking-[0.2em]">{player.team.shortName || player.team.name}</p>
                               <span className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                  {player.position}
                               </span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="mt-16 space-y-1">
                   <motion.div
                     initial="hidden"
                     animate="visible"
                     variants={{
                       visible: {
                         transition: {
                           staggerChildren: 0.1
                         }
                       }
                     }}
                   >
                    <ComparisonStatSection 
                      label="Goals" 
                      val1={selectedPlayers[0].goals} 
                      val2={selectedPlayers[1].goals} 
                    />
                    <ComparisonStatSection 
                      label="Assists" 
                      val1={selectedPlayers[0].assists} 
                      val2={selectedPlayers[1].assists} 
                    />
                    <ComparisonStatSection 
                      label="Appearances" 
                      val1={selectedPlayers[0].appearances} 
                      val2={selectedPlayers[1].appearances} 
                    />
                    <ComparisonStatSection 
                      label="Market Value" 
                      val1={selectedPlayers[0].price} 
                      val2={selectedPlayers[1].price} 
                      suffix="m"
                      prefix="£"
                    />
                    <ComparisonStatSection 
                      label="Yellow Cards" 
                      val1={selectedPlayers[0].yellowCards} 
                      val2={selectedPlayers[1].yellowCards} 
                      invert={true} 
                    />
                    <ComparisonStatSection 
                      label="Match Form" 
                      val1={selectedPlayers[0].form} 
                      val2={selectedPlayers[1].form} 
                    />
                    <ComparisonStatSection 
                      label="Season Points" 
                      val1={selectedPlayers[0].points} 
                      val2={selectedPlayers[1].points} 
                    />
                   </motion.div>
                </div>
              </div>

              <div className="px-10 py-8 border-t border-zinc-900 bg-[#111113]/50 flex justify-center">
                 <button
                   onClick={clearComparison}
                   className="px-8 h-12 rounded-xl border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-[11px] font-black uppercase tracking-[0.2em]"
                 >
                   Clear & Reset Selection
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ComparisonStatSection({ label, val1, val2, suffix = '', prefix = '', invert = false }: any) {
  const v1 = parseFloat(String(val1 ?? '0').replace(prefix, '').replace(suffix, '')) || 0;
  const v2 = parseFloat(String(val2 ?? '0').replace(prefix, '').replace(suffix, '')) || 0;
  
  const total = Math.max(v1 + v2, 1);
  const p1 = (v1 / total) * 100;
  const p2 = (v2 / total) * 100;

  const isBetter1 = invert ? v1 < v2 : v1 > v2;
  const isBetter2 = invert ? v2 < v1 : v2 > v1;

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div variants={rowVariants} className="py-6 group border-b border-zinc-900/50 last:border-0">
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="text-left w-24 sm:w-32 flex items-center gap-1 sm:gap-2 shrink-0">
             <span className={cn("text-base sm:text-lg font-black tabular-nums tracking-tighter flex items-center gap-1 sm:gap-2", isBetter1 ? "text-emerald-400" : "text-zinc-600")}>
               {isBetter1 && <Crown size={12} className="text-emerald-400 fill-emerald-400/20 shrink-0" />}
               {prefix}{val1}{suffix}
             </span>
          </div>
          
          <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-zinc-500 group-hover:text-indigo-400 transition-colors text-center flex-1 truncate">
            {label}
          </h4>

          <div className="text-right w-24 sm:w-32 flex items-center justify-end gap-1 sm:gap-2 shrink-0">
             <span className={cn("text-base sm:text-lg font-black tabular-nums tracking-tighter flex items-center gap-1 sm:gap-2", isBetter2 ? "text-emerald-400" : "text-zinc-600")}>
               {prefix}{val2}{suffix}
               {isBetter2 && <Crown size={12} className="text-emerald-400 fill-emerald-400/20 shrink-0" />}
             </span>
          </div>
       </div>
       
       <div className="h-2 w-full flex rounded-full bg-zinc-900/50 overflow-hidden ring-1 ring-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${p1}%` }}
            className={cn("h-full transition-all duration-300", isBetter1 ? "bg-emerald-500" : "bg-zinc-800")}
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${p2}%` }}
            className={cn("h-full transition-all duration-300", isBetter2 ? "bg-emerald-500" : "bg-zinc-800 border-l border-zinc-950")}
          />
       </div>
    </motion.div>
  );
}

function PlayerStatRow({ label, val1, val2, highlight = false }: any) {
  const isNumeric = typeof val1 === 'number' || (!isNaN(parseFloat(val1)) && isFinite(val1));
  const cleanVal = (v: any) => {
    if (typeof v !== 'string') return v;
    return parseFloat(v.replace('£', '').replace('m', ''));
  };
  
  const v1 = isNumeric ? cleanVal(val1) : val1;
  const v2 = isNumeric ? cleanVal(val2) : val2;

  const winner = isNumeric ? (v1 > v2 ? 1 : v2 > v1 ? 2 : 0) : 0;

  return (
    <div className="relative group min-h-[60px] flex items-center">
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <span className="bg-zinc-950 border border-zinc-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all shadow-xl">
             {label}
          </span>
       </div>
       
       <div className="grid grid-cols-2 w-full gap-8 sm:gap-24">
          <div className={cn(
            "flex flex-col items-center justify-center transition-all",
            winner === 1 ? "opacity-100" : "opacity-40 grayscale"
          )}>
             <span className={cn(
               "text-3xl font-black tabular-nums tracking-tighter",
               winner === 1 ? "text-white" : "text-zinc-600",
               highlight && "text-4xl"
             )}>
               {val1}
             </span>
             {winner === 1 && <div className="h-1 w-1 rounded-full bg-indigo-500 mt-2" />}
          </div>
          <div className={cn(
            "flex flex-col items-center justify-center transition-all",
            winner === 2 ? "opacity-100" : "opacity-40 grayscale"
          )}>
             <span className={cn(
               "text-3xl font-black tabular-nums tracking-tighter",
               winner === 2 ? "text-white" : "text-zinc-600",
               highlight && "text-4xl"
             )}>
               {val2}
             </span>
             {winner === 2 && <div className="h-1 w-1 rounded-full bg-indigo-500 mt-2" />}
          </div>
       </div>
    </div>
  );
}

function Trophy({ size, strokeWidth }: any) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth || 2} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}