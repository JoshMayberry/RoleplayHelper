import express from "express";
import { listFiles, loadFile, saveFile } from "./utils";

const router = express.Router()

router.get("/api/ping", (_req, res) => {
  res.json({ ok: true });
});

// List available json files (without extension):
// GET /api/files?folder=soundboard
router.get("/api/files", async (req, res) => {
  const folder = String(req.query.folder || "");
  // console.debug(`[server] listing files for '${folder}'`);
  if (!folder) return res.status(400).json({ error: "Missing folder" });
  const names = await listFiles(folder);
  res.json({ files: names });
});

// Load one file (returns PartialGroup[]):
// GET /api/data?folder=soundboard&filename=persona5
router.get("/api/data", async (req, res) => {
  const folder = String(req.query.folder || "");
  const filename = String(req.query.filename || "");
  console.debug(`[server] loading file '${folder}/${filename}'`);
  if (!folder || !filename) {
    return res.status(400).json({ error: "Missing folder or filename" });
  }
  const json = await loadFile(folder, filename);
  res.json(json);
});

// Save a file:
// POST /api/data  { folder, filename, data }
router.post("/api/data", async (req, res) => {
  const { folder, filename, data } = req.body || {};
  console.debug(`[server] saving file '${folder}/${filename}'`);
  if (!folder || !filename || typeof data === "undefined") {
    return res.status(400).json({ error: "Missing folder, filename, or data" });
  }
  await saveFile(folder, filename, data);
  res.sendStatus(200);
});

export default router
