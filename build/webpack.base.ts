/**
 * Base webpack config used across other specific configs
 */

import webpack from "webpack";
import webpackPaths from "./webpack.paths";
import path from "path";

export default {
  stats: "errors-only",

  module: {
    rules: [
      {
        test: /\.[jt]s?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    library: {
      type: "commonjs2",
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    alias: {
      common: path.join(webpackPaths.commonPath),
      main: path.join(webpackPaths.mainPath),
      renderer: path.join(webpackPaths.rendererPath),
    },
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    modules: ["node_modules"],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),
  ],
} as webpack.Configuration;
