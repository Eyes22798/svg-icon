const path = require('path')
const ejs = require('ejs')
const fsExtra = require('fs-extra')
const fs = require('fs')
const glob = require('glob')
const VirtualModulesPlugin = require('webpack-virtual-modules')
const webpack = require('webpack')

function isPackageInstalled(packageName) {
  try {
    const packagePath = require.resolve(packageName)

    return fs.existsSync(packagePath)
  } catch (error) {
    return false
  }
}

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
const readFile = function ({ dir = '', prefix = ''}) {
  const files = glob.sync(dir, {
    absolute: true,
    cwd: path.resolve(__dirname, '..')
  })
  const result = {}

  files.forEach((file) => {
    const data = fsExtra.readFileSync(file, 'utf8')
    const parseResult = path.parse(file)
    const fileName = parseResult.name + parseResult.ext

    result[prefix ? `${prefix}/${fileName}` : prefix] = data
  })

  return result
}

const virtualModulesPrefix = 'node_modules/@eyes22798/svg-icon'

class virtualModulesWebPackPlugin {
  constructor(options = {}) {
    this.virtualModulesPlugin = null
    this.virtualModulesPrefix = virtualModulesPrefix
    this.options = options
  }
  apply(compiler) {
    const definePlugin = new webpack.DefinePlugin({
      'process.env.__SVG_ICON_PATH__': JSON.stringify(this.options.iconPath),
      'process.env.__SVG_ICON_NAME__': JSON.stringify(this.options.name),
    })
    this._addVirtualModules(compiler) // 生成虚拟模块
    definePlugin.apply(compiler) // 注入环境变量
  }

  _addVirtualModules(compiler) {
    const data = readFile({
      prefix: this.virtualModulesPrefix,
      dir: './src/**/*.vue',
    })

    const sourcePath = isPackageInstalled('@eyes22798/svg-icon/webpack')
      ? path.resolve(__dirname, '../dist/index.esm.js')
      : path.resolve(__dirname, '../src/template.js')

    const iconPathArr = path.resolve(process.cwd(), this.options.iconPath).split(path.sep)
    // 修改源文件替换变量
    const rawSource = fs.readFileSync(sourcePath, 'utf-8')
    const source = ejs.render(rawSource, {
      iconPath: iconPathArr.join('/'),
      name: this.options.name
    })
    data[`${this.virtualModulesPrefix}/index.js`] = source

    this.virtualModulesPlugin = new VirtualModulesPlugin(data)
    this.virtualModulesPlugin.apply(compiler)
    if (process.env.NODE_ENV === 'production' && isPackageInstalled('@eyes22798/svg-icon/webpack')) {
      // fsExtra.outputFileSync(sourcePath, source, 'utf8')
    }
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

  config.plugin('svg-sprite').use(require('svg-sprite-loader/plugin'),[{ plainSprite: true }])//配置loader外还有插件需要配

  config.plugin('vmPlugin').use(vmPlugin, [
    { iconPath, name }
  ])
}

module.exports = SvgIconConfig
