import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import { Search, Scale, Zap, Info, X, Loader2, Star, Ghost, Clock, BarChart3, Trash2, Crown, Share2, Plus, BrainCircuit, CheckCircle2, AlertTriangle, CalendarDays, Timer, Flame, Target, Medal, Wand2, TrendingUp, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SquadBuilder from '../components/SquadBuilder';

// 🚨 الخريطة الرقمية النهائية لتصحيح المراكز بناءً على الـ ID (أدق طريقة برمجية)
const getPlayerPosition = (p: any) => {
  if (!p) return 'UNKNOWN';
  const pId = Number(p.id);
  const name = String(p.name || '').toLowerCase();

  // جدول التصحيح بالـ ID (عشان نضمن كريس مدافع وتياجو مهاجم)
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

  // لو لاعب جديد مش في الجدول، نطبق منطق الفانتازي العام
  const pos = String(p.position || p.section || '').toLowerCase();
  if (pos.includes('goal') || pos === 'gk') return 'GK';
  if (pos.includes('defen') || pos.includes('back') || pos === 'df' || pos === 'cb') return 'DEF';
  if (pos.includes('midfield') || pos.includes('wing') || pos === 'mf') return 'MID';
  if (pos.includes('offen') || pos.includes('forward') || pos.includes('strik') || pos === 'fw') return 'FWD';
  
  return 'MID'; 
};

// 💰 محرك الأسعار بناءً على إحصائيات الـ API الحقيقية
const getRealisticFPLData = (name: string, pos: string, goals: number, assists: number, id: number) => {
  const n = (name || '').toLowerCase().trim();
  const exactPrices: Record<string, string> = {
    'erling haaland': '15.0', 'mohamed salah': '12.5', 'cole palmer': '10.5', 'bukayo saka': '10.0', 
    'phil foden': '9.5', 'ollie watkins': '9.0', 'rodri': '6.5'
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

  // 🧹 V10 Memory - فرمتة كاملة للبيانات القديمة المغلـوطة
  const [squad, setSquad] = useState<any[]>(() => {
    const saved = localStorage.getItem('kt_squad_v10'); 
    return saved ? JSON.parse(saved) : defaultSquadStructure;
  });

  const [leaguePlayers, setLeaguePlayers] = useState<any[]>(() => { 
    try { const saved = localStorage.getItem('kt_players_db_v10'); return saved ? JSON.parse(saved) : []; } catch { return []; } 
  });

  const { data: teamsData } = useSWR(endpoints.getTeams('PL'), fetchFootballData);
  const { data: plScorers } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData);

  useEffect(() => {
    localStorage.setItem('kt_squad_v10', JSON.stringify(squad));
    localStorage.setItem('kt_players_db_v10', JSON.stringify(leaguePlayers));
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
        await new Promise(r => setTimeout(r, 6000)); // احترام الـ API Rate Limit
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
      alert(`عذراً، لا يوجد مكان شاغر في مركز ${pos}`);
    }
  };

  const removeFromSquad = (index: number) => {
    const newSquad = [...squad];
    newSquad[index].player = null;
    setSquad(newSquad);
  };

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4">
      {/* البحث والمزامنة الحية */}
      <section className="relative z-40 max-w-2xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-2">
           <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">PL Database Engine</h2>
           {isSyncing && <div className="text-[9px] text-indigo-400 animate-pulse font-bold">Syncing Teams: {syncedTeams}/20</div>}
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search Player Pool..." 
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-16 bg-[#111113] border border-zinc-800 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500 transition-all"
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
        </div>
        
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute w-full mt-2 bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-80 overflow-y-auto">
              {searchResults.map(p => (
                <div key={p.id} onClick={() => {addToSquad(p); setSearchResults([]);}} className="p-4 hover:bg-zinc-800 cursor-pointer flex justify-between items-center border-b border-zinc-800/50 last:border-0 group">
                  <div className="flex items-center gap-3">
                    <img src={p.team?.crest} className="h-6 w-6 object-contain" />
                    <span className="text-white font-bold text-sm">{p.name} <span className="text-indigo-500 text-[10px] ml-2 uppercase font-black">{p.position}</span></span>
                  </div>
                  <Plus size={18} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* التخطيط الاحترافي: الملعب بجانب المساعد الذكي */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 bg-[#111113]/50 p-6 rounded-[2.5rem] border border-zinc-800/50 shadow-inner">
          <SquadBuilder 
            squad={squad} 
            onRemovePlayer={removeFromSquad} 
            onSlotClick={(i) => {}} 
            onSelectPlayer={setActivePlayer}
          />
        </div>

        <div className="lg:col-span-4 sticky top-10">
           <div className="bg-[#111113] border border-zinc-800 rounded-[2.5rem] p-8 min-h-[450px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />
              
              <AnimatePresence mode="wait">
                {activePlayer ? (
                  <motion.div key="active" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full text-center">
                     <img src={activePlayer.team?.crest} className="h-24 mx-auto mb-6 drop-shadow-2xl" />
                     <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{activePlayer.name}</h2>
                     <p className="text-indigo-400 font-black tracking-[0.2em] text-[10px] mb-8 uppercase">{activePlayer.position} - {activePlayer.team?.name}</p>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-5 rounded-[1.5rem] border border-zinc-800/50">
                          <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Price</p>
                          <p className="text-2xl text-white font-black">£{activePlayer.price}m</p>
                        </div>
                        <div className="bg-black/40 p-5 rounded-[1.5rem] border border-zinc-800/50">
                          <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">FPL Points</p>
                          <p className="text-2xl text-white font-black">{activePlayer.points}</p>
                        </div>
                     </div>

                     <button onClick={() => addToSquad(activePlayer)} className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase text-xs transition-all shadow-lg shadow-emerald-900/20">Add to Squad</button>
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="text-center">
                     <Ghost size={60} className="mx-auto mb-6 text-zinc-800" />
                     <h3 className="text-zinc-700 font-black uppercase italic tracking-widest text-sm">Intelligence Hub</h3>
                     <p className="text-[10px] text-zinc-600 uppercase mt-2 tracking-widest leading-relaxed">Search or select a player<br/>to view live FPL analytics.</p>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </section>
    </div>
  );
}