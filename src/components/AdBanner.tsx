const AdBanner = () => {
  return (
    <a href="رابط_الافلييت_الخاص_بك" target="_blank" rel="noreferrer" className="block w-full max-w-[728px] mx-auto my-8">
      <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113]">
        <img 
          src="رابط_صورة_الإعلان_الاحترافية" 
          alt="Sports Gear" 
          className="w-full h-auto"
        />
        <div className="absolute top-2 right-2 bg-black/50 text-[8px] text-white px-2 py-0.5 rounded">AD</div>
      </div>
    </a>
  );
};