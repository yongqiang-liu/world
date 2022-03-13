import { app } from "electron";
import path from "path";

const isPackaged = app.isPackaged;

console.log(app.getPath("appData"));

const rootPath = isPackaged
  ? path.join(process.resourcesPath)
  : path.join(__dirname, "../../..");
const assetsPath = isPackaged
  ? path.join(process.resourcesPath, "assets")
  : path.join(rootPath, "assets");
const preloadPath = isPackaged
  ? path.join(__dirname, "../renderer")
  : path.join(rootPath, "release", "app", "dist", "renderer");

export function resolvePreloadPath(name: string) {
  return path.join(preloadPath, name);
}

export function resolveConfiguration(name: string) {
  return path.join(assetsPath, name);
}

export function resolveAssets(name: string) {
  return path.join(assetsPath, name);
}
