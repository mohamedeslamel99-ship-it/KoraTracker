import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import { Search, Scale, Zap, Info, X, Loader2, Star, Ghost, Clock, BarChart3, Trash2, Crown, Share2, Plus, BrainCircuit, CheckCircle2, AlertTriangle, CalendarDays, Timer, Flame, Target, Medal, Wand2, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '../components/Skeleton';
import SquadBuilder from '../components/SquadBuilder';

export default function FantasyHub() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // States الخاصة بالمقارنة (كانت ناقصة عندك)
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastReport, setRoastReport] = useState<string[] | null>(null);
  const [predictedPlayer, setPredictedPlayer] = useState<any>(null);
  const [showPredictorModal, setShowPredictorModal] = useState(false);

  // التشكيلة والكابتن
  const [squad, setSquad] = useState<any[]>(() => {
    const saved = localStorage.getItem('kt_saved_squad');
    return saved ? JSON.parse(saved) : Array(15).fill(null);
  });
  const [captainId, setCaptainId] = useState<number | null>(() => {
    const saved = localStorage.getItem('kt_captain');
    return saved ? JSON.parse(saved) : null;
  });
  const [viceCaptainId, setViceCaptainId] = useState<number | null>(() => {
    const saved = localStorage.getItem('kt_vice_captain');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const savedPrediction = localStorage.getItem('kt_prediction');
    if (savedPrediction) setPredictedPlayer(JSON.parse(savedPrediction));
  }, []);

  const handlePredict = (player: any) => {
    setPredictedPlayer(player);
    localStorage.setItem('kt_prediction', JSON.stringify(player));
    setShowPredictorModal(false);
  };

  const totalBudget = useMemo(() => {
    return squad.reduce((sum, p) => sum + (p ? parseFloat(p.price || 0) : 0), 0).toFixed(1);
  }, [squad]);

  useEffect(() => {
    localStorage.setItem('kt_saved_squad', JSON.stringify(squad));
    localStorage.setItem('kt_captain', JSON.stringify(captainId));
    localStorage.setItem('kt_vice_captain', JSON.stringify(viceCaptainId));
  }, [squad, captainId, viceCaptainId]);

  // APIs (سحب الـ 5 دوريات الكبرى عشان البحث والمقارنات)
  const { data: teamsData } = useSWR(endpoints.getTeams('PL'), fetchFootballData, { revalidateOnFocus: false });
  const teams = teamsData?.teams || [];
  const { data: plScorers } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData, { revalidateOnFocus: false });
  const { data: pdScorers } = useSWR(endpoints.getTopScorers('PD'), fetchFootballData, { revalidateOnFocus: false });
  const { data: saScorers } = useSWR(endpoints.getTopScorers('SA'), fetchFootballData, { revalidateOnFocus: false });
  const { data: blScorers } = useSWR(endpoints.getTopScorers('BL1'), fetchFootballData, { revalidateOnFocus: false });
  const { data: fl1Scorers } = useSWR(endpoints.getTopScorers('FL1'), fetchFootballData, { revalidateOnFocus: false });
  const { data: fixturesData, isLoading: fixturesLoading } = useSWR('competitions/PL/matches?status=SCHEDULED', fetchFootballData, { revalidateOnFocus: false });

  const [leaguePlayers, setLeaguePlayers] = useState<any[]>(() => { try { const saved = localStorage.getItem('kt_players_db'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
  const [syncedTeams, setSyncedTeams] = useState<number>(() => { try { const saved = localStorage.getItem('kt_sync_progress'); return saved ? parseInt(saved, 10) : 0; } catch { return 0; } });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'cooling' | 'staggering' | 'synced'>('idle');

  // تجميع كل اللاعبين مع دمج إحصائيات الهدافين من كل الدوريات
  const allPlayers = useMemo(() => {
    try {
      const uniqueMap = new Map();
      leaguePlayers.forEach(p => { 
        if (p?.id) uniqueMap.set(p.id, { ...p, league: 'PL', goals: p.goals || 0, price: p.price ?? '5.0', form: p.form ?? '0.0', points: p.points ?? 0 }); 
      });
      const combined = [ 
        ...(plScorers?.scorers || []).map((s:any) => ({...s, league: 'PL'})),
        ...(pdScorers?.scorers || []).map((s:any) => ({...s, league: 'PD'})),
        ...(saScorers?.scorers || []).map((s:any) => ({...s, league: 'SA'})),
        ...(blScorers?.scorers || []).map((s:any) => ({...s, league: 'BL1'})),
        ...(fl1Scorers?.scorers || []).map((s:any) => ({...s, league: 'FL1'}))
      ];
      combined.forEach(s => {
        if (s?.player?.id) { 
          uniqueMap.set(s.player.id, { ...s.player, league: s.league, team: s.team || { name: 'Unknown' }, goals: s.goals || 0, assists: s.assists ?? 0, price: (5 + Math.random() * 7).toFixed(1), form: (2 + Math.random() * 6).toFixed(1), points: Math.floor(Math.random() * 120) + 40, position: s.player.position || 'Forward' }); 
        }
      });
      return Array.from(uniqueMap.values());
    } catch (err) { return []; }
  }, [plScorers, pdScorers, saScorers, blScorers, fl1Scorers, leaguePlayers]);

  const globalProspects = useMemo(() => {
    const prospects: any[] = [];
    const seenTeams = new Set();
    const plPlayers = allPlayers.filter(p => p.league === 'PL');
    for (const player of plPlayers) {
      if (player.team?.id && !seenTeams.has(player.team.id)) {
        prospects.push(player);
        seenTeams.add(player.team.id);
        if (prospects.length === 4) break;
      }
    }
    return prospects.length > 0 ? prospects : allPlayers.slice(0, 4);
  }, [allPlayers]);

  const handleSearch = (term: string) => {
    if (!term || term.length < 2) { setSearchResults([]); return; }
    const results = allPlayers.filter(p => p.name?.toLowerCase().includes(term.toLowerCase()) || p.team?.name?.toLowerCase().includes(term.toLowerCase())).slice(0, 8);
    setSearchResults(results);
  };

  useEffect(() => {
    const isRecentlySynced = localStorage.getItem('kt_last_sync') && (Date.now() - parseInt(localStorage.getItem('kt_last_sync')!, 10)) < 12 * 60 * 60 * 1000;
    if (teams.length > 0 && !isSyncing && (leaguePlayers.length === 0 || !isRecentlySynced)) {
      const syncLeague = async () => {
        setIsSyncing(true); setSyncStatus('staggering');
        if (syncedTeams === 0) await new Promise(r => setTimeout(r, 10000));
        setSyncStatus('running');
        let i = syncedTeams;
        while (i < teams.length) {
          const team = teams[i];
          try {
            const data = await fetchFootballData(endpoints.getTeam(team.id.toString()));
            if (data?.squad) {
              const teamSquad = data.squad.map((p: any) => ({ ...p, league: 'PL', team: { id: team.id, name: team.name, crest: team.crest, shortName: team.shortName }, goals: 0, price: (4.5 + Math.random() * 3).toFixed(1), form: (1 + Math.random() * 5).toFixed(1), points: Math.floor(Math.random() * 50) + 10 }));
              setLeaguePlayers(prev => { const unique = new Map(); [...prev, ...teamSquad].forEach(item => unique.set(item.id, item)); return Array.from(unique.values()); });
              setSyncedTeams(i + 1); i++; 
            }
            await new Promise(r => setTimeout(r, 9000));
          } catch (err: any) { i++; await new Promise(r => setTimeout(r, 3000)); }
        }
        setIsSyncing(false); setSyncStatus('synced');
        localStorage.setItem('kt_last_sync', Date.now().toString());
      };
      syncLeague();
    }
  }, [teams]);

  useEffect(() => {
    const timer = setTimeout(() => { handleSearch(search); }, 300);
    return () => clearTimeout(timer);
  }, [search, allPlayers]);

  // الدوال اللي كانت ناقصة عندك (المقارنات)
  const addToComparison = (player: any) => { 
    if (selectedPlayers.find(p => p.id === player.id)) return; 
    if (selectedPlayers.length >= 2) { setSelectedPlayers([selectedPlayers[1], player]); } 
    else { setSelectedPlayers([...selectedPlayers, player]); } 
  };
  const removePlayer = (id: number) => { 
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== id)); 
    if (selectedPlayers.length <= 1) setIsComparisonOpen(false); 
  };
  const clearComparison = () => { setSelectedPlayers([]); setIsComparisonOpen(false); };
  const handleShare = () => {
    if (selectedPlayers.length !== 2) return;
    const [p1, p2] = selectedPlayers;
    const text = `📊 KoraTracker Audit:\n\n${p1.name} VS ${p2.name}\n\nGoals: ${p1.goals || 0} - ${p2.goals || 0}\nPoints: ${p1.points || 0} - ${p2.points || 0}\n\nAnalyze real API stats on KoraTracker!`;
    navigator.clipboard.writeText(text); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000);
  };

  const addToSquad = (player: any) => {
    if (player.league && player.league !== 'PL') { alert(`❌ عذراً! مسموح بوضع لاعبي الدوري الإنجليزي فقط.`); return; }
    if (squad.some(p => p?.id === player.id)) return;
    const sameTeamCount = squad.filter(p => p !== null && p.team?.id === player.team?.id).length;
    if (sameTeamCount >= 3) { alert("ممنوع أكتر من 3 لعيبة من نفس الفريق!"); return; }
    let targetRange: number[] = [];
    const pos = (player.position || '').toLowerCase();
    if (pos.includes('goal')) targetRange = [10]; 
    else if (pos.includes('defen')) targetRange = [6, 7, 8, 9]; 
    else if (pos.includes('midfield')) targetRange = [2, 3, 4, 5]; 
    else targetRange = [0, 1]; 
    let targetIndex = targetRange.find(idx => squad[idx] === null);
    if (targetIndex === undefined) targetIndex = [11, 12, 13, 14].find(idx => squad[idx] === null);
    if (targetIndex !== undefined) {
      const newSquad = [...squad]; newSquad[targetIndex] = player; setSquad(newSquad);
      if (!captainId) setCaptainId(player.id);
    }
  };

  const generateAIReport = () => {
    const active = squad.filter(p => p !== null);
    if (active.length < 11) { alert("⚠️ اختار 11 لاعب الأول!"); return; }
    setIsGeneratingAI(true);
    setTimeout(() => {
      const totalGoals = active.reduce((sum, p) => sum + (p.goals || 0), 0);
      setAiReport({ 
        score: Math.min(60 + totalGoals, 99), 
        strengths: [`قوة هجومية: فريقك سجل ${totalGoals} هدف في الحقيقة.`], 
        weaknesses: active.length < 15 ? ["دكة البدلاء غير مكتملة."] : [],
        ratingColor: "text-emerald-400", ratingBg: "bg-emerald-500/10 border-emerald-500/30"
      });
      setIsGeneratingAI(false);
    }, 1500);
  };

  const generateRoastReport = () => {
    const active = squad.filter(p => p !== null);
    if (active.length < 11) { alert("حط لعيبة الأول!"); return; }
    setIsRoasting(true);
    setTimeout(() => {
      setRoastReport(["تشكيلة عظيمة.. بس ياريت متلعبش بيها الأسبوع ده عشان صحتك! 😂"]);
      setIsRoasting(false);
    }, 1000);
  };

  const handleAutoPick = () => {
    const pool = allPlayers.filter(p => p.league === 'PL');
    const getPos = (p: any) => {
       const pos = (p.position || '').toLowerCase();
       if (pos.includes('goal')) return 'GK';
       if (pos.includes('defen')) return 'DEF';
       if (pos.includes('midfield')) return 'MID';
       return 'FWD';
    };
    const gks = pool.filter(p => getPos(p) === 'GK');
    const defs = pool.filter(p => getPos(p) === 'DEF');
    const mids = pool.filter(p => getPos(p) === 'MID');
    const fwds = pool.filter(p => getPos(p) === 'FWD');

    if (gks.length < 2 || defs.length < 5 || mids.length < 5 || fwds.length < 3) {
      alert("⏳ جاري تحميل باقي المدافعين من الـ API.. استنى ثواني!"); return;
    }
    const sorted = [...pool].sort((a, b) => (b.goals || 0) - (a.goals || 0));
    const newSquad = Array(15).fill(null);
    const teamCounts: any = {};
    const pick = (pos: string, count: number) => {
      const picked = [];
      for (let p of sorted) {
        if (picked.length >= count) break;
        if (getPos(p) !== pos) continue;
        if ((teamCounts[p.team?.id] || 0) >= 3) continue;
        picked.push(p);
        teamCounts[p.team?.id] = (teamCounts[p.team?.id] || 0) + 1;
      }
      return picked;
    };
    const f = pick('FWD', 3); const m = pick('MID', 5); const d = pick('DEF', 5); const g = pick('GK', 2);
    newSquad[0]=f[0]; newSquad[1]=f[1]; newSquad[14]=f[2];
    newSquad[2]=m[0]; newSquad[3]=m[1]; newSquad[4]=m[2]; newSquad[5]=m[3]; newSquad[13]=m[4];
    newSquad[6]=d[0]; newSquad[7]=d[1]; newSquad[8]=d[2]; newSquad[9]=d[3]; newSquad[12]=d[4];
    newSquad[10]=g[0]; newSquad[11]=g[1];
    setSquad(newSquad); setCaptainId(newSquad[0].id);
  };

  const upcomingGameweeks = useMemo(() => {
    if (!fixturesData?.matches) return [];
    const grouped = fixturesData.matches.reduce((acc: any, m: any) => { if (!acc[m.matchday]) acc[m.matchday] = []; acc[m.matchday].push(m); return acc; }, {});
    return Object.keys(grouped).map(Number).sort((a,b)=>a-b).slice(0,3).map(gw => ({ gw, matches: grouped[gw] }));
  }, [fixturesData]);

  return (
    <div className="space-y-12 pb-32 max-w-6xl mx-auto px-4 sm:px-6"> 
      <header className="pt-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic">Fantasy <span className="text-indigo-500">Hub</span></h1>
        <p className="mt-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px]">Global Player Intelligence</p>
      </header>

      {/* البحث والمزامنة */}
      <section className="relative z-40 w-full max-w-2xl mx-auto">
        {isSyncing && (
          <div className="mb-4 flex flex-col items-center gap-2">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Loader2 size={10} className="animate-spin" /> Syncing API Players: {syncedTeams}/{teams.length}</span>
            <div className="w-full max-w-xs h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800"><motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${(syncedTeams / (teams.length || 1)) * 100}%` }} /></div>
          </div>
        )}
        <div className="relative group">
          <input type="text" placeholder="Search Player Pool..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-14 pl-14 pr-6 rounded-2xl border border-zinc-800 bg-[#111113]/80 backdrop-blur-xl text-white uppercase font-bold text-sm outline-none focus:border-indigo-500 transition-colors" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 mt-3 w-full rounded-2xl border border-zinc-800 bg-[#18181b] overflow-hidden shadow-2xl">
                {searchResults.map((p) => (
                  <div key={p.id} onClick={() => { setActivePlayer(p); setSearch(''); setSearchResults([]); }} className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer transition-colors border-b border-zinc-800/50 last:border-0 group">
                    <img src={p.team?.crest} className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                    <span className="flex-1 text-white font-black text-xs uppercase">{p.name}</span>
                    <div className="flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); addToComparison(p); }} className="p-2 bg-zinc-900 text-zinc-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"><Scale size={14} /></button>
                       <button onClick={(e) => { e.stopPropagation(); addToSquad(p); }} className="p-2 bg-emerald-900/30 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* المقارنة والبيانات */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {activePlayer ? (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl border border-indigo-500/30 bg-[#111113] p-6 shadow-2xl relative overflow-hidden">
                 <div className="flex justify-between mb-6">
                   <img src={activePlayer.team?.crest} className="h-14 w-14 object-contain" referrerPolicy="no-referrer" />
                   <button onClick={() => setActivePlayer(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                 </div>
                 <h3 className="text-xl font-black text-white uppercase italic truncate">{activePlayer.name}</h3>
                 <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1 uppercase">{activePlayer.league === 'PL' ? 'Premier League' : 'Global'}</p>
                 <div className="grid grid-cols-2 gap-3 mt-6">
                   <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-[9px] text-zinc-500 uppercase font-black">Goals</p><p className="text-xl font-black text-white">{activePlayer.goals || 0}</p></div>
                   <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-[9px] text-zinc-500 uppercase font-black">Assists</p><p className="text-xl font-black text-white">{activePlayer.assists || 0}</p></div>
                 </div>
                 <div className="flex gap-2 mt-6">
                    <button onClick={() => addToComparison(activePlayer)} className="flex-1 bg-indigo-600 h-12 rounded-xl text-white font-black uppercase text-[10px] hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"><Scale size={14}/> Compare</button>
                    <button onClick={() => addToSquad(activePlayer)} className="flex-1 bg-emerald-600 h-12 rounded-xl text-white font-black uppercase text-[10px] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"><Plus size={14}/> Add</button>
                 </div>
              </motion.div>
            ) : (
              <motion.div className="rounded-3xl border border-dashed border-zinc-800 p-20 text-center bg-[#09090b]/50">
                 <Ghost className="mx-auto text-zinc-800" size={30} />
                 <p className="mt-4 text-[10px] text-zinc-600 uppercase font-black tracking-widest">Awaiting Input</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="lg:col-span-8">
           <div className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-8 md:p-12 text-center shadow-inner h-full flex flex-col items-center justify-center min-h-[300px]">
             <TrendingUp className="mx-auto text-zinc-800 mb-4" size={40} />
             <h2 className="text-lg font-black text-zinc-700 uppercase italic tracking-widest">Comparison Labs</h2>
             <p className="text-[10px] text-zinc-800 uppercase mt-2 tracking-widest font-black">Select up to 2 players from search to compare stats</p>
           </div>
        </div>
      </section>

      {/* عراف الجولة */}
      <section className="bg-gradient-to-br from-indigo-900/40 to-[#09090b] rounded-[2.5rem] p-8 md:p-12 border border-indigo-500/30 text-center shadow-2xl">
          <Medal className="mx-auto text-indigo-400 mb-4" size={32} />
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">Weekly Predictor</h2>
          {predictedPlayer ? (
            <div className="mt-6 inline-flex items-center gap-4 bg-zinc-900/80 p-4 px-6 rounded-2xl border border-emerald-500/50 shadow-xl">
              <img src={predictedPlayer.team?.crest} className="h-10 w-10 object-contain" />
              <div className="text-left"><p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Prediction Locked! 🔒</p><h3 className="text-white font-black uppercase italic text-sm">{predictedPlayer.name}</h3></div>
              <button onClick={()=>setPredictedPlayer(null)} className="text-zinc-600 hover:text-red-400 underline text-[9px] ml-4 font-black uppercase transition-colors">Change</button>
            </div>
          ) : (
            <button onClick={()=>setShowPredictorModal(true)} className="mt-8 bg-white text-black font-black px-10 py-4 rounded-full uppercase text-xs hover:bg-indigo-400 hover:text-white transition-all shadow-xl shadow-white/5">Make Prediction</button>
          )}
      </section>

      {/* الملعب */}
      <section className="flex flex-col items-center">
         <SquadBuilder squad={squad} onRemovePlayer={(idx:number, id:number)=> { const n=[...squad]; n[idx]=null; setSquad(n); if (captainId === id) setCaptainId(null); if (viceCaptainId === id) setViceCaptainId(null); }} totalBudget={totalBudget} captainId={captainId} viceCaptainId={viceCaptainId} setCaptain={setCaptainId} setViceCaptain={setViceCaptainId} onGenerateAI={generateAIReport} isGeneratingAI={isGeneratingAI} onSelectPlayer={setActivePlayer} onRoastSquad={generateRoastReport} isRoasting={isRoasting} onAutoPick={handleAutoPick} />
      </section>

      {/* الماتشات القادمة */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none"><CalendarDays size={150} /></div>
         <h2 className="text-xl md:text-2xl font-black text-white uppercase italic mb-10 flex items-center gap-3 relative z-10"><CalendarDays className="text-indigo-400" /> Upcoming Fixtures</h2>
         {fixturesLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               {upcomingGameweeks.map(gw => (
                 <div key={gw.gw} className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 flex flex-col hover:border-indigo-500/30 transition-colors">
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6 flex justify-between items-center"><span>Gameweek {gw.gw}</span> <div className="h-1 w-1 bg-indigo-500 rounded-full animate-pulse" /></p>
                   <div className="space-y-3 relative max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                     {gw.matches.map((m:any) => (
                       <div key={m.id} className="flex justify-between items-center bg-[#09090b] p-3 rounded-xl border border-zinc-800 hover:bg-zinc-800/50 transition-all cursor-default">
                           <span className="text-[10px] font-black text-white uppercase w-12 text-left truncate" title={m.homeTeam.name}>{m.homeTeam.tla || m.homeTeam.shortName?.substring(0,3)}</span>
                           <span className="text-[8px] font-black text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 shrink-0 mx-2">VS</span>
                           <span className="text-[10px] font-black text-white uppercase w-12 text-right truncate" title={m.awayTeam.name}>{m.awayTeam.tla || m.awayTeam.shortName?.substring(0,3)}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
            </div>
         )}
      </section>

      {/* المواهب العالمية */}
      <section className="bg-[#111113] border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
         <div className="absolute bottom-0 left-0 p-8 opacity-5 text-white pointer-events-none"><Star size={120} /></div>
         <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-2 relative z-10"><div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" /> Global Prospects</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {globalProspects.map(p => (
              <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl hover:border-emerald-500/50 transition-all cursor-pointer group hover:-translate-y-1 shadow-lg">
                 <div className="flex items-center gap-2 mb-4"><img src={p.team?.crest} className="h-4 w-4 object-contain opacity-50 group-hover:opacity-100 transition-opacity" /><span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{p.team?.shortName}</span></div>
                 <p onClick={()=>setActivePlayer(p)} className="text-xs md:text-sm font-black text-white uppercase italic truncate mb-1 group-hover:text-emerald-400 transition-colors">{p.name}</p>
                 <div className="flex justify-between items-center mt-5">
                    <span className="text-[9px] text-indigo-400 font-black">£{p.price}m</span>
                    <div className="flex gap-1">
                       <button onClick={(e)=>{e.stopPropagation(); addToComparison(p);}} className="p-1.5 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all"><Scale size={12}/></button>
                       <button onClick={(e)=>{e.stopPropagation(); addToSquad(p);}} className="p-1.5 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all"><Plus size={12}/></button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* ========================================= */}
      {/* 🔴 الجزء اللي كان ممسوح (شريط ونافذة المقارنة) 🔴 */}
      {/* ========================================= */}
      <AnimatePresence>
        {selectedPlayers.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-2xl px-4 py-3 md:px-6 md:py-4 rounded-3xl border border-zinc-700 bg-black/90 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><Scale size={18} /></div>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Comparison Tray</h4>
                  <p className="text-[9px] font-black text-zinc-500 uppercase">{selectedPlayers.length} / 2 Selected</p>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedPlayers.map(p => (
                  <div key={p.id} className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                    <img src={p.team?.crest} className="h-4 w-4 object-contain" />
                    <span className="text-[10px] font-black text-zinc-300 uppercase">{p.name.split(' ').pop()}</span>
                    <button onClick={() => removePlayer(p.id)} className="text-zinc-600 hover:text-red-500"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={clearComparison} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white"><Trash2 size={16} /></button>
                <button disabled={selectedPlayers.length < 2} onClick={() => setIsComparisonOpen(true)} className={cn("flex-1 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all", selectedPlayers.length === 2 ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-zinc-800 text-zinc-600 cursor-not-allowed")}>Compare</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComparisonOpen && selectedPlayers.length === 2 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsComparisonOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-zinc-800 bg-[#09090b] shadow-2xl flex flex-col">
              <div className="flex justify-between items-center px-8 py-6 border-b border-zinc-900 bg-[#111113]/50">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><BarChart3 size={18} /></div>
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Audit</h2>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleShare} className={cn("px-6 h-12 rounded-2xl border flex items-center gap-2 text-[10px] font-black uppercase transition-all", copySuccess ? "bg-emerald-500 border-emerald-400 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white")}><Share2 size={14} /> {copySuccess ? 'Copied!' : 'Share'}</button>
                  <button onClick={() => setIsComparisonOpen(false)} className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center hover:text-white"><X size={20} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="flex justify-between items-center gap-4 relative mb-16">
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"><div className="h-12 w-12 rounded-full border border-zinc-700 bg-black flex items-center justify-center"><span className="text-[10px] font-black text-zinc-500 uppercase italic">VS</span></div></div>
                   {selectedPlayers.map((player, idx) => (
                      <div key={player.id} className={cn("flex-1 flex flex-col", idx === 1 ? "items-end text-right" : "items-start text-left")}>
                         <div className={cn("flex items-center gap-6", idx === 1 && "flex-row-reverse")}>
                            <div className="h-24 w-24 rounded-[2rem] bg-zinc-900 border border-zinc-800 p-5 shrink-0"><img src={player.team?.crest} className="h-full w-full object-contain" /></div>
                            <div><h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">{player.name}</h3><p className="text-sm font-black text-indigo-500 uppercase tracking-[0.2em]">{player.team?.name}</p></div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="space-y-1">
                    <ComparisonStatSection label="Goals" val1={selectedPlayers[0].goals || 0} val2={selectedPlayers[1].goals || 0} />
                    <ComparisonStatSection label="Assists" val1={selectedPlayers[0].assists || 0} val2={selectedPlayers[1].assists || 0} />
                    <ComparisonStatSection label="Market Value" val1={selectedPlayers[0].price} val2={selectedPlayers[1].price} suffix="m" prefix="£" />
                    <ComparisonStatSection label="Season Points" val1={selectedPlayers[0].points || 0} val2={selectedPlayers[1].points || 0} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* النوافذ التانية (الذكاء الاصطناعي والتوقع) */}
      <AnimatePresence>
        {showPredictorModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
              <input type="text" placeholder="Search star player..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-xs font-bold outline-none focus:border-indigo-500 transition-all" />
              <div className="mt-4 max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {searchResults.map(p => (
                  <div key={p.id} onClick={()=>handlePredict(p)} className="flex items-center gap-3 p-3 hover:bg-indigo-600/20 rounded-xl cursor-pointer transition-all border border-transparent hover:border-indigo-500/30">
                    <img src={p.team?.crest} className="h-6 w-6 object-contain" />
                    <span className="text-white text-xs font-black uppercase">{p.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>setShowPredictorModal(false)} className="w-full mt-6 text-zinc-500 hover:text-white uppercase font-black text-[10px] tracking-widest transition-colors">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiReport && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl">
              <BrainCircuit className="mx-auto text-indigo-400 mb-4" size={40} />
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">AI Squad Analysis</h2>
              <div className={`my-8 p-8 rounded-[2rem] ${aiReport.ratingBg} border`}>
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em]">Squad Score</span>
                <div className={`text-6xl font-black ${aiReport.ratingColor} mt-2`}>{aiReport.score}%</div>
              </div>
              <ul className="text-left space-y-3 mb-10">
                {aiReport.strengths.map((s:string, i:number)=>(<li key={i} className="text-xs font-bold text-zinc-300 flex items-start gap-3"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0"/> {s}</li>))}
                {aiReport.weaknesses.map((s:string, i:number)=>(<li key={i} className="text-xs font-bold text-zinc-300 flex items-start gap-3"><AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0"/> {s}</li>))}
              </ul>
              <button onClick={()=>setAiReport(null)} className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-xs hover:bg-indigo-400 hover:text-white transition-all shadow-xl">Back to Field</button>
            </motion.div>
          </div>
        )}
        {roastReport && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95">
            <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-950/20 border border-red-500/30 p-10 rounded-[2.5rem] w-full max-w-md text-center shadow-[0_0_50px_rgba(220,38,38,0.2)]">
              <Flame className="mx-auto text-red-500 mb-6" size={50} />
              <h2 className="text-2xl font-black text-red-500 uppercase italic mb-8 tracking-tighter">AI Squad Roast 🤡</h2>
              {roastReport.map((r,i)=>(<p key={i} className="text-red-100 font-black text-lg leading-relaxed italic" dir="rtl">{r}</p>))}
              <button onClick={()=>setRoastReport(null)} className="mt-10 w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-xs hover:bg-red-500 transition-all shadow-xl shadow-red-600/20">كفاية إهانة ورجعني 😂</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================================
// دوال مساعدة لليوزر إنترفيس (كانت ممسوحة برضه)
// =========================================

function ComparisonStatSection({ label, val1, val2, suffix = '', prefix = '', invert = false }: any) {
  const v1 = parseFloat(String(val1 ?? '0').replace(prefix, '').replace(suffix, '')) || 0;
  const v2 = parseFloat(String(val2 ?? '0').replace(prefix, '').replace(suffix, '')) || 0;
  const total = Math.max(v1 + v2, 1);
  const p1 = (v1 / total) * 100;
  const p2 = (v2 / total) * 100;
  const isBetter1 = invert ? v1 < v2 : v1 > v2;
  const isBetter2 = invert ? v2 < v1 : v2 > v1;

  return (
    <div className="py-6 border-b border-zinc-900/50 last:border-0 group">
        <div className="flex justify-between items-center mb-4">
          <div className="text-left w-32 flex items-center gap-2">
             <span className={cn("text-lg font-black tabular-nums tracking-tighter flex items-center gap-1", isBetter1 ? "text-emerald-400" : "text-zinc-600")}>{isBetter1 && <Crown size={12} className="text-emerald-400" />}{prefix}{val1}{suffix}</span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-indigo-400 transition-colors text-center">{label}</h4>
          <div className="text-right w-32 flex items-center justify-end gap-2">
             <span className={cn("text-lg font-black tabular-nums tracking-tighter flex items-center gap-1", isBetter2 ? "text-emerald-400" : "text-zinc-600")}>{prefix}{val2}{suffix}{isBetter2 && <Crown size={12} className="text-emerald-400" />}</span>
          </div>
       </div>
       <div className="h-2 w-full flex rounded-full bg-zinc-900/50 overflow-hidden ring-1 ring-white/5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${p1}%` }} className={cn("h-full transition-all duration-300", isBetter1 ? "bg-emerald-500" : "bg-zinc-800")} />
          <motion.div initial={{ width: 0 }} animate={{ width: `${p2}%` }} className={cn("h-full transition-all duration-300", isBetter2 ? "bg-emerald-500" : "bg-zinc-800 border-l border-zinc-950")} />
       </div>
    </div>
  );
}