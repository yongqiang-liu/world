import path from "path";

const rootPath = path.join(__dirname, "..");
const srcPath = path.join(rootPath, "src");
const releasePath = path.join(rootPath, "release");

const commonPath = path.join(srcPath, "electron-common");
const mainPath = path.join(srcPath, "electron-main");
const rendererPath = path.join(srcPath, "electron-renderer");

const preloadPath = path.join(srcPath, "preload");

const distPath = path.join(releasePath, "app", "dist");
const distMainPath = path.join(distPath, "main");
const distRendererPath = path.join(distPath, "renderer");

export default {
  rootPath,
  srcPath,
  distPath,
  preloadPath,
  commonPath,
  mainPath,
  rendererPath,
  distMainPath,
  distRendererPath,
};
