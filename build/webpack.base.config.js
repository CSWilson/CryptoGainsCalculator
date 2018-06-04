const path = require('path')
const nodeExternals = require('webpack-node-externals')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

module.exports = env => {
  return {
    mode: 'development',
    target: 'node',
    node: {
      __dirname: false,
      __filename: false
    },
    externals: [nodeExternals()],
    resolve: {
      extensions: ['.vue', '.js', '.jsx'],
      alias: {
        env: path.resolve(__dirname, `../config/env_${env}.json`),
        // 'vue$': 'vue/dist/vue.esm.js'
        'vue$': 'vue/dist/vue.common.js'
      }
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        }
      ]
    },
    plugins: [
      new FriendlyErrorsWebpackPlugin({ clearConsole: env === 'development' })
    ]
  }
}
