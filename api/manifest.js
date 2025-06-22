import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Missing ID");

  try {
    const filePath = path.join(process.cwd(), 'data', 'channels.json');
    const fileData = await readFile(filePath, 'utf8');
    const channels = JSON.parse(fileData);

    const channel = channels.find(c => String(c.id) === String(id));
    if (!channel) return res.status(404).send("Channel not found");

    console.log("▶️ Requested ID:", id);
    console.log("▶️ Found Channel:", channel);

    if (channel.is_drm === false && channel.channel_url) {
      res.redirect(channel.channel_url);
    } else {
      const userAgent = req.headers["user-agent"] || "";
      let headers = {};

      if (userAgent.includes("TiviMate")) {
        headers = {
          "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.69.69.69 YGX/537.36',
          "Origin": 'https://watch.tataplay.com',
          "Referer": 'https://watch.tataplay.com/'
        };
      } else {
        headers = {
          "User-Agent": userAgent
        };
      }

      const backendUrl = `https://playflix.icu/paid-lo/manifest.mpd?id=${id}`;
      console.log("▶️ Backend URL:", backendUrl);
      console.log("▶️ Headers sent:", headers);

      const response = await fetch(backendUrl, { headers });

      console.log("▶️ Upstream Status:", response.status);

      if (!response.ok) {
        return res.status(response.status).send(`Upstream error: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "application/xml";
      res.setHeader("Content-Type", contentType);
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }

  } catch (err) {
    console.error("❌ Proxy failed:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
}
