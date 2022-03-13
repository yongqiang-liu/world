import path from "path";
import webpack from "webpack";
import { merge } from "webpack-merge";
import TerserPlugin from "terser-webpack-plugin";
import baseConfig from "./webpack.base";
import webpackPaths from "./webpack.paths";

const config: webpack.Configuration = {
  devtool: process.env.DEBUG_PROD === "true" ? "source-map" : false,
  mode: "production",
  target: "electron-main",
  entry: path.join(webpackPaths.mainPath, "main.ts"),
  output: {
    path: webpackPaths.distMainPath,
    filename: "main.js",
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
      }),
    ],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      DEBUG_PROD: false,
      START_MINIMIZED: false,
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge<webpack.Configuration>(baseConfig, config);
