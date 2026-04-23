import { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function SquadBuilder() {
  const squadRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (!squadRef.current) return;
    
    try {
      const canvas = await html2canvas(squadRef.current, {
        useCORS: true,
        backgroundColor: '#15803d', 
        scale: 2, // عشان الصورة تطلع جودتها عالية
        logging: false, // عشان مايملاليش الـ console
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'KoraTracker-Squad.png';
      link.click();
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("حصلت مشكلة في تحميل الصورة.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginTop: '40px', width: '100%' }}>
      
      {/* Pitch Area (مفيش ولا كلاس Tailwind هنا خالص) */}
      <div 
        ref={squadRef} 
        style={{
          width: '100%',
          maxWidth: '350px',
          height: '500px',
          backgroundColor: '#15803d',
          borderRadius: '8px',
          position: 'relative',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '4px solid #ffffff',
          boxSizing: 'border-box'
        }}
      >
        {/* Watermark */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>
          KORATRACKER.COM
        </div>

        {/* Attackers */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', backgroundColor: '#ffffff', color: '#000000', border: '2px solid #facc15' }}>
                  C
                </div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#ffffff' }}>Salah</span>
            </div>
        </div>

        {/* Midfielders */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '48px', position: 'relative', zIndex: 10 }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', backgroundColor: '#ffffff', color: '#000000' }}>
                  V
                </div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#ffffff' }}>Marmoush</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', backgroundColor: '#ffffff', color: '#000000' }}>
                  9
                </div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#ffffff' }}>Haaland</span>
             </div>
        </div>
        
        {/* Pitch Lines */}
        <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', transform: 'translateY(-50%)' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '96px', height: '96px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%', transform: 'translate(-50%, -50%)', boxSizing: 'border-box' }}></div>
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