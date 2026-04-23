import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LeagueDetails from './pages/LeagueDetails';
import TeamDetails from './pages/TeamDetails';
import FantasyHub from './pages/FantasyHub';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-50 selection:bg-indigo-500/30">
        <Navbar />
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