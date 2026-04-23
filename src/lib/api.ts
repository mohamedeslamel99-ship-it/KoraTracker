const BASE_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api/football` : '/api/football';

// سحب المفتاح السري من بيئة العمل
const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY;

export async function fetchFootballData(endpoint: string, retries = 0): Promise<any> {
  const MAX_RETRIES = 2;
  let response: Response | undefined;
  
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}/${endpoint}`;
    
    // إضافة الـ Headers اللي فيها المفتاح السري
    response = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY || '', // لو المفتاح مش موجود هيبعت فاضي عشان الكود ما يضربش
      }
    });
    
    // Automatic exponential backoff for rate limits (429)
    if (response.status === 429 && retries < MAX_RETRIES) {
      let errorData;
      try { errorData = await response.json(); } catch(e) { errorData = {}; }
      
      const waitSecondsMatch = (errorData.message || "").match(/Wait (\d+) seconds/i);
      const waitTime = (waitSecondsMatch ? parseInt(waitSecondsMatch[1], 10) : (5 * (retries + 1))) + 2;
      
      console.warn(`[API CLIENT] Traffic Limit. Retry ${retries + 1}/${MAX_RETRIES} in ${waitTime}s...`);
      await new Promise(r => setTimeout(r, waitTime * 1000));
      return fetchFootballData(endpoint, retries + 1);
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP Error ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.message || errorData.error || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    const isRateLimit = response?.status === 429 || error.message?.includes('limit') || error.message?.includes('Wait');
    
    if (retries < MAX_RETRIES && isRateLimit) {
       return fetchFootballData(endpoint, retries + 1);
    }

    if (!isRateLimit) {
      console.error(`[API CLIENT] Error fetching ${endpoint}:`, error);
    } else {
      console.warn(`[API CLIENT] Traffic Limit reached for ${endpoint}. Exhausted retries.`);
    }
    // Explicitly check for fetch failure
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Connection Error: Could not connect to KoraTracker server. Is it running on port 3000?`);
    }
    throw error;
  }
}

export const endpoints = {
  getMatches: (date?: string) => `matches${date ? `?dateFrom=${date}&dateTo=${date}` : ''}`,
  getLiveMatches: () => `matches?status=LIVE`,
  getLeagues: () => `competitions`,
  getStandings: (leagueId: string) => `competitions/${leagueId}/standings`,
  getTopScorers: (leagueId: string) => `competitions/${leagueId}/scorers`,
  getTeams: (leagueId: string) => `competitions/${leagueId}/teams`,
  getTeam: (teamId: string) => `teams/${teamId}`,
  getTeamMatches: (teamId: string) => `teams/${teamId}/matches`,
  getPlayer: (playerId: string) => `persons/${playerId}`,
};