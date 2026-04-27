import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Crown, Sparkles, Loader2, Flame, Wand2, ArrowRightLeft } from 'lucide-react';

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

  const downloadImage = async () => {
    if (!squadRef.current) return;
    try {
      const dataUrl = await toPng(squadRef.current, { cacheBust: true, skipFonts: true });
      const link = document.createElement('a');
      link.download = 'KoraTracker-DreamTeam.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("حصلت مشكلة في التحميل.");
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
      <div className={`flex flex-col items-center w-[60px] sm:w-[70px] md:w-[84px] relative group mt-1 md:mt-2 transition-all ${isMenuOpen || isSwapping ? 'z-[100]' : 'z-20'}`}>
        
        {/* 🎛️ أزرار التحكم */}
        {player && (
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 md:gap-1.5 transition-all duration-200 bg-white p-1.5 md:p-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-zinc-200 ${isMenuOpen ? 'opacity-100 scale-100 visible pointer-events-auto' : 'opacity-0 scale-90 invisible pointer-events-none md:pointer-events-auto md:visible md:group-hover:opacity-100 md:group-hover:scale-100'}`}>
            <button onClick={(e) => { e.stopPropagation(); setCaptain(player.id); setActiveMenu(null); }} className="w-5 h-5 md:w-6 md:h-6 bg-zinc-900 hover:bg-black rounded-full text-white font-black text-[9px] md:text-[10px] flex items-center justify-center transition-colors" title="Captain">C</button>
            <button onClick={(e) => { e.stopPropagation(); setViceCaptain(player.id); setActiveMenu(null); }} className="w-5 h-5 md:w-6 md:h-6 bg-zinc-200 hover:bg-zinc-300 rounded-full text-black font-black text-[9px] md:text-[10px] flex items-center justify-center transition-colors" title="Vice Captain">V</button>
            <button onClick={(e) => { e.stopPropagation(); onSlotClick(index); setActiveMenu(null); }} className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 hover:bg-blue-600 rounded-full text-white flex items-center justify-center transition-colors" title="Swap"><ArrowRightLeft size={10} className="md:w-3 md:h-3" strokeWidth={3} /></button>
            <button onClick={(e) => { e.stopPropagation(); onRemovePlayer(index, player.id); setActiveMenu(null); }} className="w-5 h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-600 rounded-full text-white flex items-center justify-center transition-colors" title="Remove"><X size={12} className="md:w-3.5 md:h-3.5" strokeWidth={3} /></button>
          </div>
        )}
        
        {/* كلمة المركز للدكة */}
        {isBench && <span className="text-[#37003c] font-black text-[10px] mb-1">{role}</span>}

        {/* 👕 التيشيرت */}
        <div 
          onClick={handleSlotClick}
          className={`relative flex flex-col items-center justify-center transition-all cursor-pointer mb-1
          ${isSwapping ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse' : 'hover:scale-105'}
          ${isMenuOpen ? 'scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}
        >
          {player ? (
            <div className="relative">
              {/* التيشيرت الأبيض الواقعي */}
              <RealJersey className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white fill-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]" />
              {captainId === player.id && <div className="absolute top-0 right-[-4px] md:top-0 md:right-[-6px] bg-black text-white w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-black text-[9px] md:text-[11px] border-2 border-white z-20 shadow-md">C</div>}
              {viceCaptainId === player.id && captainId !== player.id && <div className="absolute top-0 right-[-4px] md:top-0 md:right-[-6px] bg-zinc-200 text-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-black text-[9px] md:text-[11px] border-2 border-white z-20 shadow-md">V</div>}
              {player.team?.crest && (
                <div className="absolute bottom-0 right-[-6px] bg-white rounded-full p-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center z-10 w-5 h-5 md:w-6 md:h-6 border border-zinc-200">
                   <img src={player.team.crest} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <RealJersey className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white/30 fill-white/20 drop-shadow-none" />
            </div>
          )}
        </div>

        {/* 📛 يافطة الاسم والسعر */}
        {player ? (
          <div 
            className="flex flex-col w-[56px] sm:w-[64px] md:w-[72px] rounded shadow-[0_2px_5px_rgba(0,0,0,0.2)] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative z-20 mt-0.5"
            onClick={(e) => { e.stopPropagation(); onSelectPlayer(player); setActiveMenu(null); }}
          >
            <div className="bg-white text-[#37003c] text-[8px] md:text-[10px] font-black text-center py-[4px] px-1 truncate w-full" title={player.name}>
              {displayName}
            </div>
            <div className="bg-[#e1e7f0] text-[#37003c] text-[7.5px] md:text-[9px] font-bold text-center py-[2px] px-1 w-full border-t border-zinc-300">
              £{player.price}m
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-[56px] sm:w-[64px] md:w-[72px] rounded shadow-sm overflow-hidden opacity-80 relative z-20 mt-0.5">
            <div className="bg-white/90 text-[#37003c] text-[8px] md:text-[10px] font-black text-center py-[4px] px-1 truncate w-full uppercase">
              {role}
            </div>
            <div className="bg-white/60 text-[#37003c] text-[7.5px] md:text-[9px] font-bold text-center py-[2px] px-1 w-full border-t border-white">
              EMPTY
            </div>
          </div>
        )}
      </div>
    );
  };

  const pitchWithIndex = squad.map((slot: any, idx: number) => ({ slot, idx })).filter((item: any) => !item.slot.isBench);
  const benchWithIndex = squad.map((slot: any, idx: number) => ({ slot, idx })).filter((item: any) => item.slot.isBench);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full p-2 md:p-4 relative z-0 font-sans" onClick={() => setActiveMenu(null)}>
      
      {/* 🏟️ الملعب الأخضر الكلاسيكي */}
      <div ref={squadRef} className="w-full max-w-[420px] bg-[#02c753] rounded-t-xl relative flex flex-col shadow-2xl overflow-hidden min-h-[500px] md:min-h-[600px] border-x-4 border-t-4 border-white">
        
        {/* ⚽ رسم خطوط الملعب البيضاء */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 md:h-24 border-x-2 border-b-2 border-white/40" />
            <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 w-12 h-6 md:w-16 md:h-8 border-b-2 border-x-2 rounded-b-full border-white/40" />
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/40 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-20 h-20 md:w-28 md:h-28 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="absolute top-2 left-3 text-white/90 text-[8px] md:text-[10px] font-black tracking-widest z-10 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-sm">
            KORATRACKER <Sparkles size={10} /> AI
        </div>

        {/* 🔄 الترتيب الصحيح: هجوم، وسط، دفاع، حارس */}
        <div className="flex justify-around mt-8 md:mt-10 w-full px-1 md:px-2 z-20 min-h-[90px] md:min-h-[105px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'FWD').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-2 md:mt-4 w-full px-1 md:px-2 z-20 min-h-[90px] md:min-h-[105px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'MID').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-2 md:mt-4 w-full px-1 md:px-2 z-20 min-h-[90px] md:min-h-[105px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'DEF').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-2 md:mt-4 w-full px-1 md:px-2 z-20 min-h-[90px] md:min-h-[105px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'GK').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>

        {/* 🪑 دكة البدلاء */}
        <div className="mt-auto bg-[#8cebaf] border-t-4 border-white/50 -mx-1 px-1 md:-mx-6 md:px-6 flex justify-around items-end pb-3 pt-2 h-32 md:h-36 relative z-20">
           {benchWithIndex.map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>

      </div>

      <div className="flex flex-col gap-2 md:gap-3 w-full max-w-[420px]">
         <div className="flex gap-2 md:gap-3 w-full">
           <button onClick={(e) => { e.stopPropagation(); onGenerateAI(); }} disabled={isGeneratingAI || isRoasting} className="flex-1 bg-[#37003c] hover:bg-[#4a0052] disabled:opacity-50 text-white font-black py-3 md:py-4 rounded-xl shadow-md transition-all active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2">
             {isGeneratingAI ? <Loader2 size={12} className="animate-spin md:w-3.5 md:h-3.5" /> : <Sparkles size={12} className="md:w-3.5 md:h-3.5 text-[#00ff87]" />} AI Rating
           </button>
           <button onClick={(e) => { e.stopPropagation(); onRoastSquad(); }} disabled={isGeneratingAI || isRoasting} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-3 md:py-4 rounded-xl shadow-md transition-all active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2">
             {isRoasting ? <Loader2 size={12} className="animate-spin md:w-3.5 md:h-3.5" /> : <Flame size={12} className="md:w-3.5 md:h-3.5" />} Roast Me
           </button>
         </div>
         <div className="flex gap-2 md:gap-3 w-full">
           <button onClick={(e) => { e.stopPropagation(); onAutoPick(); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 md:py-4 rounded-xl shadow-md transition-all active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2">
             <Wand2 size={12} className="md:w-3.5 md:h-3.5" /> Auto Pick
           </button>
           <button onClick={(e) => { e.stopPropagation(); downloadImage(); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 md:py-4 rounded-xl shadow-md transition-all active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2">
             📸 Download
           </button>
         </div>
      </div>
    </div>
  );
}