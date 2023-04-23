/**
 * Base webpack config used across other specific configs
 */

const path = require('path');
import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';

const configuration: webpack.Configuration = {
  externals: [
    ...Object.keys(externals || {}),
    {
      // Possible drivers for knex - we'll ignore them
      //sqlite3: 'sqlite3',
      'better-sqlite3': 'better-sqlite3',
      mysql2: 'mysql2',
      mariasql: 'mariasql',
      mysql: 'mysql',
      mssql: 'mssql',
      tedious: 'tedious',
      oracle: 'oracle',
      'strong-oracle': 'strong-oracle',
      oracledb: 'oracledb',
      pg: 'pg',
      'pg-query-stream': 'pg-query-stream',
    },
  ],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
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
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    /*
    This is a fix due to the fact that grapql exports both ESM and CJS modules. Somehow, webpack packages both of them
    This causes a weird behaviour as the graphql module is imported twice, and they behave _slightly_ differently
    https://github.com/apollographql/apollo-server/issues/4637
    */
    alias: {
      graphql$: webpackPaths.rootPath + '/node_modules/graphql/index.js',
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
};

export default configuration;
