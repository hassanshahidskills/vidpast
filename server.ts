import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("vidpast.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT,
    thumbnail TEXT,
    file_size TEXT,
    quality TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/history", (req, res) => {
    try {
      const history = db.prepare("SELECT * FROM downloads ORDER BY timestamp DESC").all();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/download", (req, res) => {
    const { url, quality } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // Mocking video extraction logic
    const mockVideoInfo = {
      title: "Video_" + Math.random().toString(36).substring(7),
      thumbnail: `https://picsum.photos/seed/${Math.random()}/400/225`,
      file_size: (Math.random() * 50 + 5).toFixed(1) + " MB",
      quality: quality || "1080p",
    };

    try {
      const stmt = db.prepare(
        "INSERT INTO downloads (url, title, thumbnail, file_size, quality) VALUES (?, ?, ?, ?, ?)"
      );
      stmt.run(url, mockVideoInfo.title, mockVideoInfo.thumbnail, mockVideoInfo.file_size, mockVideoInfo.quality);
      res.json({ success: true, ...mockVideoInfo });
    } catch (error) {
      res.status(500).json({ error: "Failed to save download" });
    }
  });

  app.delete("/api/history/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM downloads WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
