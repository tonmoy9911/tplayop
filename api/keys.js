export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Missing ID");

  const headers = {
    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.69.69.69 YGX/537.36',
    "Origin": 'https://watch.tataplay.com',
    "Referer": 'https://watch.tataplay.com',
  };

  const backendUrl = `https://tp.drmlive-01.workers.dev`;

  // Helper to read raw body from req
  async function getRawBody(req) {
    return new Promise((resolve, reject) => {
      let data = [];
      req.on('data', chunk => data.push(chunk));
      req.on('end', () => resolve(Buffer.concat(data)));
      req.on('error', err => reject(err));
    });
  }

  try {
    let fetchOptions = { headers };

    if (req.method === "POST") {
      fetchOptions.method = "POST";

      // Read the raw body from the incoming request
      const rawBody = await getRawBody(req);

      // Forward the raw body as is
      fetchOptions.body = rawBody;

      // Also forward Content-Type header if present in original request
      if (req.headers['content-type']) {
        fetchOptions.headers['Content-Type'] = req.headers['content-type'];
      }
    } else if (req.method === "GET") {
      // Convert GET to POST with id in body
      fetchOptions.method = "POST";
      fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
      fetchOptions.body = `id=${encodeURIComponent(id)}`;
    } else {
      return res.status(405).send("Method Not Allowed");
    }

    const response = await fetch(backendUrl, fetchOptions);

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
