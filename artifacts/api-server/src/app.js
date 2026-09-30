import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const staticPath = path.join(__dirname, "../../../frontend-js/dist");
  app.use(express.static(staticPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

export default app;
