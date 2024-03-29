const path = require("path");
const webpack = require("webpack");

const isProd = !!process.env.IS_PRODUCTION;

console.log("webpack IS_PRODUCTION=" + isProd);

/** @type { import('webpack').Configuration } */
module.exports = [
  {
    entry: {
      background: "./src/js/background.ts",
      content: "./src/js/content.tsx",
      options: "./src/js/options.tsx",
      popup: "./src/js/popup.tsx",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "build/webpack"),
      libraryTarget: "umd",
      library: 'lib',
      umdNamedDefine: true,
      globalObject: "this"
    },
    externals: {
      quill: "Quill",
    },
    mode: isProd ? "production" : "development",
    devtool: isProd ? undefined : "inline-source-map",
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          IS_PRODUCTION: isProd,
        },
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/i,
          use: ["css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
      minimize: false,
    },
  },
];
