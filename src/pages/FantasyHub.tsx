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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  const [isRoasting, setIsRoasting] = useState(false);
  const [roastReport, setRoastReport] = useState<string[] | null>(null);
  const [predictedPlayer, setPredictedPlayer] = useState<any>(null);
  const [showPredictorModal, setShowPredictorModal] = useState(false);

  // التشكيلة المحفوظة
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

  // داتا الفرق واللعيبة
  const { data: teamsData } = useSWR(endpoints.getTeams('PL'), fetchFootballData, { revalidateOnFocus: false });
  const teams = teamsData?.teams || [];
  const { data: plScorers } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData, { revalidateOnFocus: false });
  const { data: fixturesData, isLoading: fixturesLoading } = useSWR('competitions/PL/matches?status=SCHEDULED', fetchFootballData, { revalidateOnFocus: false });

  const [leaguePlayers, setLeaguePlayers] = useState<any[]>(() => { try { const saved = localStorage.getItem('kt_players_db'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
  const [syncedTeams, setSyncedTeams] = useState<number>(() => { try { const saved = localStorage.getItem('kt_sync_progress'); return saved ? parseInt(saved, 10) : 0; } catch { return 0; } });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'cooling' | 'staggering' | 'synced'>('idle');

  // تجميع كل اللاعبين من الـ API
  const allPlayers = useMemo(() => {
    try {
      const uniqueMap = new Map();
      leaguePlayers.forEach(p => { 
        if (p?.id) uniqueMap.set(p.id, { ...p, league: 'PL', goals: p.goals || 0, price: p.price ?? '5.0', form: p.form ?? '0.0', points: p.points ?? 0 }); 
      });
      const combined = [ ...(plScorers?.scorers || []).map((s:any) => ({...s, league: 'PL'})) ];
      combined.forEach(s => {
        if (s?.player?.id) { 
          uniqueMap.set(s.player.id, { ...s.player, league: s.league, team: s.team, goals: s.goals || 0, assists: s.assists ?? 0, price: (5 + Math.random() * 7).toFixed(1), form: (2 + Math.random() * 6).toFixed(1), points: Math.floor(Math.random() * 120) + 40, position: s.player.position }); 
        }
      });
      return Array.from(uniqueMap.values());
    } catch (err) { return []; }
  }, [plScorers, leaguePlayers]);

  // ✨ ميزة الـ 4 لاعبين من فرق مختلفة ✨
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
      };
      syncLeague();
    }
  }, [teams]);

  useEffect(() => {
    const timer = setTimeout(() => { handleSearch(search); }, 300);
    return () => clearTimeout(timer);
  }, [search, allPlayers]);

  const addToSquad = (player: any) => {
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
    if (active.length < 11) return;
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
    <div className="space-y-12 pb-20 max-w-6xl mx-auto px-4 sm:px-6"> 
      <header className="pt-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic">Fantasy <span className="text-indigo-500">Hub</span></h1>
        <p className="mt-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px]">Global Player Intelligence</p>
      </header>

      {/* البحث */}
      <section className="relative z-40 w-full max-w-2xl mx-auto">
        {isSyncing && (
          <div className="mb-4 flex flex-col items-center gap-2">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Loader2 size={10} className="animate-spin" /> Syncing API Players: {syncedTeams}/{teams.length}</span>
            <div className="w-full max-w-xs h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800"><motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${(syncedTeams / (teams.length || 1)) * 100}%` }} /></div>
          </div>
        )}
        <div className="relative group">
          <input type="text" placeholder="Search Player Pool..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-14 pl-14 pr-6 rounded-2xl border border-zinc-800 bg-[#111113]/80 backdrop-blur-xl text-white uppercase" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 mt-3 w-full rounded-2xl border border-zinc-800 bg-[#18181b] overflow-hidden">
                {searchResults.map((p) => (
                  <div key={p.id} onClick={() => setActivePlayer(p)} className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer">
                    <img src={p.team?.crest} className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                    <span className="flex-1 text-white font-black text-xs uppercase">{p.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); addToSquad(p); }} className="p-2 bg-emerald-900/30 text-emerald-500 rounded-lg"><Plus size={14} /></button>
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
          {activePlayer ? (
            <div className="rounded-3xl border border-indigo-500/30 bg-[#111113] p-6 shadow-2xl relative overflow-hidden">
               <div className="flex justify-between mb-6">
                 <img src={activePlayer.team?.crest} className="h-14 w-14 object-contain" referrerPolicy="no-referrer" />
                 <button onClick={() => setActivePlayer(null)} className="text-zinc-500"><X size={18} /></button>
               </div>
               <h3 className="text-xl font-black text-white uppercase italic">{activePlayer.name}</h3>
               <div className="grid grid-cols-2 gap-3 mt-6">
                 <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-[9px] text-zinc-500 uppercase">Goals</p><p className="text-xl font-black text-white">{activePlayer.goals || 0}</p></div>
                 <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-[9px] text-zinc-500 uppercase">Assists</p><p className="text-xl font-black text-white">{activePlayer.assists || 0}</p></div>
               </div>
               <button onClick={() => addToSquad(activePlayer)} className="w-full mt-6 bg-emerald-600 h-12 rounded-xl text-white font-black uppercase text-xs">Add to Squad</button>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-800 p-20 text-center bg-[#09090b]/50">
               <Ghost className="mx-auto text-zinc-800" size={30} />
               <p className="mt-4 text-[10px] text-zinc-600 uppercase font-black">Awaiting Input</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-8">
           <div className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-8 text-center">
             <TrendingUp className="mx-auto text-zinc-800 mb-4" size={40} />
             <h2 className="text-lg font-black text-zinc-700 uppercase italic">Comparison Labs</h2>
             <p className="text-[10px] text-zinc-800 uppercase mt-2">Select players to launch side-by-side audit</p>
           </div>
        </div>
      </section>

      {/* عراف الجولة */}
      <section className="bg-gradient-to-br from-indigo-900/40 to-[#09090b] rounded-[2rem] p-8 md:p-12 border border-indigo-500/30 text-center">
          <Medal className="mx-auto text-indigo-400 mb-4" size={32} />
          <h2 className="text-2xl font-black text-white uppercase italic">Weekly Predictor</h2>
          {predictedPlayer ? (
            <div className="mt-6 inline-flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl border border-emerald-500/50">
              <img src={predictedPlayer.team?.crest} className="h-10 w-10 object-contain" />
              <div className="text-left"><p className="text-emerald-400 text-[10px] font-black uppercase">Locked! 🔒</p><h3 className="text-white font-black uppercase italic">{predictedPlayer.name}</h3></div>
              <button onClick={()=>setPredictedPlayer(null)} className="text-zinc-600 underline text-[9px] ml-4">Change</button>
            </div>
          ) : (
            <button onClick={()=>setShowPredictorModal(true)} className="mt-8 bg-white text-black font-black px-8 py-4 rounded-full uppercase text-xs">Make Prediction</button>
          )}
      </section>

      {/* الملعب */}
      <section className="flex flex-col items-center">
         <SquadBuilder squad={squad} onRemovePlayer={(idx:number, id:number)=> { const n=[...squad]; n[idx]=null; setSquad(n); }} totalBudget={totalBudget} captainId={captainId} viceCaptainId={viceCaptainId} setCaptain={setCaptainId} setViceCaptain={setViceCaptainId} onGenerateAI={generateAIReport} isGeneratingAI={isGeneratingAI} onSelectPlayer={setActivePlayer} onRoastSquad={generateRoastReport} isRoasting={isRoasting} onAutoPick={handleAutoPick} />
      </section>

      {/* الماتشات القادمة */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
         <h2 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-3"><CalendarDays className="text-indigo-400" /> Upcoming Fixtures</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingGameweeks.map(gw => (
              <div key={gw.gw} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase mb-4">Gameweek {gw.gw}</p>
                <div className="space-y-2">
                  {gw.matches.map((m:any) => (
                    <div key={m.id} className="flex justify-between text-[10px] font-bold text-zinc-400">
                      <span>{m.homeTeam.tla}</span><span>VS</span><span>{m.awayTeam.tla}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
         </div>
      </section>

      {/* المواهب العالمية - 4 فرق مختلفة */}
      <section className="bg-[#111113] border border-zinc-800 rounded-[2rem] p-8">
         <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-2"><div className="h-1 w-1 bg-indigo-500 rounded-full" /> Global Prospects</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {globalProspects.map(p => (
              <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl hover:border-indigo-500/50 cursor-pointer">
                 <div className="flex items-center gap-2 mb-3"><img src={p.team?.crest} className="h-3 w-3 object-contain" /><span className="text-[8px] text-zinc-600 uppercase font-black">{p.team?.shortName}</span></div>
                 <p onClick={()=>setActivePlayer(p)} className="text-xs font-black text-white uppercase italic truncate">{p.name}</p>
                 <div className="flex justify-between items-center mt-4"><span className="text-[9px] text-indigo-400 font-black">£{p.price}m</span><button onClick={()=>addToSquad(p)} className="p-1 bg-zinc-950 rounded border border-zinc-800 text-zinc-500 hover:text-white"><Plus size={10} /></button></div>
              </div>
            ))}
         </div>
      </section>

      {/* النافذة المنبثقة للتوقعات */}
      <AnimatePresence>
        {showPredictorModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-sm">
              <input type="text" placeholder="Search star player..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-black p-4 rounded-xl text-white text-xs outline-none" />
              <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                {searchResults.map(p => (
                  <div key={p.id} onClick={()=>handlePredict(p)} className="flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-xl cursor-pointer">
                    <img src={p.team?.crest} className="h-6 w-6 object-contain" />
                    <span className="text-white text-xs font-black uppercase">{p.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>setShowPredictorModal(false)} className="w-full mt-6 text-zinc-500 uppercase font-black text-[10px]">Cancel</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* تقارير الـ AI والـ Roast */}
      <AnimatePresence>
        {aiReport && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md text-center">
              <BrainCircuit className="mx-auto text-indigo-400 mb-4" size={40} />
              <h2 className="text-xl font-black text-white uppercase italic">AI Squad Analysis</h2>
              <div className="my-6 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-[10px] text-zinc-400 uppercase">Squad Score</span>
                <div className="text-5xl font-black text-emerald-400">{aiReport.score}%</div>
              </div>
              <ul className="text-left space-y-2 mb-8">
                {aiReport.strengths.map((s:string, i:number)=>(<li key={i} className="text-xs text-zinc-300 flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 mt-0.5"/> {s}</li>))}
                {aiReport.weaknesses.map((s:string, i:number)=>(<li key={i} className="text-xs text-zinc-300 flex items-start gap-2"><AlertTriangle size={12} className="text-red-500 mt-0.5"/> {s}</li>))}
              </ul>
              <button onClick={()=>setAiReport(null)} className="w-full py-4 bg-white text-black font-black rounded-xl uppercase text-xs">Got it</button>
            </div>
          </div>
        )}
        {roastReport && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95">
            <div className="bg-red-950/20 border border-red-500/30 p-8 rounded-3xl w-full max-w-md text-center">
              <Flame className="mx-auto text-red-500 mb-4" size={40} />
              <h2 className="text-2xl font-black text-red-500 uppercase italic mb-8">AI Squad Roast 🤡</h2>
              {roastReport.map((r,i)=>(<p key={i} className="text-red-100 font-bold leading-relaxed">{r}</p>))}
              <button onClick={()=>setRoastReport(null)} className="mt-8 w-full py-4 bg-red-600 text-white font-black rounded-xl uppercase text-xs">ارجع للتشكيلة 😂</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}