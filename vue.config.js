const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // transpileDependencies: true,
  transpileDependencies: ['pdfjs-dist'],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@vue/app'],
              plugins: ['@babel/plugin-transform-class-static-block']
            }
          }
        }
      ]
    }
  }
})
