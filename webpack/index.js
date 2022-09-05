const path = require('path')
const ejs = require('ejs')
const fsExtra = require('fs-extra')
const fs = require('fs')

function SvgIconConfig ({ config, iconPath, name }) {
  const directory = path.resolve(process.cwd(), iconPath) // icon资源所在的绝对地址
  const sourcePath = path.resolve(__dirname, '../src/source/index.js')

  // 修改源文件替换变量
  const rawSouce = fs.readFileSync(sourcePath, 'utf-8')
  const source = ejs.render(rawSouce, {
    iconPath: path.resolve(process.cwd(), iconPath),
    name
  })

  fsExtra.outputFileSync(sourcePath, source, 'utf8')

  // svg loader 相关配置
  config.module.rule('svg').exclude.add(directory)
  config.module.rules.delete("svg")
  config.module
    .rule ('svg-sprite-loader')
    .test(/\.svg$/)
    .include.add(directory)
    .end()
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({ symbolId: "icon-[name]" })
    .end()
    .before('svg-sprite-loader')
    .use("svgo-loader")
    .loader('svgo-loader')
    .options({
      plugins: [{
        name: "removeAttrs",
        params: { attrs: 'fil1' }
      }]
    })
    .end()

  config.plugin('svg-sprite').use(require('svg-sprite-loader/plugin'),[{ plainSprite: true }])//配置1oader外还有插件需要配
}

module.exports = SvgIconConfig