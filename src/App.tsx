import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LeagueDetails from './pages/LeagueDetails';
import TeamDetails from './pages/TeamDetails';
import FantasyHub from './pages/FantasyHub';

export default function App() {
  // 1. هنا بنقرا الثيم من الـ Local Storage عشان نحفظ اختيار المستخدم
  // وبنخليه 'dark' كافتراضي لأن موقعك أصلاً كان دارك
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // 2. الـ useEffect ده بيحط أو يشيل كلاس 'dark' من تاج الـ html
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. دي الفنكشن اللي هتبدل بين المودين لما ندوس على الزرار
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      {/* 4. هنا ضفنا ألوان الفاتح (bg-slate-50 text-slate-900) وحافظنا على ألوانك في الدارك (dark:bg-[#09090b] dark:text-zinc-50) */}
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-50 selection:bg-indigo-500/30 transition-colors duration-300">
        
        {/* 5. باصينا الفنكشن وحالة الثيم للـ Navbar عشان نحط فيها الزرار */}
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leagues/:id" element={<LeagueDetails />} />
            <Route path="/team/:id" element={<TeamDetails />} />
            <Route path="/fantasy-hub" element={<FantasyHub />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}