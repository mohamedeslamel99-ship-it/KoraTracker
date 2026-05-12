import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LeagueDetails from './pages/LeagueDetails';
import TeamDetails from './pages/TeamDetails';
import FantasyHub from './pages/FantasyHub';

// 👈 1. استيراد كومبوننت زرار التواصل اللي عملناه
import HireMeButton from './components/HireMeButton';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const { i18n } = useTranslation();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-50 selection:bg-indigo-500/30 transition-colors duration-300 relative">
        
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

        {/* 👈 2. وضعنا زرار التواصل هنا عشان يظهر بشكل دائم في أسفل الشاشة */}
        <HireMeButton />
        
      </div>
    </Router>
  );
}