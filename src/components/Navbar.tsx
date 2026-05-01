import { Link, useLocation } from 'react-router-dom';
import { Trophy, Home, BarChart3, Users, Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // 👈 استيراد هوك الترجمة
import { cn } from '../lib/utils';

// 👈 تحديث الـ Props عشان تستقبل زرار اللغة
interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  toggleLanguage: () => void; // الفنكشن اللي جاية من App.tsx
}

export default function Navbar({ theme, toggleTheme, toggleLanguage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // 👈 تفعيل الترجمة
  const { t, i18n } = useTranslation();

  // 👈 شيلنا الأسماء الثابتة وبقينا نستخدم دالة الترجمة t()
  const navItems = [
    { name: t('Home'), path: '/', icon: Home },
    { name: t('Leagues'), path: '/leagues/PL', icon: BarChart3 },
    { name: t('Fantasy Hub'), path: '/fantasy-hub', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-600 p-1.5 shadow-sm shadow-indigo-900/20">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
                {/* 👈 ترجمة اسم الموقع (اختياري، لو عايز تسيبه KoraTracker دايماً امسح الـ t() ) */}
                {t('KoraTracker')}
              </span>
            </Link>
          </div>

          {/* تجميعة زراير اليمين/اليسار */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      location.pathname === item.path
                        ? "text-slate-900 bg-slate-100 dark:text-white dark:bg-zinc-800"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", location.pathname === item.path ? "text-indigo-600 dark:text-indigo-400" : "")} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 👈 زرار تغيير اللغة */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors font-medium text-sm"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline-block">
                {i18n.language === 'en' ? 'عربي' : 'English'}
              </span>
            </button>

            {/* زرار تبديل المود (Dark/Light) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 focus:outline-none transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] transition-colors duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors",
                  location.pathname === item.path
                    ? "text-slate-900 bg-slate-100 dark:text-white dark:bg-zinc-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800"
                )}
              >
                <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-indigo-600 dark:text-indigo-400" : "")} />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}