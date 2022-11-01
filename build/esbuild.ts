import path from 'node:path'
import { build } from 'esbuild'
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
  })
}
