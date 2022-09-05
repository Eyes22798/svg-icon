const SvgIconConfig = require('./webpack/index')

module.exports = {
  pages: {
    index: {
      entry: 'example/main.js'
    }
  },
  chainWebpack: (config) => {
    SvgIconConfig({ config, iconPath: './example/assets/icons', name: 'svg-icon-1' })
  }
}
