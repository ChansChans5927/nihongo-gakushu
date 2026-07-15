import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/db.ts";
import { startDataGeneratorScheduler } from "./server/schedulers/dataGenerator.ts";
import { startPushScheduler } from "./server/schedulers/pushScheduler.ts";


// Route imports
import authRouter from "./server/routes/auth.ts";
import kanjiRouter from "./server/routes/kanji.ts";
import vocabRouter from "./server/routes/vocab.ts";
import jlptRouter from "./server/routes/jlpt.ts";
import progressRouter from "./server/routes/progress.ts";
import notificationsRouter from "./server/routes/notifications.ts";
import ttsRouter from "./server/routes/tts.ts";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}
app.use(express.json());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/kanji", kanjiRouter);
app.use("/api/vocab", vocabRouter);
app.use("/api/jlpt", jlptRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/tts", ttsRouter);
app.use("/api", progressRouter); // progressRouter internally mounts /progress/* and /user/* routes

async function startServer() {
  // Connect to MongoDB Atlas
  await connectDB();

  // Start background data generator scheduler
  startDataGeneratorScheduler();

  // Start background push notification cron jobs
  startPushScheduler();

  // Configure Vite or Serve static built content
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
