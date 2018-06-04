const path = require('path')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')

module.exports = env => {
  return merge(base(env), {
    mode: 'development',
    entry: {
      'background.js': './src/background.js',
      'app.js': './src/app.js',
      'app.css': './src/stylesheets/main.css'
    },
    output: {
      filename: '[name]',
      path: path.resolve(__dirname, '../app')
    }
  })
}
