const { defineConfig } = require('@vue/cli-service')
const SvgIconConfig = require('./webpack/index')

module.exports = defineConfig({
  pages: {
    index: {
      entry: 'example/main.ts',
      template: 'public/index.html',
      filename: 'index.html',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  chainWebpack: (config) => {
    SvgIconConfig({ config, iconPath: './example/assets/icons', name: 'svg-icon-1' })
  }
})
