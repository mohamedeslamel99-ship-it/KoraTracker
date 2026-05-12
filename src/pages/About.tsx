export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-4xl font-black italic uppercase mb-8">About <span className="text-indigo-500">Kora Tracker</span></h1>
      <p className="text-zinc-400 leading-relaxed mb-6">
        Kora Tracker is an advanced football analytics platform designed for the modern fan. 
        Developed by Mohamed Eslam, a dedicated Front-End Developer, the platform combines 
        real-time data with a seamless user experience.
      </p>
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <h2 className="text-indigo-400 font-bold uppercase mb-3">Our Vision</h2>
          <p className="text-sm text-zinc-500">To provide football enthusiasts with professional-grade tools for squad building and match analysis.</p>
        </div>
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <h2 className="text-indigo-400 font-bold uppercase mb-3">Technology Stack</h2>
          <p className="text-sm text-zinc-500">Built using React, Next.js, and Tailwind CSS to ensure high performance and responsiveness.</p>
        </div>
      </div>
    </div>
  );
}