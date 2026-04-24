import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { X } from 'lucide-react'; // ضفنا أيقونة الحذف

export default function SquadBuilder({ squad, onRemovePlayer }: any) {
  const squadRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (!squadRef.current) return;
    try {
      const dataUrl = await toPng(squadRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#15803d',
      });
      const link = document.createElement('a');
      link.download = 'KoraTracker-DreamTeam.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("حصلت مشكلة في التحميل.");
    }
  };

  const PlayerSlot = ({ player, index, isBench = false }: any) => (
    <div className="flex flex-col items-center w-16 relative group cursor-pointer">
      {/* زرار الحذف بيظهر لما تقف بالماوس */}
      {player && (
        <button 
          onClick={() => onRemovePlayer(index)}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30 hover:bg-red-600"
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}
      
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-[10px] shadow-lg mb-1 transition-all group-hover:scale-110
        ${player ? 'bg-white text-black border-yellow-400' : 'bg-green-800/40 border-dashed border-white/30 text-white/30'}`}>
        {player ? (
           <img src={player.team.crest} className="w-6 h-6 object-contain" alt="" crossOrigin="anonymous" />
        ) : (
           index + 1
        )}
      </div>
      <span className={`text-[8px] font-bold px-1 py-0.5 rounded min-w-[50px] text-center truncate shadow-md
        ${player ? 'bg-black/80 text-white' : 'bg-black/20 text-white/50'}`}>
        {player ? player.name : 'فارغ'}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8 w-full p-4">
      
      <div 
        ref={squadRef} 
        className="w-full max-w-[400px] bg-green-700 rounded-xl relative p-6 flex flex-col border-4 border-white shadow-2xl overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        <div className="absolute top-2 left-2 text-white/30 text-[10px] font-bold tracking-widest z-10">KORATRACKER.COM</div>

        {/* Attackers (2) */}
        <div className="flex justify-around mt-6 z-20">
          {[0, 1].map(i => <PlayerSlot key={i} index={i} player={squad[i]} />)}
        </div>

        {/* Midfielders (4) */}
        <div className="flex justify-between mt-12 z-20 px-4">
          {[2, 3, 4, 5].map(i => <PlayerSlot key={i} index={i} player={squad[i]} />)}
        </div>

        {/* Defenders (4) */}
        <div className="flex justify-between mt-12 z-20 px-4">
          {[6, 7, 8, 9].map(i => <PlayerSlot key={i} index={i} player={squad[i]} />)}
        </div>

        {/* Goalkeeper (1) */}
        <div className="flex justify-center mt-12 z-20">
          <PlayerSlot index={10} player={squad[10]} />
        </div>

        {/* Bench (4) */}
        <div className="mt-auto pt-4 border-t border-white/20 bg-green-900/40 -mx-6 px-6 flex justify-between items-center h-24">
          {[11, 12, 13, 14].map(i => <PlayerSlot key={i} index={i} player={squad[i]} isBench />)}
        </div>

        {/* Pitch Lines */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20 -translate-y-1/2 z-10"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
      </div>

      <button onClick={downloadImage} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-full shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center gap-2">
        📸 تحميل تشكيلة الأسبوع
      </button>

    </div>
  );
}