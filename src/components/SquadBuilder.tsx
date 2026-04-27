import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Shirt, Crown, Sparkles, Loader2, Flame, Wand2, ArrowRightLeft } from 'lucide-react';

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
      const dataUrl = await toPng(squadRef.current, { 
        cacheBust: true,
        skipFonts: true, 
      });
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

    return (
      <div className={`flex flex-col items-center w-[58px] sm:w-[68px] md:w-[84px] relative group mt-1 md:mt-2 transition-all ${isMenuOpen || isSwapping ? 'z-[100]' : 'z-20'}`}>
        
        {/* 🎛️ أزرار التحكم */}
        {player && (
          <div className={`absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 flex gap-1 md:gap-1.5 transition-all duration-200 bg-black/95 p-1.5 md:p-2 rounded-full border border-zinc-700 shadow-[0_0_20px_rgba(0,0,0,0.8)] ${isMenuOpen ? 'opacity-100 scale-100 visible pointer-events-auto' : 'opacity-0 scale-90 invisible pointer-events-none md:pointer-events-auto md:visible md:group-hover:opacity-100 md:group-hover:scale-100'}`}>
            <button onClick={(e) => { e.stopPropagation(); setCaptain(player.id); setActiveMenu(null); }} className="w-5 h-5 md:w-6 md:h-6 bg-yellow-500 hover:bg-yellow-400 rounded-full text-black font-black text-[9px] md:text-[10px] flex items-center justify-center transition-colors" title="Captain">C</button>
            <button onClick={(e) => { e.stopPropagation(); setViceCaptain(player.id); setActiveMenu(null); }} className="w-5 h-5 md:w-6 md:h-6 bg-zinc-300 hover:bg-white rounded-full text-black font-black text-[9px] md:text-[10px] flex items-center justify-center transition-colors" title="Vice Captain">V</button>
            <button onClick={(e) => { e.stopPropagation(); onSlotClick(index); setActiveMenu(null); }} className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 hover:bg-blue-400 rounded-full text-white flex items-center justify-center transition-colors" title="Swap"><ArrowRightLeft size={10} className="md:w-3 md:h-3" strokeWidth={3} /></button>
            <button onClick={(e) => { e.stopPropagation(); onRemovePlayer(index, player.id); setActiveMenu(null); }} className="w-5 h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-400 rounded-full text-white flex items-center justify-center transition-colors" title="Remove"><X size={12} className="md:w-3.5 md:h-3.5" strokeWidth={3} /></button>
          </div>
        )}
        
        {/* 👕 التيشيرت */}
        <div 
          onClick={handleSlotClick}
          className={`relative flex flex-col items-center justify-center transition-all cursor-pointer mb-1 md:mb-1.5
          ${isSwapping ? 'scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse' : 'hover:scale-105'}
          ${isMenuOpen ? 'scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}
        >
          {player ? (
            <>
              <Shirt className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 text-white fill-white drop-shadow-xl" strokeWidth={1} />
              {captainId === player.id && <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-yellow-400 text-black w-3 h-3 md:w-4 md:h-4 rounded-full flex items-center justify-center font-black text-[7px] md:text-[9px] border border-black z-20 shadow-md">C</div>}
              {viceCaptainId === player.id && captainId !== player.id && <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-zinc-200 text-black w-3 h-3 md:w-4 md:h-4 rounded-full flex items-center justify-center font-black text-[7px] md:text-[9px] border border-black z-20 shadow-md">V</div>}
              {player.team?.crest && (
                <div className="absolute -bottom-1 -right-1 md:-right-2 bg-white rounded-full p-[2px] shadow-sm flex items-center justify-center z-10 w-3.5 h-3.5 md:w-5 md:h-5">
                   <img src={player.team.crest} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
                </div>
              )}
            </>
          ) : (
            <>
              <Shirt className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 text-white/20 fill-white/5 drop-shadow-none" strokeWidth={1} />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-[8px] md:text-[10px] text-white/50 tracking-widest">{role}</span>
            </>
          )}
        </div>

        {/* 📛 اسم اللاعب */}
        {player ? (
          <div 
            className="bg-[#37003c] text-white border border-[#00ff87] rounded text-[7.5px] sm:text-[8px] md:text-[10px] font-black px-0.5 md:px-1.5 py-0.5 w-[56px] sm:w-[64px] md:w-[80px] text-center line-clamp-2 leading-[1.1] md:leading-[1.1] shadow-lg cursor-pointer hover:bg-[#4a0052] transition-colors relative z-20"
            onClick={(e) => { e.stopPropagation(); onSelectPlayer(player); setActiveMenu(null); }}
            title={player.name}
          >
            {player.name}
          </div>
        ) : (
          <div className="bg-black/20 text-white/30 rounded text-[7.5px] sm:text-[8px] md:text-[9px] font-black px-0.5 py-0.5 w-[50px] md:w-[60px] text-center border border-white/10 uppercase tracking-widest relative z-20">
            Empty
          </div>
        )}
        
        {/* 💷 سعر اللاعب */}
        {player && <span className="text-[7.5px] md:text-[9px] font-black text-[#00ff87] mt-0.5 md:mt-1 bg-black/80 px-1.5 md:px-2 py-0.5 rounded shadow-sm relative z-20">£{player.price}m</span>}
      </div>
    );
  };

  const pitchWithIndex = squad.map((slot: any, idx: number) => ({ slot, idx })).filter((item: any) => !item.slot.isBench);
  const benchWithIndex = squad.map((slot: any, idx: number) => ({ slot, idx })).filter((item: any) => item.slot.isBench);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full p-2 md:p-4 relative z-0" onClick={() => setActiveMenu(null)}>
      <div className="flex items-center justify-between w-full max-w-[420px] bg-zinc-900 border border-zinc-800 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl">
         <div className="flex items-center gap-2">
            <Crown size={16} className="text-yellow-500 md:w-[18px] md:h-[18px]" />
            <div>
               <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Value</p>
               <p className="text-base md:text-lg font-black text-white">£{totalBudget}m</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Players</p>
            <p className="text-base md:text-lg font-black text-white">{squad.filter((s:any) => s.player !== null).length}/15</p>
         </div>
      </div>

      <div ref={squadRef} className="w-full max-w-[420px] bg-green-700 rounded-xl relative p-2 md:p-6 flex flex-col border-2 md:border-4 border-white shadow-2xl overflow-hidden min-h-[500px] md:min-h-[600px]">
        <div className="absolute top-1.5 left-2 md:top-2 md:left-2 text-white/40 text-[8px] md:text-[10px] font-bold tracking-widest z-10 flex items-center gap-1">KORATRACKER <Sparkles size={8} className="md:w-[10px] md:h-[10px]" /> AI</div>

        <div className="flex justify-around mt-4 md:mt-4 w-full px-0.5 md:px-2 z-20 min-h-[70px] md:min-h-[80px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'FWD').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-4 md:mt-8 w-full px-0.5 md:px-2 z-20 min-h-[70px] md:min-h-[80px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'MID').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-4 md:mt-8 w-full px-0.5 md:px-2 z-20 min-h-[70px] md:min-h-[80px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'DEF').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-4 md:mt-8 w-full px-0.5 md:px-2 z-20 min-h-[70px] md:min-h-[80px]">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'GK').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>

        <div className="mt-auto pt-4 md:pt-6 border-t border-white/20 bg-green-900/40 -mx-2 px-2 md:-mx-6 md:px-6 flex justify-around items-center h-24 md:h-32 relative z-20">
           {benchWithIndex.map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>

        <div className="absolute top-1/2 left-0 w-full h-[1px] md:h-0.5 bg-white/20 -translate-y-1/2 z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 md:w-32 md:h-32 border-[1.5px] md:border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"></div>
      </div>

      <div className="flex flex-col gap-2 md:gap-3 w-full max-w-[420px]">
         <div className="flex gap-2 md:gap-3 w-full">
           <button onClick={(e) => { e.stopPropagation(); onGenerateAI(); }} disabled={isGeneratingAI || isRoasting} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black py-3 md:py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2">
             {isGeneratingAI ? <Loader2 size={12} className="animate-spin md:w-3.5 md:h-3.5" /> : <Sparkles size={12} className="md:w-3.5 md:h-3.5" />} AI Rating
           </button>
           <button onClick={(e) => { e.stopPropagation(); onRoastSquad(); }} disabled={isGeneratingAI || isRoasting} className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-black py-3 md:py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2">
             {isRoasting ? <Loader2 size={12} className="animate-spin md:w-3.5 md:h-3.5" /> : <Flame size={12} className="md:w-3.5 md:h-3.5" />} Roast Me
           </button>
         </div>
         <div className="flex gap-2 md:gap-3 w-full">
           <button onClick={(e) => { e.stopPropagation(); onAutoPick(); }} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-3 md:py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2">
             <Wand2 size={12} className="md:w-3.5 md:h-3.5" /> Auto Pick
           </button>
           <button onClick={(e) => { e.stopPropagation(); downloadImage(); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 md:py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2">
             📸 Download
           </button>
         </div>
      </div>
    </div>
  );
}