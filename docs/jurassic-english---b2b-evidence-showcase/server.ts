import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Qualifier submissions
  app.post("/api/qualifier", async (req, res) => {
    const { email, criteria, fullName, schoolName } = req.body;
    
    console.log("Qualifier submission received:", { email, criteria, fullName, schoolName });

    // Mock response for now. In a real integration, this would call Notion.
    const criteriaCount = criteria ? criteria.length : 0;
    let action = "download_guide";
    let redirectUrl = "/readiness-qualifier/guide";

    if (criteriaCount === 5) {
      action = "pilot_consultation";
      redirectUrl = "/readiness-qualifier/pilot-request";
    } else if (criteriaCount >= 3) {
      action = "discovery_call";
      redirectUrl = "/readiness-qualifier/discovery";
    }

    res.json({ action, redirectUrl });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
