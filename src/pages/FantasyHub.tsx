import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
// 👇 ضفنا أيقونات Flame و Target 👇
import { Users, Search, Scale, Shield, Zap, TrendingUp, Info, X, ChevronRight, Loader2, Star, Ghost, Clock, BarChart3, Trash2, Crown, Share2, Plus, BrainCircuit, CheckCircle2, AlertTriangle, CalendarDays, Timer, Flame, Target, Medal } from 'lucide-react';
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

  // 👇 States للـ Roast والـ Predictor 👇
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastReport, setRoastReport] = useState<string[] | null>(null);
  const [predictedPlayer, setPredictedPlayer] = useState<any>(null);
  const [showPredictorModal, setShowPredictorModal] = useState(false);

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

  // حفظ التوقع في المتصفح عشان يفضل موجود
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

  const generateAIReport = () => {
    const activePlayers = squad.filter(p => p !== null);
    if (activePlayers.length < 11) { alert("⚠️ لازم تختار 11 لاعب على الأقل!"); return; }
    setIsGeneratingAI(true);
    setTimeout(() => {
      let score = 50; 
      let strengths: string[] = []; let weaknesses: string[] = [];
      const captain = squad.find(p => p && p.id === captainId);
      if (captain) {
        if (parseFloat(captain.form || 0) >= 5) { score += 15; strengths.push(`اختيار (${captain.name}) ككابتن ممتاز.`); } 
        else { score -= 5; weaknesses.push(`مستوى الكابتن متراجع الفترة دي.`); }
      } else { score -= 10; weaknesses.push("نسيت تختار كابتن للفريق!"); }
      const avgForm = activePlayers.reduce((sum, p) => sum + parseFloat(p.form || 0), 0) / activePlayers.length;
      if (avgForm >= 5.5) { score += 20; strengths.push("فورمة اللعيبة مرعبة."); } else { score -= 10; weaknesses.push("فورمة اللعيبة ضعيفة."); }
      if (activePlayers.length === 15) { score += 10; strengths.push("دكة البدلاء مكتملة وتأمنك."); } else { score -= 5; weaknesses.push("دكة البدلاء غير مكتملة."); }
      const budgetNum = parseFloat(totalBudget);
      if (budgetNum >= 95) { score += 5; strengths.push("استغلال ممتاز للميزانية."); } else if (budgetNum < 85) { weaknesses.push("ميزانيتك المهدرة كبيرة."); }
      score = Math.min(Math.max(Math.round(score), 10), 99); 
      let ratingColor = "text-emerald-400"; let ratingBg = "bg-emerald-500/10 border-emerald-500/30";
      if (score < 65) { ratingColor = "text-red-400"; ratingBg = "bg-red-500/10 border-red-500/30"; } else if (score < 80) { ratingColor = "text-yellow-400"; ratingBg = "bg-yellow-500/10 border-yellow-500/30"; }
      setAiReport({ score, strengths, weaknesses, ratingColor, ratingBg });
      setIsGeneratingAI(false);
    }, 2000);
  };

  // 👇 خوارزمية قصف الجبهة الساخرة 👇
  const generateRoastReport = () => {
    const activePlayers = squad.filter(p => p !== null);
    if (activePlayers.length < 11) {
      alert("يا عم حط 11 لاعب الأول عشان نلاقي حاجة نتريق عليها! 😅");
      return;
    }
    setIsRoasting(true);
    setTimeout(() => {
      let roasts: string[] = [];
      const captain = squad.find(p => p && p.id === captainId);
      
      if (!captain) roasts.push("بتلعب من غير كابتن؟ إنت بايع القضية خالص يسطا! 🤡");
      else if (captain.price >= 11) roasts.push(`مكابتن ${captain.name}؟ إيه العبقرية دي! مفيش حد في الكوكب فكر فيها قبلك 🥱.`);
      else roasts.push(`مكابتن ${captain.name}؟ واضح إنك بتحب الريسك.. أو غالباً متعرفش حاجة في الكورة. 🤦‍♂️`);

      if (activePlayers.length < 15) roasts.push("سايب الدكة فاضية ليه؟ ناوي تنزل تلعب إنت لو حد اتصاب؟ 🩼");
      
      const budgetNum = parseFloat(totalBudget);
      if (budgetNum < 85) roasts.push(`سايب فلوس في البنك ليه؟ خايف عليهم من التضخم؟ اصرف يا عم وهات لعيبة عدلة! 💸`);

      const avgForm = activePlayers.reduce((sum, p) => sum + parseFloat(p.form || 0), 0) / activePlayers.length;
      if (avgForm < 4) roasts.push("فورمة اللعيبة بتاعتك في النازل.. التشكيلة دي بتنافس على الهبوط للدرجة التانية حرفياً. 📉");
      else roasts.push("حتى لو فورمتهم حلوة دلوقتي.. هيبتدوا يبلانكوا أول ما تحطهم في تشكيلتك، إحنا عارفين حظك. 🌚");

      setRoastReport(roasts);
      setIsRoasting(false);
    }, 1500);
  };

  const addToSquad = (player: any) => {
    if (player.league && player.league !== 'PL') { alert(`❌ عذراً! مسموح بوضع لاعبي الدوري الإنجليزي فقط.`); return; }
    if (squad.some(p => p?.id === player.id)) { alert("اللاعب ده موجود فعلاً!"); return; }
    const teamId = player.team?.id;
    const sameTeamCount = squad.filter(p => p !== null && p.team?.id === teamId).length;
    if (sameTeamCount >= 3) { alert(`عذراً! قوانين الفانتازي بتمنع اختيار أكتر من 3 لعيبة من نفس الفريق.`); return; }

    let targetRange: number[] = [];
    const pos = (player.position || '').toLowerCase();
    const name = (player.name || '').toLowerCase();
    const isFplMid = pos.includes('midfield') || pos.includes('wing') || pos === 'mf' || ['salah', 'saka', 'foden', 'gordon', 'palmer', 'son', 'diaz', 'mbeumo', 'bowen', 'sterling', 'eze'].some(n => name.includes(n));
    const isDef = pos.includes('defen') || pos.includes('back') || pos === 'df';
    const isGk = pos.includes('goal') || pos === 'gk';
    const isFwd = pos.includes('forward') || pos.includes('strik') || pos.includes('attack') || pos.includes('offen') || pos === 'fw';

    if (isGk) targetRange = [10]; else if (isDef) targetRange = [6, 7, 8, 9]; else if (isFplMid) targetRange = [2, 3, 4, 5]; else if (isFwd) targetRange = [0, 1]; else targetRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
    let targetIndex = targetRange.find(idx => squad[idx] === null);
    if (targetIndex === undefined) { const benchRange = [11, 12, 13, 14]; targetIndex = benchRange.find(idx => squad[idx] === null); }
    if (targetIndex === undefined) { alert(`مفيش مكان فاضي لـ ${player.name}!`); return; }

    const newSquad = [...squad]; newSquad[targetIndex] = player; setSquad(newSquad);
    if (!captainId) setCaptainId(player.id);
  };

  const removeFromSquad = (index: number, playerId: number) => {
    const newSquad = [...squad]; newSquad[index] = null; setSquad(newSquad);
    if (captainId === playerId) setCaptainId(null); if (viceCaptainId === playerId) setViceCaptainId(null);
  };

  const handleShare = () => {
    if (selectedPlayers.length !== 2) return;
    const [p1, p2] = selectedPlayers;
    const text = `📊 KoraTracker Audit:\n\n${p1.name} VS ${p2.name}\n\nGoals: ${p1.goals} - ${p2.goals}\nPoints: ${p1.points} - ${p2.points}\nValue: £${p1.price}m - £${p2.price}m\n\nAnalyze world-class stats on KoraTracker!`;
    navigator.clipboard.writeText(text); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const { data: teamsData } = useSWR(endpoints.getTeams('PL'), fetchFootballData, { revalidateOnFocus: false, revalidateIfStale: false });
  const teams = teamsData?.teams || [];

  const { data: fixturesData, isLoading: fixturesLoading } = useSWR('competitions/PL/matches?status=SCHEDULED', fetchFootballData, { revalidateOnFocus: false });

  const upcomingGameweeks = useMemo(() => {
    if (!fixturesData?.matches) return [];
    const matches = fixturesData.matches;
    const grouped = matches.reduce((acc: any, match: any) => { const gw = match.matchday; if (!gw) return acc; if (!acc[gw]) acc[gw] = []; acc[gw].push(match); return acc; }, {});
    return Object.keys(grouped).map(Number).sort((a, b) => a - b).slice(0, 3).map(gw => ({ gw, matches: grouped[gw] }));
  }, [fixturesData]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const firstMatchDate = upcomingGameweeks[0]?.matches[0]?.utcDate;
    if (!firstMatchDate) return;
    const interval = setInterval(() => {
      const now = new Date().getTime(); const deadline = new Date(firstMatchDate).getTime(); const distance = deadline - now;
      if (distance < 0) { clearInterval(interval); return; }
      setTimeLeft({ days: Math.floor(distance / (1000 * 60 * 60 * 24)), hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), seconds: Math.floor((distance % (1000 * 60)) / 1000) });
    }, 1000);
    return () => clearInterval(interval);
  }, [upcomingGameweeks]);

  const activePlayerFixtures = useMemo(() => {
    if (!activePlayer || !fixturesData?.matches) return [];
    const teamId = activePlayer.team?.id;
    if (!teamId) return [];
    return fixturesData.matches.filter((m: any) => m.homeTeam.id === teamId || m.awayTeam.id === teamId).slice(0, 3).map((m: any) => {
         const isHome = m.homeTeam.id === teamId; const opponent = isHome ? m.awayTeam : m.homeTeam; const oppName = opponent.tla || opponent.shortName || opponent.name.substring(0,3);
         const hardTeams = ['MCI', 'ARS', 'LIV']; const medTeams = ['CHE', 'TOT', 'MUN', 'NEW', 'AVL'];
         let fdrColor = "bg-emerald-500 text-white border-emerald-400"; 
         if (hardTeams.includes(oppName.toUpperCase())) fdrColor = "bg-red-500 text-white border-red-400"; 
         else if (medTeams.includes(oppName.toUpperCase())) fdrColor = "bg-zinc-600 text-white border-zinc-500"; 
         return { oppName, isHome, fdrColor };
      });
  }, [activePlayer, fixturesData]);

  const [leaguePlayers, setLeaguePlayers] = useState<any[]>(() => { try { const saved = localStorage.getItem('kt_players_db'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
  const [syncedTeams, setSyncedTeams] = useState<number>(() => { try { const saved = localStorage.getItem('kt_sync_progress'); return saved ? parseInt(saved, 10) : 0; } catch { return 0; } });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'cooling' | 'staggering' | 'synced'>('idle');

  const { data: plScorers, error: plError } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData, { revalidateOnFocus: false });
  const { data: llScorers } = useSWR(endpoints.getTopScorers('PD'), fetchFootballData, { revalidateOnFocus: false });
  const { data: saScorers } = useSWR(endpoints.getTopScorers('SA'), fetchFootballData, { revalidateOnFocus: false });
  const { data: blScorers } = useSWR(endpoints.getTopScorers('BL1'), fetchFootballData, { revalidateOnFocus: false });

  const allPlayers = useMemo(() => {
    try {
      const uniqueMap = new Map();
      leaguePlayers.forEach(p => { if (p?.id) uniqueMap.set(p.id, { ...p, league: 'PL', goals: p.goals || 0, assists: p.assists ?? 0, appearances: p.appearances ?? 0, yellowCards: p.yellowCards ?? 0, price: p.price ?? '5.0', form: p.form ?? '0.0', points: p.points ?? 0, cleanSheets: p.cleanSheets ?? 0 }); });
      const combined = [ ...(plScorers?.scorers || []).map((s:any) => ({...s, league: 'PL'})), ...(llScorers?.scorers || []).map((s:any) => ({...s, league: 'PD'})), ...(saScorers?.scorers || []).map((s:any) => ({...s, league: 'SA'})), ...(blScorers?.scorers || []).map((s:any) => ({...s, league: 'BL1'})) ];
      combined.forEach(s => {
        if (s?.player?.id) { uniqueMap.set(s.player.id, { ...s.player, league: s.league, team: s.team || { name: 'Unknown' }, goals: s.goals || 0, assists: s.assists ?? Math.floor(Math.random() * 5), cleanSheets: Math.floor(Math.random() * 8), price: (5 + Math.random() * 7).toFixed(1), form: (2 + Math.random() * 6).toFixed(1), points: Math.floor(Math.random() * 120) + 40, appearances: Math.floor(Math.random() * 25) + 5, yellowCards: Math.floor(Math.random() * 6), position: s.player.position || 'Forward' }); }
      });
      return Array.from(uniqueMap.values());
    } catch (err) { return []; }
  }, [plScorers, llScorers, saScorers, blScorers, leaguePlayers]);

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
              const teamSquad = data.squad.map((p: any) => ({ ...p, league: 'PL', team: { id: team.id, name: team.name, crest: team.crest, shortName: team.shortName }, goals: Math.floor(Math.random() * 5), assists: Math.floor(Math.random() * 5), cleanSheets: Math.floor(Math.random() * 8), price: (4.5 + Math.random() * 8).toFixed(1), form: (1 + Math.random() * 5).toFixed(1), points: Math.floor(Math.random() * 100) + 20, position: p.position || 'Unknown' }));
              setLeaguePlayers(prev => { const unique = new Map(); [...prev, ...teamSquad].forEach(item => unique.set(item.id, item)); const next = Array.from(unique.values()); localStorage.setItem('kt_players_db', JSON.stringify(next)); return next; });
              const nextSyncCount = i + 1; setSyncedTeams(nextSyncCount); localStorage.setItem('kt_sync_progress', nextSyncCount.toString()); i++; 
            }
            await new Promise(r => setTimeout(r, 9000));
          } catch (err: any) {
            const isRateLimit = err.message?.includes('limit') || err.message?.includes('Wait');
            if (isRateLimit) { setSyncStatus('cooling'); const waitMatch = err.message.match(/Wait (\d+) seconds/i); const waitTime = waitMatch ? parseInt(waitMatch[1]) : 45; await new Promise(r => setTimeout(r, (waitTime + 10) * 1000)); setSyncStatus('running'); } else { i++; await new Promise(r => setTimeout(r, 3000)); }
          }
        }
        setIsSyncing(false); setSyncStatus('synced'); setShowSyncSuccess(true); setTimeout(() => setShowSyncSuccess(false), 5000); localStorage.setItem('kt_last_sync', Date.now().toString());
      };
      syncLeague();
    } else if (isRecentlySynced && leaguePlayers.length > 0) { setSyncStatus('synced'); }
  }, [teams]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); handleSearch(search); }, 300);
    return () => clearTimeout(timer);
  }, [search, allPlayers]);

  const handleSelectForPreview = (player: any) => { setActivePlayer(player); setSearch(''); setSearchResults([]); };
  const addToComparison = (player: any) => { if (selectedPlayers.find(p => p.id === player.id)) return; if (selectedPlayers.length >= 2) { setSelectedPlayers([selectedPlayers[1], player]); } else { setSelectedPlayers([...selectedPlayers, player]); } };
  const removePlayer = (id: number) => { setSelectedPlayers(selectedPlayers.filter(p => p.id !== id)); if (selectedPlayers.length <= 1) setIsComparisonOpen(false); };
  const clearComparison = () => { setSelectedPlayers([]); setIsComparisonOpen(false); };

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto px-4 sm:px-6"> 
      <header className="pt-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6"><Zap size={14} className="fill-indigo-500/20" /></div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic">Fantasy <span className="text-indigo-500">Hub</span></h1>
        <p className="mt-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px]">Global Player Intelligence & Precision Analytics</p>
      </header>

      <section className="relative z-40 w-full max-w-2xl mx-auto">
        {(plError || plScorers?.message?.includes('limit')) && !isSyncing && ( <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse"><Info size={12} />Data Governor Active: Limited Player Pool</div> )}
        {isSyncing && (
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center">
               {syncStatus === 'cooling' ? <span className="text-amber-500 animate-pulse flex items-center gap-2"><Zap size={10} /> Traffic Governance: Cooling Off ({syncedTeams}/{teams.length})</span> : syncStatus === 'staggering' ? <span className="text-zinc-500 flex items-center gap-2"><Clock size={10} strokeWidth={3} /> Request Staggering: Buffering Budget...</span> : <span className="text-indigo-400 flex items-center gap-2"><Loader2 size={10} className="animate-spin" /> Broadcasting league Frequencies: {syncedTeams}/{teams.length} Teams Synced</span>}
            </div>
            <div className="w-full max-w-xs h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800"><motion.div className={cn("h-full transition-colors duration-500", syncStatus === 'cooling' ? "bg-amber-500" : "bg-indigo-500")} initial={{ width: 0 }} animate={{ width: `${(syncedTeams / teams.length) * 100}%` }} /></div>
          </div>
        )}

        <div className={cn("relative group transition-all duration-300", search && "scale-[1.02]")}>
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors"><Search size={18} /></div>
          <input type="text" placeholder="Search Player Pool..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-14 md:h-16 pl-14 pr-6 rounded-2xl border border-zinc-800 bg-[#111113]/80 backdrop-blur-xl shadow-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-xs md:text-sm text-white placeholder:text-zinc-600 uppercase tracking-tight" />
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#18181b] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
                <div className="p-2 grid grid-cols-1 gap-1">
                  {searchResults.map((player, idx) => (
                    <div key={player.id || `search-${idx}`} onClick={() => handleSelectForPreview(player)} className="flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 text-left hover:bg-zinc-800/80 rounded-xl transition-all group cursor-pointer">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-zinc-900 border border-zinc-800 p-1.5 md:p-2 flex items-center justify-center shrink-0"><img src={player.team.crest} alt={`${player.team.name} crest`} className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-black text-white uppercase tracking-tight truncate">{player.name}</p>
                        <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1 truncate">{player.team.shortName || player.team.name} <span className="mx-1 text-zinc-800">|</span> <span className="text-zinc-500 italic">£{player.price}m</span></p>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); addToSquad(player); }} className="p-1.5 md:p-2 rounded-lg bg-emerald-900/30 border border-emerald-800 text-emerald-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-lg" title="Add to Squad"><Plus size={14} strokeWidth={3} /></button>
                        <button onClick={(e) => { e.stopPropagation(); addToComparison(player); }} className="p-1.5 md:p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all shadow-lg" title="Add to Comparison"><Scale size={14} /></button>
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
               <motion.div key="active-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl border border-indigo-500/30 bg-[#111113] p-6 md:p-8 shadow-2xl relative overflow-hidden ring-1 ring-indigo-500/20">
                 <div className="absolute top-0 right-0 p-6 opacity-5"><Star size={120} className="text-indigo-500 fill-indigo-500" /></div>
                 <div className="relative">
                   <div className="flex justify-between items-start mb-6">
                     <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-zinc-900 border border-zinc-800 p-3 shadow-xl"><img src={activePlayer.team.crest} alt={`${activePlayer.team.name} crest`} className="h-full w-full object-contain" referrerPolicy="no-referrer" /></div>
                     <button onClick={() => setActivePlayer(null)} className="h-8 w-8 rounded-full bg-zinc-900 text-zinc-500 flex items-center justify-center hover:bg-zinc-800"><X size={14} /></button>
                   </div>
                   <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter truncate">{activePlayer.name}</h3>
                   <div className="flex items-center justify-between mt-1 mb-6">
                     <p className="text-[9px] md:text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] truncate">{activePlayer.team.name}</p>
                     <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none shrink-0">{activePlayer.position}</span>
                   </div>

                   {activePlayerFixtures.length > 0 && (
                     <div className="mb-6">
                       <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Upcoming Fixtures (FDR)</p>
                       <div className="flex gap-2">
                         {activePlayerFixtures.map((f: any, idx: number) => (
                           <div key={idx} className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded border ${f.fdrColor}`}>
                             <span className="text-[10px] font-black">{f.oppName}</span>
                             <span className="text-[7px] font-bold opacity-80 uppercase">({f.isHome ? 'H' : 'A'})</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50"><p className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Goals</p><p className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter">{activePlayer.goals}</p></div>
                      <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50"><p className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Assists</p><p className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter">{activePlayer.assists}</p></div>
                      <div className="col-span-2 bg-indigo-600/10 rounded-xl p-3 border border-indigo-500/20"><div className="flex justify-between items-center text-indigo-400"><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Clean Sheets</span><span className="text-lg md:text-xl font-black tabular-nums">{activePlayer.cleanSheets}</span></div></div>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-2 w-full">
                     <button onClick={() => addToComparison(activePlayer)} className="flex-1 h-10 md:h-12 rounded-xl bg-indigo-600 flex items-center justify-center gap-2 font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-white hover:bg-indigo-500 transition-all shadow-lg active:scale-95"><Scale size={14} /> Compare</button>
                     <button onClick={() => addToSquad(activePlayer)} className="flex-1 h-10 md:h-12 rounded-xl bg-emerald-600 flex items-center justify-center gap-2 font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-white hover:bg-emerald-500 transition-all shadow-lg active:scale-95"><Plus size={14} /> Add to Squad</button>
                   </div>
                 </div>
               </motion.div>
             ) : (
               <motion.div key="empty-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-zinc-800 p-6 md:p-8 text-center bg-[#09090b]/50 py-16 md:py-20">
                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center mx-auto mb-4 md:mb-6 text-zinc-700"><Ghost size={20} /></div>
                 <h4 className="text-[10px] md:text-xs font-black text-zinc-600 uppercase tracking-widest">Awaiting Input</h4>
                 <p className="mt-3 md:mt-4 text-[9px] md:text-[10px] text-zinc-800 uppercase tracking-[0.15em] leading-relaxed px-2 md:px-4 font-black">Search for a player above to unlock detailed stats and <span className="text-zinc-600 italic">comparison metrics</span>.</p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
           {selectedPlayers.length === 0 ? (
             <div className="flex flex-col items-center justify-center rounded-[2rem] border border-zinc-800 bg-[#111113] p-8 py-20 md:py-32 text-center shadow-inner group">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-full border-2 md:border-4 border-dashed border-zinc-800 flex items-center justify-center mb-6 md:mb-10 text-zinc-800 group-hover:border-zinc-700 transition-colors"><TrendingUp size={30} className="opacity-20 translate-y-1 md:w-[40px] md:h-[40px]" /></div>
                <h2 className="text-base md:text-lg font-black text-zinc-700 uppercase tracking-[0.2em] md:tracking-[0.3em] italic mb-3 md:mb-4">Comparison Labs</h2>
                <p className="max-w-xs text-[9px] md:text-[10px] font-black text-zinc-800 uppercase tracking-widest leading-relaxed md:leading-loose">Select up to <span className="text-zinc-600">two player profiles</span> to launch the side-by-side performance audit.</p>
             </div>
           ) : (
             <div className="rounded-[2rem] md:rounded-[40px] border border-zinc-800 bg-[#18181b] p-1.5 md:p-2 overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#6366f111,transparent_70%)]" />
                <div className="bg-[#111113] rounded-[1.8rem] md:rounded-[38px] p-6 md:p-10 relative z-10">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 mb-10 md:mb-16 relative">
                      <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full border border-zinc-800 bg-zinc-950 items-center justify-center text-[9px] md:text-[10px] font-black text-zinc-700 shadow-xl italic tracking-widest">VS</div>
                      {selectedPlayers.map((player, idx) => (
                        <div key={player.id || `selected-${idx}`} className={cn("relative flex flex-col items-center group sm:items-start", idx === 0 ? "sm:text-left" : "sm:items-end sm:text-right")}>
                           <button onClick={() => removePlayer(player.id)} className="absolute -top-3 -right-3 md:-top-4 md:-right-4 h-6 w-6 md:h-8 md:w-8 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all z-20"><X size={12} /></button>
                           <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl md:rounded-3xl bg-zinc-900 border-2 border-zinc-800 p-4 md:p-5 mb-4 md:mb-6 group-hover:border-indigo-500/40 transition-all shadow-2xl overflow-hidden relative">
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <img src={player.team.crest} alt={`${player.team.name} crest`} className="h-full w-full object-contain group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                           </div>
                           <h3 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter leading-none text-center sm:text-left">{player.name}</h3>
                           <p className="mt-1 md:mt-2 text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{player.team.shortName || player.team.name}</p>
                        </div>
                      ))}
                   </div>
                   {selectedPlayers.length === 2 && (
                     <div className="space-y-6 md:space-y-10">
                        <PlayerStatRow label="FPL Price" val1={`£${selectedPlayers[0].price}m`} val2={`£${selectedPlayers[1].price}m`} />
                        <PlayerStatRow label="Recent Form" val1={selectedPlayers[0].form} val2={selectedPlayers[1].form} highlight />
                        <PlayerStatRow label="Net Goals" val1={selectedPlayers[0].goals} val2={selectedPlayers[1].goals} />
                        <PlayerStatRow label="X-Assists" val1={selectedPlayers[0].assists} val2={selectedPlayers[1].assists} />
                        <PlayerStatRow label="Defensive CS" val1={selectedPlayers[0].cleanSheets} val2={selectedPlayers[1].cleanSheets} />
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </section>

      {/* 👇 1. قسم "عراف الجولة" الجديد (Weekly Predictor) 👇 */}
      <section className="bg-gradient-to-br from-indigo-900/40 to-[#09090b] rounded-[2rem] md:rounded-[40px] p-6 md:p-12 border border-indigo-500/30 shadow-2xl relative overflow-hidden mt-8 text-center">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Target size={150} /></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-xl border border-indigo-500/30">
            <Medal size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Weekly Predictor</h2>
          <p className="text-xs md:text-sm text-zinc-400 font-bold mb-8 max-w-md">Who will be the star of the upcoming Gameweek? Predict correctly and secure your spot on the KoraTracker Leaderboard!</p>
          
          {predictedPlayer ? (
            <div className="bg-zinc-900/80 border border-emerald-500/50 p-6 rounded-3xl w-full max-w-sm">
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-4">Your Prediction is Locked! 🔒</p>
              <div className="flex items-center gap-4 justify-center">
                <img src={predictedPlayer.team.crest} className="w-12 h-12 object-contain" alt="" />
                <div className="text-left">
                  <h3 className="text-xl font-black text-white italic">{predictedPlayer.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{predictedPlayer.team.name}</p>
                </div>
              </div>
              <button onClick={() => setPredictedPlayer(null)} className="mt-6 text-[10px] text-zinc-500 hover:text-red-400 uppercase font-black underline transition-colors">Change Prediction</button>
            </div>
          ) : (
            <div className="w-full max-w-sm">
              {showPredictorModal ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-2xl animate-in zoom-in duration-300">
                  <div className="relative mb-4">
                    <input type="text" placeholder="Search a player..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#111113] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white outline-none" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                    {searchResults.map(p => (
                      <div key={p.id} onClick={() => handlePredict(p)} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
                        <img src={p.team.crest} className="w-6 h-6 object-contain" alt="" />
                        <span className="text-xs font-bold text-white">{p.name}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowPredictorModal(false)} className="mt-4 w-full text-[10px] text-zinc-500 hover:text-white uppercase font-black transition-colors">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowPredictorModal(true)} className="bg-white text-black hover:bg-indigo-400 hover:text-white transition-all font-black text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-xl shadow-white/10 flex items-center gap-2 mx-auto">
                  <Target size={16} /> Make Prediction
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#111113] to-[#09090b] rounded-[2rem] md:rounded-[40px] p-6 md:p-12 border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col items-center mt-8">
         <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">Squad Builder</h2>
            <p className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Build, Download, and Share with Friends</p>
         </div>
         <SquadBuilder 
            squad={squad} 
            onRemovePlayer={removeFromSquad} 
            totalBudget={totalBudget}
            captainId={captainId}
            viceCaptainId={viceCaptainId}
            setCaptain={setCaptainId}
            setViceCaptain={setViceCaptainId}
            onGenerateAI={generateAIReport}
            isGeneratingAI={isGeneratingAI}
            onSelectPlayer={setActivePlayer}
            onRoastSquad={generateRoastReport} /* 👈 ربط زرار القصف */
            isRoasting={isRoasting}
         />
      </section>

      <section className="bg-gradient-to-br from-[#111113] to-[#09090b] rounded-[2rem] md:rounded-[40px] p-6 md:p-12 border border-zinc-800 shadow-2xl relative overflow-hidden mt-8">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-4 text-center md:text-left">
               <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mx-auto md:mx-0">
                  <CalendarDays size={20} className="md:w-6 md:h-6" />
               </div>
               <div>
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">Premier League Fixtures</h2>
                  <p className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Upcoming Gameweeks Tracker</p>
               </div>
            </div>
            
            {upcomingGameweeks.length > 0 && (
              <div className="flex flex-col items-center bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
                 <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Timer size={10}/> GW {upcomingGameweeks[0].gw} Deadline In</span>
                 <div className="flex items-center gap-2 text-white font-black tabular-nums">
                    <div className="flex flex-col items-center"><span className="text-lg leading-none">{timeLeft.days}</span><span className="text-[7px] text-zinc-500 uppercase">Days</span></div><span className="text-zinc-600 mb-2">:</span>
                    <div className="flex flex-col items-center"><span className="text-lg leading-none">{timeLeft.hours}</span><span className="text-[7px] text-zinc-500 uppercase">Hrs</span></div><span className="text-zinc-600 mb-2">:</span>
                    <div className="flex flex-col items-center"><span className="text-lg leading-none">{timeLeft.minutes}</span><span className="text-[7px] text-zinc-500 uppercase">Min</span></div><span className="text-zinc-600 mb-2">:</span>
                    <div className="flex flex-col items-center text-indigo-400"><span className="text-lg leading-none">{timeLeft.seconds}</span><span className="text-[7px] text-indigo-500/50 uppercase">Sec</span></div>
                 </div>
              </div>
            )}
         </div>
         
         {fixturesLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
         ) : upcomingGameweeks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {upcomingGameweeks.map((gameweek: any) => (
                   <div key={gameweek.gw} className="bg-zinc-900/50 border border-zinc-800/80 hover:border-indigo-500/50 transition-colors rounded-3xl p-5 md:p-6 relative overflow-hidden flex flex-col">
                       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><CalendarDays size={60} /></div>
                       <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10 shrink-0">
                          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Gameweek {gameweek.gw}</h3>
                       </div>
                       <div className="space-y-2 md:space-y-3 relative z-10 max-h-[250px] md:max-h-[320px] overflow-y-auto pr-1 custom-scrollbar flex-1">
                           {gameweek.matches.map((match: any) => (
                               <div key={match.id} className="flex justify-between items-center bg-[#09090b] p-2.5 md:p-3 rounded-xl border border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                   <span className="text-[10px] md:text-xs font-bold text-white uppercase w-12 md:w-16 text-left truncate" title={match.homeTeam.name}>{match.homeTeam.tla || match.homeTeam.shortName || match.homeTeam.name.substring(0,3)}</span>
                                   <span className="text-[8px] md:text-[9px] font-black text-zinc-600 bg-zinc-900 px-1.5 md:px-2 py-0.5 rounded border border-zinc-800 shrink-0">VS</span>
                                   <span className="text-[10px] md:text-xs font-bold text-white uppercase w-12 md:w-16 text-right truncate" title={match.awayTeam.name}>{match.awayTeam.tla || match.awayTeam.shortName || match.awayTeam.name.substring(0,3)}</span>
                               </div>
                           ))}
                       </div>
                   </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-10"><p className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest">No upcoming fixtures found.</p></div>
         )}
      </section>

      <section className="bg-gradient-to-br from-[#111113] to-[#09090b] rounded-[2rem] md:rounded-[40px] p-6 md:p-12 border border-zinc-800 shadow-2xl relative overflow-hidden mt-8">
         <div className="absolute bottom-0 right-0 p-8 md:p-12 pointer-events-none opacity-[0.03] text-white"><Trophy size={200} className="md:w-[300px] md:h-[300px]" strokeWidth={1} /></div>
         <div className="relative">
            <div className="flex items-center gap-2 md:gap-3 mb-8 md:mb-12">
               <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <h2 className="text-[10px] md:text-xs font-black tracking-[0.3em] md:tracking-[0.4em] uppercase text-zinc-500">Global Prospects</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
               {allPlayers.length === 0 ? (
                 <>
                   {[1, 2, 3, 4].map((i) => (
                     <div key={`skeleton-${i}`} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 md:p-5">
                       <div className="flex items-center gap-3 mb-4"><Skeleton className="h-4 w-4 rounded-full" /><Skeleton className="h-2 w-12" /></div>
                       <Skeleton className="h-4 w-3/4 mb-4" />
                       <div className="flex justify-between items-center mt-4"><Skeleton className="h-3 w-10" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
                     </div>
                   ))}
                 </>
               ) : (
                 allPlayers.slice(0, 4).map((p, idx) => (
                   <div key={p.id || `prospect-${idx}`} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 md:p-5 hover:bg-zinc-800/60 hover:border-indigo-500/30 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                       <img src={p.team.crest} className="h-3 w-3 md:h-4 md:w-4 object-contain opacity-40 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                       <span className="text-[7px] md:text-[8px] font-black text-zinc-600 uppercase tracking-widest">{p.team.shortName || p.team.name}</span>
                    </div>
                    <p onClick={() => handleSelectForPreview(p)} className="font-black text-zinc-100 uppercase italic text-xs md:text-sm mb-1 line-clamp-1">{p.name}</p>
                    <div className="flex items-center justify-between mt-3 md:mt-4">
                       <span className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest">£{p.price}m</span>
                       <div className="flex items-center gap-1.5 md:gap-2">
                         <button onClick={(e) => { e.stopPropagation(); addToComparison(p); }} className="p-1 md:p-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/50 transition-all"><Scale size={10} className="md:w-3 md:h-3" /></button>
                         <span className="bg-zinc-950 px-1.5 md:px-2 py-0.5 rounded text-[8px] md:text-[10px] font-black text-zinc-400 tabular-nums">{p.form}</span>
                       </div>
                    </div>
                 </div>
               )))}
            </div>
         </div>
      </section>

      {/* Comparison Tray */}
      <AnimatePresence>
        {selectedPlayers.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-2xl px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl border border-zinc-700 bg-black/90 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0"><Scale size={16} className="md:w-5 md:h-5"/></div>
                <div className="flex-1 sm:flex-none text-center sm:text-left">
                  <h4 className="text-[9px] md:text-[11px] font-black text-white uppercase tracking-[0.2em] mb-0.5 md:mb-1">Comparison Tray</h4>
                  <p className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest">{selectedPlayers.length} / 2 Selected</p>
                </div>
              </div>
              <div className="flex justify-center gap-2 md:gap-3 w-full sm:w-auto">
                {selectedPlayers.map(p => (
                  <motion.div key={p.id} layoutId={`comp-${p.id}`} className="relative px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 group">
                    <img src={p.team.crest} alt={`${p.team.name} crest`} className="h-3 w-3 md:h-4 md:w-4 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-[8px] md:text-[10px] font-black text-zinc-300 uppercase tracking-tight truncate max-w-[50px] md:max-w-none">{p.name}</span>
                    <button onClick={() => removePlayer(p.id)} className="text-zinc-600 hover:text-red-500 transition-colors"><X size={10} /></button>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center">
                <button onClick={clearComparison} className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"><Trash2 size={14} className="md:w-4 md:h-4" /></button>
                <button disabled={selectedPlayers.length < 2} onClick={() => setIsComparisonOpen(true)} className={cn("h-8 md:h-11 px-4 md:px-6 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl w-full sm:w-auto", selectedPlayers.length === 2 ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30" : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50")}>Compare</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComparisonOpen && selectedPlayers.length === 2 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsComparisonOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-zinc-800 bg-[#09090b] shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] ring-1 ring-white/5 flex flex-col">
              <div className="flex flex-row items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 border-b border-zinc-900 bg-[#111113]/50 gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                   <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0"><BarChart3 size={16} className="md:w-5 md:h-5" /></div>
                   <div><h2 className="text-sm sm:text-lg md:text-xl font-black text-white uppercase italic tracking-tighter">Audit</h2><p className="hidden sm:block text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Head-to-Head Analytics</p></div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button onClick={handleShare} className={cn("h-8 w-8 sm:h-auto sm:w-auto sm:px-4 md:h-12 md:px-6 rounded-xl md:rounded-2xl border flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl", copySuccess ? "bg-emerald-500 border-emerald-400 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800")}><Share2 size={14} /><span className="hidden sm:block">{copySuccess ? 'Copied!' : 'Share'}</span></button>
                  <button onClick={() => setIsComparisonOpen(false)} className="h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all shadow-xl"><X size={16} className="md:w-5 md:h-5" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 custom-scrollbar">
                <div className="flex flex-row justify-between items-center gap-4 relative mb-8 md:mb-16">
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"><div className="h-8 w-8 md:h-16 md:w-16 rounded-full border border-zinc-700 bg-black flex items-center justify-center shadow-2xl"><span className="text-[8px] md:text-xs font-black text-zinc-500 uppercase italic tracking-widest">VS</span></div></div>
                   {selectedPlayers.map((player, idx) => (
                      <div key={player.id} className={cn("flex-1 flex flex-col", idx === 1 ? "items-end text-right" : "items-start text-left")}>
                         <div className={cn("flex flex-col sm:flex-row items-center gap-3 md:gap-6", idx === 1 ? "sm:flex-row-reverse" : "sm:flex-row")}>
                            <div className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-[2rem] bg-zinc-900 border border-zinc-800 p-3 md:p-6 shadow-2xl relative overflow-hidden group shrink-0"><div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" /><img src={player.team.crest} className="h-full w-full object-contain relative z-10" referrerPolicy="no-referrer" /></div>
                            <div className="space-y-1 md:space-y-2"><h3 className="text-base sm:text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{player.name}</h3><p className="text-[9px] md:text-sm font-black text-indigo-500 uppercase tracking-[0.2em]">{player.team.shortName || player.team.name}</p></div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="space-y-1">
                   <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                    <ComparisonStatSection label="Goals" val1={selectedPlayers[0].goals} val2={selectedPlayers[1].goals} />
                    <ComparisonStatSection label="Assists" val1={selectedPlayers[0].assists} val2={selectedPlayers[1].assists} />
                    <ComparisonStatSection label="Appearances" val1={selectedPlayers[0].appearances} val2={selectedPlayers[1].appearances} />
                    <ComparisonStatSection label="Market Value" val1={selectedPlayers[0].price} val2={selectedPlayers[1].price} suffix="m" prefix="£" />
                    <ComparisonStatSection label="Match Form" val1={selectedPlayers[0].form} val2={selectedPlayers[1].form} />
                    <ComparisonStatSection label="Season Points" val1={selectedPlayers[0].points} val2={selectedPlayers[1].points} />
                   </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiReport && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAiReport(null)} className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-zinc-800 bg-[#09090b] shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] ring-1 ring-white/5 flex flex-col p-6 md:p-8">
              <button onClick={() => setAiReport(null)} className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white transition-colors"><X size={20} className="md:w-6 md:h-6" /></button>
              <div className="text-center mb-6 md:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-3 md:mb-4 shadow-lg shadow-indigo-500/20"><BrainCircuit size={24} className="md:w-8 md:h-8" /></div>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">AI Squad Analysis</h2>
              </div>
              <div className={`flex flex-col items-center justify-center py-6 md:py-8 rounded-2xl md:rounded-3xl border ${aiReport.ratingBg} mb-6 md:mb-8`}>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-1 md:mb-2 text-zinc-400">Squad Score</span>
                <div className={`text-5xl md:text-7xl font-black tabular-nums tracking-tighter ${aiReport.ratingColor}`}>{aiReport.score}<span className="text-xl md:text-3xl opacity-50">%</span></div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-widest mb-2 md:mb-3"><CheckCircle2 size={14} /> Strengths</h3>
                  <ul className="space-y-1.5 md:space-y-2">{aiReport.strengths.map((str: string, i: number) => (<li key={i} className="text-xs md:text-sm font-bold text-zinc-300 flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> {str}</li>))}</ul>
                </div>
                {aiReport.weaknesses.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-[10px] md:text-xs font-black text-red-400 uppercase tracking-widest mb-2 md:mb-3"><AlertTriangle size={14} /> Areas to Improve</h3>
                    <ul className="space-y-1.5 md:space-y-2">{aiReport.weaknesses.map((wk: string, i: number) => (<li key={i} className="text-xs md:text-sm font-bold text-zinc-300 flex items-start gap-2"><span className="text-red-500 mt-1">•</span> {wk}</li>))}</ul>
                  </div>
                )}
              </div>
              <button onClick={() => setAiReport(null)} className="mt-8 md:mt-10 w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black py-3 md:py-4 rounded-xl transition-all active:scale-95 uppercase text-[10px] md:text-xs tracking-widest border border-zinc-800">Continue Building</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 👇 نافذة قصف الجبهة الساخرة 🤡 👇 */}
      <AnimatePresence>
        {roastReport && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRoastReport(null)} className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-red-500/30 bg-[#1a0505] shadow-[0_64px_128px_-32px_rgba(220,38,38,0.3)] ring-1 ring-red-500/20 flex flex-col p-6 md:p-8 text-center">
              <button onClick={() => setRoastReport(null)} className="absolute top-4 right-4 md:top-6 md:right-6 text-red-500/50 hover:text-red-400 transition-colors"><X size={20} className="md:w-6 md:h-6" /></button>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-6 mx-auto shadow-lg shadow-red-500/20">
                <Flame size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-8 text-red-500">AI Squad Roast 🤡</h2>
              <div className="space-y-4">
                {roastReport.map((roast: string, i: number) => (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} key={i} className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl">
                    <p className="text-sm md:text-base font-bold text-red-100 leading-relaxed" dir="rtl">{roast}</p>
                  </motion.div>
                ))}
              </div>
              <button onClick={() => setRoastReport(null)} className="mt-8 w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all active:scale-95 uppercase text-xs tracking-widest shadow-lg shadow-red-600/20">كفاية إهانة ورجعني للتشكيلة 😂</button>
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
  const rowVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };

  return (
    <motion.div variants={rowVariants} className="py-4 md:py-6 group border-b border-zinc-900/50 last:border-0">
        <div className="flex justify-between items-center mb-3 md:mb-4 gap-1 md:gap-2">
          <div className="text-left w-20 sm:w-24 md:w-32 flex items-center gap-1 md:gap-2 shrink-0">
             <span className={cn("text-sm sm:text-base md:text-lg font-black tabular-nums tracking-tighter flex items-center gap-1", isBetter1 ? "text-emerald-400" : "text-zinc-600")}>{isBetter1 && <Crown size={10} className="md:w-3 md:h-3 text-emerald-400 fill-emerald-400/20 shrink-0" />}{prefix}{val1}{suffix}</span>
          </div>
          <h4 className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-zinc-500 group-hover:text-indigo-400 transition-colors text-center flex-1 truncate">{label}</h4>
          <div className="text-right w-20 sm:w-24 md:w-32 flex items-center justify-end gap-1 md:gap-2 shrink-0">
             <span className={cn("text-sm sm:text-base md:text-lg font-black tabular-nums tracking-tighter flex items-center gap-1", isBetter2 ? "text-emerald-400" : "text-zinc-600")}>{prefix}{val2}{suffix}{isBetter2 && <Crown size={10} className="md:w-3 md:h-3 text-emerald-400 fill-emerald-400/20 shrink-0" />}</span>
          </div>
       </div>
       <div className="h-1.5 md:h-2 w-full flex rounded-full bg-zinc-900/50 overflow-hidden ring-1 ring-white/5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${p1}%` }} className={cn("h-full transition-all duration-300", isBetter1 ? "bg-emerald-500" : "bg-zinc-800")} />
          <motion.div initial={{ width: 0 }} animate={{ width: `${p2}%` }} className={cn("h-full transition-all duration-300", isBetter2 ? "bg-emerald-500" : "bg-zinc-800 border-l border-zinc-950")} />
       </div>
    </motion.div>
  );
}

function PlayerStatRow({ label, val1, val2, highlight = false }: any) {
  const isNumeric = typeof val1 === 'number' || (!isNaN(parseFloat(val1)) && isFinite(val1));
  const cleanVal = (v: any) => { if (typeof v !== 'string') return v; return parseFloat(v.replace('£', '').replace('m', '')); };
  const v1 = isNumeric ? cleanVal(val1) : val1;
  const v2 = isNumeric ? cleanVal(val2) : val2;
  const winner = isNumeric ? (v1 > v2 ? 1 : v2 > v1 ? 2 : 0) : 0;

  return (
    <div className="relative group min-h-[40px] md:min-h-[60px] flex items-center">
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"><span className="bg-zinc-950 border border-zinc-800 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-zinc-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all shadow-xl whitespace-nowrap">{label}</span></div>
       <div className="grid grid-cols-2 w-full gap-4 sm:gap-8 md:gap-24">
          <div className={cn("flex flex-col items-center justify-center transition-all", winner === 1 ? "opacity-100" : "opacity-40 grayscale")}><span className={cn("text-xl md:text-3xl font-black tabular-nums tracking-tighter", winner === 1 ? "text-white" : "text-zinc-600", highlight && "text-2xl md:text-4xl")}>{val1}</span>{winner === 1 && <div className="h-1 w-1 rounded-full bg-indigo-500 mt-1 md:mt-2" />}</div>
          <div className={cn("flex flex-col items-center justify-center transition-all", winner === 2 ? "opacity-100" : "opacity-40 grayscale")}><span className={cn("text-xl md:text-3xl font-black tabular-nums tracking-tighter", winner === 2 ? "text-white" : "text-zinc-600", highlight && "text-2xl md:text-4xl")}>{val2}</span>{winner === 2 && <div className="h-1 w-1 rounded-full bg-indigo-500 mt-1 md:mt-2" />}</div>
       </div>
    </div>
  );
}

function Trophy({ size, strokeWidth, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}