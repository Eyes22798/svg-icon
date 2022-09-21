const path = require('path')
const ejs = require('ejs')
const fsExtra = require('fs-extra')
const fs = require('fs')
class ResetSourceWebpackPlugin {
  apply(compiler) {
    const sourcePath = path.resolve(__dirname, '../src/source/index.js')
    const templatePath = path.resolve(__dirname, '../src/template/index.js')
    const rawSouce = fs.readFileSync(templatePath, 'utf-8')

    compiler.hooks.watchClose.tap('ResetSourceWebpackPlugin',
      // compliation 结束后还原源文件
      () => {
        fsExtra.outputFileSync(sourcePath, rawSouce, 'utf8')
      })
  }
}
const RestPlugin = ResetSourceWebpackPlugin

function SvgIconConfig ({ config, iconPath, name }) {
  const directory = path.resolve(process.cwd(), iconPath) // icon资源所在的绝对地址
  const sourcePath = path.resolve(__dirname, '../src/source/index.js')
  const iconPathArr = path.resolve(process.cwd(), iconPath).split(path.sep)

  // 修改源文件替换变量
  const rawSouce = fs.readFileSync(sourcePath, 'utf-8')
  const source = ejs.render(rawSouce, {
    iconPath: iconPathArr.join('/'),
    name
  })

  fsExtra.outputFileSync(sourcePath, source, 'utf8')
  config.plugin('restPlugin').use(RestPlugin)

  // svg loader 相关配置
  config.module.rule('svg').exclude.add(directory)
  config.module.rules.delete('svg')
  config.module
    .rule ('svg-sprite-loader')
    .test(/\.svg$/)
    .include.add(directory)
    .end()
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({ symbolId: 'icon-[name]' })
    .end()
    .before('svg-sprite-loader')
    .use('svgo-loader')
    .loader('svgo-loader')
    .options({
      plugins: [{
        name: 'removeAttrs',
        params: { attrs: ['fill', 'fill-rule'] }
      }]
    })
    .end()

  config.plugin('svg-sprite').use(require('svg-sprite-loader/plugin'),[{ plainSprite: true }])//配置1oader外还有插件需要配
}

module.exports = SvgIconConfig