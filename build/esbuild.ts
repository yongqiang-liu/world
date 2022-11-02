import path from 'node:path'
import fs, { promises } from 'node:fs'
import { build } from 'esbuild'
import { minify } from 'minify'
import webpackPaths from './utils'

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

  minify(path.join(webpackPaths.rootPath, 'assets', 'world.js'))
    .then((v) => {
      promises.writeFile(path.join(webpackPaths.rootPath, 'buildResources', 'world.js'), v)
    })
  minify(path.join(webpackPaths.rootPath, 'assets', 'egretlib.js'))
    .then((v) => {
      promises.writeFile(path.join(webpackPaths.rootPath, 'buildResources', 'egretlib.js'), v)
    })

  if (!fs.existsSync(path.join(webpackPaths.rootPath, 'buildResources', 'icons'))) {
    promises.cp(
      path.join(webpackPaths.rootPath, 'assets', 'icons'),
      path.join(webpackPaths.rootPath, 'buildResources', 'icons'), {
        force: true,
        recursive: true,
      })
  }
}
