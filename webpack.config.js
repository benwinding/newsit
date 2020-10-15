const path = require("path");

const isProd = process.argv.includes("production");

module.exports = [
  {
    entry: {
      "background": "./src/js/background.js",
      "content": "./src/js/content.js",
      "options": "./src/js/options.js",
      "popup": "./src/js/popup.js",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "build"),
      libraryTarget: "umd",
    },
    externals: {
      quill: "Quill"
    },
    // devtool: isProd ? undefined : "inline-source-map",
    module: {
      rules: [
        // {
        //   test: /\.js$/,
        //   exclude: /node_modules/,
        //   use: {
        //     loader: "babel-loader"
        //   }
        // }
      ]
    },
    optimization: {
      minimize: false
    },
  }
];
