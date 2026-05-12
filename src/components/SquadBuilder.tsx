import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Sparkles, Loader2, Flame, Wand2, ArrowRightLeft, Trophy } from 'lucide-react';

// 👕 رسمة تيشيرت فانتازي واقعية (بديل لأيقونة Shirt العادية)
const RealJersey = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="currentColor">
    <path d="M19.1,12.3 C23.4,12.3 26.6,16 32,16 C37.4,16 40.6,12.3 44.9,12.3 C51.3,12.3 60,18.5 60,26 C60,29.5 54.4,35 52,33 C49.4,43.2 46,60 46,60 L18,60 C18,60 14.6,43.2 12,33 C9.6,35 4,29.5 4,26 C4,18.5 12.7,12.3 19.1,12.3 Z" />
  </svg>
);

export default function SquadBuilder({ 
   squad, onRemovePlayer, totalBudget, captainId, viceCaptainId, setCaptain, setViceCaptain, 
   onGenerateAI, isGeneratingAI, onSelectPlayer, onRoastSquad, isRoasting, onAutoPick,
   swapSourceIndex, onSlotClick 
}: any) {
  const squadRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 👈 الدالة الجديدة "المُحصنة" ضد إيرور الصور
  const downloadImage = async () => {
    if (!squadRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(squadRef.current, { 
        skipFonts: true,
        pixelRatio: 2, 
        backgroundColor: '#09090b',
        useCORS: true,
        // فلتر لتخطي أي نود تسبب فشل العملية (اختياري)
        filter: (node: any) => true 
      });
      const link = document.createElement('a');
      link.download = 'KoraTracker-DreamTeam.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export Error:", error);
      // Fallback: لو فشل بسبب اللوجوهات، بنحاول مرة أخيرة من غير الصور الخارجية
      try {
        const fallbackUrl = await toPng(squadRef.current, { 
          filter: (node: any) => node.tagName !== 'IMG' 
        });
        const link = document.createElement('a');
        link.download = 'KoraTracker-Squad.png';
        link.href = fallbackUrl;
        link.click();
      } catch (e) {
        alert("حصلت مشكلة في التحميل بسبب حماية المتصفح، جرب استخدام متصفح آخر.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const PlayerSlot = ({ slotObj, index }: any) => {
    const isSwapping = swapSourceIndex === index;
    const player = slotObj.player;
    const role = slotObj.role;
    const isBench = slotObj.isBench;
    const isMenuOpen = activeMenu === index;

    const handleSlotClick = (e: any) => {
      e.stopPropagation();
      if (swapSourceIndex !== null) {
        onSlotClick(index);
        setActiveMenu(null);
      } else if (player) {
        setActiveMenu(isMenuOpen ? null : index);
      } else {
        onSlotClick(index);
      }
    };

    const displayName = player ? (player.name.split(' ').length > 1 ? player.name.split(' ').pop() : player.name) : '';

    return (
      <div className={`flex flex-col items-center w-[50px] sm:w-[60px] md:w-[84px] relative group mt-1 md:mt-2 transition-all ${isMenuOpen || isSwapping ? 'z-[100]' : 'z-20'}`}>
        
        {player && (
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1.5 transition-all duration-300 ease-out z-[150]
            ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-75 translate-y-2 invisible pointer-events-none md:pointer-events-auto md:visible md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:translate-y-0'}`}>
            
            <button onClick={(e) => { e.stopPropagation(); setCaptain(player.id); setActiveMenu(null); }} className="group/btn relative w-7 h-7 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:border-yellow-400 hover:scale-110 shadow-lg transition-all">
               <span className="text-white font-black text-[10px] group-hover/btn:text-black">C</span>
               <span className="absolute -top-6 bg-black text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Captain</span>
            </button>

            <button onClick={(e) => { e.stopPropagation(); setViceCaptain(player.id); setActiveMenu(null); }} className="group/btn relative w-7 h-7 bg-zinc-800 border border-zinc-600 rounded-full flex items-center justify-center hover:bg-zinc-200 hover:border-white hover:scale-110 shadow-lg transition-all">
               <span className="text-white font-black text-[10px] group-hover/btn:text-black">V</span>
               <span className="absolute -top-6 bg-black text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Vice</span>
            </button>

            <button onClick={(e) => { e.stopPropagation(); onSlotClick(index); setActiveMenu(null); }} className="group/btn relative w-7 h-7 bg-blue-600 border border-blue-500 rounded-full flex items-center justify-center hover:bg-blue-400 hover:scale-110 shadow-lg transition-all">
               <ArrowRightLeft size={12} className="text-white" strokeWidth={3} />
               <span className="absolute -top-6 bg-black text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Swap</span>
            </button>

            <button onClick={(e) => { e.stopPropagation(); onRemovePlayer(index, player.id); setActiveMenu(null); }} className="group/btn relative w-7 h-7 bg-red-600 border border-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:scale-110 shadow-lg transition-all">
               <X size={14} className="text-white" strokeWidth={3} />
               <span className="absolute -top-6 bg-black text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Remove</span>
            </button>
          </div>
        )}
        
        {isBench && <span className="text-[#37003c] font-black text-[9px] md:text-[10px] mb-0.5">{role}</span>}

        <div 
          onClick={handleSlotClick}
          className={`relative flex flex-col items-center justify-center transition-all cursor-pointer mb-1
          ${isSwapping ? 'scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse' : 'hover:scale-105'}
          ${isMenuOpen ? 'scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''}`}
        >
          {player ? (
            <div className="relative">
              <RealJersey className="w-9 h-9 sm:w-11 sm:h-11 md:w-16 md:h-16 text-white fill-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
              
              {captainId === player.id && (
                <div className="absolute top-0 right-[-4px] md:top-[-2px] md:right-[-6px] bg-yellow-400 text-black w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-black text-[8px] md:text-[11px] border-[1.5px] border-black z-20 shadow-md transform rotate-[15deg]">
                  C
                </div>
              )}
              
              {viceCaptainId === player.id && captainId !== player.id && (
                <div className="absolute top-0 right-[-4px] md:top-[-2px] md:right-[-6px] bg-zinc-200 text-black w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-black text-[8px] md:text-[11px] border-[1.5px] border-black z-20 shadow-md transform -rotate-[10deg]">
                  V
                </div>
              )}
              
              {player.team?.crest && (
                <div className="absolute bottom-[-2px] right-[-6px] bg-white rounded-full p-[2px] md:p-[3px] shadow-[0_3px_5px_rgba(0,0,0,0.4)] flex items-center justify-center z-10 w-4 h-4 sm:w-5 sm:h-5 md:w-[26px] md:h-[26px] border border-zinc-200">
                   <img src={player.team.crest} className="w-full h-full object-contain drop-shadow-sm" alt="" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <RealJersey className="w-9 h-9 sm:w-11 sm:h-11 md:w-16 md:h-16 text-white/20 fill-white/10 drop-shadow-none" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/40 font-black text-[8px] md:text-xs tracking-widest">{role}</span>
              </div>
            </div>
          )}
        </div>

        {player ? (
          <div 
            className="flex flex-col w-[48px] sm:w-[56px] md:w-[72px] rounded text-center shadow-[0_4px_6px_rgba(0,0,0,0.3)] overflow-hidden cursor-pointer hover:shadow-[0_6px_12px_rgba(0,0,0,0.4)] transition-all relative z-20 mt-0.5 md:mt-1 border border-[#37003c]/20"
            onClick={(e) => { e.stopPropagation(); onSelectPlayer(player); setActiveMenu(null); }}
          >
            <div className="bg-gradient-to-b from-[#ffffff] to-[#f0f0f0] text-[#37003c] text-[6.5px] sm:text-[7.5px] md:text-[10px] font-black py-[3px] md:py-[5px] px-0.5 md:px-1 truncate w-full" title={player.name}>
              {displayName}
            </div>
            <div className="bg-gradient-to-b from-[#37003c] to-[#1a001d] text-[#00ff87] text-[6px] sm:text-[7px] md:text-[9px] font-black py-[2px] md:py-[3px] px-0.5 md:px-1 w-full border-t border-[#00ff87]/20">
              £{player.price}
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-[48px] sm:w-[56px] md:w-[72px] rounded shadow-sm overflow-hidden opacity-60 relative z-20 mt-0.5 md:mt-1">
            <div className="bg-black/40 backdrop-blur-sm text-white/70 text-[7px] md:text-[10px] font-black text-center py-[3px] md:py-[5px] px-1 w-full uppercase border border-white/10 rounded">
              ADD
            </div>
          </div>
        )}
      </div>
    );
  };

  const pitchWithIndex = squad.map((slot: any, idx: number) => ({ slot, idx })).filter((item: any) => !item.slot.isBench);
  const benchWithIndex = squad.map((slot: any, idx: number) => ({ slot, idx })).filter((item: any) => item.slot.isBench);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full p-0 md:p-4 relative z-0 font-sans" onClick={() => setActiveMenu(null)}>
      
      {/* 🏟️ الملعب */}
      <div ref={squadRef} className="w-full max-w-[420px] bg-gradient-to-b from-[#02b34a] to-[#01963e] rounded-t-2xl rounded-b-lg relative flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden min-h-[420px] sm:min-h-[480px] md:min-h-[600px] border-x-2 md:border-x-4 border-t-2 md:border-t-4 border-[#02c753]/40 ring-1 ring-black/20">
        
        {/* خطوط العشب */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-40 mix-blend-overlay">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`absolute top-0 bottom-0 w-[10%] ${i % 2 === 0 ? 'bg-black/5' : 'bg-white/5'} left-[${i * 10}%]`} style={{ left: `${i * 10}%` }} />
          ))}
        </div>

        {/* خطوط الملعب البيضاء */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[45%] h-16 md:h-24 border-x-2 border-b-2 border-white/60" />
            <div className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 w-10 h-5 md:w-16 md:h-8 border-b-2 border-x-2 rounded-b-full border-white/60" />
            <div className="absolute top-[48%] left-0 w-full h-[2px] bg-white/60 -translate-y-1/2" />
            <div className="absolute top-[48%] left-1/2 w-16 h-16 md:w-28 md:h-28 border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* بانر الـ AI */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 text-white font-black tracking-widest z-10 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-white/10 shadow-lg">
            <span className="text-[#00ff87] text-[8px] md:text-xs"><Sparkles size={10} className="inline pb-0.5 md:w-3 md:h-3"/> AI</span>
            <span className="text-[6px] md:text-[10px] opacity-80">SCOUT</span>
        </div>

        <div className="flex justify-around mt-8 sm:mt-10 md:mt-12 w-full px-0.5 md:px-2 z-20 min-h-[75px] md:min-h-[105px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'FWD').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-2 sm:mt-3 md:mt-5 w-full px-0.5 md:px-2 z-20 min-h-[75px] md:min-h-[105px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'MID').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-2 sm:mt-3 md:mt-5 w-full px-0.5 md:px-2 z-20 min-h-[75px] md:min-h-[105px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'DEF').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-2 sm:mt-3 md:mt-5 w-full px-0.5 md:px-2 z-20 min-h-[75px] md:min-h-[105px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'GK').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>

        {/* 🪑 دكة البدلاء */}
        <div className="mt-auto bg-gradient-to-b from-[#7fd6a0] to-[#5cb880] border-t-2 md:border-t-4 border-[#37003c]/20 shadow-[0_-10px_20px_rgba(0,0,0,0.15)] px-0.5 md:-mx-6 md:px-6 flex justify-around items-end pb-10 sm:pb-12 pt-2 h-28 sm:h-32 md:h-44 relative z-20 overflow-hidden">
           {benchWithIndex.map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
           
           <div className="absolute bottom-0 left-0 right-0 bg-[#09090b] border-t border-white/20 py-1.5 px-4 flex items-center justify-between z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-1.5">
                 <div className="h-5 w-5 bg-indigo-600 rounded flex items-center justify-center">
                    <Trophy size={10} className="text-white" />
                 </div>
                 <span className="text-[10px] md:text-xs text-white font-black italic tracking-tighter">Kora<span className="text-indigo-400">Tracker</span></span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[6px] md:text-[7px] text-zinc-400 font-black tracking-[0.2em] uppercase">Powered By</span>
                 <span className="text-[8px] md:text-[9px] text-emerald-400 font-black tracking-widest uppercase">AI Scout</span>
              </div>
           </div>
        </div>

      </div>

      <div className="flex flex-col gap-2 md:gap-3 w-full max-w-[420px] px-2 md:px-0">
         <div className="flex gap-2 md:gap-3 w-full">
           <button onClick={(e) => { e.stopPropagation(); onGenerateAI(); }} disabled={isGeneratingAI || isRoasting} className="flex-1 bg-gradient-to-r from-[#37003c] to-[#5a0063] hover:from-[#4a0052] hover:to-[#6b0075] disabled:opacity-50 text-white font-black py-3 md:py-5 rounded-xl md:rounded-2xl shadow-lg transition-all active:scale-95 uppercase text-[9px] md:text-xs tracking-wide md:tracking-[0.2em] flex items-center justify-center gap-1.5 md:gap-2 border border-[#9b00a8]/30">
             {isGeneratingAI ? <Loader2 size={14} className="animate-spin md:w-4 md:h-4" /> : <Sparkles size={14} className="text-[#00ff87] md:w-4 md:h-4" />} AI Rating
           </button>
           <button onClick={(e) => { e.stopPropagation(); onRoastSquad(); }} disabled={isGeneratingAI || isRoasting} className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-black py-3 md:py-5 rounded-xl md:rounded-2xl shadow-lg transition-all active:scale-95 uppercase text-[9px] md:text-xs tracking-wide md:tracking-[0.2em] flex items-center justify-center gap-1.5 md:gap-2 border border-orange-400/30">
             {isRoasting ? <Loader2 size={14} className="animate-spin md:w-4 md:h-4" /> : <Flame size={14} className="md:w-4 md:h-4" />} Roast Me
           </button>
         </div>
         <div className="flex gap-2 md:gap-3 w-full">
           <button onClick={(e) => { e.stopPropagation(); onAutoPick(); }} className="flex-1 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-black py-3 md:py-5 rounded-xl md:rounded-2xl shadow-lg transition-all active:scale-95 uppercase text-[9px] md:text-xs tracking-wide md:tracking-[0.2em] flex items-center justify-center gap-1.5 md:gap-2 border border-cyan-400/30">
             <Wand2 size={14} className="md:w-4 md:h-4" /> Auto Pick
           </button>
           <button onClick={(e) => { e.stopPropagation(); downloadImage(); }} disabled={isDownloading} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-black py-3 md:py-5 rounded-xl md:rounded-2xl shadow-lg transition-all active:scale-95 uppercase text-[9px] md:text-xs tracking-wide md:tracking-[0.2em] flex items-center justify-center gap-1.5 md:gap-2 border border-emerald-300/30">
             {isDownloading ? <Loader2 size={14} className="animate-spin md:w-4 md:h-4" /> : '📸'} {isDownloading ? 'Saving...' : 'Download'}
           </button>
         </div>
      </div>
    </div>
  );
}