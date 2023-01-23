const webpack = require("webpack");
const path = require("path");

const rootPath = path.join(__dirname, "../");
const srcPath = path.join(rootPath, "src");

module.exports = {
  externals: {
    knex: "commonjs knex",
    // Random hack to fix sqlite3 dev deps
    sqlite3: "commonjs sqlite3",
  },
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: [/node_modules/, /build/, /__test__/],
      },
      {
        test: /\.ts$/,
        exclude: [/node_modules/, /build/, /__test__/],
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    modules: [srcPath, "node_modules"],
    /*
    This is a fix due to the fact that grapql exports both ESM and CJS modules. Somehow, webpack packages both of them
    This causes a weird behaviour as the graphql module is imported twice, and they behave _slightly_ differently
    https://github.com/apollographql/apollo-server/issues/4637
    alias: {
      graphql$: path.resolve(__dirname, "./node_modules/graphql/index.js"),
    },
    */
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
  target: "node",
};
