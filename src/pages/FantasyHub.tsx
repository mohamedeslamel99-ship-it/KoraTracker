import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetchFootballData, endpoints } from '../lib/api';
import { Search, Scale, Zap, Info, X, Loader2, Star, Ghost, Clock, BarChart3, Trash2, Crown, Share2, Plus, BrainCircuit, CheckCircle2, AlertTriangle, CalendarDays, Timer, Flame, Target, Medal, Wand2, TrendingUp, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SquadBuilder from '../components/SquadBuilder';

// 🚨 خوارزمية الفانتازي الرسمية (FPL Strict Override)
const getPlayerPosition = (p: any) => {
  if (!p) return 'UNKNOWN';
  const name = String(p.name || '').toLowerCase();

  // 1. إجبار الأجنحة وصناع اللعب إنهم يكونوا خط وسط (MID) زي الفانتازي بالظبط
  const forceMidfielders = ['salah', 'son heung-min', 'son', 'saka', 'palmer', 'foden', 'gordon', 'bowen', 'mbeumo', 'diogo jota', 'luis díaz', 'diaz', 'sterling', 'rashford', 'garnacho', 'bruno fernandes', 'ødegaard', 'eze', 'gross', 'mcginn', 'douglas luiz'];
  if (forceMidfielders.some(m => name.includes(m))) return 'MID';

  // 2. إجبار المهاجمين الصرحاء (FWD)
  const forceForwards = ['haaland', 'watkins', 'isak', 'solanke', 'nunez', 'darwin', 'hojlund', 'havertz', 'toney', 'mateta', 'carlton morris', 'awoniyi', 'joao pedro'];
  if (forceForwards.some(f => name.includes(f))) return 'FWD';

  // 3. لو مش من المشاهير دول، نعتمد على قراءة الـ API مع تصحيحها
  const pos = String(p.position || p.section || '').toLowerCase();
  if (pos === 'gk' || pos.includes('goal')) return 'GK';
  if (pos === 'def' || pos === 'df' || pos.includes('defen') || pos.includes('back') || pos.includes('cb') || pos.includes('lb') || pos.includes('rb')) return 'DEF';
  if (pos === 'mid' || pos === 'mf' || pos.includes('midfield') || pos.includes('wing') || pos.includes('cm') || pos.includes('dm') || pos.includes('am')) return 'MID';
  if (pos === 'fwd' || pos === 'fw' || pos.includes('forward') || pos.includes('offen') || pos.includes('attack') || pos.includes('strik') || pos.includes('st')) return 'FWD';
  
  return 'MID'; // الافتراضي لو فشل كل حاجة
};

// 💰 محرك أسعار ونقاط الفانتازي الواقعي
const getRealisticFPLData = (name: string, pos: string, goals: number, assists: number, id: number) => {
  const n = (name || '').toLowerCase();
  const exactPrices: Record<string, string> = {
    'haaland': '15.0', 'salah': '12.5', 'palmer': '10.5', 'saka': '10.0', 'son heung-min': '10.0',
    'foden': '9.5', 'de bruyne': '10.5', 'watkins': '9.0', 'isak': '8.5', 'gordon': '7.5',
    'bowen': '7.5', 'solanke': '7.5', 'ødegaard': '8.5', 'bruno fernandes': '8.5', 'luis díaz': '7.5',
    'jota': '7.5', 'mbeumo': '7.0', 'eze': '7.0', 'havertz': '8.0', 'gabriel magalhães': '6.0',
    'van dijk': '6.0', 'alexander-arnold': '7.0', 'saliba': '6.0', 'porro': '5.5', 'trippier': '6.0',
    'ederson': '5.5', 'alisson': '5.5', 'raya': '5.5', 'donnarumma': '5.5', 'pickford': '5.0'
  };

  let price = '5.0';
  let foundExact = Object.keys(exactPrices).find(k => n.includes(k));
  
  if (foundExact) { 
    price = exactPrices[foundExact]; 
  } else {
    let base = pos === 'FWD' ? 5.5 : pos === 'MID' ? 5.0 : pos === 'DEF' ? 4.5 : 4.0;
    let bonus = (goals * 0.2) + (assists * 0.1);
    price = Math.min(base + bonus, 9.5).toFixed(1);
  }

  let pointsMultiplier = pos === 'DEF' || pos === 'GK' ? 6 : pos === 'MID' ? 5 : 4;
  let points = (goals * pointsMultiplier) + (assists * 3) + ((id % 20) * 2);
  if (goals === 0 && assists === 0) points = (id % 40) + 10;

  return { price, points };
};

// 🛡️ قاعدة بيانات الدوري الإنجليزي الاحتياطية بالمراكز الصحيحة
const fallbackDb = [
  { id: 3754, name: 'Mohamed Salah', position: 'Midfield', goals: 20, assists: 10, team: { id: 64, name: 'Liverpool FC', shortName: 'LIV', crest: 'https://crests.football-data.org/64.png' } },
  { id: 3823, name: 'Erling Haaland', position: 'Offence', goals: 25, assists: 5, team: { id: 65, name: 'Manchester City', shortName: 'MCI', crest: 'https://crests.football-data.org/65.png' } },
  { id: 8004, name: 'Bukayo Saka', position: 'Midfield', goals: 16, assists: 10, team: { id: 57, name: 'Arsenal FC', shortName: 'ARS', crest: 'https://crests.football-data.org/57.png' } },
  { id: 8011, name: 'Cole Palmer', position: 'Midfield', goals: 22, assists: 11, team: { id: 61, name: 'Chelsea FC', shortName: 'CHE', crest: 'https://crests.football-data.org/61.png' } },
  { id: 3794, name: 'Son Heung-min', position: 'Midfield', goals: 17, assists: 9, team: { id: 73, name: 'Tottenham', shortName: 'TOT', crest: 'https://crests.football-data.org/73.png' } },
  { id: 3811, name: 'Ollie Watkins', position: 'Offence', goals: 19, assists: 13, team: { id: 58, name: 'Aston Villa', shortName: 'AVL', crest: 'https://crests.football-data.org/58.png' } },
  { id: 3824, name: 'Kevin De Bruyne', position: 'Midfield', goals: 4, assists: 10, team: { id: 65, name: 'Manchester City', shortName: 'MCI', crest: 'https://crests.football-data.org/65.png' } },
  { id: 3825, name: 'Phil Foden', position: 'Midfield', goals: 18, assists: 8, team: { id: 65, name: 'Manchester City', shortName: 'MCI', crest: 'https://crests.football-data.org/65.png' } },
  { id: 8005, name: 'Martin Ødegaard', position: 'Midfield', goals: 8, assists: 10, team: { id: 57, name: 'Arsenal FC', shortName: 'ARS', crest: 'https://crests.football-data.org/57.png' } },
  { id: 3755, name: 'Virgil van Dijk', position: 'Defence', goals: 2, assists: 2, team: { id: 64, name: 'Liverpool FC', shortName: 'LIV', crest: 'https://crests.football-data.org/64.png' } },
  { id: 3756, name: 'Trent Alexander-Arnold', position: 'Defence', goals: 3, assists: 4, team: { id: 64, name: 'Liverpool FC', shortName: 'LIV', crest: 'https://crests.football-data.org/64.png' } },
  { id: 8006, name: 'William Saliba', position: 'Defence', goals: 2, assists: 1, team: { id: 57, name: 'Arsenal FC', shortName: 'ARS', crest: 'https://crests.football-data.org/57.png' } },
  { id: 8007, name: 'Gabriel Magalhães', position: 'Defence', goals: 4, assists: 0, team: { id: 57, name: 'Arsenal FC', shortName: 'ARS', crest: 'https://crests.football-data.org/57.png' } },
  { id: 3826, name: 'Ederson', position: 'Goalkeeper', goals: 0, assists: 0, team: { id: 65, name: 'Manchester City', shortName: 'MCI', crest: 'https://crests.football-data.org/65.png' } },
  { id: 3757, name: 'Alisson', position: 'Goalkeeper', goals: 0, assists: 0, team: { id: 64, name: 'Liverpool FC', shortName: 'LIV', crest: 'https://crests.football-data.org/64.png' } },
  { id: 8008, name: 'David Raya', position: 'Goalkeeper', goals: 0, assists: 0, team: { id: 57, name: 'Arsenal FC', shortName: 'ARS', crest: 'https://crests.football-data.org/57.png' } },
  { id: 9001, name: 'Alexander Isak', position: 'Offence', goals: 21, assists: 2, team: { id: 67, name: 'Newcastle', shortName: 'NEW', crest: 'https://crests.football-data.org/67.png' } },
  { id: 9002, name: 'Anthony Gordon', position: 'Midfield', goals: 11, assists: 10, team: { id: 67, name: 'Newcastle', shortName: 'NEW', crest: 'https://crests.football-data.org/67.png' } },
  { id: 9003, name: 'Jarrod Bowen', position: 'Midfield', goals: 16, assists: 6, team: { id: 73, name: 'West Ham', shortName: 'WHU', crest: 'https://crests.football-data.org/563.png' } },
  { id: 9004, name: 'Dominic Solanke', position: 'Offence', goals: 19, assists: 3, team: { id: 1044, name: 'Bournemouth', shortName: 'BOU', crest: 'https://crests.football-data.org/1044.png' } }
];

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
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastReport, setRoastReport] = useState<string[] | null>(null);
  
  const [predictedPlayer, setPredictedPlayer] = useState<any>(null);
  const [showPredictorModal, setShowPredictorModal] = useState(false);
  const [swapSourceIndex, setSwapSourceIndex] = useState<number | null>(null);

  const [squad, setSquad] = useState<any[]>(() => {
    const saved = localStorage.getItem('kt_squad_v4'); 
    return saved ? JSON.parse(saved) : defaultSquadStructure;
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
    return squad.reduce((sum, s) => sum + (s.player ? parseFloat(s.player.price || 0) : 0), 0).toFixed(1);
  }, [squad]);

  useEffect(() => {
    localStorage.setItem('kt_squad_v4', JSON.stringify(squad));
    localStorage.setItem('kt_captain', JSON.stringify(captainId));
    localStorage.setItem('kt_vice_captain', JSON.stringify(viceCaptainId));
  }, [squad, captainId, viceCaptainId]);

  const { data: teamsData } = useSWR(endpoints.getTeams('PL'), fetchFootballData, { revalidateOnFocus: false });
  const teams = teamsData?.teams || [];
  const { data: plScorers } = useSWR(endpoints.getTopScorers('PL'), fetchFootballData, { revalidateOnFocus: false });
  const { data: fixturesData, isLoading: fixturesLoading } = useSWR('competitions/PL/matches', fetchFootballData, { revalidateOnFocus: false });

  const [leaguePlayers, setLeaguePlayers] = useState<any[]>(() => { 
    try { const saved = localStorage.getItem('kt_players_db'); return saved ? JSON.parse(saved) : []; } catch { return []; } 
  });
  const [syncedTeams, setSyncedTeams] = useState<number>(() => { 
    try { const saved = localStorage.getItem('kt_sync_progress'); return saved ? parseInt(saved, 10) : 0; } catch { return 0; } 
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (leaguePlayers.length > 0) {
      localStorage.setItem('kt_players_db', JSON.stringify(leaguePlayers));
    }
  }, [leaguePlayers]);

  // 🛡️ التحديث الجذري: منع الاستنساخ وتوحيد البيانات + فلتر الدوري الإنجليزي فقط
  const allPlayers = useMemo(() => {
    try {
      const uniqueMap = new Map();
      const seenNames = new Set(); // عشان لو الـ API جاب نفس الاسم بـ ID مختلف نمنعه

      const addPlayerToMap = (p: any, form: string, overrideGoals?: number, overrideAssists?: number) => {
        if (!p || !p.id || !p.name) return;
        
        // 🚨 حماية: نضمن إن اللاعب في الدوري الإنجليزي فقط (نظام الفانتازي)
        const leagueId = p.league || p.competition?.code;
        // لو الـ API جاب لاعب من دوري تاني متسجلوش
        if (leagueId && leagueId !== 'PL') return;

        const pId = Number(p.id); // تحويل أي ID لرقم عشان الـ String ميبوظش الماب
        const normalizedName = p.name.trim().toLowerCase();

        if (seenNames.has(normalizedName)) return; // فلتر الأسماء المكررة (عشان هالاند ميكررش)
        seenNames.add(normalizedName);

        const pos = getPlayerPosition(p); // الخوارزمية الصارمة بتحدد المركز
        const goals = overrideGoals ?? (p.goals || 0);
        const assists = overrideAssists ?? (p.assists || 0);
        const { price, points } = getRealisticFPLData(p.name, pos, goals, assists, pId);

        uniqueMap.set(pId, {
          ...p,
          id: pId,
          league: 'PL',
          goals,
          assists,
          price,
          form,
          points,
          position: pos // (MID, FWD, DEF, GK)
        });
      };

      fallbackDb.forEach(p => addPlayerToMap(p, '8.0'));
      leaguePlayers.forEach(p => addPlayerToMap(p, ((p.id % 50) / 10).toFixed(1)));
      (plScorers?.scorers || []).forEach((s: any) => {
        if (s.player) {
          addPlayerToMap({ ...s.player, team: s.team || { name: 'Unknown' }, league: 'PL' }, ((s.player.id % 50) / 10).toFixed(1), s.goals, s.assists);
        }
      });

      return Array.from(uniqueMap.values());
    } catch (err) { return []; }
  }, [plScorers, leaguePlayers]);

  const globalProspects = useMemo(() => {
    const prospects: any[] = [];
    const seenTeams = new Set();
    const plPlayers = allPlayers;
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
    if (!term) { setSearchResults([]); return; }
    // فلتر وقت البحث برضه لضمان إن اللعيبة دي PL بس
    const results = allPlayers.filter(p => p.league === 'PL' && (p.name?.toLowerCase().includes(term.toLowerCase()) || p.team?.name?.toLowerCase().includes(term.toLowerCase()))).slice(0, 30);
    setSearchResults(results);
  };

  useEffect(() => {
    const isRecentlySynced = localStorage.getItem('kt_last_sync') && (Date.now() - parseInt(localStorage.getItem('kt_last_sync')!, 10)) < 12 * 60 * 60 * 1000;
    if (teams.length > 0 && !isSyncing && (leaguePlayers.length === 0 || !isRecentlySynced)) {
      const syncLeague = async () => {
        setIsSyncing(true);
        if (syncedTeams === 0) await new Promise(r => setTimeout(r, 2000));
        let i = syncedTeams;
        while (i < teams.length) {
          const team = teams[i];
          try {
            const data = await fetchFootballData(endpoints.getTeam(team.id.toString()));
            if (data?.squad) {
              const teamSquad = data.squad.map((p: any) => ({ ...p, league: 'PL', team: { id: team.id, name: team.name, crest: team.crest, shortName: team.shortName }, goals: 0, price: '5.0', form: '0.0', points: 0, position: getPlayerPosition(p) }));
              setLeaguePlayers(prev => { const unique = new Map(); [...prev, ...teamSquad].forEach(item => unique.set(item.id, item)); return Array.from(unique.values()); });
              setSyncedTeams(i + 1); i++; 
              localStorage.setItem('kt_sync_progress', (i).toString());
            }
            await new Promise(r => setTimeout(r, 6000));
          } catch (err: any) { 
            i++; 
            await new Promise(r => setTimeout(r, 3000)); 
          }
        }
        setIsSyncing(false);
        localStorage.setItem('kt_last_sync', Date.now().toString());
      };
      syncLeague();
    }
  }, [teams]);

  useEffect(() => {
    const timer = setTimeout(() => { handleSearch(search); }, 300);
    return () => clearTimeout(timer);
  }, [search, allPlayers]);

  const forceManualSync = () => {
    localStorage.removeItem('kt_last_sync');
    localStorage.removeItem('kt_sync_progress');
    setSyncedTeams(0);
    setIsSyncing(false);
    setLeaguePlayers([]);
    window.location.reload();
  };

  const addToComparison = (player: any) => { 
    if (selectedPlayers.find(p => p.id === player.id)) return; 
    if (selectedPlayers.length >= 2) { setSelectedPlayers([selectedPlayers[1], player]); } 
    else { setSelectedPlayers([...selectedPlayers, player]); } 
  };
  const removePlayerFromComparison = (id: number) => { 
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== id)); 
    if (selectedPlayers.length <= 1) setIsComparisonOpen(false); 
  };
  const clearComparison = () => { setSelectedPlayers([]); setIsComparisonOpen(false); };
  const handleShare = () => {
    if (selectedPlayers.length !== 2) return;
    const [p1, p2] = selectedPlayers;
    const text = `📊 KoraTracker Audit:\n\n${p1.name} VS ${p2.name}\n\nGoals: ${p1.goals || 0} - ${p2.goals || 0}\nPoints: ${p1.points || 0} - ${p2.points || 0}`;
    navigator.clipboard.writeText(text); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000);
  };

  const addToSquad = (player: any) => {
    if (player.league && player.league !== 'PL') { alert(`❌ مسموح بوضع لاعبي الدوري الإنجليزي فقط.`); return; }
    if (squad.some(s => s.player?.id === player.id)) { alert("اللاعب موجود بالفعل في تشكيلتك!"); return; }
    const teamCount = squad.filter(s => s.player?.team?.id === player.team?.id).length;
    if (teamCount >= 3) { alert("عذراً، أقصى حد 3 لاعبين من نفس الفريق!"); return; }

    const pos = player.position; 
    const emptySlotIndex = squad.findIndex(s => s.player === null && s.role === pos);

    if (emptySlotIndex !== -1) {
      const newSquad = [...squad];
      newSquad[emptySlotIndex] = { ...newSquad[emptySlotIndex], player: player };
      setSquad(newSquad);
      if (!captainId) setCaptainId(player.id);
    } else {
      alert(`لا يوجد مكان فارغ في مركز ${pos}. احذف لاعب من نفس المركز أولاً.`);
    }
  };

  const removeFromSquad = (index: number, playerId: number) => {
    const newSquad = [...squad];
    newSquad[index] = { ...newSquad[index], player: null };
    setSquad(newSquad);
    if (captainId === playerId) setCaptainId(null);
    if (viceCaptainId === playerId) setViceCaptainId(null);
    if (swapSourceIndex === index) setSwapSourceIndex(null);
  };

  const handleSlotClick = (index: number) => {
    if (swapSourceIndex === null) {
      if (squad[index].player) setSwapSourceIndex(index);
    } else {
      if (swapSourceIndex === index) {
        setSwapSourceIndex(null); return;
      }
      const p1 = squad[swapSourceIndex];
      const p2 = squad[index];

      if (p1.role === 'GK' || p2.role === 'GK') {
        if (p1.role !== 'GK' || p2.role !== 'GK') {
          alert("لا يمكن تبديل حارس المرمى إلا بحارس مرمى آخر!");
          setSwapSourceIndex(null); return;
        }
      }

      const newSquad = [...squad];
      const tempRole = newSquad[swapSourceIndex].role;
      const tempPlayer = newSquad[swapSourceIndex].player;

      newSquad[swapSourceIndex] = { ...newSquad[swapSourceIndex], role: newSquad[index].role, player: newSquad[index].player };
      newSquad[index] = { ...newSquad[index], role: tempRole, player: tempPlayer };

      const pitchRoles = newSquad.filter(s => !s.isBench).map(s => s.role);
      const dCount = pitchRoles.filter(r => r === 'DEF').length;
      const mCount = pitchRoles.filter(r => r === 'MID').length;
      const fCount = pitchRoles.filter(r => r === 'FWD').length;

      if (dCount < 3 || mCount < 2 || fCount < 1 || dCount > 5 || mCount > 5 || fCount > 3) {
        alert("خطة غير صالحة! يجب أن يكون هناك: 3-5 مدافعين، 2-5 وسط، 1-3 هجوم.");
        setSwapSourceIndex(null); return;
      }

      setSquad(newSquad);
      setSwapSourceIndex(null);
    }
  };

  const generateAIReport = () => {
    const active = squad.filter(s => !s.isBench && s.player).map(s => s.player);
    const bench = squad.filter(s => s.isBench && s.player).map(s => s.player);

    if (active.length < 11) { alert("⚠️ اختار 11 لاعب أساسي الأول عشان أقدر أحلل التشكيلة صح!"); return; }
    
    setAiReport(null);
    setRoastReport(null);
    setActivePlayer(null);
    setIsGeneratingAI(true);

    setTimeout(() => {
      const totalGoals = active.reduce((sum, p) => sum + (p.goals || 0), 0);
      const totalPoints = active.reduce((sum, p) => sum + (p.points || 0), 0);
      const totalCost = active.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0) + bench.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0);
      const defPoints = active.filter(p => p.position === 'DEF' || p.position === 'GK').reduce((sum, p) => sum + (p.points || 0), 0);
      const attPoints = active.filter(p => p.position === 'FWD' || p.position === 'MID').reduce((sum, p) => sum + (p.points || 0), 0);

      const bestPlayer = [...active].sort((a, b) => (b.points || 0) - (a.points || 0))[0];
      const bestFwd = active.filter(p => p.position === 'FWD').sort((a,b) => (b.goals || 0) - (a.goals || 0))[0];
      const captainPlayer = active.find(p => p.id === captainId);
      const isCaptainBest = captainId === bestPlayer?.id;

      let baseScore = (totalPoints / 950) * 100;
      if (totalCost > 100) baseScore -= (totalCost - 100) * 2;
      if (isCaptainBest) baseScore += 5;

      let finalScore = Math.floor(Math.max(30, Math.min(99, baseScore)));
      finalScore += Math.floor(Math.random() * 5) - 2;
      finalScore = Math.max(30, Math.min(99, finalScore));

      const strengths = [];
      const weaknesses = [];

      if (totalGoals > 50) {
        strengths.push(bestFwd ? `خط هجوم ضارب بقيادة الهداف ${bestFwd.name.split(' ').pop()}.` : `معدل تهديفي ممتاز للتشكيلة (${totalGoals} هدف).`);
      } else {
        weaknesses.push(`عقم تهديفي: التشكيلة الأساسية مسجلة ${totalGoals} هدف بس!`);
      }

      if (defPoints > attPoints * 0.6) {
        strengths.push(`دفاعك صلب وبيجمع نقط ممتازة جداً.`);
      } else if (defPoints < 150) {
        weaknesses.push(`خط الدفاع شوارع وبيخسر نقط كتير.`);
      }

      if (totalCost > 100.5) {
        weaknesses.push(`ميزانيتك تخطت الـ 100 مليون (£${totalCost.toFixed(1)}m)! غير قانوني.`);
      } else if (totalCost < 90) {
        weaknesses.push(`سايب فلوس كتير في البنك (£${(100 - totalCost).toFixed(1)}m).`);
      } else {
        strengths.push(`إدارة الميزانية ممتازة جداً ومحسوبة بالمللي.`);
      }

      if (captainPlayer) {
        if (isCaptainBest) {
          strengths.push(`اختيار الكابتن (${captainPlayer.name.split(' ').pop()}) مثالي.`);
        } else {
          weaknesses.push(`الكابتن غلط.. الأفضل تكبتن ${bestPlayer?.name.split(' ').pop()}.`);
        }
      }

      if (bench.length < 4) {
        weaknesses.push(`الدكة مش كاملة، لو حد اتصاب مش هتلاقي بديل.`);
      }

      strengths.sort(() => 0.5 - Math.random());
      weaknesses.sort(() => 0.5 - Math.random());

      let ratingColor = "text-emerald-400";
      let ratingBg = "bg-emerald-500/10 border-emerald-500/30";

      if (finalScore < 50) {
        ratingColor = "text-red-500";
        ratingBg = "bg-red-500/10 border-red-500/30";
      } else if (finalScore < 75) {
        ratingColor = "text-yellow-400";
        ratingBg = "bg-yellow-500/10 border-yellow-500/30";
      }

      setAiReport({ score: finalScore, strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 2), ratingColor, ratingBg });
      setIsGeneratingAI(false);
    }, 1500);
  };

  const generateRoastReport = () => {
    const active = squad.filter(s => !s.isBench && s.player);
    if (active.length < 1) { alert("حط لعيبة الأول عشان أعرف أقصف جبهتك! 😂"); return; }
    
    setAiReport(null);
    setRoastReport(null);
    setActivePlayer(null);
    setIsRoasting(true);

    const roasts = [
      "تشكيلة عظيمة.. لو بتلعب في دوري المظاليم! 😂",
      "إنت متأكد إن دي تشكيلة كورة مش فريق كبادي؟ 🤡",
      "الذكاء الاصطناعي بيعيط من ساعة ما شاف اختياراتك.. حرام عليك! 😭",
      "لو جوارديولا شاف التشكيلة دي هيسيب التدريب ويفتح محل كشري 🤦‍♂️",
      "خط النص عندك أبطأ من سلحفاة حامل.. إيه ده! 🐌",
      "دي تشكيلة تجيب نقط بالماينس مش بالموجب.. امسح الأكونت أحسن! 💀",
      "أنا لو مكان اللعيبة دي هعتزل قبل ما الجولة تبدأ 🚑",
      "دفاعك ده شوارع.. أي حد معدي هيسجل فيك! 🚦",
      "تشكيلة ممتازة جداً.. ناقصها بس 11 لاعب بيفهموا كورة وتظبط 🤡",
      "إنت حاطط الكابتن ده بناءً على رؤية فنية ولا ضربت الودع؟ 🔮",
      "اللعيبة دي آخرها تلعب حجز خماسي يوم الخميس، مش فانتازي! ⚽",
      "تشكيلة تبكي الحجر.. ربنا يعينك على نفسك! 💔"
    ];

    setTimeout(() => {
      const r1 = roasts[Math.floor(Math.random() * roasts.length)];
      let r2 = roasts[Math.floor(Math.random() * roasts.length)];
      while(r1 === r2) { r2 = roasts[Math.floor(Math.random() * roasts.length)]; }
      setRoastReport([r1, r2]);
      setIsRoasting(false);
    }, 1500);
  };

  // 🤖 التحديث الجذري: خوارزمية ذكية لاختيار الفريق (تحترم الميزانية وتمنع التكرار تماماً)
  const handleAutoPick = () => {
    const pool = allPlayers.filter(p => p.league === 'PL');
    if (pool.length < 40) {
      alert("⏳ جاري تحميل باقي اللاعبين من الـ API.. استنى ثواني!"); return;
    }

    const gks = pool.filter(p => p.position === 'GK').sort((a, b) => b.points - a.points);
    const defs = pool.filter(p => p.position === 'DEF').sort((a, b) => b.points - a.points);
    const mids = pool.filter(p => p.position === 'MID').sort((a, b) => b.points - a.points);
    const fwds = pool.filter(p => p.position === 'FWD').sort((a, b) => b.points - a.points);

    const teamCounts: any = {};
    const pickedIds = new Set();
    let totalSpent = 0;

    const pick = (list: any[], count: number) => {
      const picked = [];
      for (let p of list) {
        if (picked.length >= count) break;
        if (pickedIds.has(p.id)) continue; 
        if ((teamCounts[p.team?.id] || 0) >= 3) continue;

        const price = parseFloat(p.price);
        if (totalSpent > 85 && price > 6.0) continue;

        picked.push(p);
        pickedIds.add(p.id);
        teamCounts[p.team?.id] = (teamCounts[p.team?.id] || 0) + 1;
        totalSpent += price;
      }
      return picked;
    };

    // الترتيب مهم عشان يبدأ بالمهاجمين الغاليين الأول بعدين يكمل بالباقي
    const f = pick(fwds, 3);
    const m = pick(mids, 5);
    const d = pick(defs, 5);
    const g = pick(gks, 2);
    
    const newSquad = [
      { role: 'GK', isBench: false, player: g[0] || null },
      { role: 'DEF', isBench: false, player: d[0] || null },
      { role: 'DEF', isBench: false, player: d[1] || null },
      { role: 'DEF', isBench: false, player: d[2] || null },
      { role: 'DEF', isBench: false, player: d[3] || null },
      { role: 'MID', isBench: false, player: m[0] || null },
      { role: 'MID', isBench: false, player: m[1] || null },
      { role: 'MID', isBench: false, player: m[2] || null },
      { role: 'MID', isBench: false, player: m[3] || null },
      { role: 'FWD', isBench: false, player: f[0] || null },
      { role: 'FWD', isBench: false, player: f[1] || null },
      { role: 'GK', isBench: true, player: g[1] || null },
      { role: 'DEF', isBench: true, player: d[4] || null },
      { role: 'MID', isBench: true, player: m[4] || null },
      { role: 'FWD', isBench: true, player: f[2] || null },
    ];
    
    setSquad(newSquad); 
    
    const bestPlayer = [...newSquad].filter(s => s.player && !s.isBench).sort((a, b) => b.player.points - a.player.points)[0];
    if (bestPlayer) setCaptainId(bestPlayer.player.id);
  };

  const upcomingGameweeks = useMemo(() => {
    if (!fixturesData?.matches) return [];
    
    const grouped = fixturesData.matches.reduce((acc: any, m: any) => { 
      if (!m.matchday) return acc;
      if (!acc[m.matchday]) acc[m.matchday] = []; 
      acc[m.matchday].push(m); 
      return acc; 
    }, {});

    let currentMatchday = 1;
    const matchdays = Object.keys(grouped).map(Number).sort((a,b)=>a-b);
    for (const md of matchdays) {
      const matches = grouped[md];
      const hasPendingOrLive = matches.some((m:any) => ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED'].includes(m.status));
      if (hasPendingOrLive) {
        currentMatchday = md;
        break;
      }
    }

    return matchdays
      .filter(md => md >= currentMatchday)
      .slice(0, 3)
      .map(gw => ({ gw, matches: grouped[gw] }));
  }, [fixturesData]);

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 sm:px-6"> 
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
        
        <div className="relative group flex gap-2">
          <div className="relative w-full">
            <input type="text" placeholder="Search Player Pool..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-14 pl-14 pr-6 rounded-2xl border border-zinc-800 bg-[#111113]/80 backdrop-blur-xl text-white uppercase font-bold text-sm outline-none focus:border-indigo-500 transition-colors" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          </div>
          
          <button onClick={forceManualSync} className="h-14 px-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center shrink-0" title="Force Sync API">
            <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} />
          </button>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 top-16 left-0 w-full rounded-2xl border border-zinc-800 bg-[#18181b] overflow-hidden shadow-2xl max-h-80 overflow-y-auto custom-scrollbar">
                {searchResults.map((p) => (
                  <div key={p.id} onClick={() => { setActivePlayer(p); setAiReport(null); setRoastReport(null); setSearch(''); setSearchResults([]); }} className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer transition-colors border-b border-zinc-800/50 last:border-0 group">
                    <img src={p.team?.crest} className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                    <span className="flex-1 text-white font-black text-xs uppercase">{p.name} <span className="text-[9px] text-zinc-500 ml-2">{p.position} - £{p.price}m</span></span>
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

      {/* 🚀 الملعب والتحليل جنب بعض */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-0">
         
         {/* 🏟️ الجزء اليمين: الملعب التفاعلي */}
         <div className="lg:col-span-8 w-full flex flex-col items-center bg-[#111113]/50 rounded-[2.5rem] p-4 border border-zinc-800/50 shadow-2xl">
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
              onSelectPlayer={(p) => { setActivePlayer(p); setAiReport(null); setRoastReport(null); }} 
              onRoastSquad={generateRoastReport} 
              isRoasting={isRoasting} 
              onAutoPick={handleAutoPick} 
              swapSourceIndex={swapSourceIndex}
              onSlotClick={handleSlotClick} 
            />
         </div>

         {/* 🤖 الجزء الشمال: المساعد الذكي */}
         <div className="lg:col-span-4 w-full flex flex-col gap-6 sticky top-24">
            <AnimatePresence mode="wait">
               
               {(isGeneratingAI || isRoasting) ? (
                 <motion.div key="loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-12 text-center shadow-inner flex flex-col items-center justify-center min-h-[350px]">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest animate-pulse">Analyzing Squad Data...</p>
                 </motion.div>
               ) 
               
               : aiReport ? (
                 <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                    <button onClick={()=>setAiReport(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={18} /></button>
                    <div className="flex items-center gap-3 mb-6">
                      <BrainCircuit className="text-emerald-400" size={28} />
                      <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">AI Coach</h2>
                    </div>
                    <div className={`mb-6 p-6 rounded-2xl ${aiReport.ratingBg} border text-center`}>
                      <span className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em]">Squad Score</span>
                      <div className={`text-5xl font-black ${aiReport.ratingColor} mt-1`}>{aiReport.score}%</div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[9px] uppercase font-black text-zinc-500 mb-2 tracking-widest">Strengths</h4>
                        <ul className="space-y-2">{aiReport.strengths.map((s:string, i:number)=>(<li key={i} className="text-[11px] font-bold text-zinc-300 flex items-start gap-2 leading-tight"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0"/> {s}</li>))}</ul>
                      </div>
                      <div>
                        <h4 className="text-[9px] uppercase font-black text-zinc-500 mb-2 tracking-widest mt-4">Weaknesses</h4>
                        <ul className="space-y-2">{aiReport.weaknesses.map((s:string, i:number)=>(<li key={i} className="text-[11px] font-bold text-zinc-300 flex items-start gap-2 leading-tight"><AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0"/> {s}</li>))}</ul>
                      </div>
                    </div>
                 </motion.div>
               )

               : roastReport ? (
                 <motion.div key="roast" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-red-950/20 border border-red-500/30 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(220,38,38,0.1)] relative">
                    <button onClick={()=>setRoastReport(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={18} /></button>
                    <div className="flex items-center gap-3 mb-6">
                      <Flame className="text-red-500" size={28} />
                      <h2 className="text-lg font-black text-red-500 uppercase italic tracking-tighter">Squad Roast</h2>
                    </div>
                    <div className="space-y-4">
                      {roastReport.map((r,i)=>(<p key={i} className="text-red-200 font-bold text-sm leading-relaxed" dir="rtl">{r}</p>))}
                    </div>
                 </motion.div>
               )

               : activePlayer ? (
                 <motion.div key="player" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="rounded-[2rem] border border-indigo-500/30 bg-[#111113] p-8 shadow-2xl relative">
                    <button onClick={() => setActivePlayer(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={18} /></button>
                    <img src={activePlayer.team?.crest} className="h-16 w-16 object-contain mb-4" referrerPolicy="no-referrer" />
                    <h3 className="text-2xl font-black text-white uppercase italic truncate">{activePlayer.name}</h3>
                    <p className="text-[10px] text-indigo-400 font-bold tracking-widest mt-1 uppercase">{activePlayer.position} - £{activePlayer.price}m</p>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="bg-zinc-900 p-4 rounded-xl text-center"><p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Goals</p><p className="text-2xl font-black text-white">{activePlayer.goals || 0}</p></div>
                      <div className="bg-zinc-900 p-4 rounded-xl text-center"><p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Assists</p><p className="text-2xl font-black text-white">{activePlayer.assists || 0}</p></div>
                    </div>
                    <div className="flex flex-col gap-2 mt-6">
                       <button onClick={() => addToSquad(activePlayer)} className="w-full bg-emerald-600 h-12 rounded-xl text-white font-black uppercase text-[10px] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"><Plus size={14}/> Add to Squad</button>
                       <button onClick={() => addToComparison(activePlayer)} className="w-full bg-zinc-800 h-12 rounded-xl text-white font-black uppercase text-[10px] hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"><Scale size={14}/> Compare</button>
                    </div>
                 </motion.div>
               )

               : (
                 <motion.div key="empty" className="rounded-[2rem] border border-dashed border-zinc-800 bg-[#111113]/50 p-12 text-center shadow-inner flex flex-col items-center justify-center min-h-[350px]">
                    <Ghost className="text-zinc-800 mb-4" size={40} />
                    <h2 className="text-sm font-black text-zinc-700 uppercase italic tracking-widest">Awaiting Input</h2>
                    <p className="text-[9px] text-zinc-500 uppercase mt-2 tracking-widest font-black leading-relaxed">Search a player or generate<br/>AI report to view details here.</p>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </section>

      {/* باقي الصفحة */}
      <section className="bg-gradient-to-br from-indigo-900/40 to-[#09090b] rounded-[2.5rem] p-8 md:p-12 border border-indigo-500/30 text-center shadow-2xl mt-8">
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

      <section className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mt-8">
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
                     {gw.matches.map((m:any) => {
                       const isFinished = m.status === 'FINISHED';
                       const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
                       const homeScore = m.score?.fullTime?.home ?? '-';
                       const awayScore = m.score?.fullTime?.away ?? '-';

                       return (
                         <div key={m.id} className="flex justify-between items-center bg-[#09090b] p-3 rounded-xl border border-zinc-800 hover:bg-zinc-800/50 transition-all cursor-default">
                             <span className="text-[10px] font-black text-white uppercase w-12 text-left truncate" title={m.homeTeam.name}>{m.homeTeam.tla || m.homeTeam.shortName?.substring(0,3)}</span>
                             
                             {isFinished || isLive ? (
                               <div className="flex flex-col items-center justify-center mx-2 shrink-0">
                                  {isLive && <span className="text-[7px] text-red-500 font-black animate-pulse mb-0.5">LIVE</span>}
                                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded border", isLive ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30")}>
                                    {homeScore} - {awayScore}
                                  </span>
                               </div>
                             ) : (
                               <span className="text-[8px] font-black text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 shrink-0 mx-2">VS</span>
                             )}

                             <span className="text-[10px] font-black text-white uppercase w-12 text-right truncate" title={m.awayTeam.name}>{m.awayTeam.tla || m.awayTeam.shortName?.substring(0,3)}</span>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               ))}
            </div>
         )}
      </section>

      <section className="bg-[#111113] border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mt-8">
         <div className="absolute bottom-0 left-0 p-8 opacity-5 text-white pointer-events-none"><Star size={120} /></div>
         <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-2 relative z-10"><div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" /> Global Prospects</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {globalProspects.map(p => (
              <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl hover:border-emerald-500/50 transition-all cursor-pointer group hover:-translate-y-1 shadow-lg">
                 <div className="flex items-center gap-2 mb-4"><img src={p.team?.crest} className="h-4 w-4 object-contain opacity-50 group-hover:opacity-100 transition-opacity" /><span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{p.team?.shortName}</span></div>
                 <p onClick={()=>{setActivePlayer(p); setAiReport(null); setRoastReport(null);}} className="text-xs md:text-sm font-black text-white uppercase italic truncate mb-1 group-hover:text-emerald-400 transition-colors">{p.name}</p>
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
                    <button onClick={() => removePlayerFromComparison(p.id)} className="text-zinc-600 hover:text-red-500"><X size={12} /></button>
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