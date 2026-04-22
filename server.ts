import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("KoraTracker: Initializing server...");
  
  const app = express();
  const PORT = 3000;

  // Logging Middleware
  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "KoraTracker Backend is healthy", timestamp: new Date().toISOString() });
  });

  // Simple In-Memory Cache
  const cache = new Map<string, { data: any, timestamp: number, status: number }>();
  const CACHE_TTL_SHORT = 60 * 1000; // 1 minute for live data
  const CACHE_TTL_LONG = 6 * 60 * 60 * 1000; // 6 hours for standings/teams/squads (Squads don't change often)
  
  // Global Circuit Breaker for Rate Limiting
  let globalCooldownUntil = 0;
  let lastCooldownMessage = "";

  // Football API Proxy
  // Proxies requests to api.football-data.org/v4
  app.get("/api/football/*", async (req, res) => {
    const apiPath = req.params[0];
    const queryParams = new URLSearchParams(req.query as any).toString();
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    const cacheKey = `${apiPath}?${queryParams}`;

    // 1. Check Global Cooldown
    if (Date.now() < globalCooldownUntil) {
      console.warn(`[CIRCUIT BREAKER] Active until ${new Date(globalCooldownUntil).toISOString()}. Rejecting: ${apiPath}`);
      return res.status(429).json({ 
        error: "Global Traffic Governance Active", 
        message: lastCooldownMessage || "The server is currently cooling down to respect API limits. Please try again in a few seconds." 
      });
    }

    // 2. Check Cache
    const cached = cache.get(cacheKey);
    const ttl = apiPath.includes('matches') ? CACHE_TTL_SHORT : CACHE_TTL_LONG;
    
    if (cached && (Date.now() - cached.timestamp < ttl)) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.status(cached.status).json(cached.data);
    }

    console.log(`[CACHE MISS] API Proxy Request: ${apiPath} ${queryParams ? `?${queryParams}` : ""}`);

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      console.error("Missing FOOTBALL_DATA_API_KEY");
      return res.status(500).json({ error: "API Key not configured in Secrets." });
    }

    const targetUrl = `https://api.football-data.org/v4/${apiPath}${queryParams ? `?${queryParams}` : ""}`;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(targetUrl, {
        headers: {
          "X-Auth-Token": apiKey,
        },
        signal: controller.signal
      });

      clearTimeout(timeout);
      console.log(`Upstream Status: ${response.status}`);
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        
        // Handle Rate Limiting globally in memory
        if (response.status === 429) {
          const waitSecondsMatch = data.message?.match(/Wait (\d+) seconds/i);
          const waitTime = waitSecondsMatch ? parseInt(waitSecondsMatch[1], 10) : 30;
          
          globalCooldownUntil = Date.now() + (waitTime + 5) * 1000;
          lastCooldownMessage = data.message || `API limit reached. Cooling down for ${waitTime}s.`;
          
          console.warn(`[CIRCUIT BREAKER] Triggered! Cooling down for ${waitTime + 5}s.`);
        }

        // Only cache successful or legitimate responses (not transient errors)
        if (response.status === 200 || response.status === 429) {
          cache.set(cacheKey, { 
            data, 
            timestamp: Date.now(), 
            status: response.status 
          });
        }
        
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).send(text);
      }
    } catch (error: any) {
      console.error("Proxy Error:", error.message);
      res.status(500).json({ error: "Failed to connect to football API", details: error.message });
    }
  });

  // Vite / Static Assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
