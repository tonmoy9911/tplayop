import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate request method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: Method ${req.method} Not Allowed });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing ID parameter' });
  }

  const backendUrl = https://tp.drmlive-01.workers.dev?id=${id};

  try {
    const response = await fetch(backendUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Origin': 'https://watch.tataplay.com',
        'Referer': 'https://watch.tataplay.com',
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: Upstream error: ${response.statusText} });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
