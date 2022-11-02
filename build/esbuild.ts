import path from 'node:path'
import fs, { promises } from 'node:fs'
import { build } from 'esbuild'
import webpackPaths, { minifies } from './utils'

build({
  entryPoints: [
    path.join(webpackPaths.rendererPath, 'main.ts'),
  ],
  bundle: true,
  outfile: path.join(webpackPaths.distRendererPath, 'preload.js'),
  platform: 'node',
  minify: true,
  external: ['electron'],
})

if (process.env.PRODUCT) {
  build({
    entryPoints: [
      path.join(webpackPaths.mainPath, 'main.ts'),
    ],
    bundle: true,
    outfile: path.join(webpackPaths.distMainPath, 'main.js'),
    platform: 'node',
    minify: true,
    external: ['electron'],
  })

  minifies([
    path.join(webpackPaths.assetPath, 'world.js'),
    path.join(webpackPaths.assetPath, 'egretlib.js'),
  ], webpackPaths.buildResourcesPath)

  if (!fs.existsSync(path.join(webpackPaths.buildResourcesPath, 'icons'))) {
    promises.cp(
      path.join(webpackPaths.assetPath, 'icons'),
      path.join(webpackPaths.buildResourcesPath, 'icons'), {
        force: true,
        recursive: true,
      })
  }
}
