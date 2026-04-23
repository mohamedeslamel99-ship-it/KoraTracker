import { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function SquadBuilder() {
  const squadRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (!squadRef.current) return;
    
    try {
      const canvas = await html2canvas(squadRef.current, {
        useCORS: true,
        // ثبتنا اللون الأخضر هنا عشان يتصور صح من غير صورة خارجية
        backgroundColor: '#15803d', 
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'KoraTracker-Squad.png';
      link.click();
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("حصلت مشكلة في تحميل الصورة، افتح الـ Console وشوف الإيرور.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-10 w-full">
      
      {/* Pitch Area (شيلنا الصورة واعتمدنا على اللون الأخضر) */}
      <div 
        ref={squadRef} 
        className="w-full max-w-[350px] h-[500px] bg-green-700 rounded-lg relative p-4 flex flex-col justify-between border-4 border-white shadow-xl"
      >
        {/* Watermark */}
        <div className="absolute top-2 left-2 text-white/50 text-sm font-bold tracking-widest">
          KORATRACKER.COM
        </div>

        {/* Attackers (Example: Salah) */}
        <div className="flex justify-center mt-8 relative z-10">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs mb-1 border-2 border-yellow-400 shadow-md">
                  C
                </div>
                <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded">Salah</span>
            </div>
        </div>

        {/* Midfielders (Example: Marmoush & Haaland) */}
        <div className="flex justify-around mb-12 relative z-10">
             <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs mb-1 shadow-md">
                  V
                </div>
                <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded">Marmoush</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs mb-1 shadow-md">
                  9
                </div>
                <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded">Haaland</span>
             </div>
        </div>
        
        {/* خط النص بتاع الملعب كديكور */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Download Button */}
      <button 
        onClick={downloadImage}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg flex items-center gap-2 active:scale-95"
      >
        📸 حمل الصورة وشاركها
      </button>

    </div>
  );
}