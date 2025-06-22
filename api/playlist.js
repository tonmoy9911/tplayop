import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'channels.json');
    const fileData = await readFile(filePath, 'utf8');
    const data = JSON.parse(fileData);

    const base = 'https://tpeb.vercel.app/api'; // updated domain
    let m3u = '#EXTM3U\n';

    for (const channel of data) {
      if (channel.is_drm) {
        m3u += `#KODIPROP:inputstream.adaptive.license_type=clearkey\n`;
        m3u += `#KODIPROP:inputstream.adaptive.license_key=https://tp.drmlive-01.workers.dev?id=${channel.id}\n`;
        m3u += `#KODIPROP:inputstream.adaptive.manifest_type=mpd\n`;
      }

      m3u += `#EXTINF:-1 tvg-id="ts${channel.id}" catchup-type="append" catchup-days="8" catchup-source="&begin={utc}&end={utcend}" group-title="${channel.group}" tvg-logo="${channel.logo}",${channel.name}\n`;

      m3u += `#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36\n`;
      m3u += `${base}/manifest.js?id=${channel.id}\n\n`;
    }

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.status(200).send(m3u);
  } catch (err) {
    console.error("Playlist Error:", err);
    res.status(500).send("Failed to generate playlist");
  }
}
