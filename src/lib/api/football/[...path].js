export default async function handler(req, res) {
  // بنجيب المسار اللي الرياكت طالبه
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  // اللينك الأصلي بتاع موقع الكورة
  const targetUrl = `https://api.football-data.org/v4/${pathString}`;

  try {
    // بنكلم موقع الكورة ونبعتله المفتاح السري اللي هنخبيه في Vercel
    const response = await fetch(targetUrl, {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}