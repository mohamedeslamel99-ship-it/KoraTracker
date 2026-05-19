export default async function handler(req, res) {
  // بنجيب المسار اللي الرياكت طالبه
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  // اللينك الأصلي بتاع موقع الكورة
  const targetUrl = `https://api.football-data.org/v4/${pathString}`;

 try {
    const response = await fetch(targetUrl, {
      headers: {
        // حطينا المفتاح هنا مباشرة للتجربة
        'X-Auth-Token': '94ad2c35b69c48629558d4f91f65d9e0',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}