import path from 'node:path'
import fs, { promises } from 'node:fs'
import crypto from 'node:crypto'
import { minify } from 'minify'

const rootPath = path.join(__dirname, '..')
const srcPath = path.join(rootPath, 'src')
const releasePath = path.join(rootPath, 'release')

const commonPath = path.join(srcPath, 'electron-common')
const mainPath = path.join(srcPath, 'electron-main')
const rendererPath = path.join(srcPath, 'electron-renderer')

const preloadPath = path.join(srcPath, 'preload')

const distPath = path.join(releasePath, 'app', 'dist')
const distMainPath = path.join(distPath, 'main')
const distRendererPath = path.join(distPath, 'renderer')

const assetPath = path.join(rootPath, 'assets')
const buildResourcesPath = path.join(rootPath, 'buildResources')

export function getMd5(file: string) {
  if (!fs.existsSync(file))
    throw new Error('file not found')
  const md5 = crypto.createSign('md5')
  return md5.sign(fs.readFileSync(file)).toString('hex')
}

export function minifies(files: string[], outDir: string) {
  for (const file of files) {
    const filename = path.basename(file)
    minify(path.join(file))
      .then((v) => {
        promises.writeFile(path.join(outDir, filename), v)
      })
  }
}

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
  assetPath,
  buildResourcesPath,
}
