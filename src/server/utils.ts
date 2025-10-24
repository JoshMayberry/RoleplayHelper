import fs from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DATA_ROOT = path.resolve(__dirname, "data");

export function resolveFilePath(folder: string, filename: string) {
  const dirPath = path.resolve(DATA_ROOT, folder);
  const hasExt = path.extname(filename) !== "";
  const fname = hasExt ? filename : filename + ".json";
  return { dirPath, filePath: path.resolve(dirPath, fname) };
}

export async function listFiles(folder: string): Promise<string[]> {
  const dir = path.resolve(DATA_ROOT, folder);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isFile() && e.name.toLowerCase().endsWith(".json"))
      .map(e => e.name.replace(/\.json$/i, ""));
  } catch {
    return [];
  }
}

export async function loadFile(folder: string, filename: string) {
  try {
    const { filePath } = resolveFilePath(folder, filename);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return []; // default shape for your PartialGroup[] files
  }
}

export async function saveFile(folder: string, filename: string, data: any) {
  const { dirPath, filePath } = resolveFilePath(folder, filename);
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
