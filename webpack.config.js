const path = require("path");
const webpack = require("webpack");

const isProd = !!process.env.IS_PRODUCTION;

console.log("webpack IS_PRODUCTION=" + isProd);

module.exports = [
  {
    entry: {
      background: "./src/js/background.js",
      content: "./src/js/content.js",
      options: "./src/js/options.js",
      popup: "./src/js/popup.jsx",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "build"),
      libraryTarget: "umd",
    },
    externals: {
      quill: "Quill",
    },
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
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    optimization: {
      minimize: false,
    },
  },
];
