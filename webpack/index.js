const path = require('path')
const ejs = require('ejs')
const fsExtra = require('fs-extra')
const fs = require('fs')
const glob = require('glob')
const VirtualModulesPlugin = require('webpack-virtual-modules')
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
const readFile = ({ dir = '', prefix = ''}) => {
  const files = glob.sync(dir, {
    absolute: true,
    cwd: path.resolve(__dirname, '..')
  })
  const result = {}

  files.forEach((file) => {
    const data = fsExtra.readFileSync(file, 'utf8')
    const parseResult = path.parse(file)
    const fileName = parseResult.name + parseResult.ext
    
    result[prefix ? `{prefix}/${fileName}` : prefix] = data
  })
}

const virtualModulesPrefix = 'node_modules/@eyes22798/svg-icon'

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

class virtualModulesWebPackPlugin {
  constructor(options = {}) {
    console.log(options)
    this.virtualModulesPlugin = null
    this.virtualModulesPrefix = virtualModulesPrefix
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.entryOption.tap('virtualModulesPlugin',
      (context, entry) => {
        console.log('entryOption==============', context, entry)
        const sourcePath = path.resolve(__dirname, '../src/source/index.js')
        const iconPathArr = path.resolve(process.cwd(), this.options.iconPath).split(path.sep)

        // 修改源文件替换变量
        const rawSouce = fs.readFileSync(sourcePath, 'utf-8')
        const source = ejs.render(rawSouce, {
          iconPath: iconPathArr.join('/'),
          name: this.options.name
        })

        fsExtra.outputFileSync(sourcePath, source, 'utf8')
      })
  }

  _addVirtualModules(compiler) {
    const data = readFile({
      prefix: this.virtualModulesPrefix,
      dir: '../src/source/*.*',
    })

    this.virtualModulesPlugin = new VirtualModulesPlugin(data)
    this.virtualModulesPlugin.apply(compiler)
  }
}

const vmPlugin = virtualModulesWebPackPlugin

function SvgIconConfig ({ config, iconPath, name }) {
  const directory = path.resolve(process.cwd(), iconPath) // icon资源所在的绝对地址

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

  config.plugin('vmPlugin').use(vmPlugin, [
    { iconPath, name }
  ])

  config.plugin('restPlugin').use(RestPlugin)
}

module.exports = SvgIconConfig