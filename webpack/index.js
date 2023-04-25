const path = require('path')
const ejs = require('ejs')
const fsExtra = require('fs-extra')
const fs = require('fs')
const resolve = (context) => {
  return path.join(process.cwd(), context)
}
const findFileFolder = (dir, filename) => {
  const files = fs.readdirSync(resolve(dir));
  const result = [];
  files.map(file => {
    const filePath = `${dir}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      if (file === filename) {
        result.push(filePath);
      } else {
        result.push(...findFileFolder(filePath, filename));
      }
    }
  });
  return result;
}

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
  const svgRule = config.module.rule("svg-sprite")
  svgRule.uses.clear()
  svgRule
    .test(/\.(svg)(\?.*)?$/)
    .include.add(directory)
    .end()
    .use("svg-sprite-loader")
    .loader("svg-sprite-loader")
    .options({
      symbolId: "icon-[name]"
    })
    .end()
  
  const svgoExcludePaths = findFileFolder(iconPath, 'original')
  const svgoRule = config.module.rule("svgo")
  svgoRule
    .test(/\.(svg)(\?.*)?$/)
    .exclude.add([...svgoExcludePaths.map(path => resolve(path))])
    .end()
    .use("svgo-loader")
    .loader("svgo-loader")
    .tap(options => ({
      ...options,
      plugins: [{ name: "removeAttrs", params: { attrs: "fill" } }]
    }))
    .end()

  config.plugin('svg-sprite').use(require('svg-sprite-loader/plugin'),[{ plainSprite: true }])//配置1oader外还有插件需要配
}

module.exports = SvgIconConfig