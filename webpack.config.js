const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = () => {
  const env = dotenv.config().parsed;

  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return {
    mode: "development",
    entry: "./main.tsx",
    devtool: "inline-source-map",
    output: {
      path: path.join(__dirname, "/build"),
      filename: "[name].[contenthash].bundle.js",
      publicPath: "/",
      clean: true,
    },
    devtool: "inline-source-map",
    devServer: {
      static: "./build",
      historyApiFallback: true,
      port: 8082,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.less$/i,
          use: [
            // compiles Less to CSS
            "style-loader",
            "css-loader",
            "less-loader",
          ],
        },
        {
          test: /\.(png|jpe?g|gif|jp2|webp)$/,
          loader: "file-loader",
          options: {
            name: "images/[name].[ext]",
          },
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
      }),
      new CopyPlugin({
        patterns: [
          { from: "./src/favicon.ico", to: "" },
          { from: "./src/manifest.json", to: "" },
          { from: "./src/logo192.png", to: "" },
          { from: "./src/logo512.png", to: "" },
        ],
      }),
      new WorkboxWebpackPlugin.InjectManifest({
        swSrc: "./src/src-sw.js",
        swDest: "sw.js",
      }),
      new webpack.DefinePlugin({ process: { env: envKeys } }),
    ],
  };
};
