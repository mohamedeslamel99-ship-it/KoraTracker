import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { X, Shirt, Crown, Sparkles, Loader2, Flame, Wand2, ArrowRightLeft } from 'lucide-react';

export default function SquadBuilder({ 
   squad, onRemovePlayer, totalBudget, captainId, viceCaptainId, setCaptain, setViceCaptain, 
   onGenerateAI, isGeneratingAI, onSelectPlayer, onRoastSquad, isRoasting, onAutoPick,
   swapSourceIndex, onSlotClick 
}: any) {
  const squadRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (!squadRef.current) return;
    try {
      const dataUrl = await toPng(squadRef.current, { quality: 1, pixelRatio: 2, backgroundColor: '#15803d' });
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

    return (
      <div className="flex flex-col items-center w-[72px] md:w-20 relative group mt-2 z-20">
        {/* أزرار التحكم (تظهر عند الوقوف على اللاعب) */}
        {player && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-black/80 p-1 rounded-full border border-white/10 shadow-2xl">
            <button onClick={(e) => { e.stopPropagation(); setCaptain(player.id); }} className="w-5 h-5 bg-yellow-500 rounded-full text-black font-black text-[10px]">C</button>
            <button onClick={(e) => { e.stopPropagation(); setViceCaptain(player.id); }} className="w-5 h-5 bg-zinc-200 rounded-full text-black font-black text-[10px]">V</button>
            <button onClick={(e) => { e.stopPropagation(); onSlotClick(index); }} className="w-5 h-5 bg-blue-500 rounded-full text-white flex items-center justify-center" title="Swap"><ArrowRightLeft size={10} /></button>
            <button onClick={(e) => { e.stopPropagation(); onRemovePlayer(index, player.id); }} className="w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center" title="Remove"><X size={12} /></button>
          </div>
        )}
        
        {/* التيشيرت ومؤشر التبديل */}
        <div 
          onClick={() => onSlotClick(index)}
          className={`w-10 h-10 flex items-center justify-center mb-1 transition-all relative cursor-pointer
          ${isSwapping ? 'scale-110 ring-4 ring-yellow-400 rounded-full shadow-[0_0_15px_#facc15] animate-pulse z-40 bg-yellow-400/20' : 'group-hover:scale-105'}
          ${!player && 'rounded-full bg-green-800/40 border-2 border-dashed border-white/30 text-white/30'}`}
        >
          {player ? (
             <div className="relative flex flex-col items-center" onClick={(e) => { e.stopPropagation(); onSelectPlayer(player); }}>
                <Shirt size={38} className="text-white fill-white drop-shadow-md" />
                {captainId === player.id && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] border border-black z-20 shadow-md">C</div>}
                {viceCaptainId === player.id && captainId !== player.id && <div className="absolute -top-2 -right-2 bg-zinc-200 text-black w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] border border-black z-20 shadow-md">V</div>}
                {player.team?.crest && (
                  <div className="absolute -bottom-1 -right-2 bg-white rounded-full p-[2px] shadow-sm flex items-center justify-center z-10">
                     <img src={player.team.crest} className="w-3 h-3 object-contain" alt="" referrerPolicy="no-referrer" />
                  </div>
                )}
             </div>
          ) : (
             <span className="font-bold text-[10px]">{role}</span>
          )}
        </div>

        {/* اسم اللاعب */}
        <span 
          className={`text-[8.5px] md:text-[9.5px] font-black px-1 md:px-1.5 py-0.5 rounded w-[68px] md:w-[76px] text-center leading-[1.2] line-clamp-2 break-words shadow-md mt-1 cursor-pointer
          ${player ? 'bg-[#37003c] text-white border border-[#00ff87]' : 'bg-black/20 text-white/50 border border-transparent'}`}
          onClick={() => { if(player) onSelectPlayer(player); }}
          title={player ? player.name : ''}
        >
          {player ? player.name : 'فارغ'}
        </span>
        
        {player && <span className="text-[8px] font-bold text-green-300 mt-0.5 bg-black/40 px-1 rounded">£{player.price}m</span>}
      </div>
    );
  };

  // 📐 تصنيف التشكيلة ديناميكياً للرسم (Pitch vs Bench)
  const pitchWithIndex = squad.map((slot: any, idx: number) => ({ slot, idx })).filter((item: any) => !item.slot.isBench);
  const benchWithIndex = squad.map((slot: any, idx: number) => ({ slot, idx })).filter((item: any) => item.slot.isBench);

  return (
    <div className="flex flex-col items-center gap-6 w-full p-4 relative z-0">
      <div className="flex items-center justify-between w-full max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
         <div className="flex items-center gap-2">
            <Crown size={18} className="text-yellow-500" />
            <div>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Value</p>
               <p className="text-lg font-black text-white">£{totalBudget}m</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Players</p>
            <p className="text-lg font-black text-white">{squad.filter((s:any) => s.player !== null).length}/15</p>
         </div>
      </div>

      <div ref={squadRef} className="w-full max-w-[400px] bg-green-700 rounded-xl relative p-6 flex flex-col border-4 border-white shadow-2xl overflow-hidden" style={{ minHeight: '600px' }}>
        <div className="absolute top-2 left-2 text-white/40 text-[10px] font-bold tracking-widest z-10 flex items-center gap-1">KORATRACKER <Sparkles size={10} /> AI</div>

        {/* رسم خطوط الملعب ديناميكياً */}
        <div className="flex justify-around mt-4 w-full px-2 z-20">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'FWD').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-8 w-full px-2 z-20">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'MID').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-8 w-full px-2 z-20">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'DEF').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>
        <div className="flex justify-around mt-8 w-full px-2 z-20">
           {pitchWithIndex.filter((item: any) => item.slot.role === 'GK').map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>

        {/* دكة البدلاء */}
        <div className="mt-auto pt-4 border-t border-white/20 bg-green-900/40 -mx-6 px-6 flex justify-around items-center h-28 relative z-20">
           {benchWithIndex.map((item: any) => <PlayerSlot key={item.idx} slotObj={item.slot} index={item.idx} />)}
        </div>

        {/* خطوط الملعب البيضاء */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20 -translate-y-1/2 z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"></div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[400px]">
         <div className="flex gap-3 w-full">
           <button onClick={onGenerateAI} disabled={isGeneratingAI || isRoasting} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
             {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Rating
           </button>
           <button onClick={onRoastSquad} disabled={isGeneratingAI || isRoasting} className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
             {isRoasting ? <Loader2 size={14} className="animate-spin" /> : <Flame size={14} />} Roast Me
           </button>
         </div>
         <div className="flex gap-3 w-full">
           <button onClick={onAutoPick} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
             <Wand2 size={14} /> Auto Pick
           </button>
           <button onClick={downloadImage} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
             📸 Download
           </button>
         </div>
      </div>
    </div>
  );
}