import baseConfig from "./webpack.base";
import { merge } from "webpack-merge";
import webpack from "webpack";
import webpackPaths from "./webpack.paths";
import path from "path";

const config: webpack.Configuration = {
  devtool: "inline-source-map",
  target: "electron-renderer",
  entry: path.join(webpackPaths.rendererPath, "main.ts"),
  output: {
    publicPath: "/",
    path: path.join(webpackPaths.distRendererPath),
    filename: "preload.js",
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, config);
