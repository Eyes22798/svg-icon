const { readFileSync, readdirSync, statSync, existsSync } = require('fs')
const { resolve, join, basename, extname } = require('path')
const ejs = require('ejs')

const VIRTUAL_MODULE_ID = '@eyes22798/svg-icon'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

function collectSvgSymbols(dir, prefix = 'icon-', originalDirs = []) {
  if (!existsSync(dir)) return ''

  const files = readdirSync(dir)
  let result = ''

  for (const file of files) {
    const fullPath = join(dir, file)
    if (statSync(fullPath).isDirectory()) {
      result += collectSvgSymbols(fullPath, prefix, originalDirs)
    } else if (extname(file) === '.svg') {
      const content = readFileSync(fullPath, 'utf-8')
      const symbolId = prefix + basename(file, '.svg')

      const viewBoxMatch = content.match(/viewBox="([^"]*)"/)
      const innerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
      const inner = innerMatch ? innerMatch[1] : ''

      const isOriginal = originalDirs.some(d =>
        fullPath.includes(d + '/') || fullPath.includes(d + '\\')
      )
      const cleaned = isOriginal
        ? inner
        : inner.replace(/\bfill\s*=\s*["'][^"']*["']/gi, '')

      result += `<symbol id="${symbolId}"${viewBoxMatch ? ` viewBox="${viewBoxMatch[1]}"` : ''}>${cleaned}</symbol>`
    }
  }

  return result
}

function findOriginalDirs(iconDir) {
  if (!existsSync(iconDir)) return []
  const result = []
  function walk(dir) {
    const files = readdirSync(dir)
    for (const file of files) {
      const fullPath = join(dir, file)
      if (statSync(fullPath).isDirectory()) {
        if (file === 'original') result.push(fullPath)
        walk(fullPath)
      }
    }
  }
  walk(iconDir)
  return result
}

module.exports = function SvgIconPlugin(options = {}) {
  const { iconPath = './src/assets/icons', name = 'svg-icon' } = options

  let resolvedIconPath = ''
  let originalDirs = []
  let componentSource = ''
  let templateSource = ''

  return {
    name: 'svg-icon-plugin',

    configResolved(config) {
      resolvedIconPath = resolve(config.root, iconPath)
      originalDirs = findOriginalDirs(resolvedIconPath)
    },

    buildStart() {
      // Resolve absolute path to the SFC source, works in both dev (this repo)
      // and production (installed in consumer's node_modules)
      componentSource = resolve(__dirname, '../src/svg-icon.vue').split('\\').join('/')
      const templatePath = resolve(__dirname, '../src/template-vite.js')
      templateSource = readFileSync(templatePath, 'utf-8')
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return ejs.render(templateSource, {
          componentSource,
          iconPath: resolvedIconPath.split('\\').join('/'),
          name
        })
      }
    },

    transformIndexHtml(html) {
      const symbols = collectSvgSymbols(resolvedIconPath, 'icon-', originalDirs)
      const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`
      return html.replace('</body>', sprite + '</body>')
    }
  }
}
