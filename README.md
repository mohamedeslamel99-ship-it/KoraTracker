# KoraTracker - Fantasy Hub ⚽🧠

A comprehensive, real-time Fantasy Premier League (FPL) squad builder and analytics tool. Built to help FPL managers analyze, build, and predict squad performance using live data and AI-driven insights.

🔗 **Live Demo:** [KoraTracker App](https://kora-tracker.vercel.app)
## ✨ Key Features
* **Live API Integration:** Fetches real-time Premier League player data, teams, and upcoming fixtures.
* **Strict FPL Rules Engine:** Custom algorithm to map real-world tactical positions to exact FPL rules (e.g., Wingers mapped to MID) using exact ID matching.
* **Dynamic Pricing Engine:** Calculates realistic FPL prices and season points dynamically based on player stats.
* **AI Squad Coach:** Analyzes the built squad to provide a score (out of 100%), strengths, and weaknesses (e.g., Budget management, attacking threat).
* **Smart Auto-Pick:** An algorithm that auto-generates a valid 15-player squad strictly adhering to the £100m budget constraint and max 3 players per team rule.
* **Comparison Labs:** Side-by-side visual comparison of player stats and market values.

## 🛠️ Tech Stack
* **Framework:** React.js 
* **Styling:** Tailwind CSS & Lucide Icons
* **Data Fetching:** SWR for smart caching and revalidation
* **Animations:** Framer Motion
* **Deployment:** Vercel

## 🧠 Technical Challenges Solved
* Implemented a strict ID-based mapping system to overcome third-party API inaccuracies regarding player positions (e.g., mapping Defensive Midfielders to MID instead of DEF).
* Built a custom dynamic pricing engine since the live football API does not provide FPL market values.
* Handled API Rate Limiting by implementing synchronized, delayed fetching with fallback local storage mechanisms.