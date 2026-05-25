import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

interface Measurement {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  source: "physical" | "virtual";
}

const DATA_FILE_PATH = path.join(process.cwd(), "public", "data.json");

function loadHistory(): Measurement[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const dataStr = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(dataStr);
      if (parsed && Array.isArray(parsed.history)) {
        return parsed.history;
      }
    }
  } catch (err) {
    console.error("Failed to load history from data.json:", err);
  }
  return [
    { id: "1", timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), temperature: 19.5, humidity: 55.4, source: "virtual" },
    { id: "2", timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), temperature: 20.1, humidity: 53.8, source: "virtual" },
    { id: "3", timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), temperature: 20.8, humidity: 51.2, source: "virtual" },
    { id: "4", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), temperature: 21.4, humidity: 49.5, source: "virtual" },
    { id: "5", timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), temperature: 22.0, humidity: 47.1, source: "virtual" },
  ];
}

function saveHistory(data: Measurement[]) {
  try {
    const parentDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({ history: data }, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save history to data.json:", err);
  }
}

let history: Measurement[] = loadHistory();

const API_KEY = process.env.PI_API_KEY || "pi_dht20_secure_token_abc123";

app.get("/api/config", (req, res) => {
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  res.json({
    apiKey: API_KEY,
    appUrl: appUrl,
    endpointUrl: `${appUrl}/api/telemetry`
  });
});

app.get("/api/telemetry", (req, res) => {
  res.json({ history });
});

app.post("/api/telemetry", (req, res) => {
  const apiKeyHeader = req.headers["x-api-key"];
  const { apiKey: apiKeyBody, temperature, humidity, source = "physical" } = req.body;
  const providedKey = apiKeyHeader || apiKeyBody;
  
  if (providedKey !== API_KEY) {
    return res.status(401).json({ error: "Ongeldige API-sleutel (Unauthorized)" });
  }

  if (temperature === undefined || humidity === undefined) {
    return res.status(400).json({ error: "Missing temperature or humidity values" });
  }

  const tempNum = parseFloat(temperature);
  const humNum = parseFloat(humidity);

  if (isNaN(tempNum) || isNaN(humNum)) {
    return res.status(400).json({ error: "Invalid temperature or humidity values (must be numbers)" });
  }

  const newMeasurement: Measurement = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    temperature: Math.round(tempNum * 10) / 10,
    humidity: Math.round(humNum * 10) / 10,
    source,
  };

  history.push(newMeasurement);
  if (history.length > 200) {
    history.shift();
  }

  saveHistory(history);

  res.status(201).json({ success: true, measurement: newMeasurement });
});

app.post("/api/telemetry/reset", (req, res) => {
  const apiKeyHeader = req.headers["x-api-key"];
  const { apiKey: apiKeyBody } = req.body;
  const providedKey = apiKeyHeader || apiKeyBody;

  if (providedKey !== API_KEY) {
    return res.status(401).json({ error: "Ongeldige API-sleutel (Unauthorized)" });
  }

  history = [];
  saveHistory(history);
  res.json({ success: true, message: "Geschiedenis is gereset!" });
});

async function startViteServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startViteServer();
