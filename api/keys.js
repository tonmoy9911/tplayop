export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Missing ID");

  const headers = {
    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.69.69.69 YGX/537.36',
    "Origin": 'https://watch.tataplay.com',
    "Referer": 'https://watch.tataplay.com'
  };

  const backendUrl = `https://tp.drmlive-01.workers.dev?id=${id}`;

  try {
    const response = await fetch(backendUrl, { headers });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream error: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "application/json";
    res.setHeader("Content-Type", contentType);

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send("Proxy failed: " + err.message);
  }
}
