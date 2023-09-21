import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import vue from 'rollup-plugin-vue'
import alias from '@rollup/plugin-alias'
import json from '@rollup/plugin-json'
import minimist from 'minimist'
import postcss from 'rollup-plugin-postcss'
import filesize from 'rollup-plugin-filesize'
import { importAssertionsPlugin } from 'rollup-plugin-import-assert'
import { DEFAULT_EXTENSIONS } from '@babel/core'

import tsConfig from './tsconfig.types.json' assert { type: "json" }
import pkg from './package.json' assert { type: "json" }
const PREFIX = '@eyes22798'
const name = pkg.name.split(PREFIX + '/')[1]
const kebabToCamel = (name) => {
  name = name.replace(/-(\w)/g, (match, p1) => {
    return p1.toUpperCase();
  });
  name = name.replace(/^\w/, (match) => {
    return match.toUpperCase();
  });
  return name
}

const extensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx']
const argv = minimist(process.argv.slice(2))
const external = [
  'vue',
  'element-ui',
  '@vue/composition-api'
]

const baseConfig = {
  plugins: {
    preVue: [
      alias({
        customResolver: resolve({
          extensions: ['.js', '.jsx', '.vue']
        })
      })
    ],
    vue: {
      target: 'browser',
      needMap: false
    },
    babel: {
      exclude: 'node_modules/**',
      extensions,
      babelHelpers: 'bundled'
    }
  }
}

const buildConfig = {
  input: './src/index.js',
  external,
  output: {
    name: kebabToCamel(name),
    format: 'esm',
    file: `dist/index.esm.js`
  },
  plugins: [
    ...baseConfig.plugins.preVue,
    vue(baseConfig.plugins.vue),
    json(),
    importAssertionsPlugin,
    postcss(),
    typescript(tsConfig),
    babel({
      ...baseConfig.plugins.babel,
      presets: [
        [
          '@vue/cli-plugin-babel/preset',
          {
            useBuiltIns: false
          }
        ],
        '@babel/typescript'
      ]
    }),
    resolve({}),
    commonjs({
      include: 'node_modules/**'
    }),
    filesize()
  ]
}

if (argv.format === 'umd') {
  buildConfig.output.format = 'umd'
  buildConfig.output.file = `dist/index.js`
}

if (argv.format === 'cjs') {
  buildConfig.output.format = 'cjs'
  buildConfig.output.file = `dist/index.common.js`
}

export default buildConfig
