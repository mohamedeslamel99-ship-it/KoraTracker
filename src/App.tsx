import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 👈 1. استيراد هوك الترجمة
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LeagueDetails from './pages/LeagueDetails';
import TeamDetails from './pages/TeamDetails';
import FantasyHub from './pages/FantasyHub';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // 👈 2. استدعاء إعدادات الترجمة واللغة الحالية
  const { i18n } = useTranslation();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 👈 3. الـ useEffect ده بيغير اتجاه الصفحة (يمين/يسار) بناءً على اللغة
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // 👈 4. الفنكشن اللي بتبدل بين العربي والإنجليزي
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-50 selection:bg-indigo-500/30 transition-colors duration-300">
        
        {/* 👈 5. باصينا فنكشن تغيير اللغة للـ Navbar عشان نربطها بالزرار */}
        <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          toggleLanguage={toggleLanguage} 
        />
        
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