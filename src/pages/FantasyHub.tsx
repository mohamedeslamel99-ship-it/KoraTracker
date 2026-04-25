import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import { Search, Scale, Zap, Info, X, Loader2, Star, Ghost, Clock, BarChart3, Trash2, Crown, Share2, Plus, BrainCircuit, CheckCircle2, AlertTriangle, CalendarDays, Timer, Flame, Target, Medal, Wand2, TrendingUp, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SquadBuilder from '../components/SquadBuilder';

// 🚨 خريطة التصحيح النهائية بالـ ID (الأمان الكامل للمراكز)
const getPlayerPosition = (p: any) => {
  if (!p) return 'UNKNOWN';
  const pId = Number(p.id);
  const name = String(p.name || '').toLowerCase();

  const idToPosition: Record<number, string> = {
    16345: 'DEF', // Cristhian Mosquera (إجبار مكانه في الدفاع)
    102:   'FWD', // Thiago Rodrigues (إجبار مكانه في الهجوم)
    3754:  'MID', // Mohamed Salah
    8004:  'MID', // Bukayo Saka
    8011:  'MID', // Cole Palmer
    3825:  'MID', // Phil Foden
    9002:  'MID', // Anthony Gordon
    9003:  'MID', // Jarrod Bowen
    2000:  'MID', // Rodri
    3823:  'FWD', // Haaland
  };

  if (idToPosition[pId]) return idToPosition[pId];

  // منطق الفانتازي العام للأجنحة
  if (name.includes('salah') || name.includes('saka') || name.includes('palmer') || name.includes('foden')) return 'MID';

  const pos = String(p.position || p.section || '').toLowerCase();
  if (pos.includes('goal') || pos === 'gk') return 'GK';
  if (pos.includes('defen') || pos.includes('back') || pos === 'df' || pos === 'cb') return 'DEF';
  if (pos.includes('midfield') || pos.includes('wing') || pos === 'mf') return 'MID';
  if (pos.includes('offen') || pos.includes('forward') || pos.includes('strik') || pos === 'fw') return 'FWD';
  
  return 'MID'; 
};

// 💰 محرك الأسعار الديناميكي
const getRealisticFPLData = (name: string, pos: string, goals: number, assists: number, id: number) => {
  const n = (name || '').toLowerCase().trim();
  const exactPrices: Record<string, string> = {
    'erling haaland': '15.0', 'mohamed salah': '12.5', 'cole palmer': '10.5', 'bukayo saka': '10.0', 
    'phil foden': '9.5', 'kevin de bruyne': '10.5', 'ollie watkins': '9.0', 'rodri': '6.5'
  };

  let price = exactPrices[n]; 
  if (!price) {
    let base = pos === 'FWD' ? 5.5 : pos === 'MID' ? 5.0 : pos === 'DEF' ? 4.5 : 4.0;
    let bonus = (goals * 0.2) + (assists * 0.1);
    price = Math.min(base + bonus, 9.5).toFixed(1);
  }
  let points = (goals * (pos === 'MID' ? 5 : 4)) + (assists * 3) + ((id % 20) * 2);
  return { price, points };
};

const defaultSquadStructure = [
  { role: 'GK', isBench: false, player: null },
  { role: 'DEF', isBench: false, player: null },
  { role: 'DEF', isBench: false, player: null },
  { role: 'DEF', isBench: false, player: null },
  { role: 'DEF', isBench: false, player: null },
  { role: 'MID', isBench: false, player: null },
  { role: 'MID', isBench: false, player: null },
  { role: 'MID', isBench: false, player: null },
  { role: 'MID', isBench: false, player: null },
  { role: 'FWD', isBench: false, player: null },
  { role: 'FWD', isBench: false, player: null },
  { role: 'GK', isBench: true, player: null },
  { role: 'DEF', isBench: true, player: null },
  { role: 'MID', isBench: true, player: null },
  { role: 'FWD', isBench: true, player: null }
];

export default function FantasyHub() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncedTeams, setSyncedTeams] = useState<number>(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastReport, setRoastReport] = useState<string[] | null>(null);
  const [predictedPlayer, setPredictedPlayer] = useState<any>(null);

  // 🧹 V11 Clean Wipe
  const [squad, setSquad] = useState<any[]>(() => {
    const saved = localStorage.getItem('kt_squad_v11'); 
    return saved ? JSON.parse(saved) : defaultSquadStructure;
  });

  const [leaguePlayers, setLeaguePlayers] = useState<any[]>(() => { 
    try { const saved = localStorage.getItem('kt_players_db_v11'); return saved ? JSON.parse(saved) : []; } catch { return []; } 
  });

  const { data: teamsData } = useSWR(endpoints.getTeams('PL'), fetchFootballData);
  const { data: plScorers } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData);
  const { data: fixturesData, isLoading: fixturesLoading } = useSWR('competitions/PL/matches', fetchFootballData);

  useEffect(() => {
    localStorage.setItem('kt_squad_v11', JSON.stringify(squad));
    localStorage.setItem('kt_players_db_v11', JSON.stringify(leaguePlayers));
  }, [squad, leaguePlayers]);

  const allPlayers = useMemo(() => {
    const uniqueMap = new Map();
    const add = (p: any, g = 0, a = 0) => {
      if (!p || !p.id) return;
      const pos = getPlayerPosition(p);
      const { price, points } = getRealisticFPLData(p.name, pos, g || p.goals || 0, a || p.assists || 0, p.id);
      uniqueMap.set(p.id, { ...p, league: 'PL', price, points, position: pos });
    };
    leaguePlayers.forEach(p => add(p));
    (plScorers?.scorers || []).forEach(s => add(s.player, s.goals, s.assists));
    return Array.from(uniqueMap.values());
  }, [plScorers, leaguePlayers]);

  const handleSearch = (term: string) => {
    if (!term) { setSearchResults([]); return; }
    setSearchResults(allPlayers.filter(p => p.name?.toLowerCase().includes(term.toLowerCase())).slice(0, 15));
  };

  useEffect(() => {
    const sync = async () => {
      if (!teamsData?.teams || isSyncing || leaguePlayers.length > 200) return;
      setIsSyncing(true);
      for (let i = 0; i < teamsData.teams.length; i++) {
        const team = teamsData.teams[i];
        const data = await fetchFootballData(endpoints.getTeam(team.id.toString()));
        if (data?.squad) {
          const squadWithTeam = data.squad.map((p: any) => ({ ...p, team }));
          setLeaguePlayers(prev => {
            const map = new Map();
            [...prev, ...squadWithTeam].forEach(x => map.set(x.id, x));
            return Array.from(map.values());
          });
          setSyncedTeams(i + 1);
        }
        await new Promise(r => setTimeout(r, 6000));
      }
      setIsSyncing(false);
    };
    sync();
  }, [teamsData]);

  const addToSquad = (player: any) => {
    const pos = player.position;
    const emptyIndex = squad.findIndex(s => s.player === null && s.role === pos);
    if (emptyIndex !== -1) {
      const newSquad = [...squad];
      newSquad[emptyIndex].player = player;
      setSquad(newSquad);
    } else {
      alert(`لا يوجد مكان متاح في مركز ${pos}`);
    }
  };

  const removeFromSquad = (index: number) => {
    const newSquad = [...squad];
    newSquad[index].player = null;
    setSquad(newSquad);
  };

  const upcomingGameweeks = useMemo(() => {
    if (!fixturesData?.matches) return [];
    const grouped = fixturesData.matches.reduce((acc: any, m: any) => { 
      if (!m.matchday) return acc;
      if (!acc[m.matchday]) acc[m.matchday] = []; 
      acc[m.matchday].push(m); 
      return acc; 
    }, {});
    return Object.keys(grouped).sort((a,b)=>Number(a)-Number(b)).slice(0, 3).map(gw => ({ gw, matches: grouped[gw] }));
  }, [fixturesData]);

  // AI & Roast Logic
  const generateAI = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setAiReport({ score: 85, strengths: ["هجوم كاسح", "دفاع صلب"], weaknesses: ["ميزانية مرتفعة"], ratingColor: "text-emerald-400", ratingBg: "bg-emerald-500/10" });
      setIsGeneratingAI(false);
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 sm:px-6"> 
      <header className="pt-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic">Fantasy <span className="text-indigo-500">Hub</span></h1>
        <p className="mt-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px]">Live Premier League Intelligence</p>
      </header>

      {/* البحث والمزامنة */}
      <section className="relative z-40 max-w-2xl mx-auto">
        {isSyncing && <div className="text-[10px] text-indigo-400 mb-2 animate-pulse text-center">Syncing PL Teams: {syncedTeams}/20</div>}
        <input type="text" placeholder="Search Player Pool..." onChange={(e) => handleSearch(e.target.value)} className="w-full h-16 bg-[#111113] border border-zinc-800 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500 transition-all" />
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute w-full mt-2 bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50">
              {searchResults.map(p => (
                <div key={p.id} onClick={() => {addToSquad(p); setSearchResults([]);}} className="p-4 hover:bg-zinc-800 cursor-pointer flex justify-between items-center border-b border-zinc-800/50 last:border-0 group">
                  <span className="text-white font-bold text-sm">{p.name} <span className="text-indigo-500 text-[10px] ml-2 uppercase">{p.position}</span></span>
                  <Plus size={18} className="text-emerald-500" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* الملعب والتحليل جنب بعض */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <div className="lg:col-span-8 bg-[#111113]/50 p-6 rounded-[2.5rem] border border-zinc-800/50 shadow-2xl">
            <SquadBuilder 
              squad={squad} 
              onRemovePlayer={removeFromSquad} 
              onSelectPlayer={setActivePlayer} 
              onGenerateAI={generateAI}
              isGeneratingAI={isGeneratingAI}
            />
         </div>

         <div className="lg:col-span-4 sticky top-10 flex flex-col gap-6">
            <AnimatePresence mode="wait">
               {activePlayer ? (
                 <motion.div key="player" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[2rem] border border-indigo-500/30 bg-[#111113] p-8 shadow-2xl">
                    <img src={activePlayer.team?.crest} className="h-16 mb-4" />
                    <h3 className="text-2xl font-black text-white italic truncate uppercase">{activePlayer.name}</h3>
                    <p className="text-indigo-400 font-bold text-xs mb-6 uppercase tracking-widest">{activePlayer.position} - £{activePlayer.price}m</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 p-4 rounded-xl text-center"><p className="text-zinc-500 text-[9px] uppercase font-black">Points</p><p className="text-xl text-white font-black">{activePlayer.points}</p></div>
                      <div className="bg-black/40 p-4 rounded-xl text-center"><p className="text-zinc-500 text-[9px] uppercase font-black">Goals</p><p className="text-xl text-white font-black">{activePlayer.goals || 0}</p></div>
                    </div>
                    <button onClick={() => addToSquad(activePlayer)} className="w-full mt-6 py-4 bg-emerald-600 rounded-xl text-white font-black uppercase text-xs">Add to Squad</button>
                 </motion.div>
               ) : aiReport ? (
                 <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-[2rem] shadow-2xl">
                    <div className="flex items-center gap-3 mb-6"><BrainCircuit className="text-emerald-400" /> <h2 className="text-lg font-black text-white uppercase italic">AI Coach</h2></div>
                    <div className={`${aiReport.ratingBg} p-6 rounded-2xl text-center mb-6`}><div className={`text-5xl font-black ${aiReport.ratingColor}`}>{aiReport.score}%</div></div>
                    <ul className="space-y-2">{aiReport.strengths.map((s:string, i:number)=>(<li key={i} className="text-xs text-zinc-300 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> {s}</li>))}</ul>
                    <button onClick={()=>setAiReport(null)} className="w-full mt-8 py-3 bg-zinc-800 rounded-xl text-white uppercase text-[10px] font-black">Clear</button>
                 </motion.div>
               ) : (
                 <motion.div key="empty" className="rounded-[2rem] border border-dashed border-zinc-800 bg-[#111113]/50 p-12 text-center min-h-[300px] flex flex-col justify-center">
                    <Ghost size={40} className="mx-auto mb-4 text-zinc-800" />
                    <p className="text-zinc-600 uppercase font-black text-[10px] tracking-widest">Awaiting Input</p>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </section>

      {/* 🏟️ الماتشات والنتائج (التي كانت ممسوحة) */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mt-8">
         <h2 className="text-xl md:text-2xl font-black text-white uppercase italic mb-10 flex items-center gap-3"><CalendarDays className="text-indigo-400" /> Upcoming Fixtures</h2>
         {fixturesLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {upcomingGameweeks.map(gw => (
                 <div key={gw.gw} className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6">
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Gameweek {gw.gw}</p>
                   <div className="space-y-3">
                     {gw.matches.map((m:any) => (
                       <div key={m.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-zinc-800/50">
                          <span className="text-[10px] font-black text-white uppercase w-10 truncate">{m.homeTeam.tla}</span>
                          <span className="text-[8px] font-black text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">VS</span>
                          <span className="text-[10px] font-black text-white uppercase w-10 text-right truncate">{m.awayTeam.tla}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
            </div>
         )}
      </section>
    </div>
  );
}